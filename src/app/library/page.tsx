"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  GATE_ORDER,
  approvedGateCount,
  libraryStatus,
  stageLabel,
  type Production,
} from "@/data/studio"
import { type CorrectionEvent } from "@/data/studio-memory"
import { buildPackage } from "@/lib/studio-engine"
import {
  getProductionCorrectionEvents,
  STUDIO_MEMORY_CHANGED_EVENT,
} from "@/lib/studio-memory-store"
import {
  deleteProduction,
  getProductions,
  markArchived,
  markPublished,
  PRODUCTIONS_CHANGED_EVENT,
  unarchive,
} from "@/lib/studio-store"
import type { PatternAnalysis } from "@/app/api/studio/patterns/route"
import {
  getProactiveSuggestions,
  saveProactiveSuggestions,
  shouldRunProactiveAnalysis,
} from "@/lib/studio-memory-store"
import {
  Archive,
  Check,
  CheckCircle2,
  CircleDashed,
  Copy,
  ExternalLink,
  Film,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import type { SearchResult, SearchResponse, ProductionSummary } from "@/app/api/studio/search/route"
import {
  getProductionFeedback,
  saveAudienceFeedback,
} from "@/lib/studio-memory-store"
import type { AudienceFeedback, AudienceFeedbackKind } from "@/data/studio-memory"
import { FEEDBACK_KIND_LABELS } from "@/data/studio-memory"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

function conceptLabel(key: string | null): string {
  const map: Record<string, string> = {
    "grounded-strange": "Grounded Strange",
    "visual-parable": "Visual Parable",
    "cinematic-mechanism": "Cinematic Mechanism",
  }
  return key ? (map[key] ?? key) : "No concept"
}

function conceptBg(key: string | null): string {
  const map: Record<string, string> = {
    "grounded-strange": "bg-amber-950",
    "visual-parable": "bg-violet-950",
    "cinematic-mechanism": "bg-sky-950",
  }
  return key ? (map[key] ?? "bg-slate-800") : "bg-slate-800"
}

function conceptAccent(key: string | null): string {
  const map: Record<string, string> = {
    "grounded-strange": "text-amber-400",
    "visual-parable": "text-violet-400",
    "cinematic-mechanism": "text-sky-400",
  }
  return key ? (map[key] ?? "text-slate-400") : "text-slate-400"
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function handle() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }
  return (
    <button
      onClick={handle}
      aria-label={`Copy ${label}`}
      className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 transition-colors flex-shrink-0"
    >
      {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ─── Package card row ─────────────────────────────────────────────────────────

function PackageCard({
  production,
  isActive,
  onClick,
  searchWhy,
}: {
  production: Production
  isActive: boolean
  onClick: () => void
  searchWhy?: string
}) {
  const concept = production.film.selectedConcept
  const approvedAt = GATE_ORDER.map((k) => production.gates[k])
    .filter((g) => g.status === "approved" && g.decidedAt)
    .sort((a, b) => (a.decidedAt! > b.decidedAt! ? -1 : 1))[0]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border overflow-hidden transition-all ${
        isActive
          ? "border-[#0F172A] shadow-lg ring-1 ring-[#0F172A]"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      } bg-white`}
    >
      <div className="flex">
        {/* Cinematic thumbnail */}
        <div
          className={`w-40 flex-shrink-0 relative flex flex-col justify-end p-3 ${conceptBg(concept)}`}
          style={{ minHeight: "108px" }}
        >
          {/* Simulated film grain overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "8px 8px"
            }}
          />
          <div className="relative">
            <Film className={`w-5 h-5 mb-1.5 opacity-40 ${conceptAccent(concept)}`} />
            <p className={`text-[9px] uppercase tracking-[0.15em] font-bold leading-tight ${conceptAccent(concept)}`}>
              {conceptLabel(concept)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-4 min-w-0 flex flex-col justify-between">
          <div>
            <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${conceptAccent(concept).replace("text-", "text-").replace("-400", "-600")}`}>
              {conceptLabel(concept)}
            </p>
            <p className="text-lg font-bold text-[#0F172A] leading-snug mb-1">
              {production.title}
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed line-clamp-1">
              {production.spine.rememberSentence}
            </p>
          </div>

          {searchWhy && (
            <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-2.5 py-1.5 mt-2 leading-relaxed">
              <span className="font-semibold">Match:</span> {searchWhy}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span>LinkedIn post</span>
              <span>·</span>
              <span>{production.film.shots.length} shots</span>
              <span>·</span>
              <span>4 formats</span>
            </div>

            <div className="flex items-center gap-3">
              {approvedAt?.decidedAt && (
                <span className="flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved {formatDate(approvedAt.decidedAt)}
                </span>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-lg border transition-colors ${
                isActive
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "border-gray-200 text-[#0F172A] hover:bg-gray-50"
              }`}>
                Open package
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Recently published table row ────────────────────────────────────────────

function PublishedRow({ production, onClick }: { production: Production; onClick: () => void }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
      <td className="py-3 pr-4 text-sm text-[#0F172A] font-medium">{production.title}</td>
      <td className="py-3 pr-4 text-sm text-[#64748B]">
        {production.publishedAt ? `Published ${formatDate(production.publishedAt)}` : "—"}
      </td>
      <td className="py-3 pr-4 text-sm text-[#64748B]">LinkedIn</td>
      <td className="py-3 text-sm">
        <button className="text-blue-600 hover:underline font-medium">View record</button>
      </td>
    </tr>
  )
}


// ─── Audience Feedback Capture ────────────────────────────────────────────────

const FEEDBACK_CHANNELS = ["linkedin", "instagram", "dm", "email", "in-person", "other"]
const FEEDBACK_KINDS: AudienceFeedbackKind[] = [
  "quoted_idea", "deep_comment", "trust_signal", "strong_reaction",
  "confusion", "wrong_reading", "indifference",
]

function AudienceFeedbackCapture({ productionId }: { productionId: string }) {
  const [items, setItems] = useState<AudienceFeedback[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ kind: "deep_comment" as AudienceFeedbackKind, channel: "linkedin", verbatim: "", taiNote: "" })
  const [saving, setSaving] = useState(false)

  // Load feedback directly into initial state; re-runs when productionId changes
  const [_pid, setPid] = useState(productionId)
  if (_pid !== productionId) {
    setPid(productionId)
    setItems(getProductionFeedback(productionId))
  }

  function submit() {
    if (!form.kind) return
    setSaving(true)
    const saved = saveAudienceFeedback({ productionId, kind: form.kind, channel: form.channel, verbatim: form.verbatim || undefined, taiNote: form.taiNote || undefined })
    setItems((prev) => [saved, ...prev])
    setForm({ kind: "deep_comment", channel: "linkedin", verbatim: "", taiNote: "" })
    setOpen(false)
    setSaving(false)
  }

  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Audience signals</p>
          {items.length > 0 && <p className="text-[10px] text-[#94A3B8]">{items.length} logged</p>}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-[#0F172A] hover:text-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Log signal
        </button>
      </div>

      {open && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Signal type</label>
              <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as AudienceFeedbackKind }))} className="w-full text-xs rounded border border-gray-200 px-2 py-1.5 bg-white">
                {FEEDBACK_KINDS.map((k) => <option key={k} value={k}>{FEEDBACK_KIND_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Channel</label>
              <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} className="w-full text-xs rounded border border-gray-200 px-2 py-1.5 bg-white">
                {FEEDBACK_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Verbatim (optional)</label>
            <input value={form.verbatim} onChange={(e) => setForm((f) => ({ ...f, verbatim: e.target.value }))} placeholder="Exact quote or comment" className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white placeholder:text-[#94A3B8]" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Tai note (optional)</label>
            <input value={form.taiNote} onChange={(e) => setForm((f) => ({ ...f, taiNote: e.target.value }))} placeholder="Why do you think this happened?" className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white placeholder:text-[#94A3B8]" />
          </div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0F172A] text-white disabled:opacity-40">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Log
            </button>
            <button onClick={() => setOpen(false)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                ["quoted_idea","deep_comment","trust_signal"].includes(item.kind)
                  ? "bg-green-100 text-green-700"
                  : ["confusion","wrong_reading"].includes(item.kind)
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-[#64748B]"
              }`}>{FEEDBACK_KIND_LABELS[item.kind]}</span>
              <div className="min-w-0">
                {item.verbatim && <p className="text-xs text-[#0F172A] leading-relaxed line-clamp-1">&ldquo;{item.verbatim}&rdquo;</p>}
                {item.studioInterpretation && <p className="text-[10px] text-[#64748B] leading-relaxed">{item.studioInterpretation}</p>}
                <p className="text-[10px] text-[#94A3B8]">{item.channel} · {new Date(item.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !open && (
        <p className="text-xs text-[#94A3B8]">No audience signals logged yet.</p>
      )}
    </div>
  )
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function PackagePanel({
  production,
  onNavigate,
}: {
  production: Production
  onNavigate: (path: string) => void
}) {
  const [corrections, setCorrections] = useState<CorrectionEvent[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const pkg = buildPackage(production)
  const selectedConcept = production.film.concepts.find(
    (c) => c.key === production.film.selectedConcept
  ) ?? null
  const status = libraryStatus(production)
  const ready = status === "ready"
  const published = status === "published"
  const archived = status === "archived"
  const concept = production.film.selectedConcept

  const lastApproval = GATE_ORDER.map((k) => production.gates[k])
    .filter((g) => g.status === "approved" && g.decidedAt)
    .sort((a, b) => (a.decidedAt! > b.decidedAt! ? -1 : 1))[0]

  useEffect(() => {
    const load = () => setCorrections(getProductionCorrectionEvents(production.id))
    load()
    window.addEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
    return () => window.removeEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
  }, [production.id])

  return (
    <div className="sticky top-6 space-y-0 rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
      {/* Cinematic header */}
      <div
        className={`relative h-44 flex items-center justify-center ${conceptBg(concept)}`}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "8px 8px"
          }}
        />
        <div className="relative flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-colors">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <p className="text-white text-opacity-50 text-xs">No render yet · Preview in Film Studio</p>
        </div>
        <div className="absolute bottom-2 right-3 text-white text-opacity-40 text-xs font-mono">
          {production.film.shots.length * 5}s
        </div>
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] uppercase tracking-widest font-bold ${conceptAccent(concept)}`}>
            {conceptLabel(concept)}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-base font-bold text-[#0F172A] leading-snug">{production.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          {ready && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
          <span className={`text-sm font-medium ${
            ready ? "text-green-700"
            : published ? "text-blue-600"
            : archived ? "text-[#94A3B8]"
            : "text-[#64748B]"
          }`}>
            {ready ? "Ready to publish"
              : published ? "Published"
              : archived ? "Archived"
              : stageLabel(production)}
          </span>
        </div>
        <p className="text-sm text-[#64748B] leading-relaxed">{production.spine.rememberSentence}</p>
      </div>

      {/* Package contents */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">Package contents</p>
        <div className="space-y-0">
          {/* LinkedIn post */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#0F172A]">LinkedIn post</span>
              <span className="text-xs text-[#94A3B8]">· {wordCount(pkg.linkedinPost)} words</span>
            </div>
            <CopyBtn text={pkg.linkedinPost} label="LinkedIn post" />
          </div>

          {/* First comment */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border border-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#0F172A]">First comment</span>
            </div>
            <CopyBtn text={pkg.firstComment} label="first comment" />
          </div>

          {/* Accessibility text */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded border border-[#94A3B8] flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-[#94A3B8]">A</span>
              </div>
              <span className="text-sm text-[#0F172A]">Accessibility text</span>
            </div>
            <CopyBtn text={pkg.accessibilityText} label="accessibility text" />
          </div>

          {/* Film assets */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#0F172A]">Captioned vertical film</span>
              <span className="text-xs text-[#94A3B8]">· 1080×1920</span>
            </div>
            <button
              onClick={() => onNavigate(`/film-studio?id=${production.id}`)}
              className="text-xs font-medium text-blue-600 hover:underline flex-shrink-0"
            >
              Preview
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#0F172A]">Landscape film</span>
              <span className="text-xs text-[#94A3B8]">· 1920×1080</span>
            </div>
            <span className="text-xs text-[#94A3B8]">After render</span>
          </div>

          {selectedConcept && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border border-[#94A3B8] flex-shrink-0" />
                <span className="text-sm text-[#0F172A]">Production archive</span>
              </div>
              <span className="text-xs text-[#94A3B8]">{selectedConcept.costEstimate.split(" (")[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Release */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-0.5">Release</p>
        <p className="text-xs text-[#94A3B8] mb-3">Nothing publishes automatically.</p>

        {!archived ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate(`/film-studio?id=${production.id}`)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#0F172A] hover:bg-gray-50 transition-colors"
              >
                Open package
              </button>
              <button
                onClick={() => !published && markPublished(production.id)}
                disabled={!ready && !published}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  published
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : ready
                    ? "bg-[#0F172A] text-white hover:bg-[#1E293B]"
                    : "bg-gray-100 text-[#94A3B8] cursor-not-allowed"
                }`}
              >
                {published ? "Published ✓" : "Mark as published"}
              </button>
            </div>
            {!published && (
              <button
                onClick={() => markArchived(production.id)}
                className="w-full py-2 rounded-lg text-sm text-[#64748B] hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => unarchive(production.id)}
              className="w-full py-2 rounded-lg border border-gray-200 text-sm text-[#64748B] hover:bg-gray-50 transition-colors"
            >
              Restore from archive
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete production
            </button>
          </div>
        )}
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <p className="mb-1 text-sm font-bold text-[#0F172A]">Delete this production permanently?</p>
            <p className="mb-5 text-sm leading-relaxed text-[#64748B]">
              This removes all traces — thought, post, film plan, corrections. Cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduction(production.id)
                  onNavigate("/library")
                }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creative memory */}
      {corrections.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-0.5">
            What Studio learned
          </p>
          <p className="text-xs text-[#94A3B8] mb-3">
            Correction history stays with the package.
          </p>
          <div className="space-y-3">
            {corrections.slice(0, 3).map((event) => (
              <div key={event.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">
                    {event.labels[0]}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {formatDate(event.at)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#4A5568]">
                  {event.studioInterpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience feedback */}
      <AudienceFeedbackCapture productionId={production.id} />

      {/* Footer metadata */}
      <div className="px-5 py-3 bg-gray-50 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[#94A3B8] mb-0.5">Approved by</p>
          <p className="font-medium text-[#0F172A]">Tai</p>
          {lastApproval?.decidedAt && (
            <p className="text-[#94A3B8]">
              Final approval {formatDate(lastApproval.decidedAt)}
            </p>
          )}
        </div>
        <div>
          <p className="text-[#94A3B8] mb-0.5">Production cost</p>
          <p className="font-medium text-[#0F172A]">
            {selectedConcept ? selectedConcept.costEstimate.split(" (")[0] : "—"}
          </p>
        </div>
        <div>
          <p className="text-[#94A3B8] mb-1">Gates</p>
          <div className="flex items-center gap-0.5">
            {GATE_ORDER.map((k) => (
              production.gates[k].status === "approved"
                ? <CheckCircle2 key={k} className="w-3.5 h-3.5 text-green-600" />
                : <CircleDashed key={k} className="w-3.5 h-3.5 text-gray-300" />
            ))}
          </div>
          <p className="text-[#94A3B8] mt-0.5">{approvedGateCount(production)} of 5 passed</p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabKey = "ready" | "published" | "archived" | "all"

const TABS: { key: TabKey; label: string }[] = [
  { key: "ready", label: "Ready to publish" },
  { key: "published", label: "Published" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All packages" },
]

function filterByTab(productions: Production[], tab: TabKey): Production[] {
  switch (tab) {
    case "ready": return productions.filter((p) => libraryStatus(p) === "ready")
    case "published": return productions.filter((p) => libraryStatus(p) === "published")
    case "archived": return productions.filter((p) => libraryStatus(p) === "archived")
    default: return productions
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Semantic search ─────────────────────────────────────────────────────────
// Debounced LLM re-rank: sends query + spine summaries to Claude,
// gets back results ordered by meaning-based relevance.

function toSummary(p: Production): ProductionSummary {
  return {
    id: p.id,
    title: p.title,
    sourceThought: p.sourceThought,
    spine: p.spine,
    shift: p.shift,
    selectedConcept: p.film.selectedConcept,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
  }
}

function useSemanticSearch(productions: Production[]) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [interpretation, setInterpretation] = useState("")
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = (q: string) => {
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) {
      setResults(null)
      setInterpretation("")
      setSearching(false)
      return
    }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/studio/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, productions: productions.map(toSummary) }),
        })
        if (r.ok) {
          const data = await r.json() as SearchResponse
          setResults(data.results)
          setInterpretation(data.interpretation)
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 600) // 600ms debounce
  }

  return { query, results, interpretation, searching, search }
}

// ─── Patterns panel ───────────────────────────────────────────────────────────

function PatternsPanel({
  productions,
  cachedAnalysis,
  onAnalysisComplete,
}: {
  productions: Production[]
  cachedAnalysis: PatternAnalysis | null
  onAnalysisComplete: (analysis: PatternAnalysis) => void
}) {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(cachedAnalysis)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [ran, setRan] = useState(cachedAnalysis !== null)

  async function runAnalysis() {
    if (loading || ran) return
    setLoading(true)
    setError(false)
    try {
      const r = await fetch("/api/studio/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productions: productions.map((p) => ({
            id: p.id,
            title: p.title,
            spine: p.spine,
            shift: p.shift,
            publishedAt: p.publishedAt,
            createdAt: p.createdAt,
          })),
        }),
      })
      if (r.ok) {
        const result = await r.json() as PatternAnalysis
        setAnalysis(result)
        setRan(true)
        onAnalysisComplete(result)
      } else setError(true)
    } catch { setError(true) }
    setLoading(false)
  }

  if (!ran && !loading) {
    return (
      <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-8 text-center">
        <Sparkles className="w-5 h-5 mx-auto mb-3 text-[#94A3B8]" />
        <p className="text-sm font-semibold text-[#0F172A] mb-1">Pattern analysis</p>
        <p className="text-sm text-[#64748B] mb-4">
          Studio reads across {productions.length} production{productions.length !== 1 ? "s" : ""} to surface recurring themes, content gaps, and new directions.
        </p>
        <button
          onClick={runAnalysis}
          disabled={productions.length < 2}
          className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {productions.length < 2 ? "Add more productions first" : "Analyse body of work"}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-8 border border-gray-200 rounded-xl p-8 text-center bg-white">
        <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Reading across the body of work...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 border border-red-100 rounded-xl p-6 bg-red-50 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">Pattern analysis failed. <button onClick={() => { setError(false); setRan(false) }} className="underline">Try again</button></p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="mt-10 space-y-6">
      {/* Studio observation */}
      {analysis.studioObservation && (
        <div className="bg-[#0F172A] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Studio sees</p>
          </div>
          <p className="text-base text-white leading-relaxed">{analysis.studioObservation}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring themes */}
        {analysis.recurringThemes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#64748B]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Recurring themes</h3>
            </div>
            <div className="space-y-3">
              {analysis.recurringThemes.map((t, i) => (
                <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[#0F172A]">{t.theme}</p>
                    <span className="text-xs text-[#94A3B8]">{t.appearances}×</span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{t.observation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content gaps */}
        {analysis.contentGaps.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-[#64748B]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Content gaps</h3>
            </div>
            <div className="space-y-3">
              {analysis.contentGaps.map((g, i) => (
                <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[#0F172A]">{g.gap}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.urgency === "high" ? "bg-red-100 text-red-700"
                      : g.urgency === "medium" ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-[#64748B]"
                    }`}>{g.urgency}</span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{g.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Topic recommendations */}
      {analysis.topicRecommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">Recommended next directions</h3>
          <div className="space-y-4">
            {analysis.topicRecommendations.map((rec, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-bold text-[#0F172A]">{rec.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{rec.observedPattern}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    rec.confidenceLevel === "high" ? "bg-green-100 text-green-700"
                    : rec.confidenceLevel === "medium" ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-[#64748B]"
                  }`}>{rec.confidenceLevel} confidence</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Human truth</p>
                    <p className="text-[#0F172A] leading-relaxed">{rec.humanTruth}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Unconventional angle</p>
                    <p className="text-[#0F172A] leading-relaxed">{rec.unconventionalAngle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Audience shift</p>
                    <p className="text-[#0F172A] leading-relaxed">{rec.audienceShift}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Roadmap connection</p>
                    <p className="text-[#0F172A] leading-relaxed">{rec.roadmapConnection}</p>
                  </div>
                </div>
                {rec.premises.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-1.5">Three premises</p>
                    <ol className="space-y-1">
                      {rec.premises.map((p, j) => (
                        <li key={j} className="text-xs text-[#64748B] flex gap-2">
                          <span className="font-bold text-[#94A3B8] flex-shrink-0">{j + 1}.</span>
                          {p}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {rec.whatStudioMayMisunderstand && (
                  <p className="text-[10px] text-amber-700 mt-2 pt-2 border-t border-amber-100">
                    Studio may be wrong: {rec.whatStudioMayMisunderstand}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const { query: searchQuery, results: searchResults, interpretation: searchInterpretation, searching, search } = useSemanticSearch(productions)
  const [proactiveAnalysis, setProactiveAnalysis] = useState<PatternAnalysis | null>(null)

  useEffect(() => {
    const load = () => {
      const prods = getProductions()
      setProductions(prods)
      setLoaded(true)

      // Proactive analysis: load from cache immediately, then auto-run if stale
      const cached = getProactiveSuggestions()
      if (cached) setProactiveAnalysis(cached.analysis)

      if (shouldRunProactiveAnalysis(prods.length)) {
        // Fire in background — won't block the UI
        fetch("/api/studio/patterns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productions: prods.map((p) => ({
              id: p.id, title: p.title, spine: p.spine,
              shift: p.shift, publishedAt: p.publishedAt, createdAt: p.createdAt,
            })),
          }),
        })
          .then((r) => r.ok ? r.json() : null)
          .then((result: PatternAnalysis | null) => {
            if (result) {
              saveProactiveSuggestions({ generatedAt: new Date().toISOString(), productionCount: prods.length, analysis: result })
              setProactiveAnalysis(result)
            }
          })
          .catch(() => {})
      }
    }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const allProductions = productions
  const tabFiltered = filterByTab(allProductions, activeTab)

  // When searching: use semantic results to order+filter, ignore tab filter
  // (search is global — not scoped to current tab)
  const searchResultMap = new Map((searchResults ?? []).map((r) => [r.id, r]))

  const filtered: Production[] = (() => {
    if (!searchQuery.trim()) return tabFiltered
    if (searching || searchResults === null) return tabFiltered // show current while loading
    if (searchResults.length === 0) return []
    return searchResults
      .map((r) => allProductions.find((p) => p.id === r.id))
      .filter((p): p is Production => p !== undefined)
  })()

  const selected =
    filtered.find((p) => p.id === selectedId) ??
    filtered[0] ??
    null

  const counts: Record<TabKey, number> = {
    ready: allProductions.filter((p) => libraryStatus(p) === "ready").length,
    published: allProductions.filter((p) => libraryStatus(p) === "published").length,
    archived: allProductions.filter((p) => libraryStatus(p) === "archived").length,
    all: allProductions.length,
  }

  // Ready-to-publish packages for the main section
  const readyPackages = filtered.filter((p) => libraryStatus(p) === "ready")
  // Recently published for compact table
  const recentlyPublished = filtered.filter((p) => libraryStatus(p) === "published")
  // In production or other
  const inProduction = filtered.filter(
    (p) => libraryStatus(p) === "in_production"
  )
  // Show all when on "all" tab (no "ready" sub-section grouping)
  const showGrouped = activeTab === "all" || activeTab === "ready"

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-1">
          <div>
            <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight leading-none">
              Your finished work.
            </h1>
            <p className="text-sm text-[#64748B] mt-2">Approved packages, ready when you are.</p>
          </div>
          {loaded && (
            <div className="flex items-center gap-3 text-sm text-[#64748B] md:mb-1">
              <span>{allProductions.length} package{allProductions.length !== 1 ? "s" : ""}</span>
              {!searchQuery && counts.ready > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-green-700 font-semibold">{counts.ready} ready to publish</span>
                </>
              )}
              {searchQuery && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-blue-600 font-medium">searching by meaning</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-4 mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { search(e.target.value); setSelectedId(null) }}
            placeholder="Search by truth, theme, symbol, audience, concept..."
            className="w-full max-w-lg pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A]"
          />
          {searchQuery && (
            <span className="absolute left-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] whitespace-nowrap flex items-center gap-1.5">
              {searching
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Searching meaning&hellip;</>
                : searchResults !== null
                ? <>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</>
                : null
              }
            </span>
          )}
        </div>
        {/* Semantic search interpretation */}
        {searchQuery && !searching && searchInterpretation && (
          <p className="text-xs text-[#94A3B8] mt-1 mb-0 max-w-lg">
            <span className="font-medium text-[#64748B]">Studio read: </span>{searchInterpretation}
          </p>
        )}
        {searchQuery && !searching && searchResults !== null && searchResults.length === 0 && (
          <p className="text-xs text-[#94A3B8] mt-1 max-w-lg">
            No productions match that meaning. Try a different angle — theme, emotion, or audience shift.
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mt-3 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setSelectedId(null)
              }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#94A3B8] hover:text-[#64748B]"
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[#0F172A] text-white"
                    : "bg-gray-100 text-[#64748B]"
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {loaded && filtered.length === 0 && !searching && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-sm font-semibold text-[#0F172A] mb-1">
              {searchQuery.trim()
                ? "Nothing matched that search."
                : activeTab === "ready"
                ? "No packages have cleared all five gates yet."
                : activeTab === "published"
                ? "Nothing marked as published yet."
                : activeTab === "archived"
                ? "Nothing in the archive."
                : "The library is empty."}
            </p>
            <p className="text-sm text-[#64748B] mb-4">
              {searchQuery.trim()
                ? "Studio searched by meaning. Try a different angle — emotion, symbol, or audience shift."
                : "Approved productions collect here after all gates pass."}
            </p>
            {!searchQuery.trim() && (
              <button
                onClick={() => router.push("/thinking-room")}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Capture a thought →
              </button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6">

              {/* Ready to publish section */}
              {showGrouped && readyPackages.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] mb-1">Ready to publish</h2>
                  <p className="text-sm text-[#64748B] mb-4">Everything below has passed its final gate.</p>
                  <div className="space-y-3">
                    {readyPackages.map((p) => (
                      <PackageCard
                        key={p.id}
                        production={p}
                        isActive={selected?.id === p.id}
                        onClick={() => setSelectedId(p.id)}
                        searchWhy={searchResultMap.get(p.id)?.why}
                        
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Non-grouped filtered list (published / archived tabs) */}
              {!showGrouped && (
                <div className="space-y-3">
                  {filtered.map((p) => (
                    <PackageCard
                      key={p.id}
                      production={p}
                      isActive={selected?.id === p.id}
                      onClick={() => setSelectedId(p.id)}
                      searchWhy={searchResultMap.get(p.id)?.why}
                      
                    />
                  ))}
                </div>
              )}

              {/* In production (shown on "all" tab only) */}
              {showGrouped && inProduction.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A] mb-3">In production</h2>
                  <div className="space-y-3">
                    {inProduction.map((p) => (
                      <PackageCard
                        key={p.id}
                        production={p}
                        isActive={selected?.id === p.id}
                        onClick={() => setSelectedId(p.id)}
                        searchWhy={searchResultMap.get(p.id)?.why}
                        
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recently published table */}
              {showGrouped && recentlyPublished.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Recently published</h2>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium px-4 py-2.5">Title</th>
                          <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium px-4 py-2.5">Published</th>
                          <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium px-4 py-2.5">Channel</th>
                          <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium px-4 py-2.5">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentlyPublished.map((p) => (
                          <PublishedRow
                            key={p.id}
                            production={p}
                            onClick={() => setSelectedId(p.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="lg:col-span-5">
              {selected && (
                <>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#94A3B8] mb-2">
                    Selected package
                  </p>
                  <PackagePanel
                    production={selected}
                    onNavigate={(path) => router.push(path)}
                  />
                </>
              )}
            </div>
          </div>
        )}
        {/* Pattern analysis — shown on All tab when not searching */}
        {activeTab === "all" && !searchQuery && allProductions.length > 0 && (
          <PatternsPanel
            productions={allProductions}
            cachedAnalysis={proactiveAnalysis}
            onAnalysisComplete={(result) => {
              saveProactiveSuggestions({ generatedAt: new Date().toISOString(), productionCount: allProductions.length, analysis: result })
              setProactiveAnalysis(result)
            }}
          />
        )}
      </div>
    </Shell>
  )
}
