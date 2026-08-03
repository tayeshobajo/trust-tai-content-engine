// Trust Tai Studio V1 data model.
// A Production is one thought moving through the five approval gates.

export type SourceType =
  | "Typed thought"
  | "Voice transcript"
  | "Meeting insight"
  | "Article reaction"
  | "Rough draft"
  | "Question to explore"

export const SOURCE_TYPES: SourceType[] = [
  "Typed thought",
  "Voice transcript",
  "Meeting insight",
  "Article reaction",
  "Rough draft",
  "Question to explore",
]

export type GateKey = "truth" | "post" | "concept" | "keyframes" | "film"

export type GateStatus = "open" | "approved" | "hold"

export interface Gate {
  key: GateKey
  status: GateStatus
  decidedAt?: string
}

export const GATE_ORDER: GateKey[] = ["truth", "post", "concept", "keyframes", "film"]

export const GATE_LABELS: Record<GateKey, string> = {
  truth: "Truth approved",
  post: "Post approved",
  concept: "Concept approved",
  keyframes: "Keyframes approved",
  film: "Final film approved",
}

export const GATE_SHORT_LABELS: Record<GateKey, string> = {
  truth: "Truth",
  post: "Post",
  concept: "Concept",
  keyframes: "Keyframes",
  film: "Final film",
}

export const GATE_QUESTIONS: Record<GateKey, string> = {
  truth: "Is this genuinely what Tai believes?",
  post: "Is the written argument ready?",
  concept: "Is the metaphor unconventional, relevant, and producible?",
  keyframes: "Do world, character, composition, and sequence work before spending render credits?",
  film: "Are motion, continuity, sound, pacing, color, and ending polished?",
}

export interface ContentSpine {
  whatHappened: string
  whatTaiNoticed: string
  whatOthersMiss: string
  deeperTruth: string
  roadmapConnection: string
  founderValue: string
  rememberSentence: string
}

export const SPINE_LABELS: { key: keyof ContentSpine; label: string }[] = [
  { key: "whatHappened", label: "What happened" },
  { key: "whatTaiNoticed", label: "What Tai noticed" },
  { key: "whatOthersMiss", label: "What others may be missing" },
  { key: "deeperTruth", label: "The deeper business truth" },
  { key: "roadmapConnection", label: "The Roadmap Thinking connection" },
  { key: "founderValue", label: "The practical value for a founder" },
  { key: "rememberSentence", label: "The one sentence to remember" },
]

export interface AudienceShift {
  beginning: string
  end: string
}

export interface ArgumentSection {
  name: string
  text: string
  rationale: string
}

export interface VoiceWarning {
  rule: string
  detail: string
}

export interface StudioComment {
  at: string
  text: string
}

export interface Revision {
  at: string
  note: string
  sections?: ArgumentSection[] | null
}

export type ConceptKey = "grounded-strange" | "visual-parable" | "cinematic-mechanism"

export interface ConceptDirection {
  key: ConceptKey
  name: string
  premise: string
  visualAction: string
  whyItEarnsAttention: string
  represents: string
  connection: string
  reveal: string
  producibility: string
  shotCount: number
  costEstimate: string
}

export interface Shot {
  no: number
  description: string
  durationSec: number
  route: string
  purpose: string
  renderedImageUrl?: string
  renderedVideoUrl?: string
  renderPrompt?: string
  motionStatus?: "idle" | "queued" | "blocked" | "rendered"
  /** Scene Conductor orchestration data — governs how this shot moves in relation to adjacent shots. */
  orchestration?: import("@/lib/world-bible").SceneOrchestration
  /** URL of the previous shot's rendered frame — used for visual chaining in sequential render. */
  previousShotUrl?: string
  /** Coherence check result for this shot's frame. */
  coherenceStatus?: "unchecked" | "pass" | "fail" | "warning"
  coherenceNote?: string
}

export interface KeyframePlan {
  firstFrame: string
  lastFrame: string
  anchors: string
}

