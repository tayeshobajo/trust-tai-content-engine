// Creative memory persistence for Studio.
// V3: added audience feedback, world canon, confidence growth, conflict detection.
// localStorage as cache, Supabase write-behind.

import {
  DEFAULT_STUDIO_PRINCIPLES,
  DEFAULT_WORLD_CANON,
  inferLayer,
  type AudienceFeedback,
  type CorrectionEvent,
  type PrincipleConflict,
  type ProactiveSuggestionCache,
  type StudioPrinciple,
  type WorldCanonItem,
} from "@/data/studio-memory"
import {
  dbUpsertCorrection, dbUpsertPrinciple, dbDeleteCorrection, dbDeletePrinciple,
  dbUpsertFeedback, dbDeleteFeedback,
  dbUpsertWorldCanonItem, dbDeleteWorldCanonItem,
  dbUpsertConflict,
  syncFromServer, ensureMigrated,
} from "@/lib/studio-db"

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const CORRECTIONS_KEY      = "tts_correction_events"
const PRINCIPLES_KEY       = "tts_studio_principles"
const FEEDBACK_KEY         = "tts_audience_feedback"
const WORLD_CANON_KEY      = "tts_world_canon"
const CONFLICTS_KEY        = "tts_principle_conflicts"
const PROACTIVE_CACHE_KEY  = "tts_proactive_cache"

export const STUDIO_MEMORY_CHANGED_EVENT = "tts-studio-memory-changed"

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function isClient(): boolean {
  return typeof window !== "undefined"
}

function emitChange(): void {
  if (isClient()) window.dispatchEvent(new Event(STUDIO_MEMORY_CHANGED_EVENT))
}

