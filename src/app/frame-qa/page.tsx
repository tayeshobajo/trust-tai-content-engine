"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  FRAME_QA_ITEMS,
  summarizeFrameQA,
  detectDuplicateFrames,
  reviewSequence,
} from "@/lib/frame-qa"
import type { FrameQAItem, MalformationSeverity } from "@/lib/frame-qa"
import { getProductions } from "@/lib/studio-store"
import {
  ArrowLeft, Bell, ShieldCheck, ShieldAlert, AlertTriangle,
  CheckCircle2, XCircle, Film, Copy, Layers, Zap,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6DF",
  green: "#22A06B", orange: "#E8802A", red: "#DC2626", purple: "#7C6CC4",
}

const SEVERITY_COLORS: Record<MalformationSeverity, string> = {
  critical: C.red, major: C.orange, minor: C.textMuted,
}

const CATEGORY_LABELS: Record<FrameQAItem["category"], string> = {
  identity: "Character Identity",
  composition: "Composition",
  "world-consistency": "World Consistency",
  technical: "Technical Quality",
}

const CATEGORY_COLORS: Record<FrameQAItem["category"], string> = {
  identity: C.purple, composition: C.blue, "world-consistency": C.gold, technical: C.green,
}

export default function FrameQAPage() {
  const productions = getProductions()
  const [selectedProdId, setSelectedProdId] = useState<string>(productions[0]?.id ?? "")
  const [activeTab, setActiveTab] = useState<"checklist" | "duplicates" | "sequence">("checklist")

  const shots = useMemo(() => {
    const prod = productions.find((p) => p.id === selectedProdId)
    return prod?.film.shots ?? []
  }, [selectedProdId, productions])

  const summary = useMemo(() => summarizeFrameQA(shots), [shots])
  const duplicates = useMemo(() => detectDuplicateFrames(shots), [shots])
  const sequenceIssues = useMemo(() => reviewSequence(shots), [shots])

  const groupedItems = useMemo(() => {
    const groups: Record<string, FrameQAItem[]> = {}
    for (const item of FRAME_QA_ITEMS) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [])

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <Link href="/" className="flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: C.textMuted }}>
            <ArrowLeft className="w-3 h-3" /> Studio
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative">
              <Bell className="w-4 h-4" style={{ color: C.textMuted }} />
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pt-6 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>Frame QA</h1>
                <ShieldCheck className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Malformation detection, duplicate frame alerts, and sequence-level review before frames advance to film assembly.
              </p>
            </div>
          </div>

          {/* Hero banner */}
          <div className="relative rounded-xl overflow-hidden mb-6"
            style={{ height: 110, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}>
            <div className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 80% 40%, ${C.gold}15, transparent 60%)` }} />
            <div className="relative h-full flex flex-col justify-center px-8">
              <h2 className="font-serif text-white mb-1" style={{ fontSize: "20px", fontWeight: 400 }}>
                A frame is not done until it passes the test.
              </h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Identity, composition, world, technical — 19 checks per frame. Plus duplicate detection and sequence review.
              </p>
            </div>
          </div>

          {/* Production selector */}
          {productions.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-semibold" style={{ color: C.textMuted }}>Production:</span>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="text-[11px] px-3 py-1.5 rounded-lg border outline-none"
                style={{ borderColor: C.border, backgroundColor: C.white, color: C.textDark }}
              >
                {productions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <SummaryCard icon={Film} label="Total shots" value={summary.totalShots} color={C.blue} />
            <SummaryCard icon={CheckCircle2} label="Passed" value={summary.passedShots} color={C.green} />
            <SummaryCard icon={XCircle} label="Failed" value={summary.failedShots} color={C.red} />
            <SummaryCard icon={AlertTriangle} label="Warnings" value={summary.warningShots} color={C.orange} />
            <SummaryCard icon={Copy} label="Duplicates" value={duplicates.length} color={C.purple} />
            <SummaryCard icon={Layers} label="Seq issues" value={sequenceIssues.length} color={C.gold} />
          </div>

          {shots.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-2 mb-5">
                {([
                  { key: "checklist" as const, label: "QA Checklist", icon: ShieldCheck },
                  { key: "duplicates" as const, label: "Duplicates", icon: Copy },
                  { key: "sequence" as const, label: "Sequence Review", icon: Layers },
                ]).map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: activeTab === key ? C.navy : C.white,
                      color: activeTab === key ? "#fff" : C.textMid,
                      border: `1px solid ${activeTab === key ? C.navy : C.border}`,
                    }}>
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "checklist" && (
                <ChecklistTab groupedItems={groupedItems} severityColors={SEVERITY_COLORS} />
              )}
              {activeTab === "duplicates" && (
                <DuplicatesTab duplicates={duplicates} />
              )}
              {activeTab === "sequence" && (
                <SequenceTab issues={sequenceIssues} />
              )}
            </>
          )}
        </div>
      </div>
    </Shell>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.06em]" style={{ color: C.textMuted }}>{label}</span>
      </div>
      <p className="text-[22px] font-serif leading-none" style={{ color: C.textDark }}>{value}</p>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-3"
      style={{ borderColor: C.border }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: C.borderLight }}>
        <ShieldAlert className="w-6 h-6" style={{ color: C.textMuted }} />
      </div>
      <p className="text-[14px] font-semibold" style={{ color: C.textMid }}>No shots to review</p>
      <p className="text-[11px] text-center max-w-sm" style={{ color: C.textMuted }}>
        Select a production with rendered shots to run frame QA checks.
      </p>
    </div>
  )
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────

function ChecklistTab({
  groupedItems,
  severityColors,
}: {
  groupedItems: Record<string, FrameQAItem[]>
  severityColors: Record<MalformationSeverity, string>
}) {
  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, items]) => {
        const catColor = CATEGORY_COLORS[category as FrameQAItem["category"]] ?? C.textMuted
        return (
          <div key={category} className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ backgroundColor: `${catColor}08`, borderBottom: `1px solid ${C.borderLight}` }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>
                {CATEGORY_LABELS[category as FrameQAItem["category"]]}
              </h3>
              <span className="text-[9px]" style={{ color: C.textMuted }}>{items.length} checks</span>
            </div>
            <div className="divide-y" style={{ borderColor: C.borderLight }}>
              {items.map((item) => (
                <div key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold leading-tight" style={{ color: C.textDark }}>{item.label}</p>
                    <p className="text-[10px] leading-snug mt-0.5" style={{ color: C.textMid }}>{item.description}</p>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${severityColors[item.severityIfFailed]}15`,
                      color: severityColors[item.severityIfFailed],
                    }}>
                    {item.severityIfFailed}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Duplicates Tab ───────────────────────────────────────────────────────────

