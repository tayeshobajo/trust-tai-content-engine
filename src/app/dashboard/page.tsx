"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  GATE_ORDER,
  GATE_QUESTIONS,
  GATE_SHORT_LABELS,
  approvedGateCount,
  nextGate,
  stageLabel,
  type GateKey,
  type Production,
} from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { ArrowRight, Clapperboard, PenLine, Stamp } from "lucide-react"

const GATE_COLORS: Record<GateKey, { dot: string; text: string; bg: string }> = {
  truth: { dot: "bg-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" },
  post: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  concept: { dot: "bg-orange-600", text: "text-orange-700", bg: "bg-orange-50" },
  keyframes: { dot: "bg-purple-600", text: "text-purple-700", bg: "bg-purple-50" },
  film: { dot: "bg-green-700", text: "text-green-800", bg: "bg-green-50" },
}

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = (day + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export default function CommandCenterPage() {
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
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

  const waitingAtGate = (gate: GateKey) =>
    productions.filter((p) => nextGate(p) === gate).length

  const packagesReady = productions.filter((p) => nextGate(p) === null).length
  const decisionQueue = productions
    .filter((p) => nextGate(p) !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  const weekStart = startOfWeek(new Date())
  const approvedThisWeek = productions.filter(
    (p) => p.gates.post.status === "approved" && (p.gates.post.decidedAt ?? "") >= weekStart.toISOString()
  ).length
  const filmsThisWeek = productions.filter(
    (p) => p.gates.film.status === "approved" && (p.gates.film.decidedAt ?? "") >= weekStart.toISOString()
  ).length

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Command Center</h1>
            <p className="text-sm text-[#64748B] mt-1">
              One clear thought becomes an approved argument and a film built around the same truth.
            </p>
          </div>
          <button
            onClick={() => router.push("/thinking-room")}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors self-start"
          >
            <PenLine className="w-4 h-4" />
            Capture a thought
          </button>
        </div>

        {/* Gate lanes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {GATE_ORDER.map((gate) => (
            <div
              key={gate}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${GATE_COLORS[gate].dot}`} />
                <p className="text-xs uppercase tracking-wider text-[#94A3B8]">
                  {GATE_SHORT_LABELS[gate]}
                </p>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{waitingAtGate(gate)}</p>
              <p className="text-xs text-[#64748B] mt-0.5">waiting at this gate</p>
            </div>
          ))}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <p className="text-xs uppercase tracking-wider text-[#94A3B8]">Packages</p>
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{packagesReady}</p>
            <p className="text-xs text-[#64748B] mt-0.5">ready to publish by hand</p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active productions */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Active productions</h2>
                <span className="text-xs text-[#94A3B8]">
                  {productions.length} in the studio
                </span>
              </div>
              {loaded && productions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-semibold text-[#0F172A] mb-1">
                    The studio floor is clear.
                  </p>
                  <p className="text-sm text-[#64748B] mb-4">
                    Everything starts with one thought worth arguing.
                  </p>
                  <button
                    onClick={() => router.push("/thinking-room")}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Open the Thinking Room
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {productions.map((p) => {
                    const gate = nextGate(p)
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          router.push(
                            gate === "concept" || gate === "keyframes" || gate === "film"
                              ? `/film-studio?id=${p.id}`
                              : gate === null
                              ? `/library`
                              : `/approvals?id=${p.id}`
                          )
                        }
                        className="w-full text-left py-3.5 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] leading-snug group-hover:text-blue-700 transition-colors">
                              {p.title}
                            </p>
                            <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                              {p.shift.end}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                  gate ? `${GATE_COLORS[gate].bg} ${GATE_COLORS[gate].text}` : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {stageLabel(p)}
                              </span>
                              <span className="text-[11px] text-[#94A3B8]">
                                {approvedGateCount(p)} of 5 gates approved
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right rail */}
          <div className="lg:col-span-4 space-y-5">
            {/* Decision queue */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Decisions due</h2>
                {decisionQueue.length > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    {decisionQueue.length}
                  </span>
                )}
              </div>
              {decisionQueue.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-4">
                  No gates waiting on you.
                </p>
              ) : (
                <div className="space-y-3">
                  {decisionQueue.map((p) => {
                    const gate = nextGate(p)
                    if (gate === null) return null
                    return (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/approvals?id=${p.id}`)}
                        className="w-full text-left pb-3 border-b border-gray-100 last:border-0 last:pb-0 group"
                      >
                        <p className="text-xs font-medium text-[#0F172A] leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          {GATE_QUESTIONS[gate]}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => router.push("/approvals")}
                className="mt-4 w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#64748B] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Stamp className="w-4 h-4" />
                Open Approval Desk
              </button>
            </div>

            {/* Weekly cadence */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Weekly cadence</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Posts approved this week</span>
                  <span className="text-sm font-bold text-[#0F172A]">{approvedThisWeek} of 3</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (approvedThisWeek / 3) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-[#64748B]">Films finished this week</span>
                  <span className="text-sm font-bold text-[#0F172A]">{filmsThisWeek} of 1</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-700 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, filmsThisWeek * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] mt-4 pt-3 border-t border-gray-100 leading-relaxed">
                Cadence is a target, not a trigger. Nothing publishes without you.
              </p>
            </div>

            {/* Film studio shortcut */}
            <button
              onClick={() => router.push("/film-studio")}
              className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-5 text-left hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <Clapperboard className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                    Film Studio
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Concepts, treatment, shots, keyframes
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
