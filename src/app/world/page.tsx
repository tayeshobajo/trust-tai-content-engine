"use client"

import Link from "next/link"
import Shell from "@/components/Shell"
import {
  Plus,
  Shield,
  Mic,
  Users,
  MapPin,
  Sparkles,
  Palette,
  GitBranch,
  Brain,
  ChevronRight,
  Lock,
  Check,
  AlertTriangle,
  Eye,
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
  textDark: "#1A2332",
  textMid: "#4A5568",
  textMuted: "#8A8578",
  border: "#DDD8CE",
  borderLight: "#EAE6DF",
  green: "#22A06B",
  purple: "#7C3AED",
  orange: "#E8802A",
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD SECTIONS — 8 sections per spec 6A–6H
// ═══════════════════════════════════════════════════════════════════════════════

interface WorldSection {
  key: string
  label: string
  specRef: string
  icon: React.ElementType
  accent: string
  tagline: string
  summary: string
  stats: { label: string; value: string }[]
  recentItems: string[]
  href: string
  locked: boolean
}

const WORLD_SECTIONS: WorldSection[] = [
  {
    key: "constitution",
    label: "Constitution",
    specRef: "6A",
    icon: Shield,
    accent: C.purple,
    tagline: "Non-negotiable principles",
    summary: "The rules the world cannot break. Spirit First, value before entertainment, clarity over cleverness, metaphor over explanation, dignity in every frame.",
    stats: [
      { label: "Principles", value: "6" },
      { label: "Last reviewed", value: "12 days ago" },
      { label: "Violations caught", value: "3" },
    ],
    recentItems: ["Spirit First — dignity over drama", "No spectacle for its own sake", "The film must serve the post"],
    href: "/world/constitution",
    locked: true,
  },
  {
    key: "voice",
    label: "Voice",
    specRef: "6B",
    icon: Mic,
    accent: C.blue,
    tagline: "How Tai sounds on the page and screen",
    summary: "Approved traits, sentence patterns, language Tai uses, phrases to avoid, emotional range, and learned tendencies from production history.",
    stats: [
      { label: "Approved traits", value: "11" },
      { label: "Sentence patterns", value: "7" },
      { label: "Phrases to avoid", value: "14" },
    ],
    recentItems: ["No softening language (96% confidence)", "Systems-thinking register", "Opening with a 'moment' construction — pending approval"],
    href: "/world/voice",
    locked: false,
  },
  {
    key: "characters",
    label: "Characters",
    specRef: "6C",
    icon: Users,
    accent: C.orange,
    tagline: "Roster of recurring figures",
    summary: "Master appearance, alternates, wardrobe, production history, and continuity confidence. Production-only variations don't overwrite the master.",
    stats: [
      { label: "Active characters", value: "4" },
      { label: "Appearances", value: "11" },
      { label: "Avg continuity", value: "87%" },
    ],
    recentItems: ["The Architect — 4 productions", "The Mapmaker — 1 production", "The Child — 2 productions"],
    href: "/characters",
    locked: false,
  },
  {
    key: "places",
    label: "Places",
    specRef: "6D",
    icon: MapPin,
    accent: C.green,
    tagline: "Environments and their visual identity",
    summary: "Architecture, geography, lighting conditions, weather states, and time-of-day rules for every recurring location in the world.",
    stats: [
      { label: "Named places", value: "6" },
      { label: "In production", value: "2" },
      { label: "Time-of-day states", value: "18" },
    ],
    recentItems: ["The City at First Light", "The Founder's Study", "The Open Road"],
    href: "/places",
    locked: false,
  },
  {
    key: "symbols",
    label: "Symbols",
    specRef: "6E",
    icon: Sparkles,
    accent: C.gold,
    tagline: "Recurring objects with governed meaning",
    summary: "Meaning, previous uses, approved interpretations, overuse risk, and prohibited clichés. Every symbol has a production history.",
    stats: [
      { label: "Active symbols", value: "9" },
      { label: "Overuse risk", value: "2" },
      { label: "Prohibited clichés", value: "8" },
    ],
    recentItems: ["The case / container — used 3×", "The laptop — overuse caution", "The map — 1 use, strong"],
    href: "/world/symbols",
    locked: false,
  },
  {
    key: "visual",
    label: "Visual Language",
    specRef: "6F",
    icon: Palette,
    accent: "#0891B2",
    tagline: "How the world looks",
    summary: "Palette, lighting, lenses, composition, movement pace, realism level, texture, grain, transitions, typography, and hard prohibitions.",
    stats: [
      { label: "Color rules", value: "12" },
      { label: "Lens presets", value: "5" },
      { label: "Prohibitions", value: "7" },
    ],
    recentItems: ["Warm cream palette (#F4F1EA base)", "Portrait-first — 9:16 default", "No blue-teal color grade"],
    href: "/world/visual",
    locked: false,
  },
  {
    key: "threads",
    label: "Story Threads",
    specRef: "6G",
    icon: GitBranch,
    accent: "#DC2626",
    tagline: "Recurring ideas as ongoing narratives",
    summary: "Published posts, active productions, unresolved questions, next chapters, and recurring characters and symbols tied to each thread.",
    stats: [
      { label: "Active threads", value: "5" },
      { label: "Published posts", value: "7" },
      { label: "Open questions", value: "3" },
    ],
    recentItems: ["The Founder Must Become Unnecessary", "Hidden Systems / Visible Symptoms", "The TrustTai Client Journey"],
    href: "/world/threads",
    locked: false,
  },
  {
    key: "memory",
    label: "Memory",
    specRef: "6H",
    icon: Brain,
    accent: "#7C3AED",
    tagline: "What the Studio has learned and verified",
    summary: "Locked truths, learned preferences, temporary context, production lessons, and audience patterns. Each with confidence score, approval status, and usage history.",
    stats: [
      { label: "Locked truths", value: "23" },
      { label: "Pending approval", value: "3" },
      { label: "Avg confidence", value: "88%" },
    ],
    recentItems: ["Laptop metaphor resonance — pending", "Opening with 'moment' — pending", "Architectural interiors / indoor lighting — pending"],
    href: "/memory",
    locked: false,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD HEALTH METRICS
// ═══════════════════════════════════════════════════════════════════════════════

const WORLD_HEALTH = [
  { label: "Constitution intact", status: "ok" as const },
  { label: "3 memory approvals pending", status: "warn" as const },
  { label: "2 symbols at overuse risk", status: "warn" as const },
  { label: "Character continuity 87% avg", status: "ok" as const },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function WorldPage() {
  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: C.textMuted }}>World</p>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" /> Add to World
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-serif mb-1.5" style={{ fontSize: 36, color: C.textDark, fontWeight: 400 }}>World</h1>
            <p className="text-[13px] max-w-xl" style={{ color: C.textMid }}>
              The long-term memory of the Studio. Voice, characters, places, symbols, rules, and the threads that tie every production together.
            </p>
          </div>

          {/* World health bar */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {WORLD_HEALTH.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: item.status === "ok" ? "rgba(34,160,107,0.08)" : "rgba(232,128,42,0.08)",
                  color: item.status === "ok" ? C.green : C.orange,
                }}>
                {item.status === "ok" ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {item.label}
              </div>
            ))}
          </div>

          {/* 8-section grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {WORLD_SECTIONS.map((section) => (
              <SectionCard key={section.key} section={section} />
            ))}
          </div>

          {/* World footer note */}
          <div className="mt-8 rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.textMuted }} />
              <div>
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: C.textDark }}>World coherence</p>
                <p className="text-[10px] leading-relaxed" style={{ color: C.textMid }}>
                  Every production draws from this World Bible. Changes here affect every future film. The Constitution is locked — changes require a governance review. All other sections are editable with audit trail.
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
// SECTION CARD
// ═══════════════════════════════════════════════════════════════════════════════

