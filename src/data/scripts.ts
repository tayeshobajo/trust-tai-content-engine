/**
 * Scripts — Scene-level script model linking shots to purpose and post references
 *
 * Each Script belongs to a Production and contains an ordered list of Scenes.
 * Each Scene maps to one or more Shots and carries:
 *   - The narrative purpose (why this scene exists)
 *   - The post/argument reference (what claim it serves)
 *   - Duration budget
 *   - Resolved character/place/prop references
 *
 * QA coverage: Section 9 (Script Readiness)
 */

import type { CameraAngle, ShotSize, LensIntention } from "@/data/studio"

export type ScenePurpose =
  | "establish-world"
  | "introduce-character"
  | "reveal-weight"
  | "escalate-stakes"
  | "create-breathing-room"
  | "turn-point"
  | "climax"
  | "resolution"
  | "landing"
  | "transition"

export const SCENE_PURPOSE_LABELS: Record<ScenePurpose, string> = {
  "establish-world": "Establish the world",
  "introduce-character": "Introduce character",
  "reveal-weight": "Reveal the weight",
  "escalate-stakes": "Escalate stakes",
  "create-breathing-room": "Breathing room",
  "turn-point": "Turn point",
  climax: "Climax",
  resolution: "Resolution",
  landing: "Landing",
  transition: "Transition",
}

export type SceneStatus = "draft" | "locked" | "approved" | "needs-revision"

/** A character appearing in this scene, resolved to the Character registry */
export interface SceneCharacterRef {
  characterId: string
  characterName: string
  /** Variation ID if a non-default appearance is used */
  variationId?: string
  /** Role in this scene */
  sceneRole: string
}

/** A place used in this scene, resolved to the Place registry */
export interface ScenePlaceRef {
  placeId: string
  placeName: string
  /** Variation ID if a non-default look is used */
  variationId?: string
}

/** A prop used in this scene, resolved to the Prop registry */
export interface ScenePropRef {
  propId: string
  propName: string
  /** Position/hand information for continuity */
  positionNote?: string
  /** Which character holds/interacts with it */
  heldBy?: string
}

/** A single scene in the script */
export interface ScriptScene {
  id: string
  /** Scene number in the script (may differ from shot number) */
  sceneNumber: number
  /** Working title */
  title: string
  /** Why this scene exists in the film */
  purpose: ScenePurpose
  /** The post section / argument claim this scene serves */
  postRef?: string
  /** Visual action description — what physically happens */
  visualAction: string
  /** Dialogue or narration text (if any) */
  dialogue?: string
  /** Duration budget for this scene in seconds */
  durationSec: number
  /** Shot numbers in the FilmPlan that belong to this scene */
  shotNumbers: number[]
  /** Camera default for this scene's shots */
  defaultCameraAngle?: CameraAngle
  /** Shot size default for this scene's shots */
  defaultShotSize?: ShotSize
  /** Lens default for this scene's shots */
  defaultLensIntention?: LensIntention
  /** Characters resolved from the Character registry */
  characters: SceneCharacterRef[]
  /** Places resolved from the Place registry */
  places: ScenePlaceRef[]
  /** Props resolved from the Prop registry */
  props: ScenePropRef[]
  /** Status of this scene */
  status: SceneStatus
  /** Notes from review */
  reviewNotes?: string
  /** When the scene was last modified */
  updatedAt: string
}

/** The full script for a production */
export interface Script {
  id: string
  productionId: string
  /** Script version — increments on save */
  version: number
  /** All scenes in order */
  scenes: ScriptScene[]
  /** When the script was created */
  createdAt: string
  /** When the script was last modified */
  updatedAt: string
  /** Script approval status */
  status: "draft" | "in-review" | "approved" | "needs-revision"
  /** Who approved it */
  approvedBy?: string
  approvedAt?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// DURATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface DurationValidation {
  /** Sum of all scene durations */
  totalSceneDuration: number
  /** Target duration from the production */
  targetDuration: number | null
  /** Difference (positive = over, negative = under) */
  delta: number | null
  /** Whether the total is within tolerance */
  isValid: boolean
  /** Tolerance in seconds (±) */
  toleranceSec: number
  /** Per-scene breakdown */
  sceneBreakdown: { sceneId: string; title: string; durationSec: number }[]
  /** Shots not assigned to any scene */
  unassignedShots: number[]
  /** Scenes with no shots */
  emptyScenes: string[]
}

/**
 * Validates that scene durations sum to the production's target duration.
 * Also checks for orphaned shots (in FilmPlan but not in any scene) and
 * empty scenes (scenes with no shot numbers).
 */
export function validateScriptDuration(
  script: Script,
  targetDurationSec?: number,
  shotCount?: number,
  toleranceSec: number = 3,
): DurationValidation {
  const sceneBreakdown = script.scenes.map((s) => ({
    sceneId: s.id,
    title: s.title,
    durationSec: s.durationSec,
  }))

  const totalSceneDuration = script.scenes.reduce((sum, s) => sum + s.durationSec, 0)
  const targetDuration = targetDurationSec ?? null
  const delta = targetDuration !== null ? totalSceneDuration - targetDuration : null
  const isValid = delta !== null ? Math.abs(delta) <= toleranceSec : true

  // Find unassigned shots
  const assignedShotNumbers = new Set<number>()
  script.scenes.forEach((s) => s.shotNumbers.forEach((n) => assignedShotNumbers.add(n)))
  const unassignedShots: number[] = []
  if (shotCount !== undefined) {
    for (let i = 1; i <= shotCount; i++) {
      if (!assignedShotNumbers.has(i)) unassignedShots.push(i)
    }
  }

  // Find empty scenes
  const emptyScenes = script.scenes
    .filter((s) => s.shotNumbers.length === 0)
    .map((s) => s.id)

  return {
    totalSceneDuration,
    targetDuration,
    delta,
    isValid,
    toleranceSec,
    sceneBreakdown,
    unassignedShots,
    emptyScenes,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANON SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════════

export const SCRIPTS: Script[] = []

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getScript(id: string): Script | undefined {
  return SCRIPTS.find((s) => s.id === id)
}

export function getScriptByProduction(productionId: string): Script | undefined {
  return SCRIPTS.find((s) => s.productionId === productionId)
}

export function getScene(script: Script, sceneId: string): ScriptScene | undefined {
  return script.scenes.find((s) => s.id === sceneId)
}

export function getScenesByPurpose(script: Script, purpose: ScenePurpose): ScriptScene[] {
  return script.scenes.filter((s) => s.purpose === purpose)
}
