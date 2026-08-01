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

export const DEFAULT_STUDIO_PRINCIPLES: StudioPrinciple[] = [
  {
    id: "seed-perspective-before-lesson",
    title: "Perspective must change before the lesson is named",
    layer: "world",
    belief:
      "The reveal should make the audience see the system differently before copy explains the meaning.",
    evidenceEventIds: ["seed-1", "seed-2", "seed-3", "seed-4", "seed-5", "seed-6", "seed-7"],
    scope: "all_trust_tai",
    confidence: "high",
    formats: ["post", "film", "keyframes"],
    exceptions: [],
    lastReinforcedAt: "2026-07-31T12:00:00.000Z",
    behavior: "follow",
    source: "seed",
  },
  {
    id: "seed-possibility-not-moral",
    title: "End with possibility, not a packaged moral",
    layer: "voice",
    belief:
      "The closing line should open a door for the audience instead of summarizing the argument.",
    evidenceEventIds: [
      "seed-1",
      "seed-2",
      "seed-3",
      "seed-4",
      "seed-5",
      "seed-6",
      "seed-7",
      "seed-8",
      "seed-9",
      "seed-10",
      "seed-11",
    ],
    scope: "format",
    confidence: "high",
    formats: ["post", "film"],
    exceptions: [],
    lastReinforcedAt: "2026-07-30T12:00:00.000Z",
    behavior: "follow",
    source: "seed",
  },
  {
    id: "seed-altitude-needs-story-job",
    title: "Literal altitude symbols need a story job",
    layer: "taste",
    belief:
      "Birds, aerial views, and height should reveal perspective. They should not act as automatic brand signatures.",
    evidenceEventIds: ["seed-1", "seed-2", "seed-3"],
    scope: "format",
    confidence: "medium",
    formats: ["films", "keyframes"],
    exceptions: ["Use altitude when it changes what the character can understand."],
    lastReinforcedAt: "2026-07-29T12:00:00.000Z",
    behavior: "warn",
    source: "seed",
  },
  {
    id: "seed-beautiful-empty-failure",
    title: "Beautiful but empty is a failure state",
    layer: "story",
    belief:
      "A visually memorable premise cannot compensate for weak human truth, Spirit, or audience shift.",
    evidenceEventIds: ["seed-1", "seed-2", "seed-3", "seed-4", "seed-5"],
    scope: "format",
    confidence: "high",
    formats: ["concept approval"],
    exceptions: [],
    lastReinforcedAt: "2026-07-31T12:00:00.000Z",
    behavior: "warn",
    source: "seed",
  },
  {
    id: "seed-recognition-over-reach",
    title: "Recognition matters more than reach",
    layer: "audience",
    belief:
      "Audience learning should value quoted ideas, thoughtful comments, and trust signals over raw engagement.",
    evidenceEventIds: ["seed-1", "seed-2"],
    scope: "format",
    confidence: "provisional",
    formats: ["post-publication"],
    exceptions: [],
    lastReinforcedAt: "2026-07-28T12:00:00.000Z",
    behavior: "consider",
    source: "seed",
  },
]

