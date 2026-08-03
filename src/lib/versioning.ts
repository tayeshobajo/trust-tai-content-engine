/**
 * Versioning — Post and asset version management
 *
 * Handles: snapshotting, restoring, diffing, cascade-invalidation.
 * All operations are pure functions — they return new objects, never mutate.
 */

import type { VersionedPost, PostVersion } from "@/data/posts"

// ─── Snapshot ─────────────────────────────────────────────────────────────────

/**
 * Creates a new version snapshot of the post's current content.
 * Returns the new PostVersion (caller persists it).
 */
export function createVersion(
  post: VersionedPost,
  changeSummary: string,
  approvedBy?: string,
): PostVersion {
  return {
    id: `v-${post.id}-${post.version}`,
    version: post.version,
    content: {
      hook: post.hook,
      body: post.body,
      cta: post.cta,
    },
    approvedBy,
    approvedAt: approvedBy ? new Date().toISOString() : undefined,
    changeSummary,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Advances the post to a new version, snapshotting the current state into history.
 */
export function bumpVersion(
  post: VersionedPost,
  changeSummary: string,
  approvedBy?: string,
): VersionedPost {
  const snapshot = createVersion(post, changeSummary, approvedBy)
  return {
    ...post,
    version: post.version + 1,
    versionHistory: [...post.versionHistory, snapshot],
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

/**
 * Restores a post to a prior version's content.
 * The current state is snapshotted into history before restoration.
 * Bumps the version number — restoration is a new version.
 */
export function restoreVersion(
  post: VersionedPost,
  targetVersionId: string,
): VersionedPost | null {
  const target = post.versionHistory.find((v) => v.id === targetVersionId)
  if (!target) return null

  const withSnapshot = bumpVersion(post, `Snapshot before restore to version ${target.version}`)
  return {
    ...withSnapshot,
    hook: target.content.hook,
    body: target.content.body,
    cta: target.content.cta,
  }
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

export interface VersionDiff {
  field: string
  before: string
  after: string
}

/**
 * Returns the field-level diff between two post versions.
 */
export function compareVersions(
  v1: PostVersion,
  v2: PostVersion,
): VersionDiff[] {
  const diffs: VersionDiff[] = []
  const fields: (keyof PostVersion["content"])[] = ["hook", "body", "cta"]
  for (const field of fields) {
    if (v1.content[field] !== v2.content[field]) {
      diffs.push({ field, before: v1.content[field], after: v2.content[field] })
    }
  }
  return diffs
}

// ─── Cascade invalidation ─────────────────────────────────────────────────────

export interface CascadeResult {
  postId: string
  fromVersion: number
  toVersion: number
  affectedProductionIds: string[]
  requiresDecision: boolean
}

/**
 * When a locked post changes version, this identifies every production
 * that references it and must be re-evaluated.
 *
 * Returns a CascadeResult for display + storage.
 * Caller decides whether to auto-invalidate or surface for Tai approval.
 */
export function cascadeInvalidate(
  post: VersionedPost,
  fromVersion: number,
  toVersion: number,
): CascadeResult {
  return {
    postId: post.id,
    fromVersion,
    toVersion,
    affectedProductionIds: [...post.linkedProductionIds],
    requiresDecision: post.locked && post.linkedProductionIds.length > 0,
  }
}

// ─── Lock helpers ─────────────────────────────────────────────────────────────

/**
 * Locks a post as source of truth.
 * Once locked, changes trigger cascade invalidation.
 */
export function lockPost(post: VersionedPost, lockedBy: string): VersionedPost {
  return {
    ...post,
    locked: true,
    lockedAt: new Date().toISOString(),
    lockedBy,
    approvedVersionId: `v-${post.id}-${post.version}`,
  }
}

/**
 * Unlocks a post (e.g. for revision).
 */
export function unlockPost(post: VersionedPost): VersionedPost {
  return { ...post, locked: false }
}