function DuplicatesTab({ duplicates }: { duplicates: ReturnType<typeof detectDuplicateFrames> }) {
  if (duplicates.length === 0) {
    return (
      <div className="rounded-xl border p-8 flex flex-col items-center gap-2"
        style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: C.green }} />
        <p className="text-[13px] font-semibold" style={{ color: C.textDark }}>No duplicates detected</p>
        <p className="text-[10px]" style={{ color: C.textMuted }}>All shots have distinct descriptions and render prompts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {duplicates.map((d, i) => (
        <div key={i} className="rounded-xl border p-4 flex items-center gap-3"
          style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${C.purple}15` }}>
            <Copy className="w-4 h-4" style={{ color: C.purple }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[12px] font-semibold" style={{ color: C.textDark }}>
                Shot {d.shotA} ↔ Shot {d.shotB}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: d.similarity === "identical" ? `${C.red}15` : `${C.orange}15`,
                  color: d.similarity === "identical" ? C.red : C.orange,
                }}>
                {d.similarity}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: C.textMid }}>{d.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Sequence Tab ─────────────────────────────────────────────────────────────

function SequenceTab({ issues }: { issues: ReturnType<typeof reviewSequence> }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border p-8 flex flex-col items-center gap-2"
        style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: C.green }} />
        <p className="text-[13px] font-semibold" style={{ color: C.textDark }}>No sequence issues detected</p>
        <p className="text-[10px]" style={{ color: C.textMuted }}>All shots have orchestration data, camera angles, and lighting notes.</p>
      </div>
    )
  }

  const severityColor = (s: string) => s === "critical" ? C.red : s === "major" ? C.orange : C.textMuted

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div key={i} className="rounded-xl border p-4 flex items-center gap-3"
          style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${severityColor(issue.severity)}15` }}>
            <Zap className="w-4 h-4" style={{ color: severityColor(issue.severity) }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[12px] font-semibold" style={{ color: C.textDark }}>
                Shot {issue.shotNo}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${severityColor(issue.severity)}15`,
                  color: severityColor(issue.severity),
                }}>
                {issue.severity}
              </span>
              <span className="text-[8px]" style={{ color: C.textMuted }}>
                {issue.type.replace(/-/g, " ")}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: C.textMid }}>{issue.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
