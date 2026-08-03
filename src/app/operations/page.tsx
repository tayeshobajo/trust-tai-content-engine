"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import { getProductions } from "@/lib/studio-store"
import { getProductionBudget, detectStalledTasks } from "@/lib/cost-tracking"
import { buildPackageReport } from "@/lib/package-assembly"
import { getAuditTrail } from "@/lib/audit-trail"
import { jobQueue } from "@/lib/resilience"
import {
  ArrowLeft, Bell, DollarSign, Package, History,
  Activity, AlertTriangle, CheckCircle2, XCircle, Clock,
  TrendingUp, Zap, FileText, Cpu,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6DF",
  green: "#22A06B", orange: "#E8802A", red: "#DC2626", purple: "#7C6CC4",
}

type Tab = "cost" | "package" | "audit" | "jobs"

export default function OperationsPage() {
  const productions = getProductions()
  const [selectedProdId, setSelectedProdId] = useState<string>(productions[0]?.id ?? "")
  const [activeTab, setActiveTab] = useState<Tab>("cost")

  const shots = useMemo(() => {
    const prod = productions.find((p) => p.id === selectedProdId)
    return prod?.film.shots ?? []
  }, [selectedProdId, productions])

  const budget = useMemo(() => getProductionBudget(selectedProdId), [selectedProdId])
  const packageReport = useMemo(() => {
    const prod = productions.find((p) => p.id === selectedProdId)
    return prod ? buildPackageReport(prod) : null
  }, [selectedProdId, productions])
  const stalled = useMemo(() => detectStalledTasks(shots), [shots])
  const auditTrail = useMemo(() => getAuditTrail(undefined, undefined, 20), [])
  const jobs = useMemo(() => jobQueue.getJobs(selectedProdId), [selectedProdId])

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
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>
                  Operations
                </h1>
                <Activity className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Cost tracking, package assembly, audit trail, background jobs, and operational resilience.
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
                Nothing ships without a clean bill of operations.
              </h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Budget, package completeness, audit trail, job queue — all must be green before delivery.
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

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5">
            {([
              { key: "cost" as const, label: "Cost Tracking", icon: DollarSign },
              { key: "package" as const, label: "Package Assembly", icon: Package },
              { key: "audit" as const, label: "Audit Trail", icon: History },
              { key: "jobs" as const, label: "Background Jobs", icon: Cpu },
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

          {packageReport ? (
            <>
              {activeTab === "cost" && <CostTab budget={budget} stalled={stalled} />}
              {activeTab === "package" && <PackageTab report={packageReport} />}
              {activeTab === "audit" && <AuditTab entries={auditTrail} />}
              {activeTab === "jobs" && <JobsTab jobs={jobs} />}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </Shell>
  )
}

// ─── Cost Tab ─────────────────────────────────────────────────────────────────

function CostTab({ budget, stalled }: {
  budget: ReturnType<typeof getProductionBudget>
  stalled: ReturnType<typeof detectStalledTasks>
}) {
  const budgetColor = budget.isExceeded ? C.red : budget.isWarning ? C.orange : C.green
  const budgetPct = budget.estimatedBudget > 0
    ? Math.min(100, Math.round((budget.spent / budget.estimatedBudget) * 100))
    : 0

  return (
    <div className="space-y-4">
      {/* Budget overview */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <div className="px-4 py-2.5 border-b flex items-center gap-2"
          style={{ borderColor: C.borderLight, backgroundColor: `${C.cream}40` }}>
          <DollarSign className="w-4 h-4" style={{ color: C.gold }} />
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>Budget</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em]" style={{ color: C.textMuted }}>Spent</p>
              <p className="text-[24px] font-serif" style={{ color: C.textDark }}>
                {budget.spent} <span className="text-[11px]" style={{ color: C.textMuted }}>credits</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em]" style={{ color: C.textMuted }}>Estimated</p>
              <p className="text-[24px] font-serif" style={{ color: C.textDark }}>
                {budget.estimatedBudget || "—"} <span className="text-[11px]" style={{ color: C.textMuted }}>credits</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em]" style={{ color: C.textMuted }}>Remaining</p>
              <p className="text-[24px] font-serif" style={{ color: budgetColor }}>
                {budget.remaining} <span className="text-[11px]" style={{ color: C.textMuted }}>credits</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {budget.estimatedBudget > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[9px] mb-1" style={{ color: C.textMuted }}>
                <span>Budget used</span>
                <span>{budgetPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${budgetPct}%`, backgroundColor: budgetColor }} />
              </div>
            </div>
          )}

          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {budget.isExceeded && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${C.red}15`, color: C.red }}>
                <XCircle className="w-2.5 h-2.5" /> Budget exceeded
              </span>
            )}
            {budget.isWarning && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${C.orange}15`, color: C.orange }}>
                <AlertTriangle className="w-2.5 h-2.5" /> Budget warning ({Math.round(budget.warningThreshold * 100)}%)
              </span>
            )}
            {!budget.isExceeded && !budget.isWarning && budget.estimatedBudget > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${C.green}15`, color: C.green }}>
                <CheckCircle2 className="w-2.5 h-2.5" /> Within budget
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cost entries */}
      {budget.entries.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: C.borderLight }}>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>Cost Log</h3>
          </div>
          <div className="divide-y" style={{ borderColor: C.borderLight }}>
            {budget.entries.map((entry) => (
              <div key={entry.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold" style={{ color: C.textDark }}>{entry.description}</p>
                  <p className="text-[9px]" style={{ color: C.textMuted }}>
                    {entry.category} · {entry.model} · {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-[12px] font-serif" style={{ color: C.textDark }}>
                  {entry.cost} {entry.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stalled tasks */}
      {stalled.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: `${C.orange}30`, backgroundColor: `${C.orange}08` }}>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] flex items-center gap-2" style={{ color: C.orange }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Stalled Tasks ({stalled.length})
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: C.borderLight }}>
            {stalled.map((task) => (
              <div key={task.shotNo} className="px-4 py-2.5 flex items-center gap-3">
                <Clock className="w-4 h-4" style={{ color: C.orange }} />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold" style={{ color: C.textDark }}>
                    Shot {task.shotNo} — {task.status}
                  </p>
                  <p className="text-[9px]" style={{ color: C.textMuted }}>{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Package Tab ──────────────────────────────────────────────────────────────

function PackageTab({ report }: { report: ReturnType<typeof buildPackageReport> | null }) {
  if (!report) return null

  const statusColor = report.status === "ready" ? C.green : report.blockingCount > 0 ? C.red : C.orange

  return (
    <div className="space-y-4">
      {/* Completion banner */}
      <div className="rounded-xl border p-4" style={{
        backgroundColor: `${statusColor}08`, borderColor: `${statusColor}30`,
      }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${statusColor}15` }}>
            <Package className="w-6 h-6" style={{ color: statusColor }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-serif" style={{ color: C.textDark }}>
                Package: {report.status}
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: statusColor, color: "#fff" }}>
                {report.completionPercent}% complete
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMid }}>
              {report.blockingCount} blocking items remaining
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${statusColor}20` }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${report.completionPercent}%`, backgroundColor: statusColor }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.borderLight }}>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>
            Completeness Checklist
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: C.borderLight }}>
          {report.checks.map((check) => {
            const color = check.status === "pass" ? C.green
              : check.status === "fail" ? C.red
              : check.status === "warning" ? C.orange
              : C.textMuted
            const Icon = check.status === "pass" ? CheckCircle2
              : check.status === "fail" ? XCircle
              : check.status === "warning" ? AlertTriangle
              : Clock
            return (
              <div key={check.id} className="px-4 py-2.5 flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold" style={{ color: C.textDark }}>{check.label}</p>
                    <span className="text-[7px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${color}15`, color }}>
                      {check.category}
                    </span>
                    {check.blocking && (
                      <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded"
                        style={{ backgroundColor: `${C.red}10`, color: C.red }}>
                        blocking
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] leading-snug" style={{ color: C.textMid }}>
                    {check.detail ?? check.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.borderLight }}>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: C.textDark }}>
            Scene Order Timeline
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {report.timeline.map((item, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className="rounded-lg px-3 py-2 text-center min-w-[60px]"
                  style={{ backgroundColor: `${C.blue}08`, border: `1px solid ${C.borderLight}` }}>
                  <p className="text-[9px] font-bold" style={{ color: C.blue }}>#{item.order}</p>
                  <p className="text-[8px]" style={{ color: C.textMuted }}>Shot {item.shotNo}</p>
                  <p className="text-[8px]" style={{ color: C.textMuted }}>{item.durationSec}s</p>
                </div>
                {i < report.timeline.length - 1 && (
                  <div className="w-2 h-px" style={{ backgroundColor: C.border }} />
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] mt-2" style={{ color: C.textMuted }}>
            Total: {report.timeline.reduce((sum, t) => sum + t.durationSec, 0)}s
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────

function AuditTab({ entries }: { entries: ReturnType<typeof getAuditTrail> }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border p-8 flex flex-col items-center gap-2"
        style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <History className="w-8 h-8" style={{ color: C.textMuted }} />
        <p className="text-[13px] font-semibold" style={{ color: C.textMid }}>No audit entries yet</p>
        <p className="text-[10px]" style={{ color: C.textMuted }}>
          Version changes, approvals, and rollbacks will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="divide-y" style={{ borderColor: C.borderLight }}>
        {entries.map((entry) => (
          <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${C.blue}08` }}>
              <FileText className="w-3.5 h-3.5" style={{ color: C.blue }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.04em] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${C.blue}10`, color: C.blue }}>
                  {entry.action}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: C.textDark }}>
                  {entry.entityName}
                </span>
                <span className="text-[8px]" style={{ color: C.textMuted }}>
                  {entry.entityType}
                </span>
              </div>
              <p className="text-[10px] leading-snug mt-0.5" style={{ color: C.textMid }}>
                {entry.description}
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: C.textMuted }}>
                {entry.actor} · {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────

function JobsTab({ jobs }: { jobs: ReturnType<typeof jobQueue.getJobs> }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border p-8 flex flex-col items-center gap-2"
        style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
        <Cpu className="w-8 h-8" style={{ color: C.textMuted }} />
        <p className="text-[13px] font-semibold" style={{ color: C.textMid }}>No background jobs</p>
        <p className="text-[10px]" style={{ color: C.textMuted }}>
          Render and processing jobs will appear here when queued.
        </p>
      </div>
    )
  }

  const statusColor = (status: string) => {
    if (status === "completed") return C.green
    if (status === "failed") return C.red
    if (status === "processing") return C.blue
    if (status === "queued") return C.gold
    return C.textMuted
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div key={job.id} className="rounded-xl border p-3 flex items-center gap-3"
          style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${statusColor(job.status)}15` }}>
            <Zap className="w-4 h-4" style={{ color: statusColor(job.status) }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold" style={{ color: C.textDark }}>{job.type}</span>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${statusColor(job.status)}15`, color: statusColor(job.status) }}>
                {job.status}
              </span>
              {job.shotNo && (
                <span className="text-[8px]" style={{ color: C.textMuted }}>Shot {job.shotNo}</span>
              )}
            </div>
            {job.progress > 0 && job.status === "processing" && (
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                <div className="h-full rounded-full" style={{ width: `${job.progress}%`, backgroundColor: C.blue }} />
              </div>
            )}
            {job.error && (
              <p className="text-[9px] mt-0.5" style={{ color: C.red }}>{job.error}</p>
            )}
          </div>
        </div>
      ))}
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
        <TrendingUp className="w-6 h-6" style={{ color: C.textMuted }} />
      </div>
      <p className="text-[14px] font-semibold" style={{ color: C.textMid }}>No productions to track</p>
      <p className="text-[11px] text-center max-w-sm" style={{ color: C.textMuted }}>
        Create a production to start tracking costs, packages, and audit trails.
      </p>
    </div>
  )
}
