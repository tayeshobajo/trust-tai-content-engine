/**
 * Places — Environment and Location Registry
 *
 * Every recurring location in the Trust Tai world has a unique Place record.
 * Places are locked master references; production-specific variations are
 * stored separately and do not modify the master.
 *
 * QA coverage: Section 7 (Environment and Place Lock)
 */

export type PlaceType =
  | "Outdoor — Urban"
  | "Outdoor — Natural"
  | "Indoor — Domestic"
  | "Indoor — Commercial"
  | "Indoor — Industrial"
  | "Abstract / Symbolic"

export interface LightingCondition {
  /** Primary light source description */
  source: string
  /** Direction (e.g. "top-left", "low from left") */
  direction: string
  /** Quality (e.g. "warm amber", "cool diffuse") */
  quality: string
  /** Time of day this applies to */
  timeOfDay: "dawn" | "morning" | "midday" | "afternoon" | "dusk" | "night" | "any"
}

export interface PlaceVariation {
  id: string
  placeId: string
  name: string
  reason: string // narrative justification for the difference
  changes: string // what is different from the master
  approvedBy?: string
  approvedAt?: string
  isApproved: boolean
}

/** A canonical, locked location in the Trust Tai world */
export interface Place {
  id: string
  name: string
  type: PlaceType
  /** Text description of the master visual reference (image upload TBD) */
  masterRefDescription: string
  masterRefUrl?: string
  // Layout + Materials
  architecture: string
  layout: string
  materials: string[]
  scale: string
  // Scene conditions
  timeOfDay: string
  weather: string
  lighting: LightingCondition[]
  // Spatial anchors — keep these consistent across frames
  spatialAnchors: {
    entrances?: string
    windows?: string
    stairs?: string
    furniture?: string
    landmarks?: string
  }
  // Narrative
  emotionalPurpose: string
  worldLawConnection?: string // references one of the 10 World Laws
  symbolConnection?: string  // references the Symbol System
  // Production management
  productionNotes: string
  forbiddenChanges: string[]
  // Variations (production-specific only — never modify master)
  variations: PlaceVariation[]
  // Meta
  appearances: number
  createdDate: string
  updatedDate: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANON PLACES
// ═══════════════════════════════════════════════════════════════════════════════

export const PLACES: Place[] = [
  {
    id: "market-of-unseen-weight",
    name: "The Market of Unseen Weight",
    type: "Outdoor — Urban",
    masterRefDescription: "A dense, layered marketplace in the canyon city. Stalls, poles, hanging chains, glass vessels, brass instruments, canvas awnings. Worn stone paving. People trade knowledge, tools, and burdens — not goods.",
    architecture: "Dense improvised stalls within a monumental stone arcade. Elevated viaducts overhead. Carved eagle reliefs in canyon walls.",
    layout: "Open central corridor flanked by stalls. Multiple levels. Canyon walls on two sides. Viaduct bridge above.",
    materials: ["worn stone", "aged brass", "canvas", "glass vessels", "iron chains", "weathered wood"],
    scale: "Human-scale foreground; monumental canyon walls create systemic scale in background.",
    timeOfDay: "Late afternoon — golden light angled low through canyon gap.",
    weather: "Dry, slight atmospheric haze from dust and smoke.",
    lighting: [
      { source: "Canyon gap sunlight", direction: "high from left, angled down", quality: "warm amber shaft through haze", timeOfDay: "afternoon" },
      { source: "Stall lanterns", direction: "low, scattered", quality: "warm amber practicals", timeOfDay: "any" },
    ],
    spatialAnchors: {
      entrances: "Two canyon-mouth openings: north (wide, main entry) and south (narrow, exit). A third elevated entrance via the viaduct bridge.",
      windows: "None at street level. Carved apertures in canyon walls at height allow shafts of light.",
      stairs: "Stone steps cut into canyon wall on the east side. Uneven, worn smooth.",
      furniture: "Stall tables: rough wood on brass trestles. A central weighing post — brass scale hung from iron chain.",
      landmarks: "The central weighing post. The carved eagle guardian above the north entrance. A cracked paving circle where the ground visibly sank under historical weight.",
    },
    emotionalPurpose: "Recognition — something understands what I carry. Awe with belonging. The marketplace is not exotic spectacle; it is ordinary life under extraordinary physics.",
    worldLawConnection: "Law 1 (inner realities acquire physical form), Law 3 (every person carries a world), Law 9 (the world remembers).",
    symbolConnection: "Market: exchange of knowledge, tools, histories, and burdens. Stone: history, burden, memory. Brass: deliberate human intervention.",
    productionNotes: "Canon Scene 001 origin. The Carrier walks this market with the case. Do not make the market feel exotic or otherworldly — it must feel lived-in and ordinary.",
    forbiddenChanges: [
      "Do not add neon or oversaturated colour",
      "Do not replace stone with sleek surfaces",
      "Do not remove the eagle guardian above the north entrance",
      "Do not make the market feel empty — it is always populated",
      "Do not change the central weighing post to a generic prop",
    ],
    variations: [],
    appearances: 4,
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
  },
  {
    id: "valley-of-living-roads",
    name: "The Valley of Living Roads",
    type: "Outdoor — Natural",
    masterRefDescription: "A vast canyon valley seen from a high vantage. The valley floor is covered by a living civilization whose roads glow like a luminous map. The roads are not metaphor — they physically respond to intention.",
    architecture: "Canyon rim overlook. Valley floor: densely packed city, aqueduct-like elevated railways, massive stone arches. Roads glow electric/transit blue.",
    layout: "Foreground: narrow stone ledge at the canyon rim. Middle distance: the valley drops away. Background: the entire city sprawls to the horizon.",
    materials: ["stone", "brass transit rails", "glass", "luminous road material (transit blue glow)"],
    scale: "The canyon establishes systemic scale. Human figures at the rim are small but dignified — never diminished.",
    timeOfDay: "Blue hour / dusk. The living roads glow against dimming sky.",
    weather: "Clear. Atmospheric haze in the valley depth. Stars beginning to appear.",
    lighting: [
      { source: "Dusk sky", direction: "ambient, cooling", quality: "cool blue-grey", timeOfDay: "dusk" },
      { source: "Living roads", direction: "upward glow from valley floor", quality: "electric transit blue", timeOfDay: "dusk" },
      { source: "City lanterns", direction: "scattered warm points", quality: "amber", timeOfDay: "dusk" },
    ],
    spatialAnchors: {
      entrances: "The rim overlook accessed from behind (the path from the city above). No visible entrance to the valley below in master shot.",
      landmarks: "The valley floor road network. The luminous transit arc that crosses the widest canyon span. The father-daughter vantage point rock — flat, slightly protruding.",
    },
    emotionalPurpose: "Awe — the world is far larger than I imagined. Agency — there is a meaningful move I can make. The map reveals what was always there.",
    worldLawConnection: "Law 2 (perspective changes reality), Law 4 (routes respond to intention), Law 6 (truth alters material conditions).",
    symbolConnection: "Living road: intention, dependency, movement made legible. Height: access to systemic perspective.",
    productionNotes: "Canon Scene 002 origin. Father and daughter at the rim. Do not shoot from below — the power of this location is the altitude. Camera stays at rim level or above.",
    forbiddenChanges: [
      "Do not remove the road glow — it is physics, not decoration",
      "Do not photograph from the valley floor — only from the rim or above",
      "Do not make the city look like a modern city — it must be the World Bible's analog retrofuturist civilization",
      "Do not reduce the scale — this is the largest establishing shot in the canon",
    ],
    variations: [],
    appearances: 3,
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
  },
  {
    id: "the-workshop",
    name: "The Workshop",
    type: "Indoor — Industrial",
    masterRefDescription: "A craftsman's workshop inside the canyon city. Brass instruments, lenses, gears, chains, and glass globes on worktables. High ceilings with exposed iron beams. Practical amber lighting.",
    architecture: "Stone-walled industrial space. Iron roof beams. Exposed mechanisms — pulley systems, lens arrays, gear trains. A large workbench at centre.",
    layout: "Single large room. Central workbench. Shelving on three walls with instruments. A high window (not a door) on the north wall lets in a shaft of light.",
    materials: ["worn stone", "iron beams", "brass instruments", "glass lenses", "leather-wrapped tools", "tarnished metal", "canvas"],
    scale: "Human-scale. The ceiling height gives breathing room without making the character small.",
    timeOfDay: "Morning — the north window shaft crosses the workbench.",
    weather: "Interior. Dust motes in the light shaft.",
    lighting: [
      { source: "North window shaft", direction: "high from right", quality: "warm morning gold, cuts across workbench", timeOfDay: "morning" },
      { source: "Workshop lamps", direction: "low, close to workbench", quality: "warm amber", timeOfDay: "any" },
    ],
    spatialAnchors: {
      entrances: "One heavy iron door on the south wall. Inward-opening. Always unlocked during working hours.",
      windows: "One north-facing high window — too high to see out of. Provides the light shaft.",
      furniture: "The central workbench (primary). Three instrument shelving units on east, west, and south walls. A high stool at the workbench.",
      landmarks: "The central workbench with its inlaid brass measuring tracks. The instrument suspended from the ceiling by chains — a large navigational compass, always slowly rotating.",
    },
    emotionalPurpose: "Intimacy — close, personal, the character's interiority. Weight — the burden of precision, of building instruments that reveal truth.",
    worldLawConnection: "Law 8 (old and future knowledge coexist), Law 9 (the world remembers).",
    symbolConnection: "Brass: deliberate human intervention, knowledge shaped by hands. Glass: visibility with fragility.",
    productionNotes: "The Carrier and The Mapmaker scenes. The case is often opened here. Do not make it feel cluttered — it is precise, not chaotic.",
    forbiddenChanges: [
      "Do not add digital screens or modern technology",
      "Do not remove the ceiling compass",
      "Do not change the north window shaft — it is the primary light source",
      "Do not make the room feel tidy and sparse — it is lived-in",
    ],
    variations: [],
    appearances: 5,
    createdDate: "Jun 8, 2025",
    updatedDate: "Aug 1, 2025",
  },
  {
    id: "the-threshold",
    name: "The Threshold",
    type: "Indoor — Domestic",
    masterRefDescription: "A doorway at the edge of the canyon city leading outward. The door itself is heavy dark wood with brass fixtures. On one side: the familiar, worn interior. On the other: the luminous road that leads into the valley.",
    architecture: "Narrow stone corridor ending at the threshold door. Interior stone walls, warm lamp on left. The door opens outward to a stone step and the beginning of a living road.",
    layout: "Linear — the corridor leads the eye directly to the door. The composition frames the exterior through the doorway.",
    materials: ["worn stone interior", "dark wood door", "brass door fixtures", "stone step"],
    scale: "Human-scale, intimate. The door is the right size for one person.",
    timeOfDay: "Dusk — the exterior road glows blue against the darkening sky.",
    weather: "Still. Smoke from the city drifts past the doorway.",
    lighting: [
      { source: "Interior corridor lamp", direction: "left wall, low", quality: "warm amber", timeOfDay: "dusk" },
      { source: "Living road glow", direction: "through doorway, from outside", quality: "cool transit blue", timeOfDay: "dusk" },
    ],
    spatialAnchors: {
      entrances: "The threshold is both the ending point of the corridor and the beginning of the exterior road.",
      landmarks: "The brass handle. The worn stone threshold step. The first visible segment of the living road outside.",
    },
    emotionalPurpose: "Threshold — at the edge of something new. The character is not yet across. This is the most important compositional moment: one world behind, one world ahead.",
    worldLawConnection: "Law 4 (routes respond to intention), Law 6 (truth alters material conditions).",
    symbolConnection: "Door/threshold: entry into a larger reality that still requires consent.",
    productionNotes: "Use when a character is choosing to step into something. The living road must be visible through the doorway — this is not a door into darkness.",
    forbiddenChanges: [
      "Do not close the door — the threshold must always be open or opening",
      "Do not remove the road glow through the doorway",
      "Do not change the interior lamp to a cool source — it must be warm amber",
    ],
    variations: [],
    appearances: 2,
    createdDate: "Jul 1, 2025",
    updatedDate: "Aug 1, 2025",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

export function getPlacesByType(type: PlaceType): Place[] {
  return PLACES.filter((p) => p.type === type)
}
