"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import {
  GATE_LABELS,
  stageLabel,
  type ConceptKey,
  type Production,
} from "@/data/studio"
import { rebuildFilmPlanForConcept } from "@/lib/studio-engine"
import {
  getProductions,
  PRODUCTIONS_CHANGED_EVENT,
  updateProduction,
} from "@/lib/studio-store"
import {
  Check,
  CircleDashed,
  Clapperboard,
  Film,
  ImageIcon,
  ListChecks,
  Route,
} from "lucide-react"

function FilmStudio() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const querySelectedId = searchParams.get("id")
  const [productions, setProductions] = useState<Production[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  const postApproved = selected?.gates.post.status === "approved"
  const activeConcept = selected
    ? selected.film.concepts.find((c) => c.key === selected.film.selectedConcept) ?? null
    : null

  function selectConcept(key: ConceptKey) {
    if (!selected) return
    updateProduction(selected.id, (p) => ({
      ...p,
      film: rebuildFilmPlanForConcept(p.film, key),
      revisions: [
        {
          at: new Date().toISOString(),
          note: `Concept direction set to "${p.film.concepts.find((c) => c.key === key)?.name ?? key}". Treatment, shots, and keyframes rebuilt.`,
        },
        ...p.revisions,
      ],
    }))
  }

  function toggleContinuity(index: number) {
    if (!selected) return
    updateProduction(selected.id, (p) => ({
      ...p,
      film: {
        ...p.film,
        continuity: p.film.continuity.map((c, i) =>
          i === index ? { ...c, checked: !c.checked } : c
        ),
      },
    }))
  }

  const continuityDone = selected
    ? selected.film.continuity.filter((c) => c.checked).length
    : 0

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Film Studio</h1>
            <p className="text-sm text-[#64748B] mt-1">
              The post carries the argument. The film creates the experience.
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
              No productions in the studio yet.
            </p>
            <p className="text-sm text-[#64748B] mb-4">
              Films begin after a thought becomes an approved argument.
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
            {/* Approved post summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                    The truth this film must deepen
                  </p>
                  <p className="text-base font-semibold text-[#0F172A] leading-snug">
                    {selected.spine.rememberSentence}
                  </p>
                  <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                    {selected.shift.beginning} {selected.shift.end}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                    postApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {postApproved ? "Post approved" : "Post not yet approved"}
                </span>
              </div>
              {!postApproved && (
                <p className="text-xs text-[#64748B] mt-3 pt-3 border-t border-gray-100">
                  Concept work can be explored now, but nothing here should be produced
                  until the written argument clears its gate at the Approval Desk.
                </p>
              )}
            </div>

            {/* Concept directions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Concept directions
                </h2>
                <span className="text-xs text-[#94A3B8]">
                  Unconventional without meaning is expensive confusion
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {selected.film.concepts.map((c) => {
                  const isActive = selected.film.selectedConcept === c.key
                  return (
                    <div
                      key={c.key}
                      className={`bg-white rounded-lg border shadow-sm p-5 flex flex-col ${
                        isActive ? "border-blue-400" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wider text-[#94A3B8]">
                          {c.name}
                        </p>
                        {isActive && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A] leading-snug mb-3">
                        {c.premise}
                      </p>
                      <div className="space-y-3 flex-1">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">
                            What happens visually
                          </p>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{c.visualAction}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">
                            Why it earns attention
                          </p>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{c.whyItEarnsAttention}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">
                            What it represents
                          </p>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{c.represents}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">
                            The reveal
                          </p>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{c.reveal}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">
                            Producibility
                          </p>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{c.producibility}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-[#64748B]">{c.shotCount} shots</span>
                          <span className="text-xs font-medium text-[#0F172A]">{c.costEstimate.split(" (")[0]}</span>
                        </div>
                        <button
                          onClick={() => selectConcept(c.key)}
                          disabled={isActive}
                          className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700 cursor-default"
                              : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
                          }`}
                        >
                          {isActive ? "Direction locked in" : "Choose this direction"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Treatment + keyframes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Treatment</h2>
                  {activeConcept && (
                    <span className="text-xs text-[#94A3B8]">for {activeConcept.name}</span>
                  )}
                </div>
                <ol className="space-y-3">
                  {selected.film.treatment.map((beat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-[#64748B] text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[#0F172A] leading-relaxed">{beat}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Keyframe plan</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                      First frame
                    </p>
                    <p className="text-sm text-[#0F172A] leading-relaxed">
                      {selected.film.keyframes.firstFrame}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                      Last frame
                    </p>
                    <p className="text-sm text-[#0F172A] leading-relaxed">
                      {selected.film.keyframes.lastFrame}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                      Anchors before render
                    </p>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {selected.film.keyframes.anchors}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shot list */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clapperboard className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">Shot list</h2>
                <span className="text-xs text-[#94A3B8]">
                  {selected.film.shots.length} shots, 8 seconds each, 9:16 master
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3 w-10">#</th>
                      <th className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3">Shot</th>
                      <th className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3">Purpose</th>
                      <th className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium py-2">Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.film.shots.map((shot) => (
                      <tr key={shot.no} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pr-3 text-sm font-semibold text-[#0F172A] align-top">
                          {shot.no}
                        </td>
                        <td className="py-2.5 pr-3 text-sm text-[#0F172A] leading-relaxed align-top">
                          {shot.description}
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-[#64748B] leading-relaxed align-top">
                          {shot.purpose}
                        </td>
                        <td className="py-2.5 text-xs text-[#0F172A] align-top whitespace-nowrap">
                          {shot.route}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model route + continuity + readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Route className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Model route</h2>
                </div>
                <div className="space-y-3">
                  {selected.film.modelRoute.map((step) => (
                    <div key={step.role} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-[#0F172A]">{step.role}</p>
                        <p className="text-[11px] text-[#64748B] whitespace-nowrap">{step.model}</p>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">{step.why}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-3">
                  No renders run in V1. This is the plan the studio will execute by hand.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Continuity checklist</h2>
                  <span className="text-xs text-[#94A3B8]">
                    {continuityDone} of {selected.film.continuity.length}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {selected.film.continuity.map((item, i) => (
                    <li key={item.item}>
                      <button
                        onClick={() => toggleContinuity(i)}
                        className="flex items-start gap-2.5 text-left w-full group"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            item.checked
                              ? "bg-green-700 border-green-700"
                              : "border-gray-300 bg-white group-hover:border-gray-400"
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span
                          className={`text-xs leading-relaxed ${
                            item.checked ? "text-[#94A3B8] line-through" : "text-[#0F172A]"
                          }`}
                        >
                          {item.item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Package readiness</h2>
                <ul className="space-y-2.5 mb-4">
                  {(["concept", "keyframes", "film"] as const).map((gate) => {
                    const approved = selected.gates[gate].status === "approved"
                    return (
                      <li key={gate} className="flex items-center gap-2.5">
                        {approved ? (
                          <Check className="w-4 h-4 text-green-700 flex-shrink-0" />
                        ) : (
                          <CircleDashed className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                        )}
                        <span className={`text-sm ${approved ? "text-[#0F172A]" : "text-[#64748B]"}`}>
                          {GATE_LABELS[gate]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {activeConcept && (
                  <div className="pt-3 border-t border-gray-100 mb-4">
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                      Estimated render cost
                    </p>
                    <p className="text-sm text-[#0F172A]">{activeConcept.costEstimate}</p>
                  </div>
                )}
                <button
                  onClick={() => router.push(`/approvals?id=${selected.id}`)}
                  className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#64748B] hover:bg-gray-50 transition-colors"
                >
                  Decide at the Approval Desk
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}

export default function FilmStudioPage() {
  return (
    <Suspense>
      <FilmStudio />
    </Suspense>
  )
}
