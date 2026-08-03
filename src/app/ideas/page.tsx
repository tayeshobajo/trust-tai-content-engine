"use client"

import { useState } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  Plus,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Bookmark,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  Info,
  Bell,
  Settings,
  FileText,
  MessageSquare,
  Mail,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  cream: "#F4F1EA",
  white: "#FFFFFF",
  navy: "#1A2332",
  gold: "#C29A5B",
  blue: "#2F62D8",
  textDark: "#1A2332",
  textMid: "#4A5568",
  textMuted: "#8A8578",
  border: "#DDD8CE",
  borderLight: "#EAE6DF",
  green: "#22A06B",
  orange: "#E8802A",
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

type Potential = "High" | "Medium" | "Low"
type IdeaStatus = "high-potential" | "quick-win" | "wildcard" | "recommended"

interface FeaturedIdea {
  id: string
  title: string
  description: string
  tags: string[]
  captured: string
  potential: Potential
  status: IdeaStatus
}

const FEATURED_IDEAS: FeaturedIdea[] = [
  {
    id: "idea-1",
    title: "The Invisible Weight",
    description: "A leader carries the unseen until it breaks them. The world calls it strength. The body calls it something else.",
    tags: ["Leadership", "Psychological", "Drama"],
    captured: "Today",
    potential: "High",
    status: "high-potential",
  },
  {
    id: "idea-2",
    title: "The Tilted Office",
    description: "An office tilted just enough to change how people think. Everyone adapts. Nobody questions why.",
    tags: ["Workplace", "Metaphor", "Short Film"],
    captured: "Yesterday, 4:22 PM",
    potential: "Medium",
    status: "quick-win",
  },
  {
    id: "idea-3",
    title: "The Last Person Holding the Rope",
    description: "When one person lets go, everything changes. But they held on longer than anyone else. That's the story.",
    tags: ["Faith", "Sacrifice", "Human Story"],
    captured: "Jul 28, 11:05 AM",
    potential: "High",
    status: "wildcard",
  },
  {
    id: "idea-4",
    title: "The Compass That Doesn't Point North",
    description: "A man builds a compass that points to what matters most. Everyone else thinks it's broken.",
    tags: ["Purpose", "Adventure", "Drama"],
    captured: "Jul 27, 8:30 PM",
    potential: "High",
    status: "high-potential",
  },
]

interface SecondaryIdea {
  id: string
  title: string
  description: string
  tags: string[]
  captured: string
  potential: Potential
}

const SECONDARY_IDEAS: SecondaryIdea[] = [
  {
    id: "idea-5",
    title: "Morning Before the Leap",
    description: "The quiet hours before a decision that changes everything.",
    tags: ["Decision", "Courage", "Short Film"],
    captured: "Jul 26",
    potential: "Medium",
  },
  {
    id: "idea-6",
    title: "The Boy Who Drew Tomorrow",
    description: "A boy draws the future he believes is possible. Nobody notices until it arrives.",
    tags: ["Inspiration", "Family", "Coming of Age"],
    captured: "Jul 25",
    potential: "High",
  },
  {
    id: "idea-7",
    title: "Echoes of What We Ignore",
    description: "The things we ignore today echo tomorrow. Loudly.",
    tags: ["Society", "Drama", "Short Film"],
    captured: "Jul 25",
    potential: "High",
  },
  {
    id: "idea-8",
    title: "One Step Anyway",
    description: "Movement is not always progress. Sometimes it's just faith.",
    tags: ["Faith", "Motivation", "Short Film"],
    captured: "Jul 24",
    potential: "Medium",
  },
]

const TABS = ["For you", "All ideas", "My ideas", "Shortlist", "Developing", "Completed", "Archived"]

const FILTER_CHIPS = [
  { label: "Recommended", icon: Star, active: true },
  { label: "Recently captured", icon: Clock, active: false },
  { label: "High potential", icon: TrendingUp, active: false },
  { label: "Quick wins", icon: Zap, active: false },
  { label: "Wildcard", icon: Sparkles, active: false },
]

const TOP_THEMES = [
  { label: "Leadership", pct: 34 },
  { label: "Purpose", pct: 28 },
  { label: "Mindset", pct: 18 },
  { label: "Human Story", pct: 12 },
  { label: "Faith", pct: 8 },
]

const PIPELINE = [
  { label: "New ideas", count: 9, color: C.orange },
  { label: "Shortlisted", count: 6, color: C.gold },
  { label: "In development", count: 3, color: C.blue },
  { label: "Completed", count: 5, color: C.green },
]

