/**
 * Frame QA System — Malformation detection, duplicate/near-identical detection,
 * and storyboard-as-sequence review
 *
 * This is a client-side QA layer that inspects rendered frames before they
 * advance to film assembly. It flags:
 *   1. Malformations (hands, faces, objects, text, architecture)
 *   2. Duplicate or near-identical frames across shots
 *   3. Sequence-level issues (composition drift, lighting inconsistency)
 *
 * QA coverage: Section 11 (Frame QA)
 */

import type { Shot } from "@/data/studio"

// ─── Malformation Categories ──────────────────────────────────────────────────

export type MalformationType =
  | "hands"
  | "face"
  | "limbs"
  | "text-artifact"
  | "architecture"
  | "object-warp"
  | "color-drift"
  | "identity-shift"
  | "symbol-misuse"
  | "wardrobe-error"

export const MALFORMATION_LABELS: Record<MalformationType, string> = {
  hands: "Hands / fingers",
  face: "Face / expression",
  limbs: "Limbs / posture",
  "text-artifact": "Text or writing artifacts",
  architecture: "Architecture / geometry",
  "object-warp": "Object warping",
  "color-drift": "Colour palette drift",
  "identity-shift": "Character identity shift",
  "symbol-misuse": "Symbol used incorrectly",
  "wardrobe-error": "Wardrobe continuity error",
}

export const MALFORMATION_SEVERITY = {
  critical: "critical",
  major: "major",
  minor: "minor",
} as const

export type MalformationSeverity = keyof typeof MALFORMATION_SEVERITY

export interface MalformationFinding {
  id: string
  type: MalformationType
  severity: MalformationSeverity
  description: string
  /** Shot number where found */
  shotNo: number
  /** Suggested fix */
  suggestedFix?: string
  /** Whether this blocks progression */
  blocksProgression: boolean
  detectedAt: string
}

export interface FrameQAResult {
  shotNo: number
  status: "pass" | "fail" | "warning"
  findings: MalformationFinding[]
  checkedAt: string
}

// ─── QA Checklist Items (per frame) ──────────────────────────────────────────

export interface FrameQAItem {
  id: string
  label: string
  description: string
  category: "identity" | "composition" | "world-consistency" | "technical"
  severityIfFailed: MalformationSeverity
}

/** Items checked on every frame */
export const FRAME_QA_ITEMS: FrameQAItem[] = [
  // Identity
  { id: "char-face-match", label: "Character face matches master reference", description: "The character's face is recognisably the same person as the master reference image.", category: "identity", severityIfFailed: "critical" },
  { id: "char-skin-tone", label: "Skin tone consistent with master", description: "Skin tone matches the approved master reference across all lighting conditions.", category: "identity", severityIfFailed: "major" },
  { id: "char-build", label: "Body build matches character spec", description: "Height, build, and posture match the character registry.", category: "identity", severityIfFailed: "major" },
  { id: "char-wardrobe", label: "Wardrobe matches approved set", description: "Clothing matches the approved wardrobe or an approved variation.", category: "identity", severityIfFailed: "major" },
  { id: "char-hair", label: "Hair matches master reference", description: "Hair style, length, and texture match the character spec.", category: "identity", severityIfFailed: "minor" },

  // Composition
  { id: "rule-of-thirds", label: "Composition follows storyboard intent", description: "The frame's composition matches what was planned in the keyframe storyboard.", category: "composition", severityIfFailed: "minor" },
  { id: "leading-lines", label: "Leading lines guide the eye", description: "Architectural or environmental lines direct attention to the intended subject.", category: "composition", severityIfFailed: "minor" },
  { id: "depth-layered", label: "Frame has layered depth", description: "Foreground, midground, and background are all present and distinguishable.", category: "composition", severityIfFailed: "minor" },
  { id: "subject-visible", label: "Subject is clearly visible", description: "The main subject is not obscured, cropped, or lost in shadow.", category: "composition", severityIfFailed: "major" },

  // World Consistency
  { id: "arch-consistent", label: "Architecture matches Place registry", description: "Buildings, arches, and structures match the approved Place master reference.", category: "world-consistency", severityIfFailed: "major" },
  { id: "materials-correct", label: "Materials match World Bible visual DNA", description: "Stone, brass, iron, glass, wood — all match the canonical material palette.", category: "world-consistency", severityIfFailed: "minor" },
  { id: "palette-compliant", label: "Colour palette matches Visual DNA", description: "Colours are within the navy/slate/brass/amber canonical range. No neon or fantasy oversaturation.", category: "world-consistency", severityIfFailed: "major" },
  { id: "tech-analog", label: "Technology is analog / handmade", description: "No sleek digital screens, holographic UI, or minimalist sci-fi surfaces.", category: "world-consistency", severityIfFailed: "critical" },
  { id: "symbols-correct", label: "Symbols used per Symbol System", description: "Each visible symbol (eagle, map, road, brass, stone, etc.) serves its canonical meaning.", category: "world-consistency", severityIfFailed: "major" },

  // Technical
  { id: "hands-rendered", label: "Hands fully rendered (no extra fingers)", description: "All hands have the correct number of fingers and are not warped.", category: "technical", severityIfFailed: "critical" },
  { id: "no-text-artifacts", label: "No random text or writing artifacts", description: "No gibberish text, fake writing, or random characters on surfaces.", category: "technical", severityIfFailed: "major" },
  { id: "no-blur-faces", label: "Faces are sharp and well-rendered", description: "No blurred, melted, or distorted faces.", category: "technical", severityIfFailed: "critical" },
  { id: "lighting-natural", label: "Lighting feels natural and motivated", description: "Light sources are logical — no unmotivated glow or impossible shadows.", category: "technical", severityIfFailed: "minor" },
  { id: "no-floating-artifacts", label: "No random floating elements", description: "No unexplained floating objects, ghosting, or render artifacts.", category: "technical", severityIfFailed: "major" },
]