function readArray<T>(key: string): T[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function readItem<T>(key: string): T | null {
  if (!isClient()) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

function persist<T>(key: string, items: T[]): void {
  if (!isClient()) return
  localStorage.setItem(key, JSON.stringify(items))
  emitChange()
}

function persistItem<T>(key: string, item: T): void {
  if (!isClient()) return
  localStorage.setItem(key, JSON.stringify(item))
}

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ---------------------------------------------------------------------------
// Correction Events
// ---------------------------------------------------------------------------

export function getCorrectionEvents(): CorrectionEvent[] {
  return readArray<CorrectionEvent>(CORRECTIONS_KEY).sort((a, b) => (a.at > b.at ? -1 : 1))
}

export function getProductionCorrectionEvents(productionId: string): CorrectionEvent[] {
  return getCorrectionEvents().filter((event) => event.productionId === productionId)
}

export function saveCorrectionEvent(
  event: Omit<CorrectionEvent, "id" | "at" | "interpretationStatus">
): CorrectionEvent {
  const correction: CorrectionEvent = {
    ...event,
    id: uid("correction"),
    at: new Date().toISOString(),
    interpretationStatus: "pending",
  }
  persist(CORRECTIONS_KEY, [correction, ...getCorrectionEvents()])
  if (isClient()) dbUpsertCorrection(correction).catch(() => {})
  return correction
}

export function confirmCorrectionAsPrinciple(event: CorrectionEvent): StudioPrinciple {
  const layer = inferLayer(event.category, event.labels)
  const principle: StudioPrinciple = {
    id: uid("principle"),
    title: event.labels[0] ? `${event.labels[0]} correction` : "Tai confirmed correction",
    layer,
    belief: event.studioInterpretation,
    evidenceEventIds: [event.id],
    scope: event.scope,
    confidence: event.scope === "world_canon" ? "canon" : "low",
    formats: [event.surface.replace("_", " ")],
    exceptions: [],
    lastReinforcedAt: new Date().toISOString(),
    behavior: event.scope === "this_production" ? "consider" : "warn",
    source: "tai_confirmed",
  }

  persist(PRINCIPLES_KEY, [principle, ...getCustomPrinciples()])

  const updatedEvents = getCorrectionEvents().map((item) =>
    item.id === event.id
      ? { ...item, interpretationStatus: "correct" as const, principleId: principle.id }
      : item
  )
  persist(CORRECTIONS_KEY, updatedEvents)

  if (isClient()) {
    dbUpsertPrinciple(principle).catch(() => {})
    dbUpsertCorrection({ ...event, interpretationStatus: "correct", principleId: principle.id }).catch(() => {})
  }

  // Run conflict detection async after confirming
  if (isClient()) detectConflictsAsync(principle).catch(() => {})

  return principle
}

export function deleteCorrection(correctionId: string): void {
  persist(CORRECTIONS_KEY, getCorrectionEvents().filter((e) => e.id !== correctionId))
  if (isClient()) dbDeleteCorrection(correctionId).catch(() => {})
}

// ---------------------------------------------------------------------------
// Studio Principles
// ---------------------------------------------------------------------------

export function getCustomPrinciples(): StudioPrinciple[] {
  return readArray<StudioPrinciple>(PRINCIPLES_KEY)
}

export function getStudioPrinciples(): StudioPrinciple[] {
  const custom = getCustomPrinciples()
  return [...custom, ...DEFAULT_STUDIO_PRINCIPLES].sort((a, b) =>
    a.lastReinforcedAt > b.lastReinforcedAt ? -1 : 1
  )
}

export function deletePrinciple(principleId: string): void {
  persist(PRINCIPLES_KEY, getCustomPrinciples().filter((p) => p.id !== principleId))
  if (isClient()) dbDeletePrinciple(principleId).catch(() => {})
}

// ---------------------------------------------------------------------------
// Confidence Growth
// Reinforce an existing principle with a new evidence event.
// Confidence ladder: low → medium → high (never auto-promotes to canon).
// ---------------------------------------------------------------------------

const CONFIDENCE_LADDER: StudioPrinciple["confidence"][] = ["low", "medium", "high"]

export function reinforcePrinciple(
  principleId: string,
  evidenceEventId: string
): StudioPrinciple | null {
  const all = getCustomPrinciples()
  const idx = all.findIndex((p) => p.id === principleId)
  if (idx < 0) return null

  const principle = all[idx]
  // Don't re-add same evidence
  if (principle.evidenceEventIds.includes(evidenceEventId)) return principle

  const currentLevel = CONFIDENCE_LADDER.indexOf(principle.confidence as StudioPrinciple["confidence"])
  const evidenceCount = principle.evidenceEventIds.length + 1
  // Promote confidence: 3+ events → medium, 6+ events → high
  let nextConfidence = principle.confidence
  if (principle.confidence !== "canon" && principle.confidence !== "provisional") {
    if (evidenceCount >= 6 && currentLevel < 2) nextConfidence = "high"
    else if (evidenceCount >= 3 && currentLevel < 1) nextConfidence = "medium"
  }

  const updated: StudioPrinciple = {
    ...principle,
    evidenceEventIds: [...principle.evidenceEventIds, evidenceEventId],
    confidence: nextConfidence,
    lastReinforcedAt: new Date().toISOString(),
  }

  all[idx] = updated
  persist(PRINCIPLES_KEY, all)
  if (isClient()) dbUpsertPrinciple(updated).catch(() => {})
  return updated
}

// ---------------------------------------------------------------------------
// Conflict Detection
// Async: calls /api/studio/conflicts to check a new principle against existing ones.
// Stores detected conflicts in localStorage.
// ---------------------------------------------------------------------------

async function detectConflictsAsync(newPrinciple: StudioPrinciple): Promise<void> {
  const existing = getStudioPrinciples().filter((p) => p.id !== newPrinciple.id)
  if (existing.length < 2) return

  try {
    const r = await fetch("/api/studio/conflicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPrinciple, existingPrinciples: existing }),
    })
    if (!r.ok) return
    const conflicts = await r.json() as PrincipleConflict[]
    if (conflicts.length > 0) {
      const existing_ = getPrincipleConflicts()
      persist(CONFLICTS_KEY, [...conflicts, ...existing_])
      conflicts.forEach((c) => dbUpsertConflict(c).catch(() => {}))
    }
  } catch { /* network failure — silent */ }
}

export function getPrincipleConflicts(): PrincipleConflict[] {
  return readArray<PrincipleConflict>(CONFLICTS_KEY)
    .filter((c) => c.resolution === "unresolved")
    .sort((a, b) => (a.detectedAt > b.detectedAt ? -1 : 1))
}

export function resolveConflict(conflictId: string, taiNote?: string): void {
  const all = readArray<PrincipleConflict>(CONFLICTS_KEY).map((c) =>
    c.id === conflictId
      ? { ...c, resolution: "tai_resolved" as const, taiNote }
      : c
  )
  persist(CONFLICTS_KEY, all)
  const resolved = all.find((c) => c.id === conflictId)
  if (resolved && isClient()) dbUpsertConflict(resolved).catch(() => {})
}

// ---------------------------------------------------------------------------
// Audience Feedback
// ---------------------------------------------------------------------------

export function getAudienceFeedback(): AudienceFeedback[] {
  return readArray<AudienceFeedback>(FEEDBACK_KEY).sort((a, b) => (a.at > b.at ? -1 : 1))
}

export function getProductionFeedback(productionId: string): AudienceFeedback[] {
  return getAudienceFeedback().filter((f) => f.productionId === productionId)
}

export function saveAudienceFeedback(
  feedback: Omit<AudienceFeedback, "id" | "at" | "processed">
): AudienceFeedback {
  const item: AudienceFeedback = {
    ...feedback,
    id: uid("feedback"),
    at: new Date().toISOString(),
    processed: false,
  }
  persist(FEEDBACK_KEY, [item, ...getAudienceFeedback()])
  if (isClient()) dbUpsertFeedback(item).catch(() => {})

  // Async: process the feedback signal into principle impact
  if (isClient()) processFeedbackAsync(item).catch(() => {})

  return item
}

async function processFeedbackAsync(feedback: AudienceFeedback): Promise<void> {
  try {
    const r = await fetch("/api/studio/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, principles: getStudioPrinciples() }),
    })
    if (!r.ok) return
    const { studioInterpretation, principleImpact, reinforcePrincipleId } = await r.json() as {
      studioInterpretation: string
      principleImpact: string
      reinforcePrincipleId?: string
    }

    const updated = { ...feedback, studioInterpretation, principleImpact, processed: true }
    const all = getAudienceFeedback().map((f) => f.id === feedback.id ? updated : f)
    persist(FEEDBACK_KEY, all)
    dbUpsertFeedback(updated).catch(() => {}) // sync interpretation to Supabase

    if (reinforcePrincipleId) reinforcePrinciple(reinforcePrincipleId, feedback.id)
  } catch { /* silent */ }
}

