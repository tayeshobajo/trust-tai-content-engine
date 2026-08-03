/**
 * Generation Pipeline — capability checking, validation, and pre-generation guards
 *
 * Before a frame is sent to a render model, this module verifies:
 *   1. The model supports the required capabilities (reference image, aspect ratio, etc.)
 *   2. All required fields on the Shot are populated
 *   3. Negative constraints are formatted for the model
 *   4. The shot's generation meta is properly versioned
 *
 * QA coverage: Section 10 (Keyframe Generation Readiness)
 */

import type { Shot, FrameGenerationMeta } from "@/data/studio"

// ─── Model Capability Registry ────────────────────────────────────────────────

export type ModelCapability =
  | "reference-image"
  | "negative-prompt"
  | "seed-control"
  | "custom-aspect-ratio"
  | "transparent-background"
  | "inpainting"
  | "outpainting"
  | "video-from-frame"
  | "multi-character"

export interface ModelProfile {
  id: string
  name: string
  capabilities: Set<ModelCapability>
  /** Supported aspect ratios */
  aspectRatios: string[]
  /** Cost per image in credits or USD */
  costPerImage: number
  /** Max output resolution */
  maxResolution: string
  /** Whether this model can be used as a fallback */
  canFallback: boolean
}

/** Known models and their capabilities */
export const MODEL_REGISTRY: ModelProfile[] = [
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    capabilities: new Set<ModelCapability>(["negative-prompt", "custom-aspect-ratio"]),
    aspectRatios: ["1:1", "16:9", "9:16", "1792x1024", "1024x1792"],
    costPerImage: 0.04,
    maxResolution: "1792x1024",
    canFallback: true,
  },
  {
    id: "sdxl",
    name: "Stable Diffusion XL",
    capabilities: new Set<ModelCapability>([
      "reference-image",
      "negative-prompt",
      "seed-control",
      "custom-aspect-ratio",
    ]),
    aspectRatios: ["1:1", "16:9", "9:16", "3:2", "2:3"],
    costPerImage: 0.02,
    maxResolution: "1536x1536",
    canFallback: true,
  },
  {
    id: "flux-pro",
    name: "FLUX.1 Pro",
    capabilities: new Set<ModelCapability>([
      "reference-image",
      "negative-prompt",
      "seed-control",
      "custom-aspect-ratio",
      "multi-character",
    ]),
    aspectRatios: ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3"],
    costPerImage: 0.05,
    maxResolution: "2048x2048",
    canFallback: false,
  },
  {
    id: "midjourney-v6",
    name: "Midjourney v6",
    capabilities: new Set<ModelCapability>([
      "reference-image",
      "seed-control",
      "custom-aspect-ratio",
      "multi-character",
    ]),
    aspectRatios: ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "21:9"],
    costPerImage: 0.1,
    maxResolution: "2048x2048",
    canFallback: false,
  },
]

export function getModel(id: string): ModelProfile | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id)
}

export function getFallbackModel(primaryId: string): ModelProfile | undefined {
  return MODEL_REGISTRY.find((m) => m.id !== primaryId && m.canFallback)
}

// ─── Capability Check ─────────────────────────────────────────────────────────

export interface CapabilityCheckResult {
  passed: boolean
  modelId: string
  missingCapabilities: ModelCapability[]
  warnings: string[]
  fallbackModelId?: string
}

/**
 * Verifies that the chosen model supports everything the shot requires.
 * If not, identifies a fallback that can.
 */
export function checkModelCapability(
  modelId: string,
  shot: Shot,
): CapabilityCheckResult {
  const model = getModel(modelId)
  if (!model) {
    return {
      passed: false,
      modelId,
      missingCapabilities: [],
      warnings: [`Unknown model: ${modelId}`],
    }
  }

  const required = new Set<ModelCapability>()
  const warnings: string[] = []

  // Reference image required if previousShotUrl is set (visual chaining)
  if (shot.previousShotUrl) {
    required.add("reference-image")
  }

  // Multi-character if orchestration implies it or description mentions multiple people
  const descLower = shot.description.toLowerCase()
  if (/\b(they|them|both|together|crowd|group|people)\b/.test(descLower)) {
    required.add("multi-character")
  }

  // Negative prompt if constraints are set
  if (shot.negativeConstraints && shot.negativeConstraints.length > 0) {
    required.add("negative-prompt")
  }

  // Find missing capabilities
  const missing: ModelCapability[] = []
  for (const cap of required) {
    if (!model.capabilities.has(cap)) {
      missing.push(cap)
    }
  }

  const passed = missing.length === 0

  // Find fallback if needed
  let fallbackModelId: string | undefined
  if (!passed) {
    const fallback = getFallbackModel(modelId)
    if (fallback) {
      const fallbackMissing = missing.filter((c) => !fallback.capabilities.has(c))
      if (fallbackMissing.length === 0) {
        fallbackModelId = fallback.id
      }
    }
  }

  // Warnings for suboptimal but not blocking conditions
  if (!model.capabilities.has("seed-control")) {
    warnings.push("Model lacks seed control — re-renders may differ significantly.")
  }

  return {
    passed,
    modelId,
    missingCapabilities: missing,
    warnings,
    fallbackModelId,
  }
}

