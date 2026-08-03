/**
 * Character Registry — Mock Data
 *
 * Typed character data for the Trust Tai Studio world.
 * Designed to be swappable with a Supabase-backed store later.
 *
 * New characters can be added at any time — the UI adapts dynamically.
 */

export type CharacterRole =
  | "Protagonist"
  | "Guide"
  | "Antagonist"
  | "Supporting"
  | "Elder"
  | "Child"

export type RelationshipStrength = "Strong" | "Medium" | "Strained"

export interface Relationship {
  name: string
  role: string
  descriptor: string
  strength: RelationshipStrength
  avatarColor: string
}

export interface KeyMoment {
  title: string
  description: string
}

export interface StoryArcPoint {
  label: string
  title: string
  value: number // 0-100, for chart positioning
}

export interface CharacterTrait {
  label: string
  value: number // 0-100
}

export interface Character {
  id: string
  name: string
  role: CharacterRole
  archetype: string
  tagline: string
  age: string
  occupation: string
  coreDesire: string
  greatestFear: string
  internalFlaw: string
  essence: string
  voice: string
  motivation: string
  themeConnection: string
  // Story
  storyArc: {
    points: StoryArcPoint[]
    startingState: string
    transformation: string
    endState: string
  }
  keyMoments: KeyMoment[]
  backstory: string
  // Appearance
  appearance: {
    height: string
    build: string
    hair: string
    eyes: string
    style: string
  }
  // Traits
  traits: CharacterTrait[]
  tags: string[]
  // Relationships
  relationships: Relationship[]
  // Notes
  notes: string[]
  // Meta
  createdDate: string
  updatedDate: string
  appearances: number
  dialogueScenes: number
  // Visual
  portraitInitial: string
  portraitColor: string
  // ── Identity Lock (QA Section 5) ──────────────────────────────────────────────
  /** Ethnicity for accurate rendering */
  ethnicity?: string
  /** Age range for rendering e.g. "mid-30s" */
  ageRange?: string
  /** Specific skin tone for consistent rendering across lighting */
  skinTone?: string
  /** Facial structure notes — jaw, cheekbones, brow, nose, lips */
  facialStructure?: string
  /** Detailed hair description: length, texture, cut, color */
  hairDetail?: string
  /** Body build detail: frame, posture, weight distribution */
  buildDetail?: string
  /** Specific identifying features: beard detail, hairline, scars, glasses, marks */
  identifyingFeatures?: string[]
  /** Approved wardrobe with full detail */
  approvedWardrobe?: string
  /** Posture and physical bearing */
  postureDetail?: string
  /** Characteristic movement tendencies */
  movementTendencies?: string
  /** Appearance changes that are NEVER allowed */
  forbiddenAppearanceChanges?: string[]
  /** URL to approved master reference image (locked after keyframe approval) */
  masterReferenceUrl?: string
  /** Production-specific appearance variations (not new characters) */
  variations?: CharacterVariation[]
}