export interface ModelRouteStep {
  role: string
  model: string
  why: string
}

export interface ContinuityItem {
  item: string
  checked: boolean
}

export interface FilmPlan {
  selectedConcept: ConceptKey | null
  concepts: ConceptDirection[]
  treatment: string[]
  shots: Shot[]
  keyframes: KeyframePlan
  modelRoute: ModelRouteStep[]
  continuity: ContinuityItem[]
  /** Character reference images — locked after keyframe approval. Key = character name, value = image URL. */
  characterRefs?: Record<string, string>
}

/** A scoped exception to a World Bible rule for this production only */
export interface WorldRuleException {
  id: string
  ruleId: string
  reason: string
  approvedBy: string
  approvedAt: string
}

export type LibraryStatus = "in_production" | "ready" | "published" | "archived"

export interface PublishPackage {
  linkedinPost: string
  caption: string
  firstComment: string
  accessibilityText: string
}

export interface Production {
  publishedAt?: string
  archivedAt?: string
  id: string
  title: string
  sourceType: SourceType
  sourceThought: string
  createdAt: string
  updatedAt: string
  spine: ContentSpine
  shift: AudienceShift
  sections: ArgumentSection[]
  voiceWarnings: VoiceWarning[]
  comments: StudioComment[]
  revisions: Revision[]
  gates: Record<GateKey, Gate>
  film: FilmPlan
  // ── Production Definition (QA Section 2) ──────────────────────────────────
  /** Target duration of the final film in seconds */
  targetDurationSec?: number
  /** Required export aspect ratios e.g. ["16:9", "9:16", "1:1"] */
  aspectRatios?: string[]
  /** Intended publication platform */
  platform?: "linkedin" | "instagram" | "x" | "youtube"
  /** The desired emotional state the audience should reach */
  desiredEmotion?: string
  /** The final image or feeling the audience should retain */
  finalFeeling?: string
  /** Estimated generation credit budget */
  generationBudget?: number
  /** Person responsible for the next unresolved decision */
  decisionOwner?: string
  // ── Source Truth Lock (QA Section 1) ─────────────────────────────────────
  /** ID of the linked VersionedPost */
  linkedPostId?: string
  /** Version of the post this production was built against */
  linkedPostVersion?: number
  /** Central argument the film must serve */
  centralArgument?: string
  /** Claims the film must not contradict */
  protectedClaims?: string[]
  // ── World Bible Binding (QA Section 4) ───────────────────────────────────
  /** World Bible version loaded for this production */
  worldBibleVersion?: string
  /** Rule IDs explicitly activated for this production */
  activeWorldRules?: string[]
  /** Rule IDs excluded from this production (without deleting globally) */
  excludedWorldRules?: string[]
  /** Production-scoped exceptions to World Bible rules */
  productionExceptions?: WorldRuleException[]
  /** Which World memories influenced which generated assets */
  worldMemoryInfluences?: { assetId: string; memoryIds: string[] }[]
}

export function assembleArgument(sections: ArgumentSection[]): string {
  return sections
    .map((s) => s.text.trim())
    .filter((t) => t.length > 0)
    .join("\n\n")
}

export function nextGate(p: Production): GateKey | null {
  for (const key of GATE_ORDER) {
    if (p.gates[key].status !== "approved") return key
  }
  return null
}

export function approvedGateCount(p: Production): number {
  return GATE_ORDER.filter((k) => p.gates[k].status === "approved").length
}

export function libraryStatus(p: Production): LibraryStatus {
  if (p.archivedAt) return "archived"
  if (p.publishedAt) return "published"
  if (nextGate(p) === null) return "ready"
  return "in_production"
}

export function stageLabel(p: Production): string {
  const gate = nextGate(p)
  if (gate === null) return "Package ready"
  const map: Record<GateKey, string> = {
    truth: "Truth review",
    post: "Argument review",
    concept: "Concept selection",
    keyframes: "Keyframe planning",
    film: "Final film review",
  }
  return map[gate]
}
