"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import { SCRIPTS, SCENE_PURPOSE_LABELS, validateScriptDuration } from "@/data/scripts"
import type { Script, ScenePurpose, ScriptScene } from "@/data/scripts"
import {
  ArrowLeft, Bell, Plus, FileText, ChevronRight,
  Clock, AlertTriangle, CheckCircle2, XCircle, Search, Film,
  Users, MapPin, Package, Link2,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6GF", green: "#22A06B",
  orange: "#E8802A", red: "#DC2626", purple: "#7C6CC4",
}

const PURPOSE_COLORS: Record<ScenePurpose, string> = {
  "establish-world": C.blue,
  "introduce-character": C.purple,
  "reveal-weight": C.red,
  "escalate-stakes": C.orange,
  "create-breathing-room": C.green,
  "turn-point": C.gold,
  climax: C.red,
  resolution: C.green,
  landing: C.blue,
  transition: C.textMuted,
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  draft: { color: C.textMuted, label: "Draft" },
  "in-review": { color: C.gold, label: "In Review" },
  approved: { color: C.green, label: "Approved" },
  "needs-revision": { color: C.red, label: "Needs Revision" },
}

export default function ScriptsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [expandedScript, setExpandedScript] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return SCRIPTS.filter((s) => {
      if (statusFilter !== "All" && s.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          s.id.toLowerCase().includes(q) ||
          s.productionId.toLowerCase().includes(q) ||
          s.scenes.some((sc) => sc.title.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, statusFilter])

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
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border"
              style={{ borderColor: C.border, color: C.textMid }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green }} /> Studio activity
            </span>
            <button className="relative">
              <Bell className="w-4 h-4" style={{ color: C.textMuted }} />
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded hover:opacity-90"
              style={{ backgroundColor: C.navy, color: "#fff" }}>
              <Plus className="w-3 h-3" /> New script
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pt-6 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>Scripts</h1>
                <FileText className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                Scene-level scripts that link every shot to purpose, argument, and duration budget.
              </p>
            </div>
            <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>{SCRIPTS.length} scripts</span>
          </div>

          {/* Hero banner */}
          <div className="relative rounded-xl overflow-hidden mb-6"
            style={{ height: 110, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}>
            <div className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 80% 40%, ${C.gold}15, transparent 60%)` }} />
            <div className="relative h-full flex flex-col justify-center px-8">
              <h2 className="font-serif text-white mb-1" style={{ fontSize: "20px", fontWeight: 400 }}>
                Every scene must earn its place in the argument.
              </h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Each scene links to a purpose, a post reference, and a duration budget. Scene durations must sum to the production target.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {["All", "draft", "in-review", "approved", "needs-revision"].map((f) => {
              const isActive = statusFilter === f
              const count = f === "All" ? SCRIPTS.length : SCRIPTS.filter((s) => s.status === f).length
              if (count === 0 && f !== "All") return null
              const label = f === "All" ? "All" : (STATUS_CONFIG[f]?.label ?? f)
              return (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? C.navy : C.white,
                    color: isActive ? "#fff" : C.textMid,
                    border: `1px solid ${isActive ? C.navy : C.border}`,
                  }}>
                  {label} <span className="text-[8px] opacity-60">{count}</span>
                </button>
              )
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
              style={{ borderColor: C.border, backgroundColor: C.white }}>
              <Search className="w-3 h-3" style={{ color: C.textMuted }} />
              <input type="text" placeholder="Search scripts…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[10px] bg-transparent outline-none w-32" style={{ color: C.textDark }} />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-3"
              style={{ borderColor: C.border }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: C.borderLight }}>
                <FileText className="w-6 h-6" style={{ color: C.textMuted }} />
              </div>
              <p className="text-[14px] font-semibold" style={{ color: C.textMid }}>
                {SCRIPTS.length === 0 ? "No scripts yet" : "No scripts match your filters"}
              </p>
              <p className="text-[11px] text-center max-w-sm" style={{ color: C.textMuted }}>
                {SCRIPTS.length === 0
                  ? "Scripts are created when a production enters the concept phase. Each scene maps to shots, purpose, and argument claims."
                  : "Try adjusting your filters or search."}
              </p>
            </div>
          ) : (
            /* Script cards */
            <div className="space-y-3">
              {filtered.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  expanded={expandedScript === script.id}
                  onToggle={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
                />
              ))}
            </div>
          )}

          {/* Add new */}
          <div className="mt-4">
            <button className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: C.border }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: C.borderLight }}>
                <Plus className="w-4 h-4" style={{ color: C.textMuted }} />
              </div>
              <p className="text-[12px] font-semibold" style={{ color: C.textMid }}>Create a new script</p>
              <p className="text-[10px] text-center max-w-xs" style={{ color: C.textMuted }}>
                Scripts are auto-created from productions in the concept phase. Each scene maps to shots, characters, places, and props.
              </p>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ─── Script Card ──────────────────────────────────────────────────────────────

function ScriptCard({ script, expanded, onToggle }: {
  script: Script
  expanded: boolean
  onToggle: () => void
}) {
  const statusCfg = STATUS_CONFIG[script.status] ?? STATUS_CONFIG.draft
  const validation = validateScriptDuration(script)

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      {/* Card header */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-black/[0.01]">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${C.navy}08` }}>
          <FileText className="w-5 h-5" style={{ color: C.navy }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-serif text-[16px] leading-tight" style={{ color: C.textDark }}>
              {script.scenes.length} scenes
            </h3>
            <span className="text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${statusCfg.color}E6`, color: "#fff" }}>
              {statusCfg.label}
            </span>
            <span className="text-[9px]" style={{ color: C.textMuted }}>v{script.version}</span>
          </div>
          <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
            Production: {script.productionId}
          </p>
        </div>
        {/* Duration indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: C.textDark }}>
              <Clock className="w-3 h-3" />
              {validation.totalSceneDuration}s
            </div>
            {validation.targetDuration !== null && (
              <div className="flex items-center gap-1 text-[9px]" style={{
                color: validation.isValid ? C.green : C.red,
              }}>
                {validation.isValid ? (
                  <><CheckCircle2 className="w-2.5 h-2.5" /> ±{validation.delta}s</>
                ) : (
                  <><AlertTriangle className="w-2.5 h-2.5" /> {validation.delta! > 0 ? "+" : ""}{validation.delta}s over</>
                )}
              </div>
            )}
          </div>
          {expanded ? (
            <ChevronRight className="w-4 h-4 rotate-90" style={{ color: C.textMuted }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: C.textMuted }} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t" style={{ borderColor: C.borderLight }}>
          {/* Validation summary */}
          <div className="px-5 py-3 flex items-center gap-4 flex-wrap"
            style={{ backgroundColor: `${C.cream}40` }}>
            <DurationBadge validation={validation} />
            {validation.unassignedShots.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${C.orange}15`, color: C.orange }}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {validation.unassignedShots.length} unassigned shots: {validation.unassignedShots.join(", ")}
              </span>
            )}
            {validation.emptyScenes.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${C.red}15`, color: C.red }}>
                <XCircle className="w-2.5 h-2.5" />
                {validation.emptyScenes.length} scenes with no shots
              </span>
            )}
          </div>

          {/* Scene list */}
          <div className="divide-y" style={{ borderColor: C.borderLight }}>
            {script.scenes.map((scene) => (
              <SceneRow key={scene.id} scene={scene} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Scene Row ────────────────────────────────────────────────────────────────

function SceneRow({ scene }: { scene: ScriptScene }) {
  const purposeColor = PURPOSE_COLORS[scene.purpose] ?? C.textMuted
  const sceneStatus = STATUS_CONFIG[scene.status] ?? STATUS_CONFIG.draft

  return (
    <div className="px-5 py-3 hover:bg-black/[0.01]">
      <div className="flex items-start gap-3">
        {/* Scene number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
          style={{ backgroundColor: `${purposeColor}15`, color: purposeColor }}>
          {scene.sceneNumber}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + purpose */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[13px] font-semibold leading-tight" style={{ color: C.textDark }}>
              {scene.title}
            </h4>
            <span className="text-[8px] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${purposeColor}10`, color: purposeColor }}>
              {SCENE_PURPOSE_LABELS[scene.purpose]}
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${sceneStatus.color}10`, color: sceneStatus.color }}>
              {sceneStatus.label}
            </span>
          </div>

          {/* Visual action */}
          <p className="text-[11px] leading-snug mb-1.5" style={{ color: C.textMid }}>
            {scene.visualAction}
          </p>

          {/* Post reference */}
          {scene.postRef && (
            <div className="flex items-center gap-1 text-[9px] mb-1" style={{ color: C.blue }}>
              <Link2 className="w-2.5 h-2.5" />
              <span>Serves: {scene.postRef}</span>
            </div>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-3 flex-wrap text-[9px]" style={{ color: C.textMuted }}>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {scene.durationSec}s
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-2.5 h-2.5" />
              Shots: {scene.shotNumbers.length > 0 ? scene.shotNumbers.join(", ") : "—"}
            </span>
            {scene.characters.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                {scene.characters.map((c) => c.characterName).join(", ")}
              </span>
            )}
            {scene.places.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {scene.places.map((p) => p.placeName).join(", ")}
              </span>
            )}
            {scene.props.length > 0 && (
              <span className="flex items-center gap-1">
                <Package className="w-2.5 h-2.5" />
                {scene.props.map((p) => p.propName).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Duration Badge ───────────────────────────────────────────────────────────

function DurationBadge({ validation }: { validation: ReturnType<typeof validateScriptDuration> }) {
  if (validation.targetDuration === null) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
        style={{ backgroundColor: `${C.textMuted}15`, color: C.textMuted }}>
        <Clock className="w-2.5 h-2.5" />
        {validation.totalSceneDuration}s total (no target set)
      </span>
    )
  }

  if (validation.isValid) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
        style={{ backgroundColor: `${C.green}15`, color: C.green }}>
        <CheckCircle2 className="w-2.5 h-2.5" />
        {validation.totalSceneDuration}s / {validation.targetDuration}s target (±{validation.delta}s)
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full"
      style={{ backgroundColor: `${C.red}15`, color: C.red }}>
      <AlertTriangle className="w-2.5 h-2.5" />
      {validation.totalSceneDuration}s / {validation.targetDuration}s target ({validation.delta! > 0 ? "+" : ""}{validation.delta}s)
    </span>
  )
}
