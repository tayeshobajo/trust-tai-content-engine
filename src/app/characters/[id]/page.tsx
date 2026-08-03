"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Shell from "@/components/Shell"
import { getCharacter, CHARACTERS } from "@/data/characters"
import type { RelationshipStrength } from "@/data/characters"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  Users,
  Edit2,
  MoreHorizontal,
  BookOpen,
  User,
  Eye,
  Mic,
  Image as ImageIcon,
  StickyNote,
  TrendingUp,
  PlusCircle,
  Share2,
  Download,
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
  orange: "#E8802A",
}

const ROLE_COLORS: Record<string, string> = {
  Protagonist: C.gold,
  Guide: C.blue,
  Antagonist: "#DC2626",
  Supporting: C.green,
  Elder: C.textMuted,
  Child: C.orange,
}

const STRENGTH_COLORS: Record<RelationshipStrength, string> = {
  Strong: C.green,
  Medium: C.gold,
  Strained: "#DC2626",
}

const TABS = [
  { label: "Story Arc", icon: TrendingUp },
  { label: "Profile", icon: User },
  { label: "Backstory", icon: BookOpen },
  { label: "Appearance", icon: Eye },
  { label: "Voice & Speech", icon: Mic },
  { label: "Gallery", icon: ImageIcon },
  { label: "Notes", icon: StickyNote },
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function CharacterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const id = params.id as string
  const character = getCharacter(id)

  if (!character) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
          <div className="text-center">
            <p className="font-serif text-2xl mb-2" style={{ color: C.textDark }}>Character not found</p>
            <Link href="/characters" className="text-[12px] font-semibold hover:underline" style={{ color: C.blue }}>
              ← Back to all characters
            </Link>
          </div>
        </div>
      </Shell>
    )
  }

  const currentIndex = CHARACTERS.findIndex((c) => c.id === id)
  const prevChar = currentIndex > 0 ? CHARACTERS[currentIndex - 1] : null
  const nextChar = currentIndex < CHARACTERS.length - 1 ? CHARACTERS[currentIndex + 1] : null
  const roleColor = ROLE_COLORS[character.role] || C.textMuted

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

        {/* ═══ PAGINATION ROW ═══ */}
        <div className="max-w-[1400px] mx-auto px-6 pt-4">
          <div className="flex items-center justify-between">
            <Link
              href="/characters"
              className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:underline"
              style={{ color: C.textMuted }}
            >
              <ArrowLeft className="w-3 h-3" />
              Back to all characters
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => prevChar && router.push(`/characters/${prevChar.id}`)}
                disabled={!prevChar}
                className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-black/5"
                style={{ color: C.textMid }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-medium" style={{ color: C.textDark }}>
                {currentIndex + 1} of {CHARACTERS.length}
              </span>
              <button
                onClick={() => nextChar && router.push(`/characters/${nextChar.id}`)}
                disabled={!nextChar}
                className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-black/5"
                style={{ color: C.textMid }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-6 pt-4">
          {/* ═══ HEADER ═══ */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(194,154,91,0.1)" }}>
              <Users className="w-5 h-5" style={{ color: C.gold }} />
            </div>
            <div>
              <h1 className="font-serif" style={{ fontSize: "32px", color: C.textDark, fontWeight: 400 }}>
                Character Detail
              </h1>
              <p className="text-[12px]" style={{ color: C.textMid }}>
                Deep view of your character&apos;s story, purpose, and arc.
              </p>
            </div>
          </div>

          {/* ═══ HERO CHARACTER CARD ═══ */}
          <div
            className="rounded-xl border overflow-hidden mb-5"
            style={{ backgroundColor: C.white, borderColor: C.borderLight }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Portrait */}
              <div
                className="relative md:w-[240px] h-48 md:h-auto flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${character.portraitColor}, ${C.navyDeep})` }}
              >
                <span className="font-serif text-[80px] select-none" style={{ color: "rgba(255,255,255,0.15)" }}>
                  {character.portraitInitial}
                </span>
                <div className="absolute bottom-3 left-3">
                  <span
                    className="text-[9px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${roleColor}F0`, color: "#FFFFFF" }}
                  >
                    {character.role}
                  </span>
                </div>
              </div>

              {/* Identity Block */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="font-serif mb-1" style={{ fontSize: "28px", color: C.textDark, fontWeight: 400 }}>
                      {character.name}
                    </h2>
                    <p className="font-serif italic text-[13px]" style={{ color: C.textMid }}>
                      {character.tagline}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                      style={{ borderColor: C.border, color: C.textMid }}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button className="p-1.5 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: C.border }}>
                      <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                    </button>
                  </div>
                </div>

                {/* Attribute columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                  <AttrRow label="Role in story" value={character.archetype} />
                  <AttrRow label="Essence" value={character.essence} />
                  <AttrRow label="Age" value={character.age} />
                  <AttrRow label="Voice" value={character.voice} />
                  <AttrRow label="Occupation" value={character.occupation} />
                  <AttrRow label="Motivation" value={character.motivation} />
                  <AttrRow label="Core desire" value={character.coreDesire} />
                  <AttrRow label="Theme connection" value={character.themeConnection} />
                  <AttrRow label="Greatest fear" value={character.greatestFear} />
                </div>

                <div className="mt-3 pt-3 border-t" style={{ borderColor: C.borderLight }}>
                  <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: C.textMuted }}>
                    Internal flaw
                  </p>
                  <p className="text-[11px]" style={{ color: C.textMid }}>{character.internalFlaw}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ TAB NAVIGATION ═══ */}
          <div className="flex items-center gap-4 border-b pb-2 mb-5 overflow-x-auto" style={{ borderColor: C.borderLight }}>
            {TABS.map((tab, i) => {
              const Icon = tab.icon
              const isActive = activeTab === i
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors relative whitespace-nowrap"
                  style={{ color: isActive ? C.navy : C.textMuted }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-[-8px] left-0 right-0 h-0.5" style={{ backgroundColor: C.gold }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            {/* ═══ MAIN COLUMN ═══ */}
            <div className="space-y-5">
              {/* ═══ TAB CONTENT ═══ */}
              {activeTab === 0 && (
                <>
                  {/* Story Arc Chart */}
                  <DetailCard label="Story Arc" subtitle="How this character transforms.">
                    {/* Line chart */}
                    <div className="relative h-40 mb-4">
                      <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 40, 80, 120, 160].map((y) => (
                          <line key={y} x1="0" y1={y} x2="500" y2={y} stroke={C.borderLight} strokeWidth="0.5" />
                        ))}
                        {/* Area fill */}
                        <path
                          d={buildAreaPath(character.storyArc.points.map((p, i) => ({
                            x: (i / (character.storyArc.points.length - 1)) * 500,
                            y: 160 - (p.value / 100) * 140,
                          })))}
                          fill={`${C.gold}10`}
                        />
                        {/* Line */}
                        <polyline
                          points={character.storyArc.points.map((p, i) => {
                            const x = (i / (character.storyArc.points.length - 1)) * 500
                            const y = 160 - (p.value / 100) * 140
                            return `${x},${y}`
                          }).join(" ")}
                          fill="none"
                          stroke={C.gold}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Points */}
                        {character.storyArc.points.map((p, i) => {
                          const x = (i / (character.storyArc.points.length - 1)) * 500
                          const y = 160 - (p.value / 100) * 140
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="4" fill={C.gold} />
                              <circle cx={x} cy={y} r="8" fill={C.gold} opacity="0.15" />
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                    {/* Plot point labels */}
                    <div className="flex justify-between mb-5">
                      {character.storyArc.points.map((p) => (
                        <div key={p.label} className="text-center flex-1 px-1">
                          <p className="text-[8px] font-bold tracking-wide uppercase" style={{ color: C.textMuted }}>{p.label}</p>
                          <p className="text-[10px] font-serif leading-tight mt-0.5" style={{ color: C.textDark }}>{p.title}</p>
                        </div>
                      ))}
                    </div>
                    {/* Summary blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <ArcSummary label="Starting State" text={character.storyArc.startingState} color={C.orange} />
                      <ArcSummary label="Transformation" text={character.storyArc.transformation} color={C.blue} />
                      <ArcSummary label="End State" text={character.storyArc.endState} color={C.green} />
                    </div>
                  </DetailCard>

                  {/* Key Moments */}
                  <DetailCard label="Key Moments" subtitle="Defining moments in this character's journey.">
                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div
                        className="absolute left-[8px] top-2 bottom-2 w-[1.5px]"
                        style={{ backgroundColor: C.border }}
                      />
                      {character.keyMoments.map((moment, i) => (
                        <div key={i} className="relative mb-4 last:mb-0">
                          {/* Dot */}
                          <div
                            className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2"
                            style={{ backgroundColor: C.white, borderColor: C.gold }}
                          />
                          <p className="font-serif text-[12px] mb-0.5" style={{ color: C.textDark }}>{moment.title}</p>
                          <p className="text-[10px] leading-snug" style={{ color: C.textMid }}>{moment.description}</p>
                        </div>
                      ))}
                    </div>
                  </DetailCard>
                </>
              )}

              {activeTab === 1 && (
                <DetailCard label="Profile" subtitle="Core identity and attributes.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <AttrRow label="Name" value={character.name} />
                    <AttrRow label="Age" value={character.age} />
                    <AttrRow label="Role" value={character.role} />
                    <AttrRow label="Archetype" value={character.archetype} />
                    <AttrRow label="Occupation" value={character.occupation} />
                    <AttrRow label="Motivation" value={character.motivation} />
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: C.borderLight }}>
                    <p>
                      <span className="text-[9px] font-bold tracking-[0.1em] uppercase block mb-1" style={{ color: C.textMuted }}>Core Desire</span>
                      <span className="text-[11px]" style={{ color: C.textMid }}>{character.coreDesire}</span>
                    </p>
                    <p>
                      <span className="text-[9px] font-bold tracking-[0.1em] uppercase block mb-1" style={{ color: C.textMuted }}>Greatest Fear</span>
                      <span className="text-[11px]" style={{ color: C.textMid }}>{character.greatestFear}</span>
                    </p>
                    <p>
                      <span className="text-[9px] font-bold tracking-[0.1em] uppercase block mb-1" style={{ color: C.textMuted }}>Internal Flaw</span>
                      <span className="text-[11px]" style={{ color: C.textMid }}>{character.internalFlaw}</span>
                    </p>
                  </div>
                  {/* Tags */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: C.borderLight }}>
                    <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {character.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "rgba(194,154,91,0.1)", color: C.gold }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </DetailCard>
              )}

              {activeTab === 2 && (
                <DetailCard label="Backstory" subtitle="Where they come from and what shaped them.">
                  <p className="font-serif text-[14px] leading-relaxed" style={{ color: C.textDark }}>
                    {character.backstory}
                  </p>
                </DetailCard>
              )}

              {activeTab === 3 && (
                <DetailCard label="Appearance" subtitle="Physical identity for consistent rendering.">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-32 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: C.borderLight }}
                    >
                      <User className="w-8 h-8" style={{ color: C.textMuted }} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
                      <AttrRow label="Height" value={character.appearance.height} />
                      <AttrRow label="Build" value={character.appearance.build} />
                      <AttrRow label="Hair" value={character.appearance.hair} />
                      <AttrRow label="Eyes" value={character.appearance.eyes} />
                      <AttrRow label="Style" value={character.appearance.style} />
                    </div>
                  </div>
                </DetailCard>
              )}

              {activeTab === 4 && (
                <DetailCard label="Voice & Speech" subtitle="How this character speaks.">
                  <p className="font-serif text-[14px] leading-relaxed mb-3" style={{ color: C.textDark }}>
                    {character.voice}
                  </p>
                  <div className="pt-3 border-t" style={{ borderColor: C.borderLight }}>
                    <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: C.textMuted }}>Essence</p>
                    <p className="text-[12px] font-serif italic" style={{ color: C.textMid }}>{character.essence}</p>
                  </div>
                </DetailCard>
              )}

              {activeTab === 5 && (
                <DetailCard label="Gallery" subtitle="Visual references and render history.">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: C.border }}
                      >
                        <ImageIcon className="w-6 h-6" style={{ color: C.border }} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-center mt-3" style={{ color: C.textMuted }}>
                    Rendered frames will appear here as they are generated.
                  </p>
                </DetailCard>
              )}

              {activeTab === 6 && (
                <DetailCard label="Notes" subtitle="Writer and director notes.">
                  <div className="space-y-2">
                    {character.notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: C.borderLight }}>
                        <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                        <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{note}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5 mt-3"
                    style={{ borderColor: C.border, color: C.textMid }}
                  >
                    <PlusCircle className="w-3 h-3" />
                    Add note
                  </button>
                </DetailCard>
              )}

              {/* ═══ FOOTER METADATA ═══ */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border p-4"
                style={{ backgroundColor: C.white, borderColor: C.borderLight }}
              >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <MetaItem label="Created" value={character.createdDate} />
                  <MetaItem label="Last updated" value={character.updatedDate} />
                  <MetaItem label="Appearances" value={`${character.appearances} scenes`} />
                  <MetaItem label="Dialogue" value={`${character.dialogueScenes} scenes`} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                    style={{ borderColor: C.border, color: C.textMid }}
                  >
                    <Download className="w-3 h-3" />
                    Character PDF
                  </button>
                  <button
                    className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: C.navy, color: "#FFFFFF" }}
                  >
                    <Share2 className="w-3 h-3" />
                    Share character
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT RAIL ═══ */}
            <div className="space-y-4">
              {/* Character at a Glance */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: C.gold }} />
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>At a Glance</h3>
                </div>
                <div className="space-y-2.5">
                  {character.traits.map((trait) => (
                    <div key={trait.label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px]" style={{ color: C.textMid }}>{trait.label}</span>
                        <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>{trait.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                        <div className="h-full rounded-full" style={{ width: `${trait.value}%`, backgroundColor: C.gold }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Relationships</h3>
                  <button className="text-[10px] font-medium hover:underline" style={{ color: C.blue }}>View all</button>
                </div>
                <div className="space-y-2.5">
                  {character.relationships.map((rel) => (
                    <div key={rel.name} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${rel.avatarColor}15` }}
                      >
                        <span className="text-[11px] font-serif" style={{ color: rel.avatarColor }}>
                          {rel.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold leading-tight" style={{ color: C.textDark }}>{rel.name}</p>
                        <p className="text-[9px] leading-tight" style={{ color: C.textMuted }}>
                          {rel.role} · {rel.descriptor}
                        </p>
                      </div>
                      <span
                        className="text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STRENGTH_COLORS[rel.strength]}15`,
                          color: STRENGTH_COLORS[rel.strength],
                        }}
                      >
                        {rel.strength}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Character Notes */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Character Notes</h3>
                  <button className="text-[10px] font-medium hover:underline" style={{ color: C.blue }}>View all</button>
                </div>
                <div className="space-y-2">
                  {character.notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.textMuted }} />
                      <p className="text-[10px] leading-snug" style={{ color: C.textMid }}>{note}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full flex items-center justify-center gap-1 text-[10px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5 mt-3"
                  style={{ borderColor: C.border, color: C.textMid }}
                >
                  <PlusCircle className="w-3 h-3" />
                  Add note
                </button>
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

function AttrRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold tracking-[0.08em] uppercase" style={{ color: C.textMuted }}>{label}</span>
      <span className="text-[11px] leading-snug mt-0.5" style={{ color: C.textDark }}>{value}</span>
    </div>
  )
}

function DetailCard({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="mb-4">
        <h3 className="font-serif text-[16px]" style={{ color: C.textDark }}>{label}</h3>
        {subtitle && <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function ArcSummary({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: `${color}08` }}>
      <p className="text-[9px] font-bold tracking-wide uppercase mb-1" style={{ color }}>{label}</p>
      <p className="text-[10px] leading-snug" style={{ color: C.textMid }}>{text}</p>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-bold tracking-wide uppercase" style={{ color: C.textMuted }}>{label}</span>
      <span className="text-[10px]" style={{ color: C.textDark }}>{value}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHART HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function buildAreaPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ""
  const max = 160
  let path = `M 0,${max}`
  path += ` L ${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpX = (prev.x + curr.x) / 2
    path += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`
  }
  path += ` L 500,${max} Z`
  return path
}
