/**
 * Versioning + Audit Trail — Entity-level version history, approval tracking,
 * rollback, and side-by-side comparison
 *
 * QA coverage: Section 18 (Versioning, Approvals, Rollback)
 */

// ─── Entity Version Types ─────────────────────────────────────────────────────

export type EntityType = "production" | "character" | "place" | "prop" | "script" | "post"

export interface EntityVersion {
  id: string
  entityType: EntityType
  entityId: string
  version: number
  /** Human-readable snapshot label */
  label: string
  /** What changed in this version */
  changeSummary: string
  /** Who made the change */
  changedBy: string
  /** When the change was made */
  changedAt: string
  /** Whether this version was approved */
  approved: boolean
  approvedBy?: string
  approvedAt?: string
  /** Serialized snapshot of the entity at this version (opaque blob) */
  snapshot: Record<string, unknown>
}

// ─── Audit Trail Entry ────────────────────────────────────────────────────────

export type AuditAction =
  | "create"
  | "update"
  | "approve"
  | "reject"
  | "rollback"
  | "lock"
  | "unlock"
  | "comment"
  | "status-change"

export interface AuditEntry {
  id: string
  entityType: EntityType
  entityId: string
  entityName: string
  action: AuditAction
  description: string
  actor: string
  timestamp: string
  /** Before state (for diffs) */
  before?: Record<string, unknown>
  /** After state */
  after?: Record<string, unknown>
  /** Related entity (e.g. cascade target) */
  relatedEntityType?: EntityType
  relatedEntityId?: string
}

// ─── Version History Store ────────────────────────────────────────────────────

/**
 * In-memory store for entity versions and audit entries.
 * In production, this would be backed by Supabase.
 */
const versionStore = new Map<string, EntityVersion[]>()
const auditStore: AuditEntry[] = []

// ─── Version Operations ───────────────────────────────────────────────────────

/**
 * Records a new version of an entity.
 */
export function recordVersion(
  entityType: EntityType,
  entityId: string,
  changeSummary: string,
  changedBy: string,
  snapshot: Record<string, unknown>,
  label?: string,
): EntityVersion {
  const key = `${entityType}:${entityId}`
  const history = versionStore.get(key) ?? []
  const version = history.length + 1

  const entityVersion: EntityVersion = {
    id: `ver-${entityType}-${entityId}-v${version}`,
    entityType,
    entityId,
    version,
    label: label ?? `Version ${version}`,
    changeSummary,
    changedBy,
    changedAt: new Date().toISOString(),
    approved: false,
    snapshot,
  }

  history.push(entityVersion)
  versionStore.set(key, history)

  // Record audit entry
  recordAudit({
    entityType,
    entityId,
    entityName: snapshot.name as string ?? entityId,
    action: "update",
    description: changeSummary,
    actor: changedBy,
    after: snapshot,
  })

  return entityVersion
}

/**
 * Approves a specific version of an entity.
 */
export function approveVersion(
  entityType: EntityType,
  entityId: string,
  version: number,
  approvedBy: string,
): EntityVersion | null {
  const key = `${entityType}:${entityId}`
  const history = versionStore.get(key) ?? []
  const target = history.find((v) => v.version === version)
  if (!target) return null

  target.approved = true
  target.approvedBy = approvedBy
  target.approvedAt = new Date().toISOString()

  recordAudit({
    entityType,
    entityId,
    entityName: entityId,
    action: "approve",
    description: `Version ${version} approved`,
    actor: approvedBy,
  })

  return target
}

/**
 * Rolls back an entity to a prior version.
 */
export function rollbackToVersion(
  entityType: EntityType,
  entityId: string,
  targetVersion: number,
  rolledBy: string,
): EntityVersion | null {
  const key = `${entityType}:${entityId}`
  const history = versionStore.get(key) ?? []
  const target = history.find((v) => v.version === targetVersion)
  if (!target) return null

  // Record the rollback as a new version
  const rolledBack = recordVersion(
    entityType,
    entityId,
    `Rollback to version ${targetVersion}`,
    rolledBy,
    target.snapshot,
    `Rollback to v${targetVersion}`,
  )

  recordAudit({
    entityType,
    entityId,
    entityName: entityId,
    action: "rollback",
    description: `Rolled back to version ${targetVersion}`,
    actor: rolledBy,
    after: target.snapshot,
  })

  return rolledBack
}

/**
 * Retrieves the full version history for an entity.
 */
export function getVersionHistory(
  entityType: EntityType,
  entityId: string,
): EntityVersion[] {
  const key = `${entityType}:${entityId}`
  return versionStore.get(key) ?? []
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────

export function recordAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const auditEntry: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  auditStore.push(auditEntry)
  return auditEntry
}

export function getAuditTrail(
  entityType?: EntityType,
  entityId?: string,
  limit: number = 50,
): AuditEntry[] {
  let trail = [...auditStore]
  if (entityType) trail = trail.filter((e) => e.entityType === entityType)
  if (entityId) trail = trail.filter((e) => e.entityId === entityId)
  return trail.reverse().slice(0, limit)
}

// ─── Side-by-Side Comparison ──────────────────────────────────────────────────

export interface VersionComparison {
  field: string
  versionA: { version: number; value: unknown }
  versionB: { version: number; value: unknown }
  changed: boolean
}

/**
 * Compares two versions field by field.
 */
export function compareEntityVersions(
  vA: EntityVersion,
  vB: EntityVersion,
): VersionComparison[] {
  const fieldsA = Object.keys(vA.snapshot)
  const fieldsB = Object.keys(vB.snapshot)
  const allFields = [...new Set([...fieldsA, ...fieldsB])]

  return allFields.map((field) => {
    const valA = vA.snapshot[field]
    const valB = vB.snapshot[field]
    const changed = JSON.stringify(valA) !== JSON.stringify(valB)
    return {
      field,
      versionA: { version: vA.version, value: valA },
      versionB: { version: vB.version, value: valB },
      changed,
    }
  })
}
