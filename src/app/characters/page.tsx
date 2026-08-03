"use client"

import { useState } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import { CHARACTERS } from "@/data/characters"
import type { CharacterRole } from "@/data/characters"
import {
  ArrowLeft,
  Plus,
  Bell,
  Search,
  Users,
  ChevronRight,
  MoreHorizontal,
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const ROLE_FILTERS: ("All" | CharacterRole)[] = [
  "All",
  "Protagonist",
  "Guide",
  "Supporting",
  "Child",
  "Elder",
]

const ROLE_COLORS: Record<CharacterRole, string> = {
  Protagonist: C.gold,
  Guide: C.blue,
  Antagonist: "#DC2626",
  Supporting: C.green,
  Elder: C.textMuted,
  Child: "#E8802A",
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function CharactersPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | CharacterRole>("All")
  const [search, setSearch] = useState("")

  const filtered = CHARACTERS.filter((c) => {
    if (activeFilter !== "All" && c.role !== activeFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.archetype.toLowerCase().includes(search.toLowerCase())) return false
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
                3
              </span>
            </button>
            <button
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.navy, color: "#FFFFFF" }}
            >
              <Plus className="w-3 h-3" />
              New character
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {/* ═══ HEADER ROW ═══ */}
          <div className="flex items-start justify-between gap-4 pt-6 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>
                  Characters
                </h1>
                <Users className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Every person in the world. Consistent. Canon. Ready when the story needs them.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>
                {CHARACTERS.length} characters
              </span>
            </div>
          </div>

          {/* ═══ HERO BANNER ═══ */}
          <div
            className="relative rounded-xl overflow-hidden mb-6"
            style={{ height: 120, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 80% 40%, ${C.gold}15, transparent 60%)` }}
            />
            <div className="relative h-full flex flex-col justify-center px-8">
              <h2 className="font-serif text-white mb-1" style={{ fontSize: "22px", fontWeight: 400 }}>
                The cast of a living world.
              </h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Each character carries weight, history, and a reason to be in the frame.
              </p>
            </div>
          </div>

          {/* ═══ FILTER + SEARCH ROW ═══ */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {ROLE_FILTERS.map((role) => {
              const isActive = activeFilter === role
              const count = role === "All" ? CHARACTERS.length : CHARACTERS.filter((c) => c.role === role).length
              return (
                <button
                  key={role}
                  onClick={() => setActiveFilter(role)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? C.navy : C.white,
                    color: isActive ? "#FFFFFF" : C.textMid,
                    border: `1px solid ${isActive ? C.navy : C.border}`,
                  }}
                >
                  {role}
                  <span className="text-[8px] opacity-60">{count}</span>
                </button>
              )
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: C.border, backgroundColor: C.white }}>
              <Search className="w-3 h-3" style={{ color: C.textMuted }} />
              <input
                type="text"
                placeholder="Search characters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[10px] bg-transparent outline-none w-32"
                style={{ color: C.textDark }}
              />
            </div>
          </div>

          {/* ═══ CHARACTER GRID ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>

          {/* ═══ ADD NEW CHARACTER ═══ */}
          <div className="mt-4">
            <button
              className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: C.border, color: C.textMuted }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.borderLight }}>
                <Plus className="w-4 h-4" style={{ color: C.textMuted }} />
              </div>
              <p className="text-[12px] font-semibold" style={{ color: C.textMid }}>
                Create a new character
              </p>
              <p className="text-[10px] text-center max-w-xs" style={{ color: C.textMuted }}>
                New characters can be created as the script or story requires. This is never a blocker.
              </p>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER CARD
// ═══════════════════════════════════════════════════════════════════════════════

function CharacterCard({ character: ch }: { character: typeof CHARACTERS[number] }) {
  const roleColor = ROLE_COLORS[ch.role] || C.textMuted

  return (
    <Link href={`/characters/${ch.id}`}>
      <div
        className="rounded-xl border overflow-hidden flex flex-col transition-all hover:shadow-md group cursor-pointer"
        style={{ backgroundColor: C.white, borderColor: C.borderLight }}
      >
        {/* Portrait header */}
        <div
          className="relative h-28 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${ch.portraitColor}15, ${C.gold}06)` }}
        >
          <span className="font-serif text-[40px] select-none" style={{ color: `${ch.portraitColor}20` }}>
            {ch.portraitInitial}
          </span>
          {/* Role badge */}
          <div className="absolute top-2 left-2">
            <span
              className="text-[8px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${roleColor}E6`, color: "#FFFFFF" }}
            >
              {ch.role}
            </span>
          </div>
          <button className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-serif text-[15px] leading-tight" style={{ color: C.textDark }}>
            {ch.name}
          </h3>
          <p className="text-[9px] font-medium tracking-wide uppercase mt-0.5" style={{ color: roleColor }}>
            {ch.archetype}
          </p>
          <p className="text-[10px] leading-snug mt-1.5 mb-2 line-clamp-2" style={{ color: C.textMid }}>
            {ch.tagline}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {ch.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-medium px-1.5 py-0.5 rounded border"
                style={{ borderColor: C.border, color: C.textMuted }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Appearances + arrow */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: C.borderLight }}>
            <span className="text-[8px]" style={{ color: C.textMuted }}>
              {ch.appearances} scenes
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.textDark }}>
              Open
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
