// Deterministic V1 scaffold logic for Trust Tai Studio.
// Same input always produces the same output. No model or video APIs.

import type {
  ArgumentSection,
  AudienceShift,
  ConceptDirection,
  ContentSpine,
  ContinuityItem,
  FilmPlan,
  KeyframePlan,
  ModelRouteStep,
  Production,
  PublishPackage,
  Shot,
  SourceType,
  VoiceWarning,
} from "@/data/studio"
import { assembleArgument } from "@/data/studio"

// ─── Text helpers ─────────────────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function stripTrailingPunctuation(s: string): string {
  return s.replace(/[.!?]+$/, "")
}

function lowerFirst(s: string): string {
  if (s.length === 0) return s
  return s[0].toLowerCase() + s.slice(1)
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "because", "so", "of", "to", "in", "on",
  "for", "with", "at", "by", "from", "that", "this", "these", "those", "it",
  "its", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "not", "no", "yes", "you", "your", "yours", "we", "our",
  "they", "their", "them", "he", "she", "his", "her", "i", "my", "me", "as",
  "if", "when", "then", "than", "there", "here", "what", "which", "who", "how",
  "why", "will", "would", "can", "could", "should", "about", "into", "over",
  "under", "more", "most", "less", "very", "just", "also", "too", "only", "out",
  "up", "down", "all", "any", "some", "one", "two", "get", "got", "like",
  "keep", "keeps", "make", "makes", "made", "thing", "things", "way", "ways",
  "people", "dont", "doesnt", "isnt", "arent", "cant", "wont", "im", "its",
])

// The most repeated meaningful word in the thought. Falls back to "the work".
export function extractTopic(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  if (words.length === 0) return "the work"
  const counts = new Map<string, number>()
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1)
  let best = words[0]
  let bestCount = 0
  for (const w of words) {
    const c = counts.get(w) ?? 0
    if (c > bestCount || (c === bestCount && w.length > best.length)) {
      best = w
      bestCount = c
    }
  }
  return best
}

const NOTICE_MARKERS = [
  "but ", "because ", "yet ", "until ", "instead", "actually", "noticed",
  "realized", "realised", "turns out", "underneath", "kept ", "keeps ",
]

function findNoticeSentence(sentences: string[]): string | null {
  for (const s of sentences.slice(1)) {
    const lower = s.toLowerCase()
    if (NOTICE_MARKERS.some((m) => lower.includes(m))) return s
  }
  return null
}

function findShortStrongSentence(sentences: string[]): string | null {
  const candidates = sentences.filter((s) => s.length >= 20 && s.length <= 90)
  if (candidates.length === 0) return null
  return candidates.reduce((a, b) => (a.length <= b.length ? a : b))
}

// ─── Content spine ────────────────────────────────────────────────────────────

export function buildSpine(thought: string, _sourceType: SourceType): ContentSpine {
  void _sourceType
  const sentences = splitSentences(thought)
  const topic = extractTopic(thought)

  const first = sentences[0] ?? thought.trim()
  const notice = findNoticeSentence(sentences) ?? sentences[1] ?? first
  const strong = findShortStrongSentence(sentences)

  const rememberSentence =
    strong !== null && strong !== first
      ? stripTrailingPunctuation(strong) + "."
      : `Noticing ${topic} is useful. Seeing the system that keeps producing it is different.`

  return {
    whatHappened: first,
    whatTaiNoticed: notice === first && sentences.length > 1 ? sentences[1] : notice,
    whatOthersMiss: `Most founders read this as a ${topic} problem, fix the surface, and move on. The part that goes unexamined is the system that keeps producing the same result.`,
    deeperTruth: `What looks like a ${topic} issue is usually an ordering issue. The business is doing exactly what its current structure makes easy, and no amount of effort changes that until the structure does.`,
    roadmapConnection: `Roadmap lens: name the current position (Point A), the next practical stage (Point B), and what sits in the Gap between them. This thought lives in the Gap. It is a signal about what must become true before the next move can work.`,
    founderValue: `A founder can use this today: before adding another tool or initiative around ${topic}, write down what the current setup makes easy and what it makes hard. The pattern usually explains itself.`,
    rememberSentence,
  }
}

export function buildShift(thought: string, spine: ContentSpine): AudienceShift {
  const topic = extractTopic(thought)
  return {
    beginning: `The reader assumes ${topic} is a matter of working harder or choosing better tactics.`,
    end: `They understand that ${lowerFirst(stripTrailingPunctuation(spine.rememberSentence))}.`,
  }
}

