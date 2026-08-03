"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  QA_SECTIONS,
  MASTER_INDICATORS,
  getOverallStats,
  getSectionStats,
} from "@/data/qa-checklist"
import type { Priority } from "@/data/qa-checklist"
import {
  ArrowLeft,
  Bell,
  Plus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  AlertTriangle,
  FileCheck,
  TrendingUp,
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
  red: "#DC2626",
  purple: "#7C6CC4",
}

const PRIORITY_COLORS: Record<Priority, string> = {
  P0: C.red,
  P1: C.orange,
  P2: C.textMuted,
}

const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "Production blocker",
  P1: "Quality blocker",
  P2: "Warning",
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function QAPage() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]))
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all")
  const [search, setSearch] = useState("")

  const stats = useMemo(() => getOverallStats(), [])

  const toggleSection = (n: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

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
          {/* ═══ HEADER ═══ */}
          <div className="flex items-start gap-3 pt-6 mb-4">
            <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stats.p0Blocked > 0 ? "rgba(220,38,38,0.08)" : "rgba(34,160,107,0.08)" }}>
              {stats.p0Blocked > 0 ? (
                <ShieldAlert className="w-5 h-5" style={{ color: C.red }} />
              ) : (
                <ShieldCheck className="w-5 h-5" style={{ color: C.green }} />
              )}
            </div>
            <div>
              <h1 className="font-serif" style={{ fontSize: "32px", color: C.textDark, fontWeight: 400 }}>
                Production Readiness QA
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMid }}>
                Every production answers YES before the final film is approved. Evidence required.
              </p>
            </div>
          </div>

          {/* ═══ READINESS STATUS BANNER ═══ */}
          <div
            className="rounded-xl p-4 mb-5 flex items-center gap-4"
            style={{
              backgroundColor: stats.p0Blocked > 0 ? "rgba(220,38,38,0.06)" : "rgba(34,160,107,0.06)",
              border: `1px solid ${stats.p0Blocked > 0 ? "rgba(220,38,38,0.2)" : "rgba(34,160,107,0.2)"}`,
            }}
          >
            <div className="flex-1">
              <p className="font-serif text-[18px] mb-0.5" style={{ color: C.textDark }}>
                {stats.p0Blocked > 0
                  ? `Not ready: ${stats.p0Blocked} P0 blocker${stats.p0Blocked !== 1 ? "s" : ""} must be resolved`
                  : "READY — all P0 questions answered YES"}
              </p>
              <p className="text-[11px]" style={{ color: C.textMid }}>
                {stats.yes} of {stats.total} questions answered YES · {stats.notChecked} not yet checked · {stats.no + stats.unknown} gaps identified
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-[9px] font-bold tracking-wide uppercase" style={{ color: C.textMuted }}>Progress</p>
                <p className="font-serif text-[24px] leading-none" style={{ color: C.textDark }}>{stats.pct}%</p>
              </div>
            </div>
          </div>

          {/* ═══ MASTER READINESS INDICATORS (4 scores) ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {MASTER_INDICATORS.map((indicator) => (
              <div
                key={indicator.key}
                className="rounded-xl border p-4"
                style={{ backgroundColor: C.white, borderColor: C.borderLight }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: C.textMuted }}>
                    {indicator.label}
                  </p>
                  <FileCheck className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                </div>
                <p className="font-serif text-[28px] leading-none mb-1" style={{ color: C.textDark }}>
                  —
                </p>
                <p className="text-[9px]" style={{ color: C.textMuted }}>{indicator.description}</p>
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                  <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: C.gold }} />
                </div>
              </div>
            ))}
          </div>

          {/* ═══ KPI ROW ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <KPICard icon={CheckCircle2} color={C.green} label="YES" value={stats.yes} total={stats.total} />
            <KPICard icon={XCircle} color={C.red} label="NO" value={stats.no} total={stats.total} />
            <KPICard icon={HelpCircle} color={C.orange} label="UNKNOWN" value={stats.unknown} total={stats.total} />
            <KPICard icon={HelpCircle} color={C.textMuted} label="NOT CHECKED" value={stats.notChecked} total={stats.total} />
            <KPICard icon={AlertTriangle} color={C.red} label="P0 BLOCKERS" value={stats.p0Blocked} total={stats.p0Total} highlight={stats.p0Blocked > 0} />
          </div>

          {/* ═══ FILTER ROW ═══ */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {(["all", "P0", "P1", "P2"] as const).map((p) => {
              const isActive = priorityFilter === p
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? C.navy : C.white,
                    color: isActive ? "#FFFFFF" : C.textMid,
                    border: `1px solid ${isActive ? C.navy : C.border}`,
                  }}
                >
                  {p === "all" ? "All priorities" : p}
                </button>
              )
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: C.border, backgroundColor: C.white }}>
              <Search className="w-3 h-3" style={{ color: C.textMuted }} />
              <input
                type="text"
                placeholder="Search questions\u2026"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[10px] bg-transparent outline-none w-32"
                style={{ color: C.textDark }}
              />
            </div>
          </div>

          {/* ═══ SECTION ACCORDIONS ═══ */}
          <div className="space-y-3">
            {QA_SECTIONS.map((section) => {
              const sStats = getSectionStats(section)
              const isExpanded = expandedSections.has(section.number)
              const filteredQuestions = section.questions.filter((q) => {
                if (priorityFilter !== "all" && q.priority !== priorityFilter) return false
                if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
                return true
              })

              return (
                <div
                  key={section.number}
                  className="rounded-xl border overflow-hidden"
                  style={{ backgroundColor: C.white, borderColor: C.borderLight }}
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.number)}
                    className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.015]"
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" style={{ color: C.textMuted }} />
                      ) : (
                        <ChevronRight className="w-4 h-4" style={{ color: C.textMuted }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wide" style={{ color: C.textMuted }}>
                          {String(section.number).padStart(2, "0")}
                        </span>
                        <h3 className="font-serif text-[15px]" style={{ color: C.textDark }}>
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                        {section.description}
                      </p>
                    </div>
                    {/* Stats badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sStats.p0Blocked > 0 && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${C.red}12`, color: C.red }}
                        >
                          {sStats.p0Blocked} P0 blocked
                        </span>
                      )}
                      <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>
                        {sStats.yes}/{sStats.total}
                      </span>
                      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                        <div className="h-full rounded-full" style={{ width: `${sStats.pct}%`, backgroundColor: sStats.p0Blocked > 0 ? C.orange : C.green }} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded questions */}
                  {isExpanded && filteredQuestions.length > 0 && (
                    <div className="border-t" style={{ borderColor: C.borderLight }}>
                      {filteredQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-3 px-4 py-2.5 border-b last:border-b-0 transition-colors hover:bg-black/[0.01]"
                          style={{ borderColor: C.borderLight }}
                        >
                          {/* Answer indicator */}
                          <AnswerIndicator answer={q.answer} />

                          {/* Priority badge */}
                          <span
                            className="text-[8px] font-bold tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${PRIORITY_COLORS[q.priority]}12`, color: PRIORITY_COLORS[q.priority] }}
                          >
                            {q.priority}
                          </span>

                          {/* Question */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] leading-snug" style={{ color: C.textDark }}>
                              {q.question}
                            </p>
                            {q.answer === "no" && q.fixNeeded && (
                              <p className="text-[10px] mt-1 italic" style={{ color: C.red }}>
                                Fix needed: {q.fixNeeded}
                              </p>
                            )}
                            {q.answer === "yes" && q.evidence && (
                              <p className="text-[10px] mt-1" style={{ color: C.green }}>
                                Evidence: {q.evidence}
                              </p>
                            )}
                          </div>

                          {/* Priority label on hover row */}
                          <span className="text-[8px] flex-shrink-0 mt-0.5 hidden md:block" style={{ color: C.textMuted }}>
                            {PRIORITY_LABELS[q.priority]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ═══ FOOTER NOTE ═══ */}
          <div className="mt-6 rounded-xl border p-4" style={{ backgroundColor: "rgba(47,98,216,0.04)", borderColor: "rgba(47,98,216,0.15)" }}>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.blue }} />
              <div>
                <p className="text-[11px] font-semibold mb-1" style={{ color: C.textDark }}>
                  Automated Audit Cycle
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: C.textMid }}>
                  This checklist runs on a recurring schedule. Every gap is tracked until fixed. A production cannot advance when a P0 question returns No, Unknown, or Not checked.
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

function KPICard({
  icon: Icon,
  color,
  label,
  value,
  total,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  label: string
  value: number
  total: number
  highlight?: boolean
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        backgroundColor: C.white,
        borderColor: highlight ? `${color}40` : C.borderLight,
        boxShadow: highlight ? `0 0 0 1px ${color}20` : "none",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[8px] font-bold tracking-[0.08em] uppercase" style={{ color: C.textMuted }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-serif text-[22px] leading-none" style={{ color: C.textDark }}>{value}</p>
        <p className="text-[9px]" style={{ color: C.textMuted }}>/ {total}</p>
      </div>
    </div>
  )
}

function AnswerIndicator({ answer }: { answer: string }) {
  if (answer === "yes")
    return <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.green }} />
  if (answer === "no")
    return <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
  if (answer === "unknown")
    return <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.orange }} />
  return <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5" style={{ borderColor: C.border }} />
}
