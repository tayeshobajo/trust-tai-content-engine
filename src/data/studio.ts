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
}

export interface PublishPackage {
  linkedinPost: string
  caption: string
  firstComment: string
  accessibilityText: string
}

export interface Production {
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