// ─── Draft argument (Trust Tai post structure) ────────────────────────────────

export function buildArgument(thought: string, spine: ContentSpine): ArgumentSection[] {
  const topic = extractTopic(thought)
  const opening = stripTrailingPunctuation(spine.whatHappened)

  return [
    {
      name: "Pattern interrupt",
      text: `${opening}.\nNot because anyone is careless.\nBecause the system makes it the easiest outcome.`,
      rationale: "First line has to stand alone and reframe the obvious. The correction pattern (not X, because Y) earns the second look.",
    },
    {
      name: "Concrete scene",
      text: spine.whatTaiNoticed,
      rationale: "Grounds the argument in something Tai actually saw. Observation before opinion.",
    },
    {
      name: "Hidden problem",
      text: spine.whatOthersMiss,
      rationale: "Names what the reader is likely getting wrong without blaming them. This is the mirror, not the spotlight.",
    },
    {
      name: "Overview perspective",
      text: `From inside the business, you can only see the next opening and the nearest wall. From above, the dead ends and repeating paths are obvious. ${spine.deeperTruth}`,
      rationale: "Creates distance. The maze view is the Trust Tai signature move: same facts, higher vantage point.",
    },
    {
      name: "Roadmap principle",
      text: spine.roadmapConnection,
      rationale: "Connects the observation to Roadmap Thinking so the insight lands inside a framework the audience can reuse.",
    },
    {
      name: "Practical implication",
      text: spine.founderValue,
      rationale: "One thing a founder can do today. Value must be usable without hiring anyone.",
    },
    {
      name: "Calm closing thought",
      text: spine.rememberSentence,
      rationale: "The one sentence the audience should remember. Quiet confidence, no crescendo.",
    },
    {
      name: "Invitation",
      text: `If you want a second set of eyes on your ${topic} from above the maze, we listen first. No pitch.`,
      rationale: "Soft, earned invitation. Never pressure. Appears only because the argument has done the work.",
    },
  ]
}

// ─── Voice check ──────────────────────────────────────────────────────────────