export function deleteAudienceFeedback(feedbackId: string): void {
  persist(FEEDBACK_KEY, getAudienceFeedback().filter((f) => f.id !== feedbackId))
  if (isClient()) dbDeleteFeedback(feedbackId).catch(() => {})
}

// ---------------------------------------------------------------------------
// World Canon (editable)
// ---------------------------------------------------------------------------

export function getWorldCanon(): WorldCanonItem[] {
  const stored = readArray<WorldCanonItem>(WORLD_CANON_KEY)
  // Merge: stored custom items + defaults, deduplicated by id

  // Custom items (not overriding defaults unless stored explicitly)
  const storedIds = new Set(stored.map((s) => s.id))
  const defaults = DEFAULT_WORLD_CANON.filter((d) => !storedIds.has(d.id))
  return [...stored, ...defaults]
}

export function saveWorldCanonItem(item: Omit<WorldCanonItem, "id"> & { id?: string }, isSeed = false): WorldCanonItem {
  const canon = readArray<WorldCanonItem>(WORLD_CANON_KEY)
  const full: WorldCanonItem = { ...item, id: item.id ?? uid("canon") }
  const idx = canon.findIndex((c) => c.id === full.id)
  if (idx >= 0) canon[idx] = full
  else canon.unshift(full)
  persist(WORLD_CANON_KEY, canon)
  if (isClient()) dbUpsertWorldCanonItem(full, isSeed).catch(() => {})
  return full
}

export function deleteWorldCanonItem(itemId: string): void {
  persist(WORLD_CANON_KEY, readArray<WorldCanonItem>(WORLD_CANON_KEY).filter((c) => c.id !== itemId))
  if (isClient()) dbDeleteWorldCanonItem(itemId).catch(() => {})
}

// ---------------------------------------------------------------------------
// Proactive Suggestion Cache
// Library auto-runs pattern analysis if: ≥2 productions AND
// (no cache OR cache is >24h old OR production count changed).
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function getProactiveSuggestions(): ProactiveSuggestionCache | null {
  return readItem<ProactiveSuggestionCache>(PROACTIVE_CACHE_KEY)
}

export function saveProactiveSuggestions(cache: ProactiveSuggestionCache): void {
  persistItem(PROACTIVE_CACHE_KEY, cache)
  // No emitChange — this is background, shouldn't re-render everything
}

export function shouldRunProactiveAnalysis(currentProductionCount: number): boolean {
  if (currentProductionCount < 2) return false
  const cached = getProactiveSuggestions()
  if (!cached) return true
  const age = Date.now() - new Date(cached.generatedAt).getTime()
  if (age > CACHE_TTL_MS) return true
  if (cached.productionCount !== currentProductionCount) return true
  return false
}

// ---------------------------------------------------------------------------
// World Canon seed
// Call once to push the full World Bible canon to Supabase.
// Idempotent: uses upsert so safe to re-run.
// ---------------------------------------------------------------------------

const CANON_SEEDED_KEY = "tts_canon_seeded_v2"

export async function seedWorldBibleToSupabase(): Promise<void> {
  if (!isClient()) return
  if (localStorage.getItem(CANON_SEEDED_KEY)) return
  try {
    await Promise.all(
      DEFAULT_WORLD_CANON.map((item) => dbUpsertWorldCanonItem(item, true).catch(() => {}))
    )
    // Also populate localStorage so getWorldCanon() reflects the full bible immediately
    persist(WORLD_CANON_KEY, DEFAULT_WORLD_CANON)
    localStorage.setItem(CANON_SEEDED_KEY, Date.now().toString())
  } catch { /* offline — will retry */ }
}

// ---------------------------------------------------------------------------
// Sync helpers
// ---------------------------------------------------------------------------

export async function syncMemoryFromServer(): Promise<void> {
  await syncFromServer()
}

export async function ensureMemoryMigrated(): Promise<void> {
  await ensureMigrated()
}
