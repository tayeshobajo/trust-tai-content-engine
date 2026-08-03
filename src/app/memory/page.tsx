"use client"

import { useState } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  MEMORIES,
  MEMORY_STATS,
  MEMORY_THEMES,
  TYPE_SPLIT,
  TYPE_COLORS,
  IMPACT_COLORS,
  GRAPH_NODES,
  GRAPH_LINKS,
  PRODUCTION_REFS,
  SPARKLINES,
  PINNED_MEMORIES,
  INTELLIGENCE_SIGNALS,
} from "@/data/memory"
import type { MemoryEntry } from "@/data/memory"
import {
  ArrowLeft,
  Plus,
  Bell,
  Search,
  Filter,
  Brain,
  BookOpen,
  Star,
  Grid3x3,
  FlaskConical,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize,
  GitBranch,
  AlertCircle,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  cream: "#F4F1EA",
  white: "#FFFFFF",
  navy: "#1A2332",
  navyDeep: "#0D1626",
  gold: "#C29A5B",
  blue: "#2F62D8",
  purple: "#7C6CC4",
  textDark: "#1A2332",
  textMid: "#4A5568",
  textMuted: "#8A8578",
  border: "#DDD8CE",
  borderLight: "#EAE6DF",
  green: "#22A06B",
  orange: "#E8802A",
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  "Insights Library",
  "Decisions Log",
  "Patterns",
  "Assets & References",
  "Lessons Learned",
  "Prompts",
  "Experiments",
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState("")

  const filteredMemories = MEMORIES.filter((m) => {
    if (search) {
      const q = search.toLowerCase()
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.production.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* ═══ TOP BAR ═══ */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:underline"
            style={{ color: C.textMuted }}
          >
            <ArrowLeft className="w-3 h-3" />
            Studio
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border" style={{ borderColor: C.border, color: C.textMid }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green }} />
              Studio activity
            </span>
            <button className="relative">
              <Bell className="w-4 h-4" style={{ color: C.textMuted }} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: C.gold }}>
                5
              </span>
            </button>
            <button
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.navy, color: "#FFFFFF" }}
            >
              <Plus className="w-3 h-3" />
              Bring a post
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {/* ═══ HEADER ROW ═══ */}
          <div className="flex items-start justify-between gap-4 pt-6 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(194,154,91,0.1)" }}>
                <Brain className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <div>
                <h1 className="font-serif" style={{ fontSize: "32px", color: C.textDark, fontWeight: 400 }}>
                  Production Memory
                </h1>
                <p className="text-[12px] mt-0.5" style={{ color: C.textMid }}>
                  Everything we&apos;ve learned. So we build wiser, faster, and truer.
                </p>
              </div>
            </div>
          </div>

          {/* ═══ SPIRIT FIRST INTELLIGENCE BANNER ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {INTELLIGENCE_SIGNALS.map((signal, i) => {
              const Icon =
                signal.kind === "trend" ? TrendingUp :
                signal.kind === "connection" ? GitBranch :
                signal.kind === "alert" ? AlertCircle :
                Sparkles
              const color =
                signal.kind === "trend" ? C.gold :
                signal.kind === "connection" ? C.purple :
                signal.kind === "alert" ? C.orange :
                C.blue
              return (
                <div
                  key={i}
                  className="rounded-xl border p-4 flex items-start gap-3"
                  style={{ backgroundColor: C.white, borderColor: C.borderLight }}
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}12` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold leading-snug mb-1" style={{ color: C.textDark }}>
                      {signal.title}
                    </p>
                    <p className="text-[10px] leading-snug mb-1.5" style={{ color: C.textMuted }}>
                      {signal.detail}
                    </p>
                    {signal.action && (
                      <button className="text-[10px] font-semibold hover:underline" style={{ color: C.gold }}>
                        {signal.action}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ═══ KPI STAT CARDS ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard
              icon={BookOpen}
              label="Total memories"
              value={MEMORY_STATS.totalMemories.toLocaleString()}
              delta={`\u2191 ${MEMORY_STATS.totalDelta} this week`}
              sparkData={SPARKLINES.totalMemories}
              sparkColor={C.gold}
            />
            <StatCard
              icon={Star}
              label="High impact insights"
              value={MEMORY_STATS.highImpact.toString()}
              delta={`\u2191 ${MEMORY_STATS.highImpactDelta} this week`}
              sparkData={SPARKLINES.highImpact}
              sparkColor={C.orange}
            />
            <StatCard
              icon={Grid3x3}
              label="Patterns identified"
              value={MEMORY_STATS.patterns.toString()}
              delta={`\u2191 ${MEMORY_STATS.patternsDelta} this week`}
              sparkData={SPARKLINES.patterns}
              sparkColor={C.purple}
            />
            <StatCard
              icon={FlaskConical}
              label="Experiments run"
              value={MEMORY_STATS.experiments.toString()}
              delta={`\u2191 ${MEMORY_STATS.experimentsDelta} this week`}
              sparkData={SPARKLINES.experiments}
              sparkColor={C.green}
            />
          </div>

          {/* ═══ TAB NAVIGATION ═══ */}
          <div className="flex items-center gap-4 border-b pb-2 mb-5">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="text-[12px] font-semibold transition-colors relative whitespace-nowrap"
                style={{ color: activeTab === i ? C.navy : C.textMuted }}
              >
                {tab}
                {activeTab === i && (
                  <div className="absolute bottom-[-8px] left-0 right-0 h-0.5" style={{ backgroundColor: C.gold }} />
                )}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: C.border, backgroundColor: C.white }}>
              <Search className="w-3 h-3" style={{ color: C.textMuted }} />
              <input
                type="text"
                placeholder="Search memory\u2026"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[10px] bg-transparent outline-none w-28"
                style={{ color: C.textDark }}
              />
            </div>
            <button className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-full border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
              <Filter className="w-2.5 h-2.5" />
              Filters
            </button>
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            {/* ═══ MAIN COLUMN ═══ */}
            <div className="space-y-5">
              {/* ═══ RECENT MEMORIES TABLE ═══ */}
              <div className="rounded-xl border" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                {/* Card header */}
                <div className="flex items-start justify-between p-5 pb-3">
                  <div>
                    <h3 className="font-serif text-[16px]" style={{ color: C.textDark }}>Recent memories</h3>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                      The latest insights, references, and decisions captured.
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                    style={{ borderColor: C.border, color: C.textMid }}
                  >
                    View all memories
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Table header */}
                <div
                  className="flex items-center gap-3 px-5 py-2 border-y text-[8px] font-bold tracking-[0.08em] uppercase"
                  style={{ borderColor: C.borderLight, color: C.textMuted }}
                >
                  <span className="flex-1">Memory</span>
                  <span className="w-20">Type</span>
                  <span className="w-28 hidden md:block">Production</span>
                  <span className="w-16 text-center">Impact</span>
                  <span className="w-16 text-right">Added</span>
                  <span className="w-6" />
                </div>

                {/* Table rows */}
                {filteredMemories.map((mem) => (
                  <MemoryRow key={mem.id} memory={mem} />
                ))}

                {/* Footer */}
                <div className="flex items-center justify-center py-3 border-t" style={{ borderColor: C.borderLight }}>
                  <button className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline" style={{ color: C.textMid }}>
                    Show more memories
                    <ChevronRight className="w-2.5 h-2.5 rotate-90" />
                  </button>
                </div>
              </div>

              {/* ═══ BOTTOM ROW: 3 CARDS ═══ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Memory Themes */}
                <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <h4 className="font-serif text-[14px] mb-1" style={{ color: C.textDark }}>Top memory themes</h4>
                  <p className="text-[9px] mb-3" style={{ color: C.textMuted }}>What we&apos;re learning about.</p>
                  <div className="space-y-2.5">
                    {MEMORY_THEMES.map((theme) => (
                      <div key={theme.label} className="flex items-center gap-2">
                        <span className="text-[10px] w-2 flex-shrink-0" style={{ color: C.textMid }}>{theme.icon}</span>
                        <span className="text-[10px] flex-shrink-0 w-28" style={{ color: C.textMid }}>{theme.label}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                          <div className="h-full rounded-full" style={{ width: `${theme.pct}%`, backgroundColor: C.gold }} />
                        </div>
                        <span className="text-[9px] font-semibold w-7 text-right" style={{ color: C.textDark }}>{theme.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory Graph */}
                <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-serif text-[14px]" style={{ color: C.textDark }}>Memory graph</h4>
                      <p className="text-[9px]" style={{ color: C.textMuted }}>How ideas connect.</p>
                    </div>
                    <button className="text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                      Explore
                    </button>
                  </div>
                  <MemoryGraph />
                </div>

                {/* Pinned Memories */}
                <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-serif text-[14px]" style={{ color: C.textDark }}>Pinned</h4>
                      <p className="text-[9px]" style={{ color: C.textMuted }}>Quick access.</p>
                    </div>
                    <button className="text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                      Manage
                    </button>
                  </div>
                  <div className="space-y-2.5 mt-2">
                    {PINNED_MEMORIES.map((mem) => {
                      const tc = TYPE_COLORS[mem.type]
                      return (
                        <div key={mem.id} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[12px]" style={{ backgroundColor: tc.tile }}>
                            {tc.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold leading-tight" style={{ color: C.textDark }}>{mem.title}</p>
                            <p className="text-[8px]" style={{ color: C.textMuted }}>{mem.source}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button className="w-full text-center text-[9px] font-medium mt-3 hover:underline" style={{ color: C.textMid }}>
                    View all pinned \u2192
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT RAIL ═══ */}
            <div className="space-y-4">
              {/* Memory Intelligence — Donut */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <h4 className="font-serif text-sm mb-1" style={{ color: C.textDark }}>Memory intelligence</h4>
                <p className="text-[9px] mb-3" style={{ color: C.textMuted }}>What we&apos;re learning most right now.</p>

                {/* Donut */}
                <div className="flex justify-center mb-3">
                  <DonutChart segments={TYPE_SPLIT} centerLabel="Top memory types" centerValue="1,248" centerSub="Total" />
                </div>

                {/* Legend */}
                <div className="space-y-1.5">
                  {TYPE_SPLIT.map((seg) => (
                    <div key={seg.type} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-[10px] flex-1" style={{ color: C.textMid }}>{seg.type}</span>
                      <span className="text-[9px] font-semibold" style={{ color: C.textDark }}>{seg.pct}%</span>
                      <span className="text-[9px] w-8 text-right" style={{ color: C.textMuted }}>{seg.count}</span>
                    </div>
                  ))}
                </div>

                {/* Highlight box */}
                <div className="mt-3 rounded-lg border p-3" style={{ borderColor: C.borderLight, backgroundColor: "rgba(194,154,91,0.04)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3" style={{ color: C.gold }} />
                    <p className="text-[10px] font-bold" style={{ color: C.textDark }}>Strongest learning trend</p>
                  </div>
                  <p className="text-[9px] leading-snug mb-1.5" style={{ color: C.textMid }}>
                    Visual language and pacing decisions are driving the highest audience impact.
                  </p>
                  <button className="text-[9px] font-semibold hover:underline" style={{ color: C.gold }}>
                    View analysis \u2192
                  </button>
                </div>
              </div>

              {/* Recently Used In */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <h4 className="font-serif text-sm mb-1" style={{ color: C.textDark }}>Recently used in</h4>
                <p className="text-[9px] mb-3" style={{ color: C.textMuted }}>Memories shaping current work.</p>
                <div className="space-y-2.5">
                  {PRODUCTION_REFS.map((prod) => (
                    <div key={prod.name} className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {prod.thumbs.map((thumb, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded flex items-center justify-center text-[9px]"
                            style={{ backgroundColor: C.navyDeep, color: "rgba(255,255,255,0.4)" }}
                          >
                            {thumb}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold leading-tight truncate" style={{ color: C.textDark }}>{prod.name}</p>
                        <p className="text-[8px]" style={{ color: C.textMuted }}>{prod.count} memories</p>
                      </div>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: C.textMuted }} />
                    </div>
                  ))}
                </div>
                <button className="w-full text-center text-[9px] font-medium mt-3 hover:underline" style={{ color: C.textMid }}>
                  View all productions \u2192
                </button>
              </div>

              {/* Storage & Health */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <h4 className="font-serif text-sm mb-3" style={{ color: C.textDark }}>Storage &amp; health</h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: C.textMid }}>Memory bank status</span>
                  <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>62% used</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: C.borderLight }}>
                  <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: C.gold }} />
                </div>
                <p className="text-[8px] text-right mb-3" style={{ color: C.textMuted }}>248 GB / 400 GB</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-2.5" style={{ borderColor: C.borderLight }}>
                    <p className="text-[8px] font-bold tracking-wide uppercase mb-1" style={{ color: C.textMuted }}>This week</p>
                    <p className="font-serif text-[20px] leading-none mb-0.5" style={{ color: C.textDark }}>24</p>
                    <p className="text-[8px]" style={{ color: C.textMuted }}>New memories added</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ borderColor: C.borderLight }}>
                    <p className="text-[8px] font-bold tracking-wide uppercase mb-1" style={{ color: C.textMuted }}>Auto-linked</p>
                    <p className="font-serif text-[20px] leading-none mb-0.5" style={{ color: C.textDark }}>89%</p>
                    <p className="text-[8px]" style={{ color: C.textMuted }}>Of memories connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sparkData,
  sparkColor,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  delta: string
  sparkData: number[]
  sparkColor: string
}) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: C.gold }} />
          <span className="text-[9px] font-bold tracking-[0.08em] uppercase" style={{ color: C.textMuted }}>{label}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="font-serif text-[26px] leading-none mb-1" style={{ color: C.textDark }}>{value}</p>
          <p className="text-[9px] font-semibold" style={{ color: C.green }}>{delta}</p>
        </div>
        {/* Sparkline */}
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 56
    const y = 20 - ((v - min) / range) * 16 - 2
    return `${x},${y}`
  })
  return (
    <svg width="56" height="20" className="flex-shrink-0">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const [x, y] = p.split(",")
        return <circle key={i} cx={x} cy={y} r="1.5" fill={color} />
      })}
    </svg>
  )
}

