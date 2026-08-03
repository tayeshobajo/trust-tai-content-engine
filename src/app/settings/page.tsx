"use client"

import React, { useEffect, useState } from "react"
import Shell from "@/components/Shell"
import {
  CORRECTION_LABELS,
  DEFAULT_WORLD_CANON,
  layerLabel,
  scopeLabel,
  type StudioPrinciple,
  type WorldCanonItem,
} from "@/data/studio-memory"
import { saveVoiceSettings } from "@/lib/studio-settings-store"
import {
  getStudioPrinciples,
  getWorldCanon,
  saveWorldCanonItem,
  deleteWorldCanonItem,
  getPrincipleConflicts,
  resolveConflict,
  STUDIO_MEMORY_CHANGED_EVENT,
} from "@/lib/studio-memory-store"
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Clapperboard,
  Cpu,
  Lock,
  Megaphone,
  Pencil,
  Plus,
  Rocket,
  Search,
  Settings,
  Shield,
  Trash2,
  X,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsSection =
  | "voice"
  | "memory"
  | "production"
  | "release"
  | "brand"
  | "engine"
  | "data"

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${
        on ? "bg-[#0F172A]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

// ─── Left nav ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { key: "voice", label: "Voice", icon: <Megaphone className="w-4 h-4" /> },
  { key: "memory", label: "Memory", icon: <Brain className="w-4 h-4" /> },
  { key: "production", label: "Production", icon: <Clapperboard className="w-4 h-4" /> },
  { key: "release", label: "Release", icon: <Rocket className="w-4 h-4" /> },
  { key: "brand", label: "Brand", icon: <BookOpen className="w-4 h-4" /> },
  { key: "engine", label: "Engine", icon: <Cpu className="w-4 h-4" /> },
  { key: "data", label: "Data & security", icon: <Shield className="w-4 h-4" /> },
]

// ─── Warning rules ────────────────────────────────────────────────────────────

const DEFAULT_WARNINGS = [
  { rule: "Em dashes", behavior: "Warn and highlight", on: true },
  { rule: "Exclamation marks", behavior: "Warn and highlight", on: true },
  { rule: "Hashtags in body", behavior: "Warn and highlight", on: true },
  { rule: "Pressure CTAs", behavior: "Warn and highlight", on: true },
  { rule: "Sentence length", behavior: "Warn above 32 words", on: true },
  { rule: "Consulting clichés", behavior: "Warn and suggest review", on: true },
]

const DEFAULT_BANNED = ["leverage", "synergy", "unlock", "game-changer", "seamless", "empower", "delve"]

const APPROVED_EXAMPLES = [
  { title: "From inside the maze", type: "LinkedIn post", approvedOn: "July 24" },
  { title: "Movement is not always progress", type: "LinkedIn post", approvedOn: "July 25" },
]

const SYSTEM_OWNED = [
  { label: "Brand tokens", status: "Locked" },
  { label: "Prompt architecture", status: "Locked" },
  { label: "Model routing", status: "Locked" },
  { label: "Production scoring", status: "Locked" },
  { label: "Rendering providers", status: "Not connected" },
]

// ─── Voice section ────────────────────────────────────────────────────────────