// DEFAULT_WORLD_CANON — sourced from THE TRUST TAI WORLD BIBLE v1.0
// Symbols, laws, and characters that govern every Trust Tai production.
// These are seeded to tts_world_canon on first Supabase sync.
export const DEFAULT_WORLD_CANON: WorldCanonItem[] = [
  // ── Core Laws ──────────────────────────────────────────────────────────────
  {
    id: "canon-elevation-reveals-systems",
    kind: "law",
    name: "Elevation reveals systems",
    status: "canon",
    meaning: "Height gives access to systemic perspective — it changes what can be understood, not just seen.",
    neverMeans: "Superiority, moral rank, or spectacle. Height without new understanding is decoration.",
  },
  {
    id: "canon-inner-realities-manifest",
    kind: "law",
    name: "Inner realities can acquire physical form",
    status: "canon",
    meaning: "Weight, purpose, memory, confusion, possibility — the things people carry internally can become physically visible in this world.",
    neverMeans: "Generic magic. Every manifestation must be emotionally legible.",
  },
  {
    id: "canon-routes-respond-to-intention",
    kind: "law",
    name: "Routes respond to intention",
    status: "canon",
    meaning: "The path a person is on is shaped by what they are genuinely trying to do — not just where their feet are pointed.",
    neverMeans: "Determinism. The world reveals; it does not override choice.",
  },
  {
    id: "canon-wisdom-reveals-not-dominates",
    kind: "law",
    name: "Wisdom reveals; it does not dominate",
    status: "canon",
    meaning: "Guides, elders, and mapmakers offer perspective. They do not rescue the protagonist or become the hero.",
    neverMeans: "The guide solving the problem. The protagonist must retain the decisive choice.",
  },
  // ── Symbols ────────────────────────────────────────────────────────────────
  {
    id: "canon-eagle",
    kind: "symbol",
    name: "Eagle",
    status: "canon",
    meaning: "Altitude, witness, perspective unavailable from the ground. The eagle sees the system the protagonist cannot yet see.",
    neverMeans: "Automatic logo, mascot, savior, or brand signature.",
  },
  {
    id: "canon-map",
    kind: "symbol",
    name: "Map",
    status: "canon",
    meaning: "A record of relationships and possibilities. A map restores choice — it does not walk the road for someone.",
    neverMeans: "Generic treasure map or motivational prop.",
  },
  {
    id: "canon-living-road",
    kind: "symbol",
    name: "Living road",
    status: "canon",
    meaning: "Intention, dependency, and movement made legible. Roads that glow or move reflect active human purpose.",
    neverMeans: "Random glowing line or generic sci-fi FX.",
  },
  {
    id: "canon-brass-intervention",
    kind: "symbol",
    name: "Brass",
    status: "canon",
    meaning: "Deliberate human intervention — knowledge shaped by hands. Marks points of leverage, repair, or designed help.",
    neverMeans: "Universal gold decoration or luxury signaling without a story function.",
  },
  {
    id: "canon-glass",
    kind: "symbol",
    name: "Glass",
    status: "provisional",
    meaning: "Visibility with fragility. What can be seen through, but broken.",
    neverMeans: "Generic sci-fi screen or surface decoration.",
  },
  {
    id: "canon-stone",
    kind: "symbol",
    name: "Stone",
    status: "canon",
    meaning: "History, burden, memory, enduring structure. What has been carried long enough to become part of the landscape.",
    neverMeans: "Meaningless floating debris or generic fantasy architecture.",
  },
  {
    id: "canon-water-reflection",
    kind: "symbol",
    name: "Water / reflection",
    status: "provisional",
    meaning: "Another layer of truth, memory, or possible self-recognition. The reflection that shows what the surface does not.",
    neverMeans: "Decorative puddle or cinematic beauty without function.",
  },
  {
    id: "canon-case-container",
    kind: "symbol",
    name: "Case / container",
    status: "canon",
    meaning: "A world, system, memory, or responsibility that someone is physically transporting. The weight of what depends on them.",
    neverMeans: "Convenient steampunk luggage or set dressing.",
  },
  {
    id: "canon-door-threshold",
    kind: "symbol",
    name: "Door / threshold",
    status: "provisional",
    meaning: "Entry into a larger reality that still requires consent. The protagonist must choose to cross.",
    neverMeans: "Obvious portal cliché or passive teleportation.",
  },
  {
    id: "canon-light",
    kind: "symbol",
    name: "Light",
    status: "canon",
    meaning: "Recognition or active relationship — light marks where understanding is present or beginning.",
    neverMeans: "Holiness, moral goodness, or constant ambient magic glow.",
  },
  {
    id: "canon-market",
    kind: "symbol",
    name: "Market",
    status: "provisional",
    meaning: "Exchange of knowledge, tools, histories, and burdens. A place where people with different levels of understanding meet.",
    neverMeans: "Exotic visual clutter or generic fantasyscape.",
  },
  // ── Characters ─────────────────────────────────────────────────────────────
  {
    id: "canon-quiet-observer",
    kind: "character",
    name: "The quiet observer",
    status: "provisional",
    meaning: "A figure who sees the system without needing to dominate the scene. Often knows more than they say.",
    neverMeans: "A passive character who avoids responsibility or exists only as set dressing.",
  },
  {
    id: "canon-guide-revealer",
    kind: "character",
    name: "The guide / revealer",
    status: "canon",
    meaning: "An elder, mapmaker, or instrument who helps the protagonist see. Offers perspective, not rescue. Does not take the decisive choice away.",
    neverMeans: "The savior. The guide succeeds when the protagonist acts — not when the guide acts for them.",
  },
]

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