const SIGNALS = [
  { icon: FileText, kind: "Post", title: "The One Thing", meta: "High engagement · Jul 28" },
  { icon: MessageSquare, kind: "Comment", title: "This hit deep.", meta: "Multiple responses · Jul 28" },
  { icon: Mail, kind: "DM", title: "Make a video about…", meta: "3 people asked · Jul 27" },
]

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function IdeasPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeChip, setActiveChip] = useState(0)

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
                3
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
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>
                  Ideas
                </h1>
                <Sparkles className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Raw sparks. Great stories start here.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>Production progress</span>
                <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>2 of 8</span>
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                  <div className="h-full rounded-full" style={{ width: "25%", backgroundColor: C.navy }} />
                </div>
              </div>
              <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                <Settings className="w-3 h-3" />
                Production settings
              </button>
            </div>
          </div>

          {/* ═══ TAB NAVIGATION ═══ */}
          <div className="flex items-center gap-4 border-b pb-2 mb-5" style={{ borderColor: C.borderLight }}>
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
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* ═══ MAIN COLUMN ═══ */}
            <div className="space-y-5">
              {/* ═══ HERO BANNER ═══ */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  height: 140,
                  background: `linear-gradient(135deg, ${C.navy}, #0D1626)`,
                }}
              >
                {/* Decorative glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 80% 40%, ${C.gold}15, transparent 60%)`,
                  }}
                />
                <div className="relative h-full flex flex-col justify-center px-8">
                  <h2 className="font-serif text-white mb-1" style={{ fontSize: "26px", fontWeight: 400 }}>
                    You see what most miss.
                  </h2>
                  <p className="text-[13px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Capture it now. Build it when the time is right.
                  </p>
                  <button
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90 w-fit"
                    style={{ backgroundColor: "#FFFFFF", color: C.textDark }}
                  >
                    <Plus className="w-3 h-3" />
                    Capture a new idea
                  </button>
                </div>
              </div>

              {/* ═══ QUICK FILTER CHIPS ═══ */}
              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_CHIPS.map((chip, i) => {
                  const Icon = chip.icon
                  const isActive = activeChip === i
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setActiveChip(i)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: isActive ? C.navy : C.white,
                        color: isActive ? "#FFFFFF" : C.textMid,
                        border: `1px solid ${isActive ? C.navy : C.border}`,
                      }}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {chip.label}
                    </button>
                  )
                })}
                <div className="flex-1" />
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-full border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                  <Filter className="w-2.5 h-2.5" />
                  Filter
                </button>
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-full border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                  Sort
                </button>
              </div>

              {/* ═══ FEATURED IDEA CARDS (4-col grid) ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {FEATURED_IDEAS.map((idea) => (
                  <FeaturedIdeaCard key={idea.id} idea={idea} />
                ))}
              </div>

              {/* ═══ SECONDARY IDEA LIST (2-col) ═══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SECONDARY_IDEAS.map((idea) => (
                  <SecondaryIdeaCard key={idea.id} idea={idea} />
                ))}
              </div>

              {/* ═══ LOAD MORE ═══ */}
              <div className="flex justify-center pt-2">
                <button className="flex items-center gap-1.5 text-[11px] font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: C.border, color: C.textMid }}>
                  <RefreshCw className="w-3 h-3" />
                  Load more ideas
                </button>
              </div>
            </div>

            {/* ═══ RIGHT RAIL ═══ */}
            <div className="space-y-4">
              {/* Idea Engine */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" style={{ color: C.gold }} />
                    <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Idea engine</h3>
                  </div>
                  <Info className="w-3 h-3" style={{ color: C.textMuted }} />
                </div>
                <p className="text-[10px] leading-relaxed mb-3" style={{ color: C.textMid }}>
                  We analyze signals, story patterns, and what your audience responds to.
                </p>
                <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                  Top themes
                </p>
                <div className="space-y-1.5">
                  {TOP_THEMES.map((theme) => (
                    <div key={theme.label} className="flex items-center gap-2">
                      <span className="text-[10px] flex-shrink-0 w-20" style={{ color: C.textMid }}>{theme.label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                        <div className="h-full rounded-full" style={{ width: `${theme.pct}%`, backgroundColor: C.navy }} />
                      </div>
                      <span className="text-[9px] font-semibold w-7 text-right" style={{ color: C.textDark }}>{theme.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideas Captured */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: C.textMid }}>Ideas captured</p>
                  {/* Mini sparkline */}
                  <svg width="60" height="20" viewBox="0 0 60 20">
                    <polyline
                      points="0,15 10,12 20,14 30,8 40,10 50,4 60,6"
                      fill="none"
                      stroke={C.gold}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-serif text-[32px] leading-none" style={{ color: C.textDark }}>23</span>
                  <span className="text-[10px] font-semibold" style={{ color: C.gold }}>+6 this week</span>
                </div>
                <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                  Development pipeline
                </p>
                <div className="space-y-1.5">
                  {PIPELINE.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px]" style={{ color: C.textMid }}>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Signals */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: C.textMid }}>
                  Recent signals inspiring ideas
                </p>
                <div className="space-y-2.5">
                  {SIGNALS.map((signal, i) => {
                    const Icon = signal.icon
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(138,133,120,0.06)" }}>
                          <Icon className="w-3 h-3" style={{ color: C.textMid }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold" style={{ color: C.textDark }}>
                            {signal.kind}: {signal.title}
                          </p>
                          <p className="text-[8px]" style={{ color: C.textMuted }}>{signal.meta}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="w-full flex items-center justify-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5 mt-3" style={{ borderColor: C.border, color: C.textMid }}>
                  View all signals
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Quote Block */}
              <div className="rounded-xl p-4 relative overflow-hidden" style={{ backgroundColor: C.navy }}>
                <span className="font-serif absolute top-0 left-3" style={{ fontSize: "48px", color: C.gold, lineHeight: 1, opacity: 0.5 }}>
                  &ldquo;
                </span>
                <p className="font-serif italic text-[13px] leading-relaxed pl-6 pt-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Ideas are easy. The hard part is choosing which one to build.
                </p>
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

function StatusBadge({ status }: { status: IdeaStatus }) {
  const config: Record<IdeaStatus, { label: string; color: string; bg: string }> = {
    "high-potential": { label: "High potential", color: C.gold, bg: "rgba(194,154,91,0.85)" },
    "quick-win": { label: "Quick win", color: C.green, bg: "rgba(34,160,107,0.85)" },
    "wildcard": { label: "Wildcard", color: C.textMid, bg: "rgba(138,133,120,0.8)" },
    "recommended": { label: "Recommended", color: C.blue, bg: "rgba(47,98,216,0.85)" },
  }
  const c = config[status]
  return (
    <span
      className="text-[8px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full backdrop-blur-sm"
      style={{ backgroundColor: c.bg, color: "#FFFFFF" }}
    >
      {c.label}
    </span>
  )
}

function PotentialMeter({ potential }: { potential: Potential }) {
  const fillPct = potential === "High" ? 85 : potential === "Medium" ? 55 : 30
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: C.textMuted }}>Potential</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: C.navy }} />
      </div>
      <span className="text-[8px] font-semibold" style={{ color: C.textDark }}>{potential}</span>
    </div>
  )
}

function TagChip({ label }: { label: string }) {
  return (
    <span className="text-[8px] font-medium px-1.5 py-0.5 rounded border" style={{ borderColor: C.border, color: C.textMuted }}>
      {label}
    </span>
  )
}

function FeaturedIdeaCard({ idea }: { idea: FeaturedIdea }) {
  return (
    <div
      className="rounded-xl border overflow-hidden flex flex-col transition-all hover:shadow-md"
      style={{ backgroundColor: C.white, borderColor: C.borderLight }}
    >
      {/* Image header */}
      <div
        className="relative h-24 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${C.navy}12, ${C.gold}06)` }}
      >
        <span className="text-[28px] font-serif select-none" style={{ color: `${C.navy}10` }}>
          {idea.title.charAt(0)}
        </span>
        <div className="absolute top-2 left-2">
          <StatusBadge status={idea.status} />
        </div>
        <button className="absolute top-2 right-2">
          <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-serif text-[14px] leading-tight mb-1" style={{ color: C.textDark }}>
          {idea.title}
        </h3>
        <p className="text-[10px] leading-snug mb-2" style={{ color: C.textMid }}>
          {idea.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {idea.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>

        {/* Captured */}
        <p className="text-[8px] mb-2" style={{ color: C.textMuted }}>
          Captured {idea.captured}
        </p>

        {/* Potential */}
        <div className="mb-2">
          <PotentialMeter potential={idea.potential} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: C.borderLight }}>
          <button>
            <Bookmark className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
          </button>
          <button className="flex items-center gap-1 text-[10px] font-semibold transition-colors hover:underline" style={{ color: C.textDark }}>
            Develop
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SecondaryIdeaCard({ idea }: { idea: SecondaryIdea }) {
  return (
    <div
      className="rounded-xl border p-3 flex items-start gap-3 transition-all hover:shadow-sm"
      style={{ backgroundColor: C.white, borderColor: C.borderLight }}
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${C.navy}10, ${C.gold}06)` }}
      >
        <span className="text-[18px] font-serif" style={{ color: `${C.navy}15` }}>
          {idea.title.charAt(0)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-[13px] leading-tight" style={{ color: C.textDark }}>
            {idea.title}
          </h4>
          <button className="flex-shrink-0">
            <MoreHorizontal className="w-3 h-3" style={{ color: C.textMuted }} />
          </button>
        </div>
        <p className="text-[10px] leading-snug mb-1.5" style={{ color: C.textMid }}>
          {idea.description}
        </p>
        <div className="flex items-center gap-1 flex-wrap mb-1">
          {idea.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[8px]" style={{ color: C.textMuted }}>Captured {idea.captured}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-semibold uppercase" style={{ color: C.textMuted }}>Potential</span>
              <span className="text-[8px] font-semibold" style={{ color: idea.potential === "High" ? C.gold : C.textDark }}>
                {idea.potential}
              </span>
            </div>
            <Bookmark className="w-3 h-3" style={{ color: C.textMuted }} />
          </div>
        </div>
      </div>
    </div>
  )
}