const BANNED_PHRASES: { pattern: RegExp; rule: string; label: string }[] = [
  { pattern: /—|–/g, rule: "No em dashes", label: "em or en dash" },
  { pattern: /\bleverage\b/gi, rule: "No empty consulting phrases", label: "leverage" },
  { pattern: /\bsynergy\b/gi, rule: "No empty consulting phrases", label: "synergy" },
  { pattern: /\bunlock\b/gi, rule: "No generic AI language", label: "unlock" },
  { pattern: /\bgame.?changer\b/gi, rule: "No generic AI language", label: "game-changer" },
  { pattern: /\bseamless(ly)?\b/gi, rule: "No generic AI language", label: "seamless" },
  { pattern: /\bempower(ing|s)?\b/gi, rule: "No generic AI language", label: "empower" },
  { pattern: /\bdelve\b/gi, rule: "No generic AI language", label: "delve" },
  { pattern: /\brevolutioniz/gi, rule: "No generic AI language", label: "revolutionize" },
  { pattern: /\b10x\b/gi, rule: "No hype language", label: "10x" },
  { pattern: /\bvery\b/gi, rule: "Cut weak intensifiers", label: "very" },
  { pattern: /\breally\b/gi, rule: "Cut weak intensifiers", label: "really" },
  { pattern: /\bjust\b/gi, rule: "Cut weak intensifiers", label: "just" },
  { pattern: /\bact now\b/gi, rule: "No pressure CTA", label: "act now" },
  { pattern: /\bdon'?t miss\b/gi, rule: "No pressure CTA", label: "don't miss" },
  { pattern: /\blimited (time|spots)\b/gi, rule: "No pressure CTA", label: "limited time or spots" },
  { pattern: /#\w+/g, rule: "No hashtags in body copy", label: "hashtag" },
]

export function checkVoice(text: string, settingsOverride?: { bannedWords?: string[]; sentenceLengthWarning?: number; exclamationMarkWarning?: boolean; hashtagWarning?: boolean; pressureCTAWarning?: boolean; emDashWarning?: boolean; consultingClicheWarning?: boolean }): VoiceWarning[] {
  // Read settings at call time — allows runtime settings to override defaults
  let settings = settingsOverride
  if (!settings && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tts_voice_settings")
      if (raw) settings = JSON.parse(raw) as typeof settingsOverride
    } catch { /* noop */ }
  }

  const bannedWords = settings?.bannedWords ?? [
    "leverage", "synergy", "unlock", "game-changer", "seamless", "empower", "delve"
  ]
  const sentenceLimit = settings?.sentenceLengthWarning ?? 32
  const checkExclamation = settings?.exclamationMarkWarning ?? true
  const checkHashtag = settings?.hashtagWarning ?? true
  const checkPressureCTA = settings?.pressureCTAWarning ?? true
  const checkEmDash = settings?.emDashWarning ?? true
  const checkConsulting = settings?.consultingClicheWarning ?? true

  const warnings: VoiceWarning[] = []

  // Em dash
  if (checkEmDash) {
    const matches = text.match(/—|–/g)
    if (matches && matches.length > 0) {
      warnings.push({ rule: "No em dashes", detail: `Found ${matches.length} em or en dash${matches.length > 1 ? "es" : ""}. Replace with a period or a new line.` })
    }
  }

  // Dynamic banned words from settings
  for (const word of bannedWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`\\b${escaped}\\b`, "gi")
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      warnings.push({
        rule: "Banned word",
        detail: `Found "${word}" ${matches.length === 1 ? "once" : matches.length + " times"}. Rewrite in plain, direct language.`,
      })
    }
  }

  // Consulting clichés (built-in, toggleable)
  if (checkConsulting) {
    for (const { pattern, rule, label } of BANNED_PHRASES.filter((p) => !/(em|dash|hashtag|CTA)/i.test(p.rule))) {
      if (bannedWords.some((w) => label.includes(w))) continue // already caught above
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        warnings.push({ rule, detail: `Found "${label}" ${matches.length === 1 ? "once" : matches.length + " times"}. Rewrite in plain, direct language.` })
      }
    }
  }

  // Pressure CTAs
  if (checkPressureCTA) {
    for (const { pattern, rule, label } of BANNED_PHRASES.filter((p) => p.rule === "No pressure CTA")) {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        warnings.push({ rule, detail: `Found "${label}". Remove pressure language.` })
      }
    }
  }

  // Hashtags
  if (checkHashtag) {
    const hMatches = text.match(/#\w+/g)
    if (hMatches && hMatches.length > 0) {
      warnings.push({ rule: "No hashtags in body copy", detail: `Found ${hMatches.length} hashtag${hMatches.length > 1 ? "s" : ""} in body copy.` })
    }
  }

  // Exclamation marks
  if (checkExclamation) {
    const exclaims = (text.match(/!/g) ?? []).length
    if (exclaims > 0) {
      warnings.push({
        rule: "Quiet confidence",
        detail: `${exclaims === 1 ? "One exclamation mark" : exclaims + " exclamation marks"} found. The argument should not need volume.`,
      })
    }
  }

  // Sentence length
  const longSentences = splitSentences(text).filter((s) => s.split(/\s+/).length > sentenceLimit)
  if (longSentences.length > 0) {
    warnings.push({
      rule: "Short sentences carry the cadence",
      detail: `${longSentences.length} sentence${longSentences.length === 1 ? "" : "s"} over ${sentenceLimit} words. Break them so the post reads like thinking out loud.`,
    })
  }

  return warnings
}

// ─── Film plan: three concept directions ──────────────────────────────────────

interface ConceptTemplate {
  premise: string
  visualAction: string
  whyItEarnsAttention: string
  represents: string
  reveal: string
  producibility: string
  shotCount: number
}

