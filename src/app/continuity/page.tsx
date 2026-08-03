"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import { generateContinuityReport } from "@/lib/continuity-checker"
import type { ContinuityIssue } from "@/lib/continuity-checker"
import { getProductions } from "@/lib/studio-store"
import { CHARACTERS } from "@/data/characters"
import { PLACES } from "@/data/places"
import { PROPS } from "@/data/props"
import { SCRIPTS } from "@/data/scripts"
import {
  ArrowLeft, Bell, Users, MapPin, Package, AlertTriangle,
  CheckCircle2, XCircle, Scan, GitCompare,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6DF",
  green: "#22A06B", orange: "#E8802A", red: "#DC2626", purple: "#7C6CC4",
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: C.red, major: C.orange, minor: C.textMuted,
}

const ISSUE_TYPE_ICON: Record<string, React.ElementType> = {
  "identity-shift": Users,
  "wardrobe-change": Users,
  "position-inconsistent": MapPin,
  "direction-inconsistent": MapPin,
  "prop-missing": Package,
  "prop-position-changed": Package,
  "place-inconsistent": MapPin,
  "missing-master-reference": AlertTriangle,
  "no-character-refs": Users,
}

export default function ContinuityPage() {
  const productions = getProductions()
  const [selectedProdId, setSelectedProdId] = useState<string>(productions[0]?.id ?? "")

  const shots = useMemo(() => {
    const prod = productions.find((p) => p.id === selectedProdId)
    return prod?.film.shots ?? []
  }, [selectedProdId, productions])
  const script = SCRIPTS.find((s) => s.productionId === selectedProdId)
  const scenes = script?.scenes

  const report = useMemo(
    () => generateContinuityReport(shots, CHARACTERS, PLACES, PROPS, scenes),
    [shots, scenes],
  )

  const statusConfig = {
    pass: { color: C.green, label: "Pass", icon: CheckCircle2 },
    warning: { color: C.orange, label: "Warning", icon: AlertTriangle },
    fail: { color: C.red, label: "Fail", icon: XCircle },
  }
  const statusCfg = statusConfig[report.status]

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
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>Continuity Checker</h1>
                <GitCompare className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Frame-to-frame identity verification, wardrobe tracking, prop position checks, and place consistency across all shots.
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
                The same person must remain the same person.
              </h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Every recurring character, place, and prop is tracked across shots. Master references required before rendering.
              </p>
            </div>
          </div>

          {/* Production selector */}
          {productions.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-semibold" style={{ color: C.textMuted }}>Production:</span>
              <select value={selectedProdId} onChange={(e) => setSelectedProdId(e.target.value)}
                className="text-[11px] px-3 py-1.5 rounded-lg border outline-none"
                style={{ borderColor: C.border, backgroundColor: C.white, color: C.textDark }}>
                {productions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {shots.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Overall status banner */}
              <div className="rounded-xl border p-4 mb-5 flex items-center gap-4"
                style={{
                  backgroundColor: `${statusCfg.color}08`,
                  borderColor: `${statusCfg.color}30`,
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${statusCfg.color}15` }}>
                  <statusCfg.icon className="w-6 h-6" style={{ color: statusCfg.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-serif" style={{ color: C.textDark }}>
                      Continuity: {statusCfg.label}
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusCfg.color, color: "#fff" }}>
                      {report.issues.length} issues
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textMid }}>
                    {report.summary.verified} / {report.summary.totalChecks} appearances verified ·{" "}
                    {report.summary.mismatches} mismatches ·{" "}
                    {report.summary.unchecked} missing master refs
                  </p>
                </div>
              </div>

              {/* Recurring characters */}
              {report.recurringCharacters.length > 0 && (
                <Section title="Recurring Characters" icon={Users}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {report.recurringCharacters.map((rc) => (
                      <span key={rc.characterId}
                        className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full border"
                        style={{ borderColor: C.border, backgroundColor: C.white, color: C.textDark }}>
                        <Users className="w-3 h-3" style={{ color: C.purple }} />
                        {rc.characterName}
                        <span className="text-[8px]" style={{ color: C.textMuted }}>
                          shots {rc.shotNumbers.join(", ")}
                        </span>
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Issues list */}
              {report.issues.length > 0 ? (
                <Section title="Continuity Issues" icon={AlertTriangle}>
                  <div className="space-y-2">
                    {report.issues.map((issue, i) => (
                      <IssueRow key={i} issue={issue} />
                    ))}
                  </div>
                </Section>
              ) : (
                <Section title="Continuity Issues" icon={CheckCircle2}>
                  <div className="rounded-lg border p-6 flex items-center gap-3"
                    style={{ borderColor: C.borderLight, backgroundColor: `${C.green}05` }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: C.green }} />
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: C.textDark }}>No continuity issues detected</p>
                      <p className="text-[10px]" style={{ color: C.textMuted }}>
                        All characters have master references, wardrobe is consistent, props are tracked, and places are documented.
                      </p>
                    </div>
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </Shell>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border overflow-hidden mb-4"
      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b"
        style={{ borderColor: C.borderLight, backgroundColor: `${C.cream}40` }}>
        <Icon className="w-4 h-4" style={{ color: C.gold }} />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Issue Row ────────────────────────────────────────────────────────────────

function IssueRow({ issue }: { issue: ContinuityIssue }) {
  const sevColor = SEVERITY_COLOR[issue.severity] ?? C.textMuted
  const IssueIcon = ISSUE_TYPE_ICON[issue.type] ?? AlertTriangle

  return (
    <div className="rounded-lg border p-3 flex items-start gap-3"
      style={{ borderColor: C.borderLight, backgroundColor: `${sevColor}03` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${sevColor}15` }}>
        <IssueIcon className="w-4 h-4" style={{ color: sevColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-semibold" style={{ color: C.textDark }}>
            Shot {issue.shotNo}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${sevColor}15`, color: sevColor }}>
            {issue.severity}
          </span>
          <span className="text-[8px]" style={{ color: C.textMuted }}>
            {issue.type.replace(/-/g, " ")}
          </span>
        </div>
        <p className="text-[10px] leading-snug mb-1" style={{ color: C.textMid }}>{issue.description}</p>
        {issue.suggestedFix && (
          <p className="text-[9px] leading-snug" style={{ color: C.blue }}>
            → {issue.suggestedFix}
          </p>
        )}
      </div>
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
        <Scan className="w-6 h-6" style={{ color: C.textMuted }} />
      </div>
      <p className="text-[14px] font-semibold" style={{ color: C.textMid }}>No shots to analyse</p>
      <p className="text-[11px] text-center max-w-sm" style={{ color: C.textMuted }}>
        Select a production with shots to run the continuity checker.
      </p>
    </div>
  )
}