/** A production-specific appearance variation that preserves core identity */
export interface CharacterVariation {
  id: string
  characterId: string
  name: string          // e.g. "Tai — Winter Coat"
  reason: string        // narrative justification
  wardrobeChange: string
  approvedBy?: string
  approvedAt?: string
  isApproved: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANON CHARACTERS
// ═══════════════════════════════════════════════════════════════════════════════

export const CHARACTERS: Character[] = [
  {
    id: "tai",
    name: "Tai",
    role: "Protagonist",
    archetype: "The Architect",
    tagline: "He builds maps for people who are lost in their own kingdoms.",
    age: "36",
    occupation: "Strategist & Founder",
    coreDesire: "To build systems that free people to live and create.",
    greatestFear: "Building the wrong thing.",
    internalFlaw: "Carries everything. Struggles to ask for help.",
    essence: "Calm mind. Heavy heart. Clear vision.",
    voice: "Measured, curious, direct. Speaks with clarity and conviction.",
    motivation: "Impact, Freedom, Legacy",
    themeConnection: "The cost of carrying vision alone.",
    storyArc: {
      points: [
        { label: "Setup", title: "Comfort in control", value: 20 },
        { label: "Inciting Incident", title: "Everything tilts", value: 35 },
        { label: "Midpoint", title: "Goes beneath the surface", value: 50 },
        { label: "Crisis", title: "Lets go to level the weight", value: 30 },
        { label: "Resolution", title: "Builds what outlives him", value: 85 },
      ],
      startingState: "Carries the weight. Solves everything himself.",
      transformation: "Learns to trust. Builds systems. Empowers others.",
      endState: "Leads from clarity, not control.",
    },
    keyMoments: [
      { title: "Childhood moment", description: "Watched his father carry too much." },
      { title: "First failure", description: "Built the wrong solution. Learned humility." },
      { title: "Breakthrough", description: "Discovered the power of one clear map." },
      { title: "Lowest point", description: "Almost burned out trying to save everyone." },
      { title: "Redemption", description: "Built the system. Freed himself and others." },
    ],
    backstory:
      "Grew up watching his father build for everyone but had nothing left for himself. He learned early that if he didn\u2019t hold it all together, it would fall apart. That lesson saved him \u2014 and cost him.",
    appearance: {
      height: "5'11\"",
      build: "Athletic",
      hair: "Short, curly",
      eyes: "Deep brown",
      style: "Minimal. Focused.",
    },
    traits: [
      { label: "Strength", value: 78 },
      { label: "Vulnerability", value: 62 },
      { label: "Intelligence", value: 92 },
      { label: "Compassion", value: 68 },
      { label: "Determination", value: 90 },
    ],
    tags: ["Strategist", "Leader", "Protector", "Perfectionist", "Visionary", "Loyal", "Deep Thinker", "Reluctant Hero"],
    relationships: [
      { name: "Jordan", role: "Son", descriptor: "Love \u00b7 Responsibility", strength: "Strong", avatarColor: "#2F62D8" },
      { name: "Mubo", role: "Wife", descriptor: "Partnership \u00b7 Anchor", strength: "Strong", avatarColor: "#C29A5B" },
      { name: "Emmanuel", role: "Partner", descriptor: "Trust \u00b7 Execution", strength: "Medium", avatarColor: "#22A06B" },
      { name: "The Captain", role: "Mentor", descriptor: "Challenge \u00b7 Guidance", strength: "Strong", avatarColor: "#8A8578" },
    ],
    notes: [
      "Tai\u2019s turning point happens in Act 2 when he realizes control is not leadership.",
      "Visual motif: Brass marble",
      "Symbol: The Map",
      "Needs to learn: Letting go to lead.",
    ],
    createdDate: "Apr 12, 2025",
    updatedDate: "Aug 2, 2025",
    appearances: 12,
    dialogueScenes: 8,
    portraitInitial: "T",
    portraitColor: "#1A2332",
    // Identity Lock
    ethnicity: "Black — West African heritage",
    ageRange: "mid-30s (34–38)",
    skinTone: "Rich deep brown, warm undertones, luminous under natural light",
    facialStructure: "Strong jaw, defined cheekbones, broad nose, full lips, high brow. Face reads as thoughtful and composed.",
    hairDetail: "Short curly hair, well-kept, close-cropped sides, slightly fuller on top. Natural texture. No fade.",
    buildDetail: "Athletic build, broad shoulders, upright posture. Carries weight with composure rather than strain.",
    identifyingFeatures: ["Clean-shaven or very light stubble only", "No visible scars", "No glasses", "Strong brow ridge"],
    approvedWardrobe: "Tailored navy or deep blue long coat, high collar. Cream or white fitted shirt underneath. Dark fitted trousers. Functional leather boots, dark. Understated — no logos, no decoration.",
    postureDetail: "Upright, deliberate. Weight carried forward slightly — the posture of someone always ready to act.",
    movementTendencies: "Measured, controlled. No sudden movements. Pauses before speaking or acting.",
    forbiddenAppearanceChanges: [
      "Do not lighten skin tone",
      "Do not change to casual or modern clothing",
      "Do not add beard without narrative justification",
      "Do not age him beyond early 40s",
      "Do not change hair to a different texture or length",
    ],
    variations: [],
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "Supporting",
    archetype: "The Child",
    tagline: "He carries lightness because he doesn\u2019t yet know what weight is.",
    age: "10",
    occupation: "Student",
    coreDesire: "To understand why his father works so hard.",
    greatestFear: "Being forgotten by the people he loves.",
    internalFlaw: "Innocence that hasn\u2019t been tested.",
    essence: "Pure potential. Unburdened curiosity.",
    voice: "Bright, direct, unfiltered. Asks the questions adults won\u2019t.",
    motivation: "Connection, Understanding, Play",
    themeConnection: "What inherits \u2014 and what doesn\u2019t.",
    storyArc: {
      points: [
        { label: "Setup", title: "Happy in the background", value: 70 },
        { label: "Inciting Incident", title: "Notices the weight", value: 55 },
        { label: "Midpoint", title: "Asks the question", value: 50 },
        { label: "Crisis", title: "Feels the distance", value: 35 },
        { label: "Resolution", title: "Lifts the case", value: 90 },
      ],
      startingState: "Lives in his father\u2019s orbit without understanding it.",
      transformation: "Sees the weight. Chooses to help carry it.",
      endState: "Becomes the proof that the system can be lighter.",
    },
    keyMoments: [
      { title: "Drawing time", description: "Draws the image that becomes the film\u2019s final frame." },
      { title: "The lift", description: "Picks up the case without effort \u2014 it was always this light." },
      { title: "The question", description: "Asks Tai why he works so hard. Tai doesn\u2019t have an answer." },
    ],
    backstory:
      "Jordan has grown up in the warmth of his father\u2019s ambition without understanding its cost. He sees the case but doesn\u2019t know what\u2019s inside. His innocence is not naivety \u2014 it\u2019s the untested version of what Tai is fighting to preserve.",
    appearance: {
      height: "4'6\"",
      build: "Slim",
      hair: "Short, curly",
      eyes: "Bright brown",
      style: "Casual. Bright colors.",
    },
    traits: [
      { label: "Strength", value: 30 },
      { label: "Vulnerability", value: 85 },
      { label: "Intelligence", value: 70 },
      { label: "Compassion", value: 88 },
      { label: "Determination", value: 55 },
    ],
    tags: ["Innocent", "Curious", "Heart", "Future", "Proof"],
    relationships: [
      { name: "Tai", role: "Father", descriptor: "Love \u00b7 Distance", strength: "Strong", avatarColor: "#1A2332" },
      { name: "Mubo", role: "Mother", descriptor: "Warmth \u00b7 Safety", strength: "Strong", avatarColor: "#C29A5B" },
    ],
    notes: [
      "Jordan is the proof-of-concept for the entire film\u2019s thesis.",
      "Visual motif: The Drawing",
      "Symbol: Light (without knowing it)",
    ],
    createdDate: "May 3, 2025",
    updatedDate: "Jul 28, 2025",
    appearances: 6,
    dialogueScenes: 3,
    portraitInitial: "J",
    portraitColor: "#2F62D8",
  },
  {
    id: "mubo",
    name: "Mubo",
    role: "Supporting",
    archetype: "The Anchor",
    tagline: "She is the ground that holds while the sky changes.",
    age: "34",
    occupation: "Designer & Mother",
    coreDesire: "To raise a family that is present, not just provided for.",
    greatestFear: "That love becomes the thing they postponed.",
    internalFlaw: "Holds her own weight silently to avoid adding to his.",
    essence: "Steady. Warm. Quietly unshakeable.",
    voice: "Calm, grounded, honest. Says more with fewer words.",
    motivation: "Family, Presence, Truth",
    themeConnection: "The cost carried by those who hold the home together.",
    storyArc: {
      points: [
        { label: "Setup", title: "Holds the home", value: 60 },
        { label: "Inciting Incident", title: "Asks for more presence", value: 45 },
        { label: "Midpoint", title: "Names the distance", value: 50 },
        { label: "Crisis", title: "Considers stepping back", value: 30 },
        { label: "Resolution", title: "Partnership deepens", value: 80 },
      ],
      startingState: "Supports silently. Doesn\u2019t name what she needs.",
      transformation: "Finds her voice. Asks for partnership, not just support.",
      endState: "Equal footing. Mutual weight.",
    },
    keyMoments: [
      { title: "The conversation", description: "Tells Tai she doesn\u2019t need more \u2014 she needs him present." },
      { title: "The drawing", description: "Keeps Jordan\u2019s drawing on the fridge. It stays there." },
      { title: "The turn", description: "Sees Tai change. Chooses to stay. Partnership redefined." },
    ],
    backstory:
      "Met Tai when they were both building something. She built a home while he built a company. The asymmetry grew slowly. She never complained \u2014 she adjusted. Until adjusting became its own kind of weight.",
    appearance: {
      height: "5'7\"",
      build: "Graceful",
      hair: "Locs, pulled back",
      eyes: "Warm brown",
      style: "Effortless. Intentional.",
    },
    traits: [
      { label: "Strength", value: 72 },
      { label: "Vulnerability", value: 55 },
      { label: "Intelligence", value: 85 },
      { label: "Compassion", value: 90 },
      { label: "Determination", value: 75 },
    ],
    tags: ["Anchor", "Partner", "Mother", "Truth-teller", "Steady"],
    relationships: [
      { name: "Tai", role: "Husband", descriptor: "Partnership \u00b7 Strain", strength: "Strong", avatarColor: "#1A2332" },
      { name: "Jordan", role: "Son", descriptor: "Love \u00b7 Joy", strength: "Strong", avatarColor: "#2F62D8" },
    ],
    notes: [
      "Mubo\u2019s arc mirrors Tai\u2019s \u2014 she learns to ask, he learns to let go.",
      "Visual motif: The Kitchen Light",
      "Symbol: Stone (enduring structure)",
    ],
    createdDate: "May 10, 2025",
    updatedDate: "Jul 30, 2025",
    appearances: 7,
    dialogueScenes: 4,
    portraitInitial: "M",
    portraitColor: "#C29A5B",
  },
  {
    id: "emmanuel",
    name: "Emmanuel",
    role: "Supporting",
    archetype: "The Builder",
    tagline: "He executes the vision so precisely that Tai forgets he needs a partner.",
    age: "38",
    occupation: "COO & Co-founder",
    coreDesire: "To build something that outlasts the founder.",
    greatestFear: "Being the executor of someone else\u2019s wrong idea.",
    internalFlaw: "Loyal to a fault. Waits too long before pushing back.",
    essence: "Precise. Loyal. Quietly ambitious.",
    voice: "Structured, diplomatic, measured. Hedges before he commits.",
    motivation: "Excellence, Autonomy, Recognition",
    themeConnection: "The difference between loyalty and dependency.",
    storyArc: {
      points: [
        { label: "Setup", title: "Executes perfectly", value: 65 },
        { label: "Inciting Incident", title: "Sees the cracks first", value: 50 },
        { label: "Midpoint", title: "Speaks up \u2014 too gently", value: 45 },
        { label: "Crisis", title: "Threatens to leave", value: 25 },
        { label: "Resolution", title: "Becomes true partner", value: 82 },
      ],
      startingState: "Executes Tai\u2019s vision without question.",
      transformation: "Finds his own voice. Demands co-ownership.",
      endState: "Equal partner. Different strengths. Same direction.",
    },
    keyMoments: [
      { title: "The override", description: "Tai overrides his call. He was right." },
      { title: "The ultimatum", description: "Tells Tai he\u2019ll leave if the dynamic doesn\u2019t change." },
      { title: "The partnership", description: "They restructure. Emmanuel gets equity and authority." },
    ],
    backstory:
      "Met Tai in the early days when the company was an idea and a laptop. He built the operations, the systems, the muscle. He never asked for the spotlight \u2014 he believed the work would speak. It did. But it spoke in Tai\u2019s voice.",
    appearance: {
      height: "6'1\"",
      build: "Broad",
      hair: "Clean shaven",
      eyes: "Dark brown",
      style: "Sharp. Professional.",
    },
    traits: [
      { label: "Strength", value: 80 },
      { label: "Vulnerability", value: 40 },
      { label: "Intelligence", value: 88 },
      { label: "Compassion", value: 60 },
      { label: "Determination", value: 82 },
    ],
    tags: ["Executor", "Loyal", "Operator", "Quiet ambition", "Systems thinker"],
    relationships: [
      { name: "Tai", role: "Partner", descriptor: "Trust \u00b7 Tension", strength: "Medium", avatarColor: "#1A2332" },
      { name: "The Captain", role: "Ally", descriptor: "Respect \u00b7 Strategy", strength: "Medium", avatarColor: "#8A8578" },
    ],
    notes: [
      "Emmanuel represents what happens when loyalty isn\u2019t reciprocated with ownership.",
      "Visual motif: The Blueprint",
      "Symbol: Brass (knowledge shaped by hands)",
    ],
    createdDate: "May 15, 2025",
    updatedDate: "Jul 22, 2025",
    appearances: 5,
    dialogueScenes: 4,
    portraitInitial: "E",
    portraitColor: "#22A06B",
  },
  {
    id: "captain",
    name: "The Captain",
    role: "Guide",
    archetype: "The Witness",
    tagline: "He sees from altitude because he stopped needing to be seen.",
    age: "58",
    occupation: "Mentor & Strategist",
    coreDesire: "To hand the map to someone who will use it well.",
    greatestFear: "That the wisdom dies with his generation.",
    internalFlaw: "Sometimes watches when he should intervene.",
    essence: "Altitude. Patience. Quiet authority.",
    voice: "Slow, weighted, parabolic. Speaks in images.",
    motivation: "Legacy, Wisdom, Transfer",
    themeConnection: "Inherited wisdom against isolated striving.",
    storyArc: {
      points: [
        { label: "Setup", title: "Watches from above", value: 50 },
        { label: "Inciting Incident", title: "Sees Tai carrying alone", value: 45 },
        { label: "Midpoint", title: "Offers the map", value: 60 },
        { label: "Crisis", title: "Tai rejects the perspective", value: 35 },
        { label: "Resolution", title: "Tai returns. Asks. Listens.", value: 88 },
      ],
      startingState: "Observes. Doesn\u2019t intervene.",
      transformation: "Offers wisdom at the right moment \u2014 not too early, not too late.",
      endState: "Sees his knowledge received. The chain continues.",
    },
    keyMoments: [
      { title: "The silence", description: "Sits with Tai for an hour without speaking. Tai breaks first." },
      { title: "The question", description: "\u201cWhat are you carrying that isn\u2019t yours?\u201d" },
      { title: "The handoff", description: "Gives Tai the instrument. Steps back. Doesn\u2019t watch." },
    ],
    backstory:
      "Built his own company thirty years ago. Carried it the same way Tai carries his \u2014 alone, proudly, destructively. Lost his marriage and his health before he understood the cost. Now he offers perspective to those who will receive it. He never forces. The map only works when someone asks for it.",
    appearance: {
      height: "6'0\"",
      build: "Lean",
      hair: "Silver, cropped",
      eyes: "Grey-green",
      style: "Understated. Old-world.",
    },
    traits: [
      { label: "Strength", value: 65 },
      { label: "Vulnerability", value: 50 },
      { label: "Intelligence", value: 95 },
      { label: "Compassion", value: 82 },
      { label: "Determination", value: 70 },
    ],
    tags: ["Mentor", "Wisdom", "Altitude", "Witness", "Eagle"],
    relationships: [
      { name: "Tai", role: "Mentee", descriptor: "Challenge \u00b7 Guidance", strength: "Strong", avatarColor: "#1A2332" },
      { name: "Emmanuel", role: "Ally", descriptor: "Respect \u00b7 Strategy", strength: "Medium", avatarColor: "#22A06B" },
    ],
    notes: [
      "The Captain is the guide \u2014 he reveals, never rescues.",
      "Visual motif: The Eagle",
      "Symbol: Height (access to systemic perspective)",
    ],
    createdDate: "Apr 20, 2025",
    updatedDate: "Aug 1, 2025",
    appearances: 4,
    dialogueScenes: 3,
    portraitInitial: "C",
    portraitColor: "#8A8578",
  },
  {
    id: "the-carrier",
    name: "The Carrier",
    role: "Protagonist",
    archetype: "The Carrier",
    tagline: "He holds the world together by carrying it \u2014 until he learns to set it down.",
    age: "40",
    occupation: "Leader, unnamed",
    coreDesire: "To be seen as someone who can handle it all.",
    greatestFear: "That everything depends on him and he cannot stop.",
    internalFlaw: "Confuses carrying with leading.",
    essence: "Weary strength. Dignified endurance. Approaching the crack.",
    voice: "Sparse, weighted, deliberate. Speaks less as the weight grows.",
    motivation: "Duty, Love, Control",
    themeConnection: "The Market of Unseen Weight \u2014 Canon Scene 001.",
    storyArc: {
      points: [
        { label: "Setup", title: "Carries the city", value: 40 },
        { label: "Inciting Incident", title: "Another weight added", value: 30 },
        { label: "Midpoint", title: "The valley floor", value: 15 },
        { label: "Crisis", title: "The case opens", value: 25 },
        { label: "Resolution", title: "One move. Everything changes.", value: 85 },
      ],
      startingState: "Carries everything. Confuses weight with purpose.",
      transformation: "Sees the system. Makes one decisive move. Weight transfers.",
      endState: "Stands beside the city, not under it.",
    },
    keyMoments: [
      { title: "The exchange", description: "A colleague hands him a mechanism. It enters the case. The case doesn\u2019t grow." },
      { title: "The valley floor", description: "His child gives him a drawing. It enters the case. This is the heaviest weight." },
      { title: "The crack", description: "He opens the case at night. A living city is inside. Every road leads back to him." },
      { title: "The turn", description: "He moves one road. The system reorganizes without his touch." },
      { title: "The landing", description: "The child lifts the case. It was always this light." },
    ],
    backstory:
      "The Carrier is the archetypal figure from Canon Scene 001 \u2014 The Market of Unseen Weight. He is not a specific person. He is every competent person who has normalized the scale of what depends on them. His story is the story of the case: what it holds, what it costs, and what becomes possible when he sets it down.",
    appearance: {
      height: "6'0\"",
      build: "Solid, tired",
      hair: "Close-cropped",
      eyes: "Deep brown, reflective",
      style: "Long navy coat. High collar. Functional boots.",
    },
    traits: [
      { label: "Strength", value: 85 },
      { label: "Vulnerability", value: 45 },
      { label: "Intelligence", value: 75 },
      { label: "Compassion", value: 80 },
      { label: "Determination", value: 95 },
    ],
    tags: ["Carrier", "Leader", "Weight", "Systems", "Dignity", "Endurance"],
    relationships: [
      { name: "The Child", role: "Dependent", descriptor: "Love \u00b7 Future", strength: "Strong", avatarColor: "#2F62D8" },
      { name: "The Colleague", role: "Peer", descriptor: "Exchange \u00b7 Trust", strength: "Medium", avatarColor: "#22A06B" },
    ],
    notes: [
      "The Carrier is canonical \u2014 he appears in Canon Scene 001 and 003.",
      "Visual motif: The Case",
      "Symbol: Weight contains information",
    ],
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
    appearances: 11,
    dialogueScenes: 2,
    portraitInitial: "C",
    portraitColor: "#1A2332",
  },
  {
    id: "the-child",
    name: "The Child",
    role: "Child",
    archetype: "The Child",
    tagline: "She lifts what the adult cannot because she doesn\u2019t know it\u2019s heavy.",
    age: "8",
    occupation: "Child",
    coreDesire: "To understand the adult\u2019s world.",
    greatestFear: "Losing the adult to something she can\u2019t see.",
    internalFlaw: "Innocence untested by the world\u2019s weight.",
    essence: "Lightness. Curiosity. Unconditioned perception.",
    voice: "Simple, direct, surprising. Asks what adults won\u2019t.",
    motivation: "Understanding, Connection, Play",
    themeConnection: "Proof that the case was always this light.",
    storyArc: {
      points: [
        { label: "Setup", title: "Watches from the margins", value: 70 },
        { label: "Inciting Incident", title: "Sees the case", value: 55 },
        { label: "Midpoint", title: "Offers the drawing", value: 50 },
        { label: "Crisis", title: "Feels the distance grow", value: 40 },
        { label: "Resolution", title: "Lifts the case", value: 95 },
      ],
      startingState: "Observes without understanding.",
      transformation: "Acts without knowing the significance. Becomes the proof.",
      endState: "The case is light. The future is open.",
    },
    keyMoments: [
      { title: "The drawing", description: "Draws the man standing beside the city. Gives it to him." },
      { title: "The lift", description: "Picks up the case effortlessly. Walks away with it." },
    ],
    backstory:
      "The Child is the archetypal figure from Canon Scene 001 and 003. She is not a specific child \u2014 she is the unburdened future. Her innocence isn\u2019t weakness; it\u2019s the condition Tai is fighting to preserve. When she lifts the case, the entire thesis of the world becomes visible: the weight was never the object. It was the relationship to it.",
    appearance: {
      height: "4'2\"",
      build: "Small",
      hair: "Braided",
      eyes: "Bright, observant",
      style: "Simple dress. Bare feet.",
    },
    traits: [
      { label: "Strength", value: 25 },
      { label: "Vulnerability", value: 90 },
      { label: "Intelligence", value: 65 },
      { label: "Compassion", value: 85 },
      { label: "Determination", value: 60 },
    ],
    tags: ["Innocent", "Proof", "Future", "Light", "Unburdened"],
    relationships: [
      { name: "The Carrier", role: "Guardian", descriptor: "Love \u00b7 Distance", strength: "Strong", avatarColor: "#1A2332" },
    ],
    notes: [
      "The Child is the emotional proof-of-concept for the entire world thesis.",
      "Visual motif: The Drawing",
      "Symbol: Light (recognition without knowing it)",
    ],
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
    appearances: 5,
    dialogueScenes: 1,
    portraitInitial: "C",
    portraitColor: "#2F62D8",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id)
}

export function getCharactersByRole(role: CharacterRole): Character[] {
  return CHARACTERS.filter((c) => c.role === role)
}
