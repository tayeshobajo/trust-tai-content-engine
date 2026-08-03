/**
 * Operational Resilience — Background job processing, browser-refresh recovery,
 * concurrent-edit detection
 *
 * QA coverage: Section 21 (Operational Resilience)
 */

// ─── Background Job Queue ─────────────────────────────────────────────────────

export type JobType = "image-render" | "video-render" | "narration" | "coherence-check" | "package-build"
export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled"

export interface BackgroundJob {
  id: string
  type: JobType
  productionId: string
  shotNo?: number
  status: JobStatus
  /** Progress 0-100 */
  progress: number
  /** Error message if failed */
  error?: string
  queuedAt: string
  startedAt?: string
  completedAt?: string
  /** Estimated completion time */
  estimatedDurationSec?: number
  /** Retry count */
  retryCount: number
  /** Max retries */
  maxRetries: number
  /** Result data */
  result?: Record<string, unknown>
}

class JobQueue {
  private jobs: BackgroundJob[] = []
  private listeners: Set<(jobs: BackgroundJob[]) => void> = new Set()

  /**
   * Enqueues a new background job.
   */
  enqueue(
    type: JobType,
    productionId: string,
    shotNo?: number,
    estimatedDurationSec?: number,
  ): BackgroundJob {
    const job: BackgroundJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      productionId,
      shotNo,
      status: "queued",
      progress: 0,
      queuedAt: new Date().toISOString(),
      estimatedDurationSec,
      retryCount: 0,
      maxRetries: 3,
    }
    this.jobs.push(job)
    this.notify()
    return job
  }

  /**
   * Updates a job's status and progress.
   */
  update(jobId: string, status: JobStatus, progress?: number, error?: string): void {
    const job = this.jobs.find((j) => j.id === jobId)
    if (!job) return

    job.status = status
    if (progress !== undefined) job.progress = progress
    if (error) job.error = error
    if (status === "processing" && !job.startedAt) job.startedAt = new Date().toISOString()
    if (status === "completed" || status === "failed") job.completedAt = new Date().toISOString()
    this.notify()
  }

  /**
   * Gets all jobs, optionally filtered.
   */
  getJobs(productionId?: string, status?: JobStatus): BackgroundJob[] {
    return this.jobs.filter((j) => {
      if (productionId && j.productionId !== productionId) return false
      if (status && j.status !== status) return false
      return true
    })
  }

  /**
   * Subscribes to job updates.
   */
  subscribe(listener: (jobs: BackgroundJob[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    const snapshot = [...this.jobs]
    this.listeners.forEach((l) => l(snapshot))
  }

  /**
   * Retries a failed job.
   */
  retry(jobId: string): BackgroundJob | null {
    const job = this.jobs.find((j) => j.id === jobId)
    if (!job || job.status !== "failed") return null
    if (job.retryCount >= job.maxRetries) return null

    job.retryCount++
    job.status = "queued"
    job.progress = 0
    job.error = undefined
    job.completedAt = undefined
    this.notify()
    return job
  }

  /**
   * Cancels a queued or processing job.
   */
  cancel(jobId: string): void {
    const job = this.jobs.find((j) => j.id === jobId)
    if (!job) return
    if (job.status === "queued" || job.status === "processing") {
      job.status = "cancelled"
      job.completedAt = new Date().toISOString()
      this.notify()
    }
  }

  /**
   * Clears completed/failed/cancelled jobs.
   */
  clearFinished(): void {
    this.jobs = this.jobs.filter(
      (j) => j.status === "queued" || j.status === "processing",
    )
    this.notify()
  }
}

export const jobQueue = new JobQueue()

// ─── Browser-Refresh Recovery ─────────────────────────────────────────────────

const RECOVERY_KEY = "trust-tai-studio-recovery"

export interface RecoveryState {
  productionId?: string
  activeGate?: string
  unsavedChanges: boolean
  lastSavedAt?: string
  activeShots: number[]
  pendingJobs: string[]
}

/**
 * Saves recovery state to localStorage for browser-refresh recovery.
 */
export function saveRecoveryState(state: RecoveryState): void {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({
      ...state,
      lastSavedAt: new Date().toISOString(),
    }))
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Loads recovery state after a page refresh.
 */
export function loadRecoveryState(): RecoveryState | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RecoveryState
  } catch {
    return null
  }
}

/**
 * Clears recovery state after successful save.
 */
export function clearRecoveryState(): void {
  try {
    localStorage.removeItem(RECOVERY_KEY)
  } catch {
    // noop
  }
}

// ─── Concurrent-Edit Detection ────────────────────────────────────────────────

export interface ConcurrentEdit {
  entityId: string
  entityType: string
  editedBy: string
  editedAt: string
  /** Session ID of the other editor */
  sessionId: string
}

const CONCURRENT_EDIT_KEY = "trust-tai-studio-concurrent-edits"
const HEARTBEAT_INTERVAL_MS = 5000
const STALE_THRESHOLD_MS = 15000

/**
 * Detects if another session is editing the same entity.
 */
export function detectConcurrentEdits(
  entityId: string,
  entityType: string,
  currentSessionId: string,
): ConcurrentEdit[] {
  try {
    const raw = localStorage.getItem(CONCURRENT_EDIT_KEY)
    if (!raw) return []

    const allEdits = JSON.parse(raw) as Record<string, ConcurrentEdit>
    const now = Date.now()

    // Filter: same entity, different session, not stale
    return Object.values(allEdits).filter((edit) => {
      if (edit.entityId !== entityId || edit.entityType !== entityType) return false
      if (edit.sessionId === currentSessionId) return false
      return now - new Date(edit.editedAt).getTime() < STALE_THRESHOLD_MS
    })
  } catch {
    return []
  }
}

/**
 * Registers that the current session is editing an entity.
 */
export function registerConcurrentEdit(
  entityId: string,
  entityType: string,
  sessionId: string,
  user: string,
): void {
  try {
    const raw = localStorage.getItem(CONCURRENT_EDIT_KEY)
    const allEdits = raw ? JSON.parse(raw) as Record<string, ConcurrentEdit> : {}

    allEdits[`${entityType}:${entityId}:${sessionId}`] = {
      entityId,
      entityType,
      editedBy: user,
      editedAt: new Date().toISOString(),
      sessionId,
    }

    localStorage.setItem(CONCURRENT_EDIT_KEY, JSON.stringify(allEdits))
  } catch {
    // noop
  }
}

/**
 * Starts a heartbeat for concurrent-edit detection.
 * Returns a cleanup function.
 */
export function startEditHeartbeat(
  entityId: string,
  entityType: string,
  sessionId: string,
  user: string,
): () => void {
  registerConcurrentEdit(entityId, entityType, sessionId, user)

  const interval = setInterval(() => {
    registerConcurrentEdit(entityId, entityType, sessionId, user)
  }, HEARTBEAT_INTERVAL_MS)

  return () => clearInterval(interval)
}
