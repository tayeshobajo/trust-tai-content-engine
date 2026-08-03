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


export const CHARACTERS: Character[] = []

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id)
}

export function getCharactersByRole(role: CharacterRole): Character[] {
  return CHARACTERS.filter((c) => c.role === role)
}
