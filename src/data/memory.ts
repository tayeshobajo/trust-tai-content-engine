/**
 * Production Memory System — Data Layer
 *
 * Types and config are static. All content arrays are empty — 
 * populated at runtime from studio-store, not seeded mock data.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type MemoryType =
  | "Insight"
  | "Pattern"
  | "Decision"
  | "Reference"
  | "Experiment"
  | "Prompt"
  | "Lesson"

export type Impact = "High" | "Medium" | "Low"

export type ThemeCategory =
  | "Visual Language"
  | "Pacing & Rhythm"
  | "Character & Arc"
  | "Audience Response"
  | "Systems & Workflow"

export interface MemoryEntry {
  id: string
  title: string
  description: string
  type: MemoryType
  source: string
  production: string
  impact: Impact
  impactScore: number // 1-5 (filled dots)
  added: string // relative time
  addedDate: string // ISO for sorting
  themes: ThemeCategory[]
  pinned: boolean
  contextTags: string[]
  linkedMemoryIds: string[]
  proactiveAlert?: string
}

export interface MemoryTheme {
  label: ThemeCategory
  pct: number
  icon: string
}

export interface MemoryGraphLink {
  from: string
  to: string
}

export interface MemoryGraphNode {
  id: string
  label: string
  type: "theme" | "production" | "system"
  color: string
  x: number
  y: number
}

export interface ProductionMemoryRef {
  name: string
  count: number
  thumbs: string[]
}

export interface MemoryTypeSplit {
  type: string
  pct: number
  count: number
  color: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE COLORS (UI config — static)
// ═══════════════════════════════════════════════════════════════════════════════

export const TYPE_COLORS: Record<MemoryType, { bg: string; text: string; tile: string; icon: string }> = {
  Insight:    { bg: "rgba(194,154,91,0.12)",  text: "#C29A5B", tile: "rgba(194,154,91,0.1)",  icon: "💡" },
  Pattern:    { bg: "rgba(124,108,196,0.12)", text: "#7C6CC4", tile: "rgba(124,108,196,0.1)", icon: "🎞" },
  Decision:   { bg: "rgba(34,160,107,0.12)",  text: "#22A06B", tile: "rgba(34,160,107,0.1)",  icon: "✓" },
  Reference:  { bg: "rgba(47,98,216,0.12)",   text: "#2F62D8", tile: "rgba(47,98,216,0.1)",   icon: "📄" },
  Experiment: { bg: "rgba(232,128,42,0.12)",  text: "#E8802A", tile: "rgba(232,128,42,0.1)",  icon: "⚗" },
  Prompt:     { bg: "rgba(220,38,38,0.10)",   text: "#DC2626", tile: "rgba(220,38,38,0.08)",  icon: "📖" },
  Lesson:     { bg: "rgba(138,133,120,0.12)", text: "#8A8578", tile: "rgba(138,133,120,0.1)", icon: "🧠" },
}

export const IMPACT_COLORS: Record<Impact, string> = {
  High: "#E8802A",
  Medium: "#C29A5B",
  Low: "#8A8578",
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT ARRAYS — empty, populated at runtime
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORIES: MemoryEntry[] = []

export const MEMORY_THEMES: MemoryTheme[] = []

export const TYPE_SPLIT: MemoryTypeSplit[] = []

export const GRAPH_NODES: MemoryGraphNode[] = []

export const GRAPH_LINKS: MemoryGraphLink[] = []

export const PRODUCTION_REFS: ProductionMemoryRef[] = []

export const MEMORY_STATS = {
  totalMemories: 0,
  totalDelta: 0,
  highImpact: 0,
  highImpactDelta: 0,
  patterns: 0,
  patternsDelta: 0,
  experiments: 0,
  experimentsDelta: 0,
}

export const SPARKLINES = {
  totalMemories: [0, 0, 0, 0, 0, 0, 0, 0],
  highImpact: [0, 0, 0, 0, 0, 0, 0, 0],
  patterns: [0, 0, 0, 0, 0, 0, 0, 0],
  experiments: [0, 0, 0, 0, 0, 0, 0, 0],
}

export const PINNED_MEMORIES = MEMORIES.filter((m) => m.pinned)

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE SIGNALS
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntelligenceSignal {
  kind: "trend" | "connection" | "alert" | "suggestion"
  title: string
  detail: string
  action?: string
}

export const INTELLIGENCE_SIGNALS: IntelligenceSignal[] = []

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function recallMemories(context: {
  production?: string
  themes?: ThemeCategory[]
  type?: MemoryType
  limit?: number
}): MemoryEntry[] {
  let results = [...MEMORIES]
  if (context.production && context.production !== "All Productions") {
    results = results.filter(
      (m) => m.production === context.production || m.production === "All Productions"
    )
  }
  if (context.themes && context.themes.length > 0) {
    results = results.filter((m) => m.themes.some((t) => context.themes!.includes(t)))
  }
  if (context.type) {
    results = results.filter((m) => m.type === context.type)
  }
  results.sort((a, b) => {
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore
    return b.addedDate.localeCompare(a.addedDate)
  })
  return results.slice(0, context.limit ?? 10)
}

export function getLinkedMemories(memoryId: string): MemoryEntry[] {
  const entry = MEMORIES.find((m) => m.id === memoryId)
  if (!entry) return []
  return entry.linkedMemoryIds
    .map((id) => MEMORIES.find((m) => m.id === id))
    .filter(Boolean) as MemoryEntry[]
}