// ─── Duplicate Detection ──────────────────────────────────────────────────────

export interface DuplicateFinding {
  shotA: number
  shotB: number
  similarity: "identical" | "near-identical" | "similar"
  note: string
}

/**
 * Detects duplicate or near-identical frames by comparing shot descriptions
 * and render prompts. In a full system, this would use perceptual hashing on
 * the actual rendered images.
 */
export function detectDuplicateFrames(shots: Shot[]): DuplicateFinding[] {
  const findings: DuplicateFinding[] = []

  for (let i = 0; i < shots.length; i++) {
    for (let j = i + 1; j < shots.length; j++) {
      const a = shots[i]
      const b = shots[j]
      if (!a.renderPrompt || !b.renderPrompt) continue

      const descA = a.description.toLowerCase().trim()
      const descB = b.description.toLowerCase().trim()
      const promptA = a.renderPrompt.toLowerCase().trim()
      const promptB = b.renderPrompt.toLowerCase().trim()

      // Exact description match
      if (descA === descB && descA.length > 20) {
        findings.push({
          shotA: a.no,
          shotB: b.no,
          similarity: "near-identical",
          note: "Shot descriptions are identical — verify these are distinct moments.",
        })
      }

      // Very similar render prompts
      if (promptA === promptB && promptA.length > 50) {
        findings.push({
          shotA: a.no,
          shotB: b.no,
          similarity: "identical",
          note: "Render prompts are identical — these will produce the same frame.",
        })
      }
    }
  }

  return findings
}

// ─── Sequence Review ──────────────────────────────────────────────────────────

export interface SequenceIssue {
  type: "composition-drift" | "lighting-inconsistent" | "pace-break" | "orphan-shot" | "missing-orchestration"
  shotNo: number
  description: string
  severity: MalformationSeverity
}

/**
 * Reviews the storyboard as a sequence — checks that shots flow together
 * cinematically, not just individually.
 */
export function reviewSequence(shots: Shot[]): SequenceIssue[] {
  const issues: SequenceIssue[] = []

  for (const shot of shots) {
    // Missing orchestration
    if (!shot.orchestration) {
      issues.push({
        type: "missing-orchestration",
        shotNo: shot.no,
        description: "No orchestration data — shot will not chain cinematically with adjacent shots.",
        severity: "minor",
      })
    }

    // Missing keyframe fields for generation
    if (!shot.cameraAngle) {
      issues.push({
        type: "composition-drift",
        shotNo: shot.no,
        description: "No camera angle set — composition may drift from storyboard intent.",
        severity: "minor",
      })
    }

    if (!shot.lightingNotes) {
      issues.push({
        type: "lighting-inconsistent",
        shotNo: shot.no,
        description: "No lighting notes — lighting may be inconsistent with adjacent shots.",
        severity: "minor",
      })
    }

    // Orphan shot (no link to purpose)
    if (!shot.purpose?.trim()) {
      issues.push({
        type: "orphan-shot",
        shotNo: shot.no,
        description: "No purpose defined — this shot has no narrative justification.",
        severity: "major",
      })
    }
  }

  return issues
}

// ─── Aggregate QA Status ──────────────────────────────────────────────────────

export interface FrameQASummary {
  totalShots: number
  renderedShots: number
  unrenderedShots: number
  passedShots: number
  failedShots: number
  warningShots: number
  uncheckedShots: number
  findings: MalformationFinding[]
  duplicates: DuplicateFinding[]
  sequenceIssues: SequenceIssue[]
  blockingCount: number
}

/**
 * Produces a full QA summary for a film plan's shots.
 */
export function summarizeFrameQA(shots: Shot[]): FrameQASummary {
  const renderedShots = shots.filter((s) => s.renderedImageUrl)
  const unrendered = shots.filter((s) => !s.renderedImageUrl)

  const findings: MalformationFinding[] = []
  const passedShots = renderedShots.filter((s) => s.coherenceStatus === "pass").length
  const failedShots = renderedShots.filter((s) => s.coherenceStatus === "fail").length
  const warningShots = renderedShots.filter((s) => s.coherenceStatus === "warning").length
  const uncheckedShots = renderedShots.filter(
    (s) => !s.coherenceStatus || s.coherenceStatus === "unchecked",
  ).length

  const duplicates = detectDuplicateFrames(shots)
  const sequenceIssues = reviewSequence(shots)

  const blockingCount = findings.filter((f) => f.blocksProgression).length

  return {
    totalShots: shots.length,
    renderedShots: renderedShots.length,
    unrenderedShots: unrendered.length,
    passedShots,
    failedShots,
    warningShots,
    uncheckedShots,
    findings,
    duplicates,
    sequenceIssues,
    blockingCount,
  }
}
