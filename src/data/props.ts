/**
 * Props — Visual Property Registry
 *
 * Every important prop in the Trust Tai world has a unique record.
 * Props carry continuity requirements (size, material, hand, position)
 * and a link to the Symbol System from the World Bible.
 *
 * QA coverage: Section 8 (Props and Symbol Continuity)
 */

export type PropCategory =
  | "Container"
  | "Instrument"
  | "Document"
  | "Clothing"
  | "Tool"
  | "Structural"
  | "Symbol"

export type HandSide = "left" | "right" | "both" | "neither" | "surface"

/** Prior use of a prop in a production — used to check for symbol overuse */
export interface PropUsage {
  productionId: string
  productionTitle: string
  sceneNumbers: number[]
  symbolMeaning: string
}

/** A specific instance of a prop in a scene — for position tracking */
export interface PropPosition {
  sceneNumber: number
  description: string // e.g. "On table, left of centre, lid closed"
  heldBy?: string    // character name if held
  hand?: HandSide
}

/** A canon prop with full continuity documentation */
export interface Prop {
  id: string
  name: string
  category: PropCategory
  // Visual identity
  visualRefDescription: string
  visualRefUrl?: string
  size: string
  material: string[]
  color: string
  condition: string
  // Continuity rules
  defaultHand?: HandSide
  continuityNotes: string
  positionHistory: PropPosition[]
  // Symbol system link
  symbolName?: string  // must match a symbol in World Bible symbol system
  symbolMeaning: string
  symbolMustNeverBecome: string
  // Usage tracking (for overuse detection)
  priorUsages: PropUsage[]
  // Forbidden changes
  forbiddenChanges: string[]
  // Meta
  createdDate: string
  updatedDate: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANON PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export const PROPS: Prop[] = [
  {
    id: "the-case",
    name: "The Case",
    category: "Container",
    visualRefDescription: "A worn leather-and-brass case. Roughly 50cm wide, 30cm tall, 15cm deep. Age-darkened leather with brass corner reinforcements and a brass-clasp latch. Scuffed and dented — it has been carried for years. Heavy.",
    size: "~50cm × 30cm × 15cm",
    material: ["aged leather", "brass corners and clasp", "iron rivets"],
    color: "Dark brown leather, tarnished brass fittings",
    condition: "Well-worn, multiple scuffs, one corner dented, clasp slightly stiff",
    defaultHand: "right",
    continuityNotes: "Carried in right hand. Swings slightly when walking. Does not grow visibly larger as things are added — the weight is invisible. The interior contains a living city (Law 1). Never appears clean or new.",
    positionHistory: [],
    symbolName: "Case/container",
    symbolMeaning: "World, system, memory, or responsibility that someone transports",
    symbolMustNeverBecome: "Convenient steampunk luggage or a generic briefcase",
    priorUsages: [],
    forbiddenChanges: [
      "Do not make it clean or new",
      "Do not change the brass clasp to a modern mechanism",
      "Do not make it visibly larger or smaller between scenes",
      "Do not show the interior without narrative justification — it is only revealed in the crack scene",
    ],
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
  },
  {
    id: "the-brass-instrument",
    name: "The Brass Instrument",
    category: "Instrument",
    visualRefDescription: "A handheld brass navigation instrument — part compass, part map reader. Circular, ~15cm diameter. Engraved with route-markings. A rotating bezel. A small glass lens at centre. Made by hand. Clearly old.",
    size: "~15cm diameter, 3cm thick",
    material: ["aged brass", "glass lens", "engraved copper inlay"],
    color: "Warm tarnished brass, slightly green at engravings",
    condition: "Old but precise. Regularly used. The glass is clean despite the tarnish.",
    defaultHand: "neither",
    continuityNotes: "Rests on surfaces when not in use. When held, two-handed, consulted at eye level. The bezel rotates. The lens refracts light when the angle is right.",
    positionHistory: [],
    symbolName: "Brass",
    symbolMeaning: "Deliberate human intervention, knowledge shaped by hands",
    symbolMustNeverBecome: "Universal gold decoration or generic gadget",
    priorUsages: [],
    forbiddenChanges: [
      "Do not make it look like a modern device",
      "Do not remove the glass lens",
      "Do not make it look mass-produced",
    ],
    createdDate: "Jun 8, 2025",
    updatedDate: "Aug 1, 2025",
  },
  {
    id: "the-drawing",
    name: "The Drawing",
    category: "Document",
    visualRefDescription: "A child's drawing on folded paper. A man stands beside a city — not under it. Drawn in pencil with some coloured chalk. Folded once. Slightly crumpled. The image is simple but unmistakable.",
    size: "A5, folded to A6",
    material: ["paper", "pencil", "chalk colour (brown and blue)"],
    color: "White paper, pencil lines, brown and blue chalk",
    condition: "Folded, slightly crumpled. Handled carefully despite the crumples.",
    defaultHand: "neither",
    continuityNotes: "Given by the child to the Carrier. Enters the case. Retrieved in the landing scene. The image inside must remain consistent — man beside city, not under it.",
    positionHistory: [],
    symbolName: "Map",
    symbolMeaning: "Record of relationships and possibilities",
    symbolMustNeverBecome: "Generic treasure map or motivational prop",
    priorUsages: [],
    forbiddenChanges: [
      "Do not change the image — the man must always stand BESIDE the city, not under it",
      "Do not make it look like a professional drawing",
      "Do not show it as clean and unfolded until the landing scene",
    ],
    createdDate: "Jun 1, 2025",
    updatedDate: "Aug 2, 2025",
  },
  {
    id: "the-lantern",
    name: "The Lantern",
    category: "Tool",
    visualRefDescription: "A brass-framed oil lantern, roughly 25cm tall. Glass panels, tarnished brass frame, a curved handle. Burns warm amber. When placed, it illuminates a small area with recognition-quality light.",
    size: "~25cm tall, ~12cm wide",
    material: ["brass frame", "glass panels", "iron base"],
    color: "Tarnished brass, amber glow",
    condition: "Well-used. Some soot on the top. The glass is clean where the light matters.",
    defaultHand: "left",
    continuityNotes: "Held in left hand, or placed on surfaces. The glow is warm amber — never cool white. It illuminates only what the viewer needs to see.",
    positionHistory: [],
    symbolName: "Light",
    symbolMeaning: "Recognition or active relationship",
    symbolMustNeverBecome: "Holiness, goodness, or constant magical glow",
    priorUsages: [],
    forbiddenChanges: [
      "Do not change the light colour to white or blue",
      "Do not make it glow too brightly — it is a practical light, not a spotlight",
      "Do not use it as a general mood light — it illuminates meaning, not atmosphere",
    ],
    createdDate: "Jun 15, 2025",
    updatedDate: "Aug 1, 2025",
  },
  {
    id: "the-map",
    name: "The Map",
    category: "Document",
    visualRefDescription: "A large rolled map, bound with a leather cord. When unrolled, it shows relationships, routes, and dependencies — not geography. Points are connected by lines. Some routes glow faintly transit blue.",
    size: "Rolled: ~60cm long, ~8cm diameter",
    material: ["aged parchment", "brass tip-weights at corners when unrolled", "faint luminous route markings"],
    color: "Warm parchment, charcoal route lines, transit blue for active routes",
    condition: "Well-used. Rolled and unrolled many times. Some edge wear.",
    defaultHand: "neither",
    continuityNotes: "When unrolled, requires a flat surface and all four corners held. The living routes (transit blue) only glow when someone is actively moving with intention.",
    positionHistory: [],
    symbolName: "Map",
    symbolMeaning: "Record of relationships and possibilities — not geography",
    symbolMustNeverBecome: "Generic treasure map or motivational poster prop",
    priorUsages: [],
    forbiddenChanges: [
      "Do not show it as a geographic map — it shows relationships and routes",
      "Do not make all routes glow — only active, intentional routes glow",
      "Do not make it look like a digital display",
    ],
    createdDate: "Jun 15, 2025",
    updatedDate: "Aug 2, 2025",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getProp(id: string): Prop | undefined {
  return PROPS.find((p) => p.id === id)
}

export function getPropsBySymbol(symbolName: string): Prop[] {
  return PROPS.filter((p) => p.symbolName === symbolName)
}

export function getPropsByCategory(category: PropCategory): Prop[] {
  return PROPS.filter((p) => p.category === category)
}