const GROUNDED_STRANGE: ConceptTemplate[] = [
  {
    premise: "An ordinary office where every door opens onto the same hallway.",
    visualAction: "A founder walks a normal office at a normal pace. Every door she opens leads back to the hallway she left. She never panics. She starts chalking small marks beside each door, and the marks slowly reveal a repeating pattern on the wall.",
    whyItEarnsAttention: "The world is completely believable except for one impossible rule, so the viewer leans in to figure out the rule instead of scrolling past.",
    represents: "TOPIC handled by effort alone. Working the doors harder never changes the hallway.",
    reveal: "The chalk marks, seen together in the final wide shot, form a map. The exit was never behind a door. It was in the pattern.",
    producibility: "High. One location, one character, repeatable framing. Continuity risk is low because the sameness is the point.",
    shotCount: 6,
  },
  {
    premise: "A workday where the clock only moves when someone stops to look at the whole room.",
    visualAction: "A team works fast in a bright office, but the wall clock is frozen. Papers move, coffee pours, nothing advances. One person stops, steps back to the doorway, and looks at the whole room. Only then does the clock tick.",
    whyItEarnsAttention: "Frozen time inside busy motion is visually wrong in a way the eye catches within two seconds.",
    represents: "Motion mistaken for progress. TOPIC does not advance because nobody steps back far enough to see it.",
    reveal: "The clock responds to perspective, not activity. Stepping back is the only action that moves time forward.",
    producibility: "High. Single interior, static clock prop, one repeated camera move. Build still frames first, then test motion in YouTube Create or a paid renderer later.",
    shotCount: 7,
  },
  {
    premise: "A house where the lights only turn on in rooms the owner has drawn on a paper map.",
    visualAction: "At night a founder walks a dark house flipping switches that do nothing. At a kitchen table she sketches the floor plan by hand. As each room appears on paper, its light turns on down the hall behind her.",
    whyItEarnsAttention: "Light answering a pencil instead of a switch is a quiet, uncanny cause-and-effect the viewer wants to test again.",
    represents: "Clarity precedes function. Parts of the business stay dark until they are mapped, not until they are pushed.",
    reveal: "The last room to light up is the one she is sitting in. Mapping the system illuminated her own position.",
    producibility: "High. Dark interiors hide continuity seams. First and last frames are strong natural keyframes.",
    shotCount: 6,
  },
]

const VISUAL_PARABLE: ConceptTemplate[] = [
  {
    premise: "A giraffe and a rat inside a hedge maze that quietly rearranges itself.",
    visualAction: "A giraffe towers over a hedge maze, eyes fixed on the distant exit, and walks into the same dead end again and again. Near the ground a rat ignores the destination and studies scuff marks at the roots. It notices the hedges shifting behind them, maps the movement, and walks out.",
    whyItEarnsAttention: "The tall animal should win and does not. The inversion of the obvious advantage is the hook.",
    represents: "Vision without system-sight. The giraffe sees farther. The rat sees the system. TOPIC is the maze.",
    reveal: "The maze was never static. The rat wins by observing the system the giraffe overlooked, not by magic.",
    producibility: "Medium. Two characters and a shifting environment need reference images per shot. Keyframe discipline required.",
    shotCount: 8,
  },
  {
    premise: "An octopus running a lighthouse while seabirds argue about the weather.",
    visualAction: "Storm night. Seabirds on the railing argue loudly about wind direction. Below them an octopus moves through the lighthouse, one arm on the lamp, one on the logbook, one on the pump, never rushing. The beam never wavers.",
    whyItEarnsAttention: "An octopus doing calm, competent infrastructure work is absurd and dignified at once, which reads as intentional rather than random.",
    represents: "Quiet systems beating loud opinion. The birds debate TOPIC. The octopus operates it.",
    reveal: "Dawn shows wrecked debris from other shores, but this harbor is intact. Nobody noticed the lighthouse because it never failed.",
    producibility: "Medium. One structure, controlled lighting states, one hero character. Storm particles are the main render risk.",
    shotCount: 7,
  },
  {
    premise: "Ants relocating an entire colony one grain at a time while a beetle waits for perfect weather.",
    visualAction: "A beetle checks the sky, polishes its shell, and waits beside a crack in dry ground. A line of ants passes it for the whole film, each carrying one grain, one egg, one leaf. The weather never becomes perfect. The colony still moves.",
    whyItEarnsAttention: "The contrast runs in the background of every single shot, so the meaning accumulates without narration.",
    represents: "Sequenced small moves versus waiting for ideal conditions. TOPIC advances by order, not by occasion.",
    reveal: "Rain finally comes. The beetle is exactly where it started. The ants are already home.",
    producibility: "High. Macro scale hides detail imperfections. Repetition is the aesthetic, which suits generation.",
    shotCount: 6,
  },
]

