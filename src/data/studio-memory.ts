export type IntelligenceLayer = "world" | "voice" | "story" | "taste" | "audience"

export type CorrectionCategory =
  | "truth"
  | "tone"
  | "originality"
  | "structure"
  | "emotion"
  | "visual_execution"
  | "technical_quality"

export type LearningScope =
  | "this_production"
  | "format"
  | "all_trust_tai"
  | "world_canon"

export type LearningConfidence = "low" | "medium" | "high" | "canon" | "provisional"

export type LearningBehavior = "follow" | "warn" | "consider"

export type LearningSurface =
  | "thinking_room"
  | "approval_desk"
  | "film_studio"
  | "library"
  | "settings"

export interface CorrectionEvent {
  id: string
  productionId: string
  at: string
  surface: LearningSurface
  target: string
  before?: string
  after?: string
  labels: string[]
  category: CorrectionCategory
  scope: LearningScope
  keepUnchanged: string[]
  taiNote?: string
  studioInterpretation: string
  interpretationStatus: "pending" | "correct" | "partly_correct" | "wrong"
  principleId?: string
}

export interface StudioPrinciple {
  id: string
  title: string
  layer: IntelligenceLayer
  belief: string
  evidenceEventIds: string[]
  scope: LearningScope
  confidence: LearningConfidence
  formats: string[]
  exceptions: string[]
  lastReinforcedAt: string
  behavior: LearningBehavior
  source: "seed" | "tai_confirmed"
}

// ─── Audience Feedback ──────────────────────────────────────────────────────

export type AudienceFeedbackKind =
  | "quoted_idea"     // someone shared or quoted the idea
  | "deep_comment"    // comment showing genuine engagement
  | "confusion"       // audience didn't understand the point
  | "wrong_reading"   // audience read it as something Tai didn't intend
  | "trust_signal"    // DM, follow, or business inquiry
  | "indifference"    // low engagement / no meaningful response
  | "strong_reaction" // polarizing response (positive or negative)

export interface AudienceFeedback {
  id: string
  productionId: string
  at: string
  kind: AudienceFeedbackKind
  verbatim?: string          // the actual comment / quote if available
  channel: string            // "linkedin" | "instagram" | "dm" | "email" | "in-person"
  taiNote?: string           // Tai's interpretation of why this happened
  studioInterpretation?: string  // what Studio learned from this signal
  principleImpact?: string   // which principle this reinforces or challenges
  processed: boolean         // has Studio ingested this into a principle update?
}

export const FEEDBACK_KIND_LABELS: Record<AudienceFeedbackKind, string> = {
  quoted_idea: "Quoted idea",
  deep_comment: "Deep comment",
  confusion: "Audience confused",
  wrong_reading: "Wrong reading",
  trust_signal: "Trust signal",
  indifference: "Indifference",
  strong_reaction: "Strong reaction",
}

// ─── Conflict Detection ──────────────────────────────────────────────────────

export interface PrincipleConflict {
  id: string
  detectedAt: string
  principleA: string  // principle id
  principleB: string  // principle id
  description: string // how they conflict
  severity: "minor" | "moderate" | "major"
  resolution: "unresolved" | "tai_resolved" | "auto_resolved"
  taiNote?: string
}

// ─── Proactive Suggestion Cache ──────────────────────────────────────────────

export interface ProactiveSuggestionCache {
  generatedAt: string
  productionCount: number
  analysis: import("@/app/api/studio/patterns/route").PatternAnalysis
}

// ─── World Canon ─────────────────────────────────────────────────────────────

export interface WorldCanonItem {
  id: string
  kind: "character" | "location" | "object" | "symbol" | "law"
  name: string
  status: "canon" | "provisional" | "single_story"
  meaning: string
  neverMeans: string
}

export const CORRECTION_LABELS = [
  "Too obvious",
  "Too literal",
  "Too generic",
  "Too polished",
  "Feels AI-generated",
  "Emotionally cold",
  "Missing human weight",
  "Weak reveal",
  "Wrong truth",
  "Overexplained",
  "Too much spectacle",
  "Not Trust Tai",
  "Character lacks dignity",
  "Beautiful but empty",
  "Strong idea, weak execution",
  "Keep this, change only",
  "Unexpectedly right",
]

export const CORRECTION_CATEGORIES: { key: CorrectionCategory; label: string }[] = [
  { key: "truth", label: "Truth" },
  { key: "tone", label: "Tone" },
  { key: "originality", label: "Originality" },
  { key: "structure", label: "Structure" },
  { key: "emotion", label: "Emotion" },
  { key: "visual_execution", label: "Visual execution" },
  { key: "technical_quality", label: "Technical quality" },
]

export const LEARNING_SCOPES: { key: LearningScope; label: string }[] = [
  { key: "this_production", label: "This production only" },
  { key: "format", label: "This format" },
  { key: "all_trust_tai", label: "All Trust Tai content" },
  { key: "world_canon", label: "World canon" },
]


export const DEFAULT_STUDIO_PRINCIPLES: StudioPrinciple[] = []

// DEFAULT_WORLD_CANON — empty, populated from World Bible store
export const DEFAULT_WORLD_CANON: WorldCanonItem[] = []

export function layerLabel(layer: IntelligenceLayer): string {
  const labels: Record<IntelligenceLayer, string> = {
    world: "World",
    voice: "Voice",
    story: "Story",
    taste: "Taste",
    audience: "Audience",
  }
  return labels[layer]
}

export function scopeLabel(scope: LearningScope): string {
  return LEARNING_SCOPES.find((s) => s.key === scope)?.label ?? scope
}

export function inferLayer(category: CorrectionCategory, labels: string[]): IntelligenceLayer {
  if (category === "tone") return "voice"
  if (category === "visual_execution") return "world"
  if (category === "technical_quality") return "story"
  if (labels.includes("Not Trust Tai") || labels.includes("Too generic")) return "taste"
  if (labels.includes("Missing human weight") || labels.includes("Emotionally cold")) return "audience"
  if (labels.includes("Weak reveal") || labels.includes("Beautiful but empty")) return "story"
  return "taste"
}

export function suggestInterpretation(labels: string[], category: CorrectionCategory): string {
  if (labels.includes("Too literal")) {
    return "I think the issue is not the symbol itself. The symbol is doing the audience's thinking for them instead of revealing a perspective they can discover."
  }
  if (labels.includes("Missing human weight")) {
    return "I think the issue is that the idea is structurally clear, but the person inside it is not carrying enough private weight for the audience to recognize themselves."
  }
  if (labels.includes("Beautiful but empty")) {
    return "I think the issue is that the image has visual memory, but the human truth, Spirit, or audience shift is not strong enough to justify production."
  }
  if (labels.includes("Unexpectedly right")) {
    return "I think this worked because it protected the truth while surprising the pattern I would normally follow. I should treat this as positive evidence, not an exception to ignore."
  }
  if (category === "truth") {
    return "I think the issue is that the expression drifted from what Tai actually believes. I should protect the approved truth before improving style."
  }
  return "I think this correction reveals a preference, but I should keep it local until Tai confirms the broader principle."
}

