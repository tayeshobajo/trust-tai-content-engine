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


export const PROPS: Prop[] = []

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