const CINEMATIC_MECHANISM: ConceptTemplate[] = [
  {
    premise: "A cutaway building where every floor is furiously productive and no staircase connects them.",
    visualAction: "Dollhouse cutaway view. Five floors, each full of motion: printing, packing, calling, planning. Slowly the camera reveals there are no stairs. Work piles at the edge of each floor. A hand reaches in and places a single staircase, and the piles begin to flow.",
    whyItEarnsAttention: "The missing staircase is discovered, not announced. The viewer solves the image a beat before the film confirms it.",
    represents: "Departments and efforts around TOPIC succeeding in isolation while the whole fails to connect.",
    reveal: "Nothing on any floor changes when the stairs arrive. Only the connection changes, and that changes everything.",
    producibility: "High. Fixed camera on a miniature-style set. One deliberate camera move and one insert shot.",
    shotCount: 6,
  },
  {
    premise: "A rope bridge being rebuilt plank by plank while a heavy cart waits to cross.",
    visualAction: "A gorge at dusk. A loaded cart waits. A figure walks the rope bridge testing planks, replacing them in a strict order that looks wrong: not the most broken plank first, but the ones that support the next repair. The cart crosses at first light.",
    whyItEarnsAttention: "Everyone expects the worst plank to be fixed first. The strange order creates a question the ending answers.",
    represents: "Sequencing under load. TOPIC cannot pause while the structure is rebuilt beneath it.",
    reveal: "The order was the strategy. Each plank made the next repair possible. Fixing by pain order would have dropped the cart.",
    producibility: "Medium. Outdoor light continuity across shots needs locked palette. Single character, strong silhouette.",
    shotCount: 7,
  },
  {
    premise: "A grand piano being tuned in a concert hall while the audience files in.",
    visualAction: "Seats fill. A tuner works alone on stage, striking one note over and over, adjusting, listening. The murmur of the crowd grows. The tuner does not speed up. The final strike of that single note rings pure, and the lights go down for the performance.",
    whyItEarnsAttention: "Public pressure against private precision creates tension without a single word of dialogue.",
    represents: "Foundational work on TOPIC done properly while the market watches and waits.",
    reveal: "The performance can only be as good as the tuning nobody applauded. The unseen work was the concert.",
    producibility: "High. One location, one character, one prop. Sound design can be handled in edit after the free motion test works.",
    shotCount: 6,
  },
]

function pickTemplate(templates: ConceptTemplate[], seed: number): ConceptTemplate {
  return templates[seed % templates.length]
}

function fillTopic(text: string, topic: string): string {
  return text.replace(/TOPIC/g, topic)
}

function estimateCost(shotCount: number): string {
  return `Free first pass (${shotCount} approved frames, YouTube motion test before paid render)`
}

export function buildConcepts(thought: string, spine: ContentSpine): ConceptDirection[] {
  const topic = extractTopic(thought)
  const seed = hashString(thought.trim().toLowerCase())
  const remember = stripTrailingPunctuation(spine.rememberSentence)

  const directions: { key: ConceptDirection["key"]; name: string; templates: ConceptTemplate[] }[] = [
    { key: "grounded-strange", name: "Grounded Strange", templates: GROUNDED_STRANGE },
    { key: "visual-parable", name: "Visual Parable", templates: VISUAL_PARABLE },
    { key: "cinematic-mechanism", name: "Cinematic Mechanism", templates: CINEMATIC_MECHANISM },
  ]

  return directions.map((d, i) => {
    const t = pickTemplate(d.templates, seed + i)
    return {
      key: d.key,
      name: d.name,
      premise: fillTopic(t.premise, topic),
      visualAction: fillTopic(t.visualAction, topic),
      whyItEarnsAttention: t.whyItEarnsAttention,
      represents: fillTopic(t.represents, topic),
      connection: `Carries the post's closing line into the image: "${remember}." The film shows it, the post says it.`,
      reveal: fillTopic(t.reveal, topic),
      producibility: t.producibility,
      shotCount: t.shotCount,
      costEstimate: estimateCost(t.shotCount),
    }
  })
}

// ─── Treatment, shots, keyframes, routing, continuity ────────────────────────

export function buildTreatment(concept: ConceptDirection): string[] {
  return [
    `Open inside the normal: establish the world of "${concept.premise}" as calm and credible before anything is strange.`,
    `Introduce the one wrong thing without commentary. ${concept.visualAction.split(". ")[0]}.`,
    "Let the pattern repeat. The viewer should feel the loop before any character does.",
    "Turn: the observing character stops acting on the surface and starts reading the system.",
    `Reveal: ${concept.reveal}`,
    "Close on stillness. Hold the final frame two beats longer than comfortable. No text until the last second.",
  ]
}