function SectionCard({ section }: { section: WorldSection }) {
  const Icon = section.icon
  return (
    <Link href={section.href} className="block rounded-xl border p-5 transition-all hover:shadow-sm group"
      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${section.accent}12` }}>
            <Icon className="w-4.5 h-4.5" style={{ color: section.accent, width: 18, height: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-serif text-[15px]" style={{ color: C.textDark }}>{section.label}</p>
              {section.locked && <Lock className="w-2.5 h-2.5" style={{ color: C.textMuted }} />}
            </div>
            <p className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: C.textMuted }}>{section.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${section.accent}12`, color: section.accent }}>
            {section.specRef}
          </span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
            style={{ color: C.textMuted }} />
        </div>
      </div>

      <p className="text-[11px] leading-snug mb-3" style={{ color: C.textMid }}>{section.summary}</p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3">
        {section.stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-bold text-[14px]" style={{ color: C.textDark }}>{stat.value}</p>
            <p className="text-[8px]" style={{ color: C.textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent items */}
      <div className="border-t pt-2.5 space-y-1" style={{ borderColor: C.borderLight }}>
        {section.recentItems.map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: section.accent }} />
            <p className="text-[10px] truncate" style={{ color: C.textMid }}>{item}</p>
          </div>
        ))}
      </div>
    </Link>
  )
}