// ─── Shot Readiness Check ─────────────────────────────────────────────────────

export interface ShotReadinessResult {
  ready: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Checks whether a shot has all required fields populated before generation.
 */
export function checkShotReadiness(shot: Shot): ShotReadinessResult {
  const missing: string[] = []
  const warnings: string[] = []

  if (!shot.description?.trim()) missing.push("description")
  if (!shot.renderPrompt?.trim()) missing.push("renderPrompt")
  if (!shot.cameraAngle) warnings.push("cameraAngle not set — model will default")
  if (!shot.shotSize) warnings.push("shotSize not set — model will default")
  if (!shot.lensIntention) warnings.push("lensIntention not set — model will default")
  if (!shot.composition?.trim()) warnings.push("composition not set — model will improvise")
  if (!shot.lightingNotes?.trim()) warnings.push("lightingNotes not set — model will improvise")
  if (!shot.atmosphereNotes?.trim()) warnings.push("atmosphereNotes not set — model will improvise")
  if (!shot.emotionalExpression?.trim()) warnings.push("emotionalExpression not set")
  if (!shot.orchestration) warnings.push("orchestration not set — shot will not chain cinematically")

  return {
    ready: missing.length === 0,
    missing,
    warnings,
  }
}

// ─── Negative Constraint Formatting ──────────────────────────────────────────

/**
 * Formats the shot's negative constraints into a single string for models
 * that support negative prompts. Returns empty string if none.
 */
export function formatNegativeConstraints(shot: Shot): string {
  const constraints = shot.negativeConstraints ?? []
  // Always include anti-drift defaults from the World Bible
  const defaults = [
    "neon colours",
    "oversaturated fantasy palette",
    "generic AI fantasy glow",
    "sleek digital screens",
    "holographic UI",
    "minimalist sci-fi surfaces",
    "medieval warrior clothing",
    "random magic effects",
    "spectacle without meaning",
  ]
  const all = [...new Set([...constraints, ...defaults])]
  return all.join(", ")
}

// ─── Generation Meta Helpers ──────────────────────────────────────────────────

/**
 * Creates initial generation metadata for a shot that has never been rendered.
 */
export function initGenerationMeta(modelId: string): FrameGenerationMeta {
  return {
    model: modelId,
    version: 0,
    capabilityChecked: false,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Increments the generation version after a successful render.
 */
export function bumpGenerationVersion(
  meta: FrameGenerationMeta,
  modelId: string,
  cost?: number,
  seed?: number,
  fallbackModel?: string,
): FrameGenerationMeta {
  return {
    ...meta,
    model: modelId,
    version: meta.version + 1,
    cost,
    seed,
    fallbackModel,
    capabilityChecked: true,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Pre-Generation Guard ─────────────────────────────────────────────────────

export interface PreGenerationResult {
  proceed: boolean
  shotReady: ShotReadinessResult
  capabilityCheck: CapabilityCheckResult
  formattedNegativeConstraints: string
  effectiveModelId: string
  blockedReasons: string[]
}

/**
 * The master pre-generation check. Run this before sending a shot to any render API.
 * Returns everything the render route needs to proceed safely.
 */
export function preGenerationGuard(
  shot: Shot,
  requestedModelId: string,
): PreGenerationResult {
  const shotReady = checkShotReadiness(shot)
  const capabilityCheck = checkModelCapability(requestedModelId, shot)
  const formattedNegativeConstraints = formatNegativeConstraints(shot)

  const blockedReasons: string[] = []
  if (!shotReady.ready) {
    blockedReasons.push(`Missing required fields: ${shotReady.missing.join(", ")}`)
  }
  if (!capabilityCheck.passed) {
    if (capabilityCheck.fallbackModelId) {
      // Can proceed with fallback
    } else {
      blockedReasons.push(
        `Model ${requestedModelId} missing capabilities: ${capabilityCheck.missingCapabilities.join(", ")}`,
      )
    }
  }

  const effectiveModelId = capabilityCheck.passed
    ? requestedModelId
    : capabilityCheck.fallbackModelId ?? requestedModelId

  return {
    proceed: blockedReasons.length === 0,
    shotReady,
    capabilityCheck,
    formattedNegativeConstraints,
    effectiveModelId,
    blockedReasons,
  }
}