export function buildShots(concept: ConceptDirection): Shot[] {
  const beats: { description: string; purpose: string; route: string }[] = [
    { description: `Establishing wide. The world of ${concept.premise.toLowerCase().replace(/\.$/, "")}. Everything looks normal.`, purpose: "Set the credible baseline", route: "ChatGPT frame" },
    { description: "Medium on the main character in motion. Confident, unhurried, wrong.", purpose: "Introduce the surface behavior", route: "ChatGPT frame" },
    { description: "The impossible condition shown plainly for the first time. No camera trickery.", purpose: "Plant the hook", route: "ChatGPT frame" },
    { description: "Repetition beat. Same framing as shot 2 with small differences accumulating.", purpose: "Build the loop", route: "YouTube motion test" },
    { description: "Close on the detail that matters: the marks, the pattern, the system moving.", purpose: "Shift attention from goal to system", route: "ChatGPT frame" },
    { description: "The turn. The observer stops, studies, understands. Held longer than expected.", purpose: "Pivot the meaning", route: "YouTube motion test" },
    { description: "The reveal composition. The whole system visible in one frame.", purpose: "Deliver the argument visually", route: "ChatGPT frame" },
    { description: "Final still. The closing line appears as quiet text. Two-beat hold.", purpose: "Land the remember sentence", route: "Edit hold" },
  ]
  return beats.slice(0, Math.max(6, Math.min(8, concept.shotCount))).map((b, i) => ({
    no: i + 1,
    description: b.description,
    durationSec: 8,
    route: b.route,
    purpose: b.purpose,
  }))
}

export function buildKeyframes(concept: ConceptDirection): KeyframePlan {
  return {
    firstFrame: `Wide, eye-level, muted palette. ${concept.premise} rendered as completely believable. The impossible element present but not yet noticeable.`,
    lastFrame: `Same location, new vantage point. ${concept.reveal} The composition should answer the first frame directly: what was hidden is now legible.`,
    anchors: "Lock character silhouette, wardrobe, hero prop, and light direction in reference images before any motion is generated. First and last frames are approved before any in-between shot is rendered.",
  }
}

export function buildModelRoute(): ModelRouteStep[] {
  return [
    { role: "Frames first", model: "ChatGPT image generation", why: "Approve the story visually before spending video credits." },
    { role: "Free motion test", model: "YouTube Create / Shorts", why: "Use free mobile AI clips or photo-to-video to test whether the approved frames move well." },
    { role: "Paid render, later", model: "Veo API / Higgsfield", why: "Only use paid rendering after the free test proves the story connects." },
    { role: "Final edit", model: "YouTube Create, CapCut, or DaVinci Resolve", why: "Captions, sound, timing, and export stay editable outside the generator." },
  ]
}

export function buildContinuity(): ContinuityItem[] {
  return [
    { item: "Character silhouette consistent across all shots", checked: false },
    { item: "Wardrobe and hero prop locked to reference", checked: false },
    { item: "Environment palette and light direction consistent", checked: false },
    { item: "9:16 vertical master framing holds on every shot", checked: false },
    { item: "Repetition shots match framing of their source shot", checked: false },
    { item: "Ending composition answers the opening frame", checked: false },
    { item: "Sound direction noted per shot before render", checked: false },
  ]
}

export function buildFilmPlan(thought: string, spine: ContentSpine): FilmPlan {
  const concepts = buildConcepts(thought, spine)
  const primary = concepts[0]
  return {
    selectedConcept: null,
    concepts,
    treatment: buildTreatment(primary),
    shots: buildShots(primary),
    keyframes: buildKeyframes(primary),
    modelRoute: buildModelRoute(),
    continuity: buildContinuity(),
  }
}

export function rebuildFilmPlanForConcept(film: FilmPlan, key: ConceptDirection["key"]): FilmPlan {
  const concept = film.concepts.find((c) => c.key === key) ?? film.concepts[0]
  return {
    ...film,
    selectedConcept: concept.key,
    treatment: buildTreatment(concept),
    shots: buildShots(concept),
    keyframes: buildKeyframes(concept),
    continuity: buildContinuity(),
  }
}

// ─── Publish package ─────────────────────────────────────────────────────────

export function buildPackage(p: Production): PublishPackage {
  const post = assembleArgument(p.sections)
  const remember = stripTrailingPunctuation(p.spine.rememberSentence)
  const concept = p.film.concepts.find((c) => c.key === p.film.selectedConcept) ?? p.film.concepts[0]
  return {
    linkedinPost: post,
    caption: `${remember}.`,
    firstComment: "The full thinking behind this is part of how we build roadmaps with founders. If it names something you are living with, the comments are open.",
    accessibilityText: concept
      ? `Short film description: ${concept.visualAction} ${concept.reveal}`
      : `Short film description: a visual story built around the idea that ${lowerFirst(remember)}.`,
  }
}

// ─── Production factory ───────────────────────────────────────────────────────

export function deriveTitle(spine: ContentSpine): string {
  const t = stripTrailingPunctuation(spine.rememberSentence)
  return t.length > 72 ? t.slice(0, 69).trimEnd() + "..." : t
}
