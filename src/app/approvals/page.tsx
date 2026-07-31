"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import {
  GATE_LABELS,
  GATE_ORDER,
  GATE_QUESTIONS,
  approvedGateCount,
  stageLabel,
  type GateKey,
  type Production,
} from "@/data/studio"
import {
  getProductions,
  PRODUCTIONS_CHANGED_EVENT,
  setGate,
  updateProduction,
} from "@/lib/studio-store"
import {
  Check,
  CircleDashed,
  Clapperboard,
  MessageSquare,
  PauseCircle,
  ShieldAlert,
  ShieldCheck,
  Undo2,
} from "lucide-react"

function formatWhen(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function ApprovalDesk() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const querySelectedId = searchParams.get("id")
  const [productions, setProductions] = useState<Production[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = () => {
      setProductions(getProductions())
      setLoaded(true)
    }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const selected =
    productions.find((p) => p.id === (selectedId ?? querySelectedId)) ??
    productions[0] ??
    null

  function decide(gate: GateKey, status: "approved" | "hold" | "open") {
    if (!selected) return
    setGate(selected.id, gate, status)
    const verb =
      status === "approved" ? "approved" : status === "hold" ? "put on hold" : "reopened"
    updateProduction(selected.id, (p) => ({
      ...p,
      revisions: [
        { at: new Date().toISOString(), note: `Gate "${GATE_LABELS[gate]}" ${verb}.` },
        ...p.revisions,
      ],
    }))
  }

  function addNote() {
    if (!selected || note.trim().length === 0) return
    const text = note.trim()
    updateProduction(selected.id, (p) => ({
      ...p,
      comments: [{ at: new Date().toISOString(), text }, ...p.comments],
    }))
    setNote("")
  }

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Approval Desk</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Five gates. Every decision is yours, and every decision is reversible.
            </p>
          </div>
          {productions.length > 0 && (
            <select
              value={selected?.id ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] max-w-full md:max-w-md"
            >
              {productions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({stageLabel(p)})
                </option>
              ))}
            </select>
          )}
        </div>

        {loaded && productions.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-[#0F172A] mb-1">
              Nothing is waiting for review.
            </p>
            <p className="text-sm text-[#64748B] mb-4">
              Productions arrive here after a thought is captured in the Thinking Room.
            </p>
            <button
              onClick={() => router.push("/thinking-room")}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Capture a thought
            </button>
          </div>
        )}

        {selected && (
          <>
            {/* Gate controls */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Approval gates</h2>
                <span className="text-xs text-[#94A3B8]">
                  {approvedGateCount(selected)} of 5 approved
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {GATE_ORDER.map((gate) => {
                  const g = selected.gates[gate]
                  return (
                    <div
                      key={gate}
                      className={`rounded-lg border p-3.5 ${
                        g.status === "approved"
                          ? "border-green-200 bg-green-50"
                          : g.status === "hold"
                          ? "border-amber-200 bg-amber-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {g.status === "approved" ? (
                          <Check className="w-3.5 h-3.5 text-green-700" />
                        ) : g.status === "hold" ? (
                          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <CircleDashed className="w-3.5 h-3.5 text-[#94A3B8]" />
                        )}
                        <p className="text-xs font-semibold text-[#0F172A]">
                          {GATE_LABELS[gate]}
                        </p>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-snug mb-3 min-h-[3.5em]">
                        {GATE_QUESTIONS[gate]}
                      </p>
                      {g.status === "approved" ? (
                        <button
                          onClick={() => decide(gate, "open")}
                          className="w-full py-1.5 text-[11px] font-semibold text-[#64748B] border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Undo2 className="w-3 h-3" />
                          Reopen
                        </button>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => decide(gate, "approved")}
                            className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => decide(gate, g.status === "hold" ? "open" : "hold")}
                            className="flex-1 py-1.5 text-[11px] font-semibold text-[#64748B] border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {g.status === "hold" ? "Release hold" : "Hold"}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {selected.gates.post.status === "approved" && (
                <button
                  onClick={() => router.push(`/film-studio?id=${selected.id}`)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Clapperboard className="w-4 h-4" />
                  Post approved. Continue in the Film Studio.
                </button>
              )}
            </div>

            {/* Thought + argument */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-[#0F172A] mb-2">
                    Original thought
                  </h2>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    {selected.sourceType}, captured {formatWhen(selected.createdAt)}
                  </p>
                  <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                    {selected.sourceThought}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {selected.voiceWarnings.length === 0 ? (
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    )}
                    <h2 className="text-sm font-semibold text-[#0F172A]">Voice warnings</h2>
                  </div>
                  {selected.voiceWarnings.length === 0 ? (
                    <p className="text-sm text-[#64748B]">
                      The draft passes every Trust Tai voice rule.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {selected.voiceWarnings.map((w, i) => (
                        <li key={i}>
                          <p className="text-xs font-semibold text-amber-700">{w.rule}</p>
                          <p className="text-xs text-[#64748B] leading-relaxed">{w.detail}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#0F172A]">
                      Current argument
                    </h2>
                    <span className="text-xs text-[#94A3B8]">
                      Each section with why it exists
                    </span>
                  </div>
                  <div className="space-y-5">
                    {selected.sections.map((s) => (
                      <div
                        key={s.name}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-6"
                      >
                        <div className="lg:col-span-2">
                          <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                            {s.name}
                          </p>
                          <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                            {s.text}
                          </p>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed lg:pt-5">
                          {s.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes + history */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Tai notes</h2>
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addNote()
                    }}
                    placeholder="What should change, or what to protect"
                    className="flex-1 min-w-0 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB]"
                  />
                  <button
                    onClick={addNote}
                    disabled={note.trim().length === 0}
                    className="h-9 px-4 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white text-sm font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                {selected.comments.length === 0 ? (
                  <p className="text-xs text-[#94A3B8]">No notes yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {selected.comments.map((c, i) => (
                      <li key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                        <p className="text-sm text-[#0F172A] leading-relaxed">{c.text}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">{formatWhen(c.at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
                  Revision history
                </h2>
                {selected.revisions.length === 0 ? (
                  <p className="text-xs text-[#94A3B8]">No revisions recorded.</p>
                ) : (
                  <ul className="space-y-3">
                    {selected.revisions.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] mt-1.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-[#0F172A] leading-relaxed">{r.note}</p>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">{formatWhen(r.at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}

export default function ApprovalsPage() {
  return (
    <Suspense>
      <ApprovalDesk />
    </Suspense>
  )
}
