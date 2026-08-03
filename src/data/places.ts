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


export const PLACES: Place[] = []

// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

export function getPlacesByType(type: PlaceType): Place[] {
  return PLACES.filter((p) => p.type === type)
}
