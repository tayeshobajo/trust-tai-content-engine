/**
 * Production Memory System — Data Layer
 *
 * Designed around Spirit First principles:
 * - Reads the room (context-aware, production-aware)
 * - Links concepts (memory graph, auto-linked)
 * - Stays proactive (trending themes, learning signals)
 * - Learns (patterns, lessons, experiments feed back into future work)
 *
 * Mock data — structured to swap with a Supabase-backed store.
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
  // Spirit First intelligence layer
  contextTags: string[] // what room was this learned in?
  linkedMemoryIds: string[] // concept graph edges
  proactiveAlert?: string // if set, this memory has a live signal
}

export interface MemoryTheme {
  label: ThemeCategory
  pct: number
  icon: string // emoji or short label for the row icon
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
  x: number // 0-100 percentage position
  y: number
}

export interface ProductionMemoryRef {
  name: string
  count: number
  thumbs: string[] // emoji or initial for thumbnail stand-in
}

export interface MemoryTypeSplit {
  type: string
  pct: number
  count: number
  color: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE COLORS
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
// MEMORY ENTRIES (mock — 12 seeded memories)
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORIES: MemoryEntry[] = [
  {
    id: "mem-001",
    title: "Silence before the reveal creates weight.",
    description: "A 2\u20133 second hold before key reveals increases retention and emotional impact.",
    type: "Insight",
    source: "The Tilted Office, Scene 3",
    production: "The Tilted Office",
    impact: "High",
    impactScore: 4,
    added: "2h ago",
    addedDate: "2025-08-03T00:00:00Z",
    themes: ["Pacing & Rhythm", "Audience Response"],
    pinned: false,
    contextTags: ["post-production", "audience-test"],
    linkedMemoryIds: ["mem-005", "mem-008"],
    proactiveAlert: "Pacing insight trending \u2014 3 new corroborating signals this week",
  },
  {
    id: "mem-002",
    title: "Low-angle + negative space communicates scale.",
    description: "Used effectively in scenes 2, 4, and 6 to position the builder as small vs. the system.",
    type: "Pattern",
    source: "The Man Who Carried a City",
    production: "The Man Who Carried a City",
    impact: "High",
    impactScore: 4,
    added: "5h ago",
    addedDate: "2025-08-02T20:00:00Z",
    themes: ["Visual Language", "Character & Arc"],
    pinned: false,
    contextTags: ["cinematography", "composition"],
    linkedMemoryIds: ["mem-006", "mem-010"],
  },
  {
    id: "mem-003",
    title: "Decision: Open with the catch, not the problem.",
    description: "Testing showed stronger curiosity and completion rate when starting with action.",
    type: "Decision",
    source: "Decision Log, May 14, 2025",
    production: "The Tilted Office",
    impact: "High",
    impactScore: 5,
    added: "Yesterday",
    addedDate: "2025-08-02T00:00:00Z",
    themes: ["Pacing & Rhythm", "Audience Response"],
    pinned: true,
    contextTags: ["editing", "narrative-structure"],
    linkedMemoryIds: ["mem-001", "mem-005"],
  },
  {
    id: "mem-004",
    title: "Brass + walnut color palette resonates.",
    description: "Audience feedback shows warmth, trust, and premium perception.",
    type: "Reference",
    source: "Audience Signal, May 10, 2025",
    production: "Brand World",
    impact: "Medium",
    impactScore: 3,
    added: "2 days ago",
    addedDate: "2025-08-01T00:00:00Z",
    themes: ["Visual Language", "Audience Response"],
    pinned: false,
    contextTags: ["color-theory", "brand"],
    linkedMemoryIds: ["mem-006", "mem-011"],
  },
  {
    id: "mem-005",
    title: "Experiment: 5-sec vs 10-sec scene pacing.",
    description: "5-sec cuts improved retention by 18% on average across test audience.",
    type: "Experiment",
    source: "Experiment #12, May 8, 2025",
    production: "The Tilted Office",
    impact: "Medium",
    impactScore: 3,
    added: "3 days ago",
    addedDate: "2025-07-31T00:00:00Z",
    themes: ["Pacing & Rhythm", "Audience Response"],
    pinned: false,
    contextTags: ["editing", "audience-test"],
    linkedMemoryIds: ["mem-001", "mem-003"],
  },
  {
    id: "mem-006",
    title: "Prompt that generates more cinematic frames.",
    description: "Using directional light + texture language in prompt increases realism and mood.",
    type: "Prompt",
    source: "Prompt Library V2.3",
    production: "All Productions",
    impact: "High",
    impactScore: 5,
    added: "4 days ago",
    addedDate: "2025-07-30T00:00:00Z",
    themes: ["Visual Language", "Systems & Workflow"],
    pinned: true,
    contextTags: ["rendering", "ai-prompt"],
    linkedMemoryIds: ["mem-002", "mem-004", "mem-011"],
  },
  {
    id: "mem-007",
    title: "Character silence is more powerful than dialogue.",
    description: "When the Carrier doesn\u2019t speak in Scene 7, audience engagement spikes.",
    type: "Insight",
    source: "The Man Who Carried a City, Scene 7",
    production: "The Man Who Carried a City",
    impact: "High",
    impactScore: 5,
    added: "5 days ago",
    addedDate: "2025-07-29T00:00:00Z",
    themes: ["Character & Arc", "Pacing & Rhythm"],
    pinned: false,
    contextTags: ["direction", "character"],
    linkedMemoryIds: ["mem-001", "mem-002"],
    proactiveAlert: "Silence pattern recurring across 3 productions \u2014 consider canonizing",
  },
  {
    id: "mem-008",
    title: "Audience retains emotional beats over informational ones.",
    description: "Scenes rated \u201cemotionally resonant\u201d had 2.3x the recall rate of informational scenes.",
    type: "Pattern",
    source: "Audience Study, Jul 2025",
    production: "All Productions",
    impact: "High",
    impactScore: 5,
    added: "1 week ago",
    addedDate: "2025-07-27T00:00:00Z",
    themes: ["Audience Response", "Character & Arc"],
    pinned: false,
    contextTags: ["audience-research"],
    linkedMemoryIds: ["mem-001", "mem-007"],
  },
  {
    id: "mem-009",
    title: "Decision: Brass instruments as recurring motif.",
    description: "Anchors the world\u2019s analog technology identity. Approved by Tai.",
    type: "Decision",
    source: "World Bible Session, Jul 15",
    production: "Brand World",
    impact: "High",
    impactScore: 4,
    added: "1 week ago",
    addedDate: "2025-07-26T00:00:00Z",
    themes: ["Visual Language"],
    pinned: false,
    contextTags: ["world-building", "art-direction"],
    linkedMemoryIds: ["mem-004", "mem-006"],
  },
  {
    id: "mem-010",
    title: "Lesson: Over-lighting kills the mood.",
    description: "Scenes lit above 40% ambient lost the cinematic feel. Keep practicals dominant.",
    type: "Lesson",
    source: "Render Post-Mortem #4",
    production: "All Productions",
    impact: "Medium",
    impactScore: 4,
    added: "1 week ago",
    addedDate: "2025-07-25T00:00:00Z",
    themes: ["Visual Language", "Systems & Workflow"],
    pinned: false,
    contextTags: ["lighting", "rendering"],
    linkedMemoryIds: ["mem-002", "mem-006"],
  },
  {
    id: "mem-011",
    title: "Warm practical light = trust signal.",
    description: "Audience associates amber lamplight with safety. Use in scenes where the character arrives, not departs.",
    type: "Reference",
    source: "Audience Signal, Jul 20",
    production: "Brand World",
    impact: "Medium",
    impactScore: 3,
    added: "2 weeks ago",
    addedDate: "2025-07-20T00:00:00Z",
    themes: ["Visual Language", "Audience Response"],
    pinned: false,
    contextTags: ["lighting", "audience-research"],
    linkedMemoryIds: ["mem-004", "mem-006", "mem-010"],
  },
  {
    id: "mem-012",
    title: "Experiment: Narration vs pure visual storytelling.",
    description: "Visual-only scenes had 40% higher completion but 25% lower message recall. Hybrid won.",
    type: "Experiment",
    source: "Experiment #15, Jul 18",
    production: "The Man Who Carried a City",
    impact: "High",
    impactScore: 5,
    added: "2 weeks ago",
    addedDate: "2025-07-18T00:00:00Z",
    themes: ["Pacing & Rhythm", "Audience Response"],
    pinned: false,
    contextTags: ["narration", "audience-test"],
    linkedMemoryIds: ["mem-001", "mem-005", "mem-008"],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// THEME BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORY_THEMES: MemoryTheme[] = [
  { label: "Visual Language", pct: 32, icon: "📖" },
  { label: "Pacing & Rhythm", pct: 26, icon: "▶" },
  { label: "Character & Arc", pct: 18, icon: "👤" },
  { label: "Audience Response", pct: 14, icon: "👁" },
  { label: "Systems & Workflow", pct: 10, icon: "⚙" },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE SPLIT (donut chart data)
// ═══════════════════════════════════════════════════════════════════════════════

export const TYPE_SPLIT: MemoryTypeSplit[] = [
  { type: "Insight",    pct: 36, count: 449, color: "#C29A5B" },
  { type: "Patterns",   pct: 24, count: 299, color: "#7C6CC4" },
  { type: "Decisions",  pct: 18, count: 224, color: "#22A06B" },
  { type: "References", pct: 12, count: 150, color: "#2F62D8" },
  { type: "Other",      pct: 10, count: 126, color: "#8A8578" },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY GRAPH NODES + LINKS
// ═══════════════════════════════════════════════════════════════════════════════

export const GRAPH_NODES: MemoryGraphNode[] = [
  { id: "visual-lang",   label: "Visual Language",      type: "theme",     color: "#C29A5B", x: 50, y: 15 },
  { id: "pacing",        label: "Pacing",                type: "theme",     color: "#7C6CC4", x: 15, y: 35 },
  { id: "audience",      label: "Audience Signal",       type: "theme",     color: "#22A06B", x: 85, y: 45 },
  { id: "tilted-office", label: "The Tilted Office",     type: "production",color: "#1A2332", x: 30, y: 55 },
  { id: "carried-city",  label: "The Man Who Carried a City", type: "production", color: "#1A2332", x: 70, y: 60 },
  { id: "decision-log",  label: "Decision Log",          type: "system",    color: "#C29A5B", x: 20, y: 80 },
  { id: "brand-world",   label: "Brand World",           type: "system",    color: "#22A06B", x: 80, y: 80 },
  { id: "prod-system",   label: "Production System",     type: "system",    color: "#2F62D8", x: 50, y: 88 },
]

export const GRAPH_LINKS: MemoryGraphLink[] = [
  { from: "visual-lang",   to: "tilted-office" },
  { from: "visual-lang",   to: "carried-city" },
  { from: "pacing",        to: "tilted-office" },
  { from: "pacing",        to: "carried-city" },
  { from: "audience",      to: "carried-city" },
  { from: "audience",      to: "brand-world" },
  { from: "decision-log",  to: "tilted-office" },
  { from: "brand-world",   to: "carried-city" },
  { from: "prod-system",   to: "tilted-office" },
  { from: "prod-system",   to: "carried-city" },
  { from: "visual-lang",   to: "brand-world" },
  { from: "pacing",        to: "audience" },
]

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION MEMORY REFS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCTION_REFS: ProductionMemoryRef[] = [
  { name: "The Tilted Office",              count: 12, thumbs: ["🎬", "📊", "💡"] },
  { name: "The Man Who Carried a City",     count: 18, thumbs: ["🏔", "🛤", "👁"] },
  { name: "The Last Person Holding the Rope", count: 7, thumbs: ["🪢", "💪", "🌅"] },
]

// ═══════════════════════════════════════════════════════════════════════════════
// KPI STATS
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORY_STATS = {
  totalMemories: 1248,
  totalDelta: 24,
  highImpact: 186,
  highImpactDelta: 12,
  patterns: 37,
  patternsDelta: 3,
  experiments: 52,
  experimentsDelta: 6,
}

// Sparkline data (trend points, 0-100 normalized)
export const SPARKLINES = {
  totalMemories: [20, 28, 25, 38, 42, 55, 60, 72],
  highImpact: [30, 35, 32, 44, 48, 52, 58, 64],
  patterns: [15, 22, 28, 30, 35, 40, 42, 48],
  experiments: [10, 15, 18, 22, 28, 30, 35, 42],
}

// ═══════════════════════════════════════════════════════════════════════════════
// PINNED MEMORIES
// ═══════════════════════════════════════════════════════════════════════════════

export const PINNED_MEMORIES = MEMORIES.filter((m) => m.pinned)

// ═══════════════════════════════════════════════════════════════════════════════
// SPIRIT FIRST INTELLIGENCE SIGNALS
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntelligenceSignal {
  kind: "trend" | "connection" | "alert" | "suggestion"
  title: string
  detail: string
  action?: string
}

export const INTELLIGENCE_SIGNALS: IntelligenceSignal[] = [
  {
    kind: "trend",
    title: "Visual language and pacing decisions are driving the highest audience impact.",
    detail: "Cross-referencing 186 high-impact memories against performance data.",
    action: "View analysis \u2192",
  },
  {
    kind: "connection",
    title: "3 memories across 2 productions share the same silence-before-reveal pattern.",
    detail: "Consider canonizing this as a world law or production principle.",
    action: "Review pattern \u2192",
  },
  {
    kind: "alert",
    title: "Over-lighting is the #1 cause of render rejection.",
    detail: "4 of the last 6 failed renders traced back to ambient light above 40%.",
    action: "Add to pre-render checklist \u2192",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: READ THE ROOM
// Given a production + scene context, surface relevant memories.
// In production this would be an API call. Here it's a synchronous filter.
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
  // Sort by impact score then recency
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