function MemoryRow({ memory }: { memory: MemoryEntry }) {
  const tc = TYPE_COLORS[memory.type]
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 border-b transition-colors hover:bg-black/[0.015]"
      style={{ borderColor: C.borderLight }}
    >
      {/* Memory content */}
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-[14px]"
          style={{ backgroundColor: tc.tile }}
        >
          {tc.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: C.textDark }}>
            {memory.title}
          </p>
          <p className="text-[9px] leading-snug truncate" style={{ color: C.textMuted }}>
            {memory.description}
          </p>
        </div>
      </div>

      {/* Type pill */}
      <div className="w-20 flex-shrink-0">
        <span
          className="text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full inline-block"
          style={{ backgroundColor: tc.bg, color: tc.text }}
        >
          {memory.type}
        </span>
      </div>

      {/* Production */}
      <div className="w-28 hidden md:block flex-shrink-0">
        <span className="text-[9px]" style={{ color: C.textMid }}>{memory.production}</span>
      </div>

      {/* Impact dots */}
      <div className="w-16 flex-shrink-0 flex items-center justify-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: i < memory.impactScore ? IMPACT_COLORS[memory.impact] : C.border }}
          />
        ))}
      </div>

      {/* Added */}
      <div className="w-16 text-right flex-shrink-0">
        <span className="text-[9px]" style={{ color: C.textMuted }}>{memory.added}</span>
      </div>

      {/* Overflow */}
      <div className="w-6 flex-shrink-0 flex justify-center">
        <button>
          <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
        </button>
      </div>
    </div>
  )
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
  centerSub,
}: {
  segments: { type: string; pct: number; color: string }[]
  centerLabel: string
  centerValue: string
  centerSub: string
}) {
  const r = 42
  const circ = 2 * Math.PI * r

  // Precompute segment offsets (no mutation during render)
  const computed = segments.reduce<
    { type: string; color: string; dash: number; offset: number }[]
  >((acc, seg) => {
    const dash = (seg.pct / 100) * circ
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
    acc.push({ type: seg.type, color: seg.color, dash, offset })
    return acc
  }, [])

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke={C.borderLight} strokeWidth="10" />
        {computed.map((seg) => {
          return (
            <circle
              key={seg.type}
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[7px] font-medium" style={{ color: C.textMuted }}>{centerLabel}</p>
        <p className="font-serif text-[18px] leading-none my-0.5" style={{ color: C.textDark }}>{centerValue}</p>
        <p className="text-[7px]" style={{ color: C.textMuted }}>{centerSub}</p>
      </div>
    </div>
  )
}

function MemoryGraph() {
  return (
    <div className="relative h-40 mt-2" style={{ backgroundColor: "rgba(244,241,234,0.5)", borderRadius: 8 }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Links */}
        {GRAPH_LINKS.map((link, i) => {
          const from = GRAPH_NODES.find((n) => n.id === link.from)
          const to = GRAPH_NODES.find((n) => n.id === link.to)
          if (!from || !to) return null
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={C.border}
              strokeWidth="0.4"
            />
          )
        })}
      </svg>
      {/* Nodes (HTML for pill styling) */}
      {GRAPH_NODES.map((node) => (
        <div
          key={node.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: `${node.color}12`,
              color: node.color,
              borderColor: `${node.color}30`,
            }}
          >
            {node.label}
          </span>
        </div>
      ))}
      {/* Zoom controls */}
      <div className="absolute right-1.5 top-1.5 flex flex-col gap-0.5 rounded-md border p-0.5" style={{ borderColor: C.border, backgroundColor: C.white }}>
        <button className="p-0.5 rounded hover:bg-black/5">
          <ZoomIn className="w-2.5 h-2.5" style={{ color: C.textMuted }} />
        </button>
        <button className="p-0.5 rounded hover:bg-black/5">
          <ZoomOut className="w-2.5 h-2.5" style={{ color: C.textMuted }} />
        </button>
        <button className="p-0.5 rounded hover:bg-black/5">
          <Maximize className="w-2.5 h-2.5" style={{ color: C.textMuted }} />
        </button>
      </div>
    </div>
  )
}