function VoiceSection({
  onDirty,
  onStateChange,
}: {
  onDirty: () => void
  onStateChange: (state: { primaryVoice: string; ctaPosture: string; defaultAudience: string; banned: string[]; warnings: typeof DEFAULT_WARNINGS }) => void
}) {
  const stored = typeof window !== "undefined" ? (() => { try { const r = localStorage.getItem("tts_voice_settings"); return r ? JSON.parse(r) : null } catch { return null } })() : null

  const [primaryVoice, setPrimaryVoice] = useState<string>(
    stored?.primaryVoice ?? "Smart, direct, everyday language. Consultancy first.\nStory-led, practical, and clear."
  )
  const [ctaPosture, setCtaPosture] = useState<string>(
    stored?.ctaPosture ?? "Invitation only when earned"
  )
  const [defaultAudience, setDefaultAudience] = useState<string>(
    stored?.defaultAudience ?? "Founder-led businesses carrying too much through one person"
  )
  const [warnings, setWarnings] = useState(DEFAULT_WARNINGS.map((w) => ({
    ...w,
    on: stored ? (
      w.rule === "Em dashes" ? (stored.emDashWarning ?? true)
      : w.rule === "Exclamation marks" ? (stored.exclamationMarkWarning ?? true)
      : w.rule === "Hashtags in body" ? (stored.hashtagWarning ?? true)
      : w.rule === "Pressure CTAs" ? (stored.pressureCTAWarning ?? true)
      : w.rule === "Consulting clichés" ? (stored.consultingClicheWarning ?? true)
      : w.on
    ) : w.on,
  })))
  const [banned, setBanned] = useState<string[]>(stored?.bannedWords ?? DEFAULT_BANNED)
  const [newWord, setNewWord] = useState("")

  function toggleWarning(i: number) {
    const next = warnings.map((w, idx) => (idx === i ? { ...w, on: !w.on } : w))
    setWarnings(next)
    onStateChange({ primaryVoice, ctaPosture, defaultAudience, banned, warnings: next })
    onDirty()
  }

  function removeBanned(word: string) {
    const next = banned.filter((w) => w !== word)
    setBanned(next)
    onStateChange({ primaryVoice, ctaPosture, defaultAudience, banned: next, warnings })
    onDirty()
  }

  function addBanned() {
    const w = newWord.trim().toLowerCase()
    if (w && !banned.includes(w)) {
      const next = [...banned, w]
      setBanned(next)
      setNewWord("")
      onStateChange({ primaryVoice, ctaPosture, defaultAudience, banned: next, warnings })
      onDirty()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A]">Voice</h2>
          <p className="text-sm text-[#64748B] mt-1">
            The editorial rules applied to every draft before it reaches your Approval Desk.
          </p>
        </div>
        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg mt-1">
          Live settings
        </span>
      </div>

      {/* Editorial posture */}
      <div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-4">Editorial posture</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
              Primary voice
            </label>
            <textarea
              value={primaryVoice}
              onChange={(e) => { setPrimaryVoice(e.target.value); onStateChange({ primaryVoice: e.target.value, ctaPosture, defaultAudience, banned, warnings }); onDirty() }}
              rows={3}
              className="w-full px-3 py-2.5 text-sm text-[#0F172A] rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A] resize-none leading-relaxed"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">
              Define the default tone and style across all drafts.
            </p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
              CTA posture
            </label>
            <div className="relative">
              <select
                value={ctaPosture}
                onChange={(e) => { setCtaPosture(e.target.value); onStateChange({ primaryVoice, ctaPosture: e.target.value, defaultAudience, banned, warnings }); onDirty() }}
                className="w-full px-3 py-2.5 text-sm text-[#0F172A] rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A] appearance-none pr-8"
              >
                <option>Invitation only when earned</option>
                <option>Never include a CTA</option>
                <option>Soft close on every post</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5">
              When calls to action are appropriate.
            </p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
              Default audience
            </label>
            <input
              type="text"
              value={defaultAudience}
              onChange={(e) => { setDefaultAudience(e.target.value); onStateChange({ primaryVoice, ctaPosture, defaultAudience: e.target.value, banned, warnings }); onDirty() }}
              className="w-full px-3 py-2.5 text-sm text-[#0F172A] rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">
              Who Studio writes for by default.
            </p>
          </div>
        </div>
      </div>

      {/* Automatic warnings */}
      <div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-4">Automatic warnings</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold px-4 py-3">Rule</th>
                <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold px-4 py-3">Behavior</th>
                <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((w, i) => (
                <tr key={w.rule} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-sm text-[#0F172A]">{w.rule}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{w.behavior}</td>
                  <td className="px-4 py-3 text-right">
                    <Toggle on={w.on} onChange={() => toggleWarning(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banned words */}
      <div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-3">Banned words</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {banned.map((word) => (
            <span
              key={word}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#0F172A]"
            >
              {word}
              <button
                onClick={() => removeBanned(word)}
                className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBanned()}
              placeholder="Add a word"
              className="w-28 text-xs px-2.5 py-1 rounded-lg border border-dashed border-gray-300 bg-white focus:outline-none focus:border-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <button
              onClick={addBanned}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Warnings advise. Studio never changes approved meaning automatically.
        </p>
      </div>

      {/* Approved examples */}
      <div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-3">Approved examples</h3>
        <div className="space-y-0">
          {APPROVED_EXAMPLES.map((ex) => (
            <div
              key={ex.title}
              className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-0"
            >
              <span className="text-sm text-[#0F172A] flex-1">{ex.title}</span>
              <span className="text-sm text-[#64748B] flex-1">{ex.type}</span>
              <span className="text-sm text-[#64748B] flex-1">Approved {ex.approvedOn}</span>
              <button className="text-sm font-medium text-blue-600 hover:underline">View</button>
            </div>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0F172A] mt-3 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add approved example
        </button>
      </div>
    </div>
  )
}

// ─── World Canon Editor ──────────────────────────────────────────────────────

const CANON_KINDS: WorldCanonItem["kind"][] = ["character", "location", "object", "symbol", "law"]
const CANON_STATUSES: WorldCanonItem["status"][] = ["canon", "provisional", "single_story"]

function WorldCanonEditor() {
  const [items, setItems] = useState<WorldCanonItem[]>([])
  const [editing, setEditing] = useState<WorldCanonItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<WorldCanonItem>>({})

  useEffect(() => {
    const load = () => setItems(getWorldCanon())
    load()
    window.addEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
    return () => window.removeEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
  }, [])

  function openAdd() {
    setForm({ kind: "symbol", status: "provisional", name: "", meaning: "", neverMeans: "" })
    setAdding(true); setEditing(null)
  }
  function openEdit(item: WorldCanonItem) {
    setForm({ ...item }); setEditing(item); setAdding(false)
  }
  function save() {
    if (!form.name?.trim() || !form.meaning?.trim()) return
    saveWorldCanonItem(form as Omit<WorldCanonItem, "id"> & { id?: string })
    setItems(getWorldCanon()); setAdding(false); setEditing(null); setForm({})
  }
  function remove(id: string) {
    const defaultIds = new Set(DEFAULT_WORLD_CANON.map((d) => d.id))
    if (defaultIds.has(id)) return
    deleteWorldCanonItem(id); setItems(getWorldCanon())
  }

  const defaultIds = new Set(DEFAULT_WORLD_CANON.map((d) => d.id))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-[#0F172A]">World canon</h3>
        <button onClick={openAdd} className="flex items-center gap-1 text-xs font-medium text-[#0F172A] hover:text-blue-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <p className="text-xs text-[#94A3B8] mb-4">Characters, laws, symbols, and objects that recur inside Trust Tai stories.</p>

      {(adding || editing) && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-bold text-blue-900">{adding ? "New canon item" : "Edit canon item"}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Kind</label>
              <select value={form.kind ?? "symbol"} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as WorldCanonItem["kind"] }))} className="w-full text-xs rounded border border-gray-200 px-2 py-1.5 bg-white">
                {CANON_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Status</label>
              <select value={form.status ?? "provisional"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as WorldCanonItem["status"] }))} className="w-full text-xs rounded border border-gray-200 px-2 py-1.5 bg-white">
                {CANON_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Name</label>
            <input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. The brass mechanism" className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white placeholder:text-[#94A3B8]" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">What it means</label>
            <textarea value={form.meaning ?? ""} onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value }))} placeholder="What this element represents in Trust Tai's world" rows={2} className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white placeholder:text-[#94A3B8] resize-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">What it never means</label>
            <input value={form.neverMeans ?? ""} onChange={(e) => setForm((f) => ({ ...f, neverMeans: e.target.value }))} placeholder="The misreading Studio should avoid" className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white placeholder:text-[#94A3B8]" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={!form.name?.trim() || !form.meaning?.trim()} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0F172A] text-white disabled:opacity-40">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); setForm({}) }} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8]">{item.kind}</span>
                <p className="text-sm font-semibold text-[#0F172A]">{item.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] bg-gray-50 border border-gray-200 rounded px-2 py-0.5">{item.status}</span>
                <button onClick={() => openEdit(item)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"><Pencil className="w-3 h-3" /></button>
                {!defaultIds.has(item.id) && (
                  <button onClick={() => remove(item.id)} className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                )}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">{item.meaning}</p>
            {item.neverMeans && <p className="text-[10px] text-[#94A3B8] mt-0.5">Never means: {item.neverMeans}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Conflicts Panel ──────────────────────────────────────────────────────────

function ConflictsPanel() {
  const [conflicts, setConflicts] = useState(
    typeof window !== "undefined" ? getPrincipleConflicts() : []
  )
  const principles = typeof window !== "undefined" ? getStudioPrinciples() : []

  useEffect(() => {
    const load = () => setConflicts(getPrincipleConflicts())
    load()
    window.addEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
    return () => window.removeEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
  }, [])

  function principleTitle(id: string): string {
    return principles.find((p) => p.id === id)?.title ?? id
  }

  if (conflicts.length === 0) return null

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-bold text-amber-900">Principle conflicts detected</h3>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">{conflicts.length}</span>
      </div>
      <p className="text-xs text-amber-700 mb-4">Studio found principles that may pull in opposite directions. Review and resolve.</p>
      <div className="space-y-4">
        {conflicts.map((conflict) => (
          <div key={conflict.id} className="bg-white rounded-lg border border-amber-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs leading-relaxed text-[#0F172A]">{conflict.description}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                conflict.severity === "major" ? "bg-red-100 text-red-700"
                : conflict.severity === "moderate" ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-[#64748B]"
              }`}>{conflict.severity}</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] mb-3">&ldquo;{principleTitle(conflict.principleA)}&rdquo; vs &ldquo;{principleTitle(conflict.principleB)}&rdquo;</p>
            <button onClick={() => { resolveConflict(conflict.id, "Tai reviewed"); setConflicts(getPrincipleConflicts()) }} className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1">
              <Check className="w-3 h-3" /> Mark resolved
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Memory section ───────────────────────────────────────────────────────────

function MemorySection() {
  const [principles, setPrinciples] = useState<StudioPrinciple[]>([])

  useEffect(() => {
    const load = () => setPrinciples(getStudioPrinciples())
    load()
    window.addEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
    return () => window.removeEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
  }, [])

  const grouped = ["World", "Voice", "Story", "Taste", "Audience"].map((layer) => ({
    layer,
    count: principles.filter((p) => layerLabel(p.layer) === layer).length,
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A]">Memory</h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            What Studio believes, why it believes it, and how carefully it may apply that belief.
          </p>
        </div>
        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg mt-1">
          Needs Tai confirmation
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-3">
          Intelligence layers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {grouped.map((item) => (
            <div key={item.layer} className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-semibold text-[#0F172A]">{item.layer}</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                {item.count} principle{item.count === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">Learned principles</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              High confidence should guide Studio. It should not trap it.
            </p>
          </div>
          <button className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">
            Review pending
          </button>
        </div>
        <div className="space-y-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#0F172A] bg-gray-100 px-2 py-0.5 rounded">
                      {layerLabel(principle.layer)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                      {principle.confidence}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] bg-white border border-gray-200 px-2 py-0.5 rounded">
                      {principle.behavior}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#0F172A]">{principle.title}</h4>
                  <p className="text-sm text-[#64748B] leading-relaxed mt-1">
                    {principle.belief}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 md:w-64 flex-shrink-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Evidence</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{principle.evidenceEventIds.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Scope</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{scopeLabel(principle.scope)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Last</p>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {new Date(principle.lastReinforcedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-2">Correction labels</h3>
          <p className="text-xs text-[#94A3B8] mb-4">
            Used when Tai teaches Studio why a direction worked or failed.
          </p>
          <div className="flex flex-wrap gap-2">
            {CORRECTION_LABELS.map((label) => (
              <span
                key={label}
                className="text-xs font-medium text-[#0F172A] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <WorldCanonEditor />
        <ConflictsPanel />
      </div>

      <div className="bg-[#0F172A] rounded-xl p-5 text-white">
        <p className="text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">
          Learning rule
        </p>
        <p className="text-sm leading-relaxed text-white/85">
          Studio may suggest a principle. Tai decides whether it is correct, partly correct,
          wrong, local to one production, or strong enough to become a Studio principle.
        </p>
      </div>
    </div>
  )
}

// ─── Production section ───────────────────────────────────────────────────────

function ProductionSection() {
  const [autoConceptGen, setAutoConceptGen] = useState(true)
  const [autoContinuityCheck, setAutoContinuityCheck] = useState(true)
  const [autoFrameVariations, setAutoFrameVariations] = useState(false)
  const [autoRenderAfterApproval, setAutoRenderAfterApproval] = useState(false)
  const [memorySuggestions, setMemorySuggestions] = useState(true)
  const [costLimit, setCostLimit] = useState("25")
  const [approvalGate, setApprovalGate] = useState("10")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A]">Production</h2>
        <p className="text-sm text-[#64748B] mt-1">Cost controls, approval gates, and automation for every production.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Cost controls</h3>
        <p className="text-xs text-[#64748B] mb-5">Budgets and approval gates prevent runaway generation costs.</p>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Per-production budget</p>
              <p className="text-xs text-[#64748B] mt-0.5">Maximum spend per production before a warning fires.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#64748B]">$</span>
              <input value={costLimit} onChange={e => setCostLimit(e.target.value)}
                className="w-20 text-sm text-right px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]"
                type="number" min="0" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Approval gate at</p>
              <p className="text-xs text-[#64748B] mt-0.5">Pause and require approval when spend exceeds this amount.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#64748B]">$</span>
              <input value={approvalGate} onChange={e => setApprovalGate(e.target.value)}
                className="w-20 text-sm text-right px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]"
                type="number" min="0" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Automation</h3>
        <p className="text-xs text-[#64748B] mb-5">What the Studio does automatically without waiting for a decision.</p>
        <div className="space-y-4">
          {[
            { label: "Auto concept generation", sub: "Generate 3 concept directions when a post is approved.", val: autoConceptGen, set: setAutoConceptGen },
            { label: "Auto continuity check", sub: "Run a continuity scan after every frame render.", val: autoContinuityCheck, set: setAutoContinuityCheck },
            { label: "Auto frame variations", sub: "Generate 3 frame alternates after master frame approval.", val: autoFrameVariations, set: setAutoFrameVariations },
            { label: "Auto-render after approval", sub: "Begin scene generation immediately after frames are approved.", val: autoRenderAfterApproval, set: setAutoRenderAfterApproval },
            { label: "Memory suggestions", sub: "Surface relevant World Bible entries at each approval gate.", val: memorySuggestions, set: setMemorySuggestions },
          ].map(({ label, sub, val, set }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{sub}</p>
              </div>
              <Toggle on={val} onChange={set} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Quality thresholds</h3>
        <p className="text-xs text-[#64748B] mb-5">Minimum scores before an asset can proceed to the next gate.</p>
        <div className="space-y-4">
          {[
            { label: "Frame continuity minimum", value: "80%", note: "Below this, frame is flagged for review before scene generation." },
            { label: "Script-to-post alignment minimum", value: "85%", note: "Below this, script is flagged with divergence warning." },
            { label: "Coherence check threshold", value: "75%", note: "Below this, character coherence warning surfaces before approval." },
          ].map(({ label, value, note }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{note}</p>
              </div>
              <span className="text-sm font-bold text-[#0F172A] flex-shrink-0">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Release section ───────────────────────────────────────────────────────────

function ReleaseSection() {
  const [defaultRatio, setDefaultRatio] = useState("9:16")
  const [defaultDuration, setDefaultDuration] = useState("30-45s")
  const [autoCaptions, setAutoCaptions] = useState(true)
  const [exportQuality, setExportQuality] = useState("1080p")
  const [namingPattern, setNamingPattern] = useState("{title}_{date}_{format}")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A]">Release</h2>
        <p className="text-sm text-[#64748B] mt-1">Format defaults, export quality, and naming conventions for every package.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Format defaults</h3>
        <p className="text-xs text-[#64748B] mb-5">Applied to every new production unless overridden at the frame or scene stage.</p>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Default aspect ratio</p>
              <p className="text-xs text-[#64748B] mt-0.5">Portrait-first for LinkedIn and Instagram Reels.</p>
            </div>
            <select value={defaultRatio} onChange={e => setDefaultRatio(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]">
              {["9:16", "1:1", "16:9", "4:5"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Default duration target</p>
              <p className="text-xs text-[#64748B] mt-0.5">Script pacing and scene timing are calibrated to this range.</p>
            </div>
            <select value={defaultDuration} onChange={e => setDefaultDuration(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]">
              {["15-20s", "20-30s", "30-45s", "45-60s", "60-90s"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Auto-generate captions</p>
              <p className="text-xs text-[#64748B] mt-0.5">Generate a captioned variant for every approved film.</p>
            </div>
            <Toggle on={autoCaptions} onChange={setAutoCaptions} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Export quality</p>
              <p className="text-xs text-[#64748B] mt-0.5">Resolution for final package exports.</p>
            </div>
            <select value={exportQuality} onChange={e => setExportQuality(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]">
              {["720p", "1080p", "4K"].map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">File naming</h3>
        <p className="text-xs text-[#64748B] mb-4">Pattern for exported files. Variables: {"{title}"}, {"{date}"}, {"{format}"}, {"{version}"}.</p>
        <input value={namingPattern} onChange={e => setNamingPattern(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A] font-mono" />
        <p className="text-xs text-[#94A3B8] mt-2">Preview: the-man-who-carried_2026-07-28_9x16</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Auto-generated format variants</h3>
        <p className="text-xs text-[#64748B] mb-5">Variants generated automatically from the master cut after final approval.</p>
        <div className="space-y-3">
          {[
            { label: "Vertical (9:16)", sub: "LinkedIn / Instagram Reels default", active: true },
            { label: "Square (1:1)", sub: "Instagram feed", active: true },
            { label: "Landscape (16:9)", sub: "YouTube / embeds", active: false },
            { label: "Captioned", sub: "Open captions burned in", active: true },
            { label: "Clean (no captions)", sub: "For overlay or re-captioning", active: false },
            { label: "Audio-described", sub: "Accessibility variant", active: false },
          ].map(({ label, sub, active }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B]">{sub}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-[#94A3B8]"}`}>{active ? "On" : "Off"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Brand section ────────────────────────────────────────────────────────────

function BrandSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A]">Brand</h2>
        <p className="text-sm text-[#64748B] mt-1">Visual tokens, color palette, and typographic standards that govern the world.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Color palette</h3>
        <p className="text-xs text-[#64748B] mb-5">The approved palette for all productions.</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "Warm Cream", hex: "#F4F1EA", role: "Base / background" },
            { name: "Deep Navy", hex: "#1A2332", role: "Primary / text" },
            { name: "Studio Gold", hex: "#C29A5B", role: "Accent / CTA" },
            { name: "Trust Blue", hex: "#2F62D8", role: "Link / action" },
            { name: "Forest Green", hex: "#22A06B", role: "Approval / success" },
            { name: "Amber", hex: "#E8802A", role: "Warning / caution" },
            { name: "Midtone", hex: "#4A5568", role: "Body text" },
            { name: "Muted", hex: "#8A8578", role: "Meta / captions" },
          ].map(({ name, hex, role }) => (
            <div key={name} className="space-y-2">
              <div className="h-12 rounded-lg border border-gray-100" style={{ backgroundColor: hex }} />
              <div>
                <p className="text-[11px] font-semibold text-[#0F172A]">{name}</p>
                <p className="text-[10px] font-mono text-[#94A3B8]">{hex}</p>
                <p className="text-[10px] text-[#64748B]">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Typography</h3>
        <p className="text-xs text-[#64748B] mb-5">Typefaces across productions and the Studio interface.</p>
        <div className="space-y-4">
          {[
            { role: "Display / headings", family: "Playfair Display", usage: "Film titles, post headers, section headings", serif: true },
            { role: "Body / UI", family: "Inter", usage: "All UI text, captions, descriptions", serif: false },
            { role: "Mono / code", family: "JetBrains Mono", usage: "File names, IDs, technical metadata", serif: false },
          ].map(({ role, family, usage, serif }) => (
            <div key={role} className="py-3 border-t border-gray-100 first:border-0 first:pt-0">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{role}</p>
              <p className="text-base font-medium text-[#0F172A]" style={{ fontFamily: serif ? "serif" : "inherit" }}>{family}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{usage}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Visual prohibitions</h3>
        <p className="text-xs text-[#64748B] mb-5">Never permitted regardless of concept direction.</p>
        <div className="space-y-2">
          {[
            "Blue-teal color grading (the Netflix look)",
            "Desaturated / washed-out palettes",
            "Lens flare as a stylistic choice",
            "Stock-photography aesthetic",
            "Crowded or chaotic compositions",
            "Centered talking-head framing without environmental context",
            "Comic-book or illustrated overlay styles",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <p className="text-sm text-[#0F172A]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Engine section ───────────────────────────────────────────────────────────

function EngineSection() {
  const [imageModel, setImageModel] = useState("openai/gpt-image-1.5")
  const [videoModel, setVideoModel] = useState("fal/kling-2")
  const [fallbackModel, setFallbackModel] = useState("fal/wan-2.6")
  const [imageFallback, setImageFallback] = useState("fal/flux-pro")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A]">Engine</h2>
        <p className="text-sm text-[#64748B] mt-1">Model routing, preferred providers, and fallback order. Changes affect new productions only.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Model routing</h3>
        <p className="text-xs text-[#64748B] mb-5">Preferred models for each generation task.</p>
        <div className="space-y-5">
          {[
            { label: "Image generation", sub: "Frames, keyframes, character renders.", val: imageModel, set: setImageModel, opts: ["openai/gpt-image-1.5", "fal/flux-pro", "fal/ideogram-v3"] },
            { label: "Image fallback", sub: "Used when primary model fails or times out.", val: imageFallback, set: setImageFallback, opts: ["fal/flux-pro", "fal/ideogram-v3", "openai/gpt-image-1.5"] },
            { label: "Video / motion", sub: "Scene generation and motion clips.", val: videoModel, set: setVideoModel, opts: ["fal/kling-2", "fal/wan-2.6", "fal/minimax-video"] },
            { label: "Video fallback", sub: "Used when primary video model fails.", val: fallbackModel, set: setFallbackModel, opts: ["fal/wan-2.6", "fal/kling-2", "fal/minimax-video"] },
          ].map(({ label, sub, val, set, opts }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{sub}</p>
              </div>
              <select value={val} onChange={e => set(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0F172A]">
                {opts.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Task routing</h3>
        <p className="text-xs text-[#64748B] mb-5">Which model handles each Studio intelligence task.</p>
        <div className="space-y-3">
          {[
            { task: "Concept generation", model: "claude-sonnet-4", note: "Narrative reasoning" },
            { task: "Script writing", model: "claude-sonnet-4", note: "Long-form structured output" },
            { task: "Post intelligence", model: "gpt-5.4-mini", note: "Analysis and extraction" },
            { task: "Memory suggestions", model: "gpt-5.4-mini", note: "Vector similarity + ranking" },
            { task: "Coherence checks", model: "gpt-5.4", note: "Vision + reasoning" },
            { task: "Pattern analysis", model: "gpt-5.4", note: "Cross-production synthesis" },
          ].map(({ task, model, note }) => (
            <div key={task} className="flex items-start justify-between gap-4 py-2.5 border-t border-gray-100 first:border-0 first:pt-0">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{task}</p>
                <p className="text-xs text-[#64748B]">{note}</p>
              </div>
              <span className="text-xs font-mono font-medium text-[#0F172A] flex-shrink-0 bg-gray-50 border border-gray-200 px-2 py-1 rounded">{model}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Data & security section ──────────────────────────────────────────────────

function DataSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A]">Data & security</h2>
        <p className="text-sm text-[#64748B] mt-1">Export your data, manage access, and control what the Studio retains.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Export</h3>
        <p className="text-xs text-[#64748B] mb-5">Full data export includes productions, scripts, frames, packages, world bible, signals, and memory.</p>
        <div className="space-y-3">
          {[
            { label: "Full Studio export", sub: "Everything — productions, world, memory, signals", format: ".zip" },
            { label: "Productions only", sub: "Posts, scripts, frame metadata, and packages", format: ".json" },
            { label: "World Bible", sub: "Constitution, voice, characters, symbols, visual rules, memory", format: ".md" },
            { label: "Signals data", sub: "Performance records and pattern analysis", format: ".csv" },
          ].map(({ label, sub, format }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B]">{sub}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50">
                Export {format}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Data deletion</h3>
        <p className="text-xs text-[#64748B] mb-5">Permanent actions. Cannot be undone.</p>
        <div className="space-y-3">
          {[
            { label: "Clear all signals", sub: "Remove all performance records and pattern analysis", high: false },
            { label: "Reset memory", sub: "Delete all learned preferences and locked truths", high: true },
            { label: "Delete all productions", sub: "Remove all productions, scripts, frames, and packages", high: true },
          ].map(({ label, sub, high }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#64748B]">{sub}</p>
              </div>
              <button className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${high ? "border-red-200 text-red-600 hover:bg-red-50" : "border-gray-200 text-[#64748B] hover:bg-gray-50"}`}>
                {high ? "Delete…" : "Clear…"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Workspace access</h3>
        <p className="text-xs text-[#64748B] mb-5">Who can access this Studio workspace.</p>
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2" style={{ borderColor: "#C29A5B", color: "#C29A5B" }}>TS</div>
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Tai Shobajo</p>
              <p className="text-xs text-[#64748B]">Owner</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#64748B]">Full access</span>
        </div>
        <button className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Invite collaborator
        </button>
      </div>
    </div>
  )
}

// ─── Right panel — Current standard ──────────────────────────────────────────

function CurrentStandardPanel({ activeSection }: { activeSection: SettingsSection }) {
  const [principleCount, setPrincipleCount] = useState(0)

  useEffect(() => {
    if (activeSection !== "memory") return
    const load = () => setPrincipleCount(getStudioPrinciples().length)
    load()
    window.addEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
    return () => window.removeEventListener(STUDIO_MEMORY_CHANGED_EVENT, load)
  }, [activeSection])

  if (activeSection === "memory") {
    return (
      <div className="space-y-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-[#0F172A]">Learning standard</p>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 space-y-2.5">
          {[
            { label: "Principles", value: `${principleCount}` },
            { label: "Canon items", value: `${DEFAULT_WORLD_CANON.length}` },
            { label: "Default scope", value: "This production" },
            { label: "Autonomy", value: "Recommend only" },
            { label: "Global rules", value: "Require Tai" },
            { label: "Audience data", value: "Not connected" },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3">
              <span className="text-xs text-[#94A3B8] flex-shrink-0">{row.label}</span>
              <span className="text-xs text-[#0F172A] text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm italic text-[#0F172A] leading-relaxed">
            &ldquo;High confidence is guidance. It is not a cage.&rdquo;
          </p>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
            Protected learning
          </p>
          <div className="space-y-2">
            {[
              "No auto-canonization",
              "No global rule from one production",
              "Evidence required",
              "Exceptions preserved",
              "Tai can reset patterns",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">{item}</span>
                <Lock className="w-3 h-3 text-[#94A3B8]" />
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50 space-y-0.5">
          <p className="text-xs text-[#94A3B8]">Seeded from STUDIO_INTELLIGENCE.md</p>
          <p className="text-xs text-[#94A3B8]">Creative Memory Foundation</p>
          <p className="text-xs text-[#94A3B8]">V1 local-first</p>
        </div>
      </div>
    )
  }

  if (activeSection !== "voice") return null

  return (
    <div className="space-y-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-[#0F172A]">Current standard</p>
      </div>

      {/* Summary rows */}
      <div className="px-5 py-4 border-b border-gray-100 space-y-2.5">
        {[
          { label: "Tone", value: "Calm and direct" },
          { label: "Perspective", value: "Overview before action" },
          { label: "Structure", value: "Scene to truth to practical value" },
          { label: "CTA", value: "No pressure" },
          { label: "Sentence warning", value: "32 words" },
          { label: "Banned words", value: "7" },
        ].map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <span className="text-xs text-[#94A3B8] flex-shrink-0">{row.label}</span>
            <span className="text-xs text-[#0F172A] text-right">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm italic text-[#0F172A] leading-relaxed">
          &ldquo;Studio may sharpen the language. It may not invent what Tai believes.&rdquo;
        </p>
      </div>

      {/* System-owned */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
          System-owned
        </p>
        <div className="space-y-2">
          {SYSTEM_OWNED.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs ${
                  item.status === "Locked" ? "text-[#94A3B8]" : "text-amber-600"
                }`}>
                  {item.status}
                </span>
                <Lock className="w-3 h-3 text-[#94A3B8]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-2.5 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <span className="text-amber-500 text-base flex-shrink-0">ⓘ</span>
          <div>
            <p className="text-xs text-[#64748B] leading-relaxed mb-1.5">
              These controls stay protected so a writing preference cannot destabilize production.
            </p>
            <button className="text-xs font-medium text-amber-700 hover:underline">
              View engine configuration
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-gray-50 space-y-0.5">
        <p className="text-xs text-[#94A3B8]">Last changed July 31, 9:42 PM</p>
        <p className="text-xs text-[#94A3B8]">Seeded from studio-engine.ts</p>
        <p className="text-xs text-[#94A3B8]">Version 1.3</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("voice")
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(true)
  const [dirtyCount, setDirtyCount] = useState(0)
  const voiceStateRef = React.useRef<{ primaryVoice: string; ctaPosture: string; defaultAudience: string; banned: string[]; warnings: typeof DEFAULT_WARNINGS } | null>(null)

  function markDirty() {
    setDirty(true)
    setSaved(false)
    setDirtyCount((n) => n + 1)
  }

  function handleVoiceStateChange(state: typeof voiceStateRef.current) {
    voiceStateRef.current = state
  }

  function handleSave() {
    if (voiceStateRef.current) {
      const { primaryVoice, ctaPosture, defaultAudience, banned, warnings } = voiceStateRef.current
      saveVoiceSettings({
        primaryVoice,
        ctaPosture: ctaPosture as "Invitation only when earned" | "Never include a CTA" | "Soft close on every post",
        defaultAudience,
        bannedWords: banned,
        sentenceLengthWarning: 32,
        exclamationMarkWarning: warnings.find((w) => w.rule === "Exclamation marks")?.on ?? true,
        hashtagWarning: warnings.find((w) => w.rule === "Hashtags in body")?.on ?? true,
        pressureCTAWarning: warnings.find((w) => w.rule === "Pressure CTAs")?.on ?? true,
        emDashWarning: warnings.find((w) => w.rule === "Em dashes")?.on ?? true,
        consultingClicheWarning: warnings.find((w) => w.rule === "Consulting clichés")?.on ?? true,
      })
    }
    setDirty(false)
    setSaved(true)
    setDirtyCount(0)
  }

  function handleDiscard() {
    setDirty(false)
    setSaved(true)
    setDirtyCount(0)
  }

  return (
    <Shell>
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white bg-opacity-70 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold uppercase tracking-wider">Studio Standard</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by title, idea, or visual direction"
                className="pl-8 pr-4 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] w-64"
              />
            </div>
            {/* Save state */}
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <span className="text-green-600">✓</span> All changes saved
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                {dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}
              </span>
            )}
            <button className="p-1 rounded text-[#94A3B8] hover:text-[#0F172A]">
              ⋮
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 px-6 py-8">
          {/* H1 */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-[#0F172A] leading-none tracking-tight">
              How Studio works.
            </h1>
            <p className="text-sm text-[#64748B] mt-2">
              Change the standards you own.{" "}
              <span className="text-[#0F172A] font-medium">See the systems Studio protects.</span>
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8]">
              <span>Private workspace</span>
              <span>·</span>
              <span>Tai only</span>
            </div>
          </div>

          {/* Three-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left nav */}
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3 px-2">
                Settings
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeSection === item.key
                        ? "bg-white shadow-sm border border-gray-200 text-[#0F172A] font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:bg-opacity-50"
                    }`}
                  >
                    <span className={activeSection === item.key ? "text-[#0F172A]" : "text-[#94A3B8]"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}

                {/* V1 notice */}
                <div className="mt-4 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    System-owned settings are visible but cannot be edited in V1.
                  </p>
                </div>
              </nav>
            </div>

            {/* Center content */}
            <div className="lg:col-span-7 pb-24">
              {activeSection === "voice" && (
                <VoiceSection onDirty={markDirty} onStateChange={handleVoiceStateChange} />
              )}
              {activeSection === "memory" && (
                <MemorySection />
              )}
              {activeSection === "production" && <ProductionSection />}
              {activeSection === "release" && <ReleaseSection />}
              {activeSection === "brand" && <BrandSection />}
              {activeSection === "engine" && <EngineSection />}
              {activeSection === "data" && <DataSection />}
            </div>

            {/* Right panel */}
            <div className="lg:col-span-3">
              <CurrentStandardPanel activeSection={activeSection} />
            </div>
          </div>
        </div>

        {/* Sticky save bar */}
        {dirty && (
          <div className="fixed bottom-0 left-0 right-0 md:left-[140px] z-30 bg-white border-t border-gray-200 shadow-lg px-8 py-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              {dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#94A3B8] hidden md:block">
                Changes apply to new drafts. Existing approved work is not rewritten.
              </p>
              <button
                onClick={handleDiscard}
                className="px-5 py-2 text-sm font-medium text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                Save voice standard
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
