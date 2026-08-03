"use client"

import React, { useState, useEffect } from "react"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import type { Production } from "@/data/studio"
import Shell from "@/components/Shell"
import {
  Plus,
  TrendingUp,
  MessageSquare,
  Bookmark,
  Eye,
  Play,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  BarChart2,
  ChevronRight,
  Check,
  Clock,
  Brain,
  FileText,
  Film,
  ChevronDown,
  Star,
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
  red: "#DC2626",
  purple: "#7C3AED",
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

// OVERVIEW_STATS derived from productions at render time

interface PackagePerf {
  id: string
  title: string
  publishedAt: string
  postMetrics: { impressions: string; likes: string; comments: string; saves: string; shares: string }
  videoMetrics: { views: string; completionRate: string; avgWatch: string }
  sentiment: "positive" | "mixed" | "neutral"
  questions: string[]
  businessOutcome?: string
  taiReflection?: string
  thread: string
}

// PACKAGES derived from productions at render time

// PATTERNS derived from productions at render time

const SIGNAL_SOURCES = [
  { label: "LinkedIn post metrics", status: "manual", items: 3 },
  { label: "LinkedIn video analytics", status: "manual", items: 3 },
  { label: "Comments + DMs", status: "manual", items: 12 },
  { label: "Client conversations", status: "manual", items: 4 },
  { label: "Observations", status: "manual", items: 7 },
]

type SignalsView = "overview" | "packages" | "patterns" | "sources"

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SignalsPage() {
  const [view, setView] = useState<SignalsView>("overview")
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null)
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)
  const [productions, setProductions] = useState<Production[]>([])

  useEffect(() => {
    const load = () => setProductions(getProductions())
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const publishedProductions = productions.filter(p => p.publishedAt)

  // Derive overview stats from real productions
  const OVERVIEW_STATS = [
    { label: "Published packages", value: String(publishedProductions.length), change: publishedProductions.length > 0 ? `${publishedProductions.length} total` : "None yet", icon: FileText, trend: "neutral" as const },
    { label: "In production", value: String(productions.filter(p => !p.publishedAt && !p.archivedAt).length), change: "Active", icon: Film, trend: "neutral" as const },
    { label: "Film-approved", value: String(productions.filter(p => p.gates.film?.status === "approved").length), change: "Ready", icon: Play, trend: "neutral" as const },
    { label: "Needs decision", value: String(productions.filter(p => Object.values(p.gates).some(g => g?.status === "hold")).length), change: "On hold", icon: AlertCircle, trend: "neutral" as const },
    { label: "Total shots planned", value: String(productions.reduce((sum, p) => sum + p.film.shots.length, 0)), change: "Across all", icon: Eye, trend: "neutral" as const },
    { label: "Motion rendered", value: String(productions.reduce((sum, p) => sum + p.film.shots.filter(s => s.renderedVideoUrl).length, 0)), change: "Scenes done", icon: ThumbsUp, trend: "neutral" as const },
  ]

  // Derive packages from published productions
  const PACKAGES: PackagePerf[] = publishedProductions.map(p => ({
    id: p.id,
    title: p.title,
    publishedAt: p.publishedAt ?? "",
    postMetrics: { impressions: "—", likes: "—", comments: "—", saves: "—", shares: "—" },
    videoMetrics: { views: "—", completionRate: "—", avgWatch: "—" },
    sentiment: "neutral" as const,
    questions: [],
    thread: "",
  }))

  // Patterns are empty until real signal data exists
  const PATTERNS: { category: string; icon: React.ElementType; accent: string; items: { insight: string; frequency: string; action: string }[] }[] = []

  const VIEWS: { key: SignalsView; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "packages", label: `Per package (${PACKAGES.length})` },
    { key: "patterns", label: "Pattern analysis" },
    { key: "sources", label: "Sources" },
  ]

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: C.textMuted }}>Signals</p>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" /> Log signal
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-serif mb-1.5" style={{ fontSize: 36, color: C.textDark, fontWeight: 400 }}>Signals</h1>
            <p className="text-[13px] max-w-xl" style={{ color: C.textMid }}>
              What audiences respond to, translated into better creative decisions. Engagement informs — it never dictates.
            </p>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1 mb-6 border-b" style={{ borderColor: C.borderLight }}>
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key)}
                className="text-[11px] font-medium px-3 py-2 border-b-2 -mb-px transition-all whitespace-nowrap"
                style={{ borderColor: view === v.key ? C.navy : "transparent", color: view === v.key ? C.textDark : C.textMuted }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* ─── OVERVIEW ─── */}
          {view === "overview" && (
            <div className="space-y-6">
              {/* Stats grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {OVERVIEW_STATS.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="rounded-xl border p-3" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <Icon className="w-3.5 h-3.5 mb-2" style={{ color: C.textMuted }} />
                      <p className="font-bold text-xl mb-0.5" style={{ color: C.textDark }}>{stat.value}</p>
                      <p className="text-[8px] font-bold tracking-[0.1em] uppercase leading-tight mb-1" style={{ color: C.textMuted }}>{stat.label}</p>
                      <p className="text-[9px]"
                        style={{ color: (stat.trend as string) === "up" ? C.green : (stat.trend as string) === "down" ? C.red : C.textMuted }}>
                        {stat.change}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Top signal this week */}
              <div className="rounded-xl border p-5" style={{ backgroundColor: `${C.gold}05`, borderColor: `${C.gold}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-3.5 h-3.5" style={{ color: C.gold }} />
                  <p className="text-[10px] font-bold" style={{ color: C.gold }}>Top signal this week</p>
                </div>
                <p className="font-serif text-base mb-1.5" style={{ color: C.textDark }}>
                  "The Man Who Carried a City" save rate 4.2% — highest in portfolio history
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>
                  3 separate comments asked &quot;what happens next&quot; — a direct signal that The Founder Must Become Unnecessary thread should continue. 2 business inquiries cited the video specifically.
                </p>
                <p className="text-[10px] mt-2 font-medium" style={{ color: C.blue }}>
                  Recommendation: prioritize thread continuation over a new topic this cycle.
                </p>
              </div>

              {/* Pattern preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold" style={{ color: C.textDark }}>Emerging patterns</p>
                  <button onClick={() => setView("patterns")} className="text-[10px] font-medium transition-colors hover:underline flex items-center gap-1"
                    style={{ color: C.blue }}>
                    See all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {PATTERNS.length === 0 && (
                    <div className="col-span-2 rounded-xl border border-dashed p-6 text-center" style={{ borderColor: C.border }}>
                      <p className="text-[11px]" style={{ color: C.textMuted }}>No patterns yet. Publish packages and log signals to surface analysis.</p>
                    </div>
                  )}
                  {PATTERNS.slice(0, 2).map((pat) => {
                    const Icon = pat.icon
                    return (
                      <div key={pat.category} className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5" style={{ color: pat.accent }} />
                          <p className="text-[10px] font-bold" style={{ color: C.textMid }}>{pat.category}</p>
                        </div>
                        <p className="text-[11px] leading-snug" style={{ color: C.textDark }}>{pat.items[0].insight}</p>
                        <p className="text-[9px] mt-1.5 font-medium" style={{ color: pat.accent }}>→ {pat.items[0].action}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── PER-PACKAGE ─── */}
          {view === "packages" && (
            <div className="space-y-4">
              {PACKAGES.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: C.border }}>
                  <p className="text-[12px] mb-1" style={{ color: C.textMid }}>No published packages yet.</p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>Performance metrics will appear here after you publish a production.</p>
                </div>
              )}
              {PACKAGES.map((pkg) => {
                const isOpen = expandedPkg === pkg.id
                return (
                  <div key={pkg.id} className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <button
                      onClick={() => setExpandedPkg(isOpen ? null : pkg.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[0.01]">
                      <div>
                        <p className="font-serif text-[15px] mb-0.5" style={{ color: C.textDark }}>{pkg.title}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px]" style={{ color: C.textMuted }}>{pkg.publishedAt}</span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${C.green}10`, color: C.green }}>
                            <Check className="w-2 h-2 inline mr-0.5" />Published
                          </span>
                          <span className="text-[9px]" style={{ color: C.textMuted }}>{pkg.thread}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[13px] font-bold" style={{ color: C.textDark }}>{pkg.postMetrics.saves}</p>
                          <p className="text-[8px]" style={{ color: C.textMuted }}>saves</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold" style={{ color: C.textDark }}>{pkg.videoMetrics.completionRate}</p>
                          <p className="text-[8px]" style={{ color: C.textMuted }}>completion</p>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: C.textMuted, transform: isOpen ? "rotate(180deg)" : "none" }} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: C.borderLight }}>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Post metrics */}
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>Post metrics</p>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(pkg.postMetrics).map(([k, v]) => (
                                <div key={k} className="rounded-lg p-2" style={{ backgroundColor: C.cream }}>
                                  <p className="font-bold text-[13px]" style={{ color: C.textDark }}>{v}</p>
                                  <p className="text-[8px] capitalize" style={{ color: C.textMuted }}>{k}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Video metrics */}
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>Video metrics</p>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(pkg.videoMetrics).map(([k, v]) => (
                                <div key={k} className="rounded-lg p-2" style={{ backgroundColor: C.cream }}>
                                  <p className="font-bold text-[13px]" style={{ color: C.textDark }}>{v}</p>
                                  <p className="text-[8px] capitalize" style={{ color: C.textMuted }}>{k.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Questions */}
                        {pkg.questions.length > 0 && (
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>Audience questions</p>
                            <div className="space-y-1.5">
                              {pkg.questions.map((q) => (
                                <div key={q} className="flex items-start gap-2">
                                  <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: C.blue }} />
                                  <p className="text-[11px] italic" style={{ color: C.textMid }}>&quot;{q}&quot;</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Business outcome */}
                        {pkg.businessOutcome && (
                          <div className="rounded-lg p-3" style={{ backgroundColor: `${C.green}06`, border: `1px solid ${C.green}25` }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp className="w-3 h-3" style={{ color: C.green }} />
                              <p className="text-[9px] font-bold" style={{ color: C.green }}>Business outcome</p>
                            </div>
                            <p className="text-[11px]" style={{ color: C.textMid }}>{pkg.businessOutcome}</p>
                          </div>
                        )}

                        {/* Tai's reflection */}
                        {pkg.taiReflection && (
                          <div className="rounded-lg border-l-2 pl-3 py-1" style={{ borderColor: C.gold }}>
                            <p className="text-[9px] font-bold mb-1" style={{ color: C.gold }}>Tai's reflection</p>
                            <p className="text-[11px] italic" style={{ color: C.textMid }}>{pkg.taiReflection}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── PATTERN ANALYSIS ─── */}
          {view === "patterns" && (
            <div className="space-y-3">
              <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: `${C.navy}03`, borderColor: C.borderLight }}>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>
                  Every pattern below is grounded in production data and audience behavior. Recommendations explain their evidence. Engagement informs — it never dictates the creative.
                </p>
              </div>
              {PATTERNS.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: C.border }}>
                  <p className="text-[12px] mb-1" style={{ color: C.textMid }}>No patterns analyzed yet.</p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>Patterns emerge from published production signals over time.</p>
                </div>
              )}
              {PATTERNS.map((pat) => {
                const Icon = pat.icon
                const isOpen = expandedPattern === pat.category
                return (
                  <div key={pat.category} className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <button
                      onClick={() => setExpandedPattern(isOpen ? null : pat.category)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-black/[0.01]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${pat.accent}12` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: pat.accent }} />
                        </div>
                        <p className="text-[12px] font-semibold" style={{ color: C.textDark }}>{pat.category}</p>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${pat.accent}10`, color: pat.accent }}>
                          {pat.items.length}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 transition-transform" style={{ color: C.textMuted, transform: isOpen ? "rotate(180deg)" : "none" }} />
                    </button>
                    {isOpen && (
                      <div className="border-t" style={{ borderColor: C.borderLight }}>
                        {pat.items.map((item, i) => (
                          <div key={i} className="px-4 py-3.5" style={{ borderTop: i > 0 ? `1px solid ${C.borderLight}` : "none" }}>
                            <p className="text-[12px] font-medium mb-1" style={{ color: C.textDark }}>{item.insight}</p>
                            <p className="text-[10px] mb-2" style={{ color: C.textMuted }}>{item.frequency}</p>
                            <div className="flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3" style={{ color: pat.accent }} />
                              <p className="text-[10px] font-medium" style={{ color: pat.accent }}>{item.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── SOURCES ─── */}
          {view === "sources" && (
            <div className="space-y-4">
              <p className="text-[11px]" style={{ color: C.textMid }}>
                All signals are logged manually. Connect LinkedIn analytics or import a CSV to populate automatically.
              </p>
              <div className="space-y-2">
                {SIGNAL_SOURCES.map((src) => (
                  <div key={src.label} className="rounded-xl border p-4 flex items-center justify-between"
                    style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-4 h-4" style={{ color: C.textMuted }} />
                      <div>
                        <p className="text-[12px] font-medium" style={{ color: C.textDark }}>{src.label}</p>
                        <p className="text-[9px]" style={{ color: C.textMuted }}>{src.items} entries · manual</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                      style={{ borderColor: C.border, color: C.textMid }}>
                      <Plus className="w-2.5 h-2.5" /> Add entry
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-dashed p-5 text-center" style={{ borderColor: C.border }}>
                <p className="text-[11px] mb-2" style={{ color: C.textMid }}>Connect LinkedIn analytics for automatic performance import</p>
                <button className="text-[10px] font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
                  Connect LinkedIn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
