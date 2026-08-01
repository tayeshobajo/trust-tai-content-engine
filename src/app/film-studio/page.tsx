"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import TeachStudio from "@/components/TeachStudio"
import {
  GATE_LABELS,
  GATE_ORDER,
  GATE_SHORT_LABELS,
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
  CheckCircle2,
  Circle,
  CircleDashed,
  Clapperboard,
  Film,
  ImageIcon,
  ListChecks,
  Route,
} from "lucide-react"

function GateStrip({ production }: { production: Production }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {GATE_ORDER.map((key, i) => {
        const status = production.gates[key].status
        const approved = status === "approved"
        const hold = status === "hold"
        const current =
          !approved &&
          !hold &&
          GATE_ORDER.slice(0, i).every((k) => production.gates[k].status === "approved")

        return (
          <div key={key} className="flex items-center flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                approved
                  ? "bg-green-100 text-green-700"
                  : hold
                  ? "bg-amber-100 text-amber-700"
                  : current
                  ? "bg-[#0F172A] text-white"
                  : "bg-gray-100 text-[#94A3B8]"
              }`}
            >
              {approved ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : hold ? (
                <Circle className="w-3 h-3" />
              ) : current ? (
                <Circle className="w-3 h-3" />
              ) : (
                <CircleDashed className="w-3 h-3" />
              )}
              {GATE_SHORT_LABELS[key]}
            </div>
            {i < GATE_ORDER.length - 1 && (
              <div
                className={`w-6 h-px mx-0.5 flex-shrink-0 ${
                  approved ? "bg-green-300" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

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

  const continuityDone = selected
    ? selected.film.continuity.filter((c) => c.checked).length
    : 0

  const continuityTotal = selected?.film.continuity.length ?? 0
  const continuityAllDone = continuityDone === continuityTotal && continuityTotal > 0

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

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6 max-w-5xl">

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
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] max-w-full md:max-w-sm"
            >
              {productions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {stageLabel(p)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Empty state */}
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
            {/* Gate progress */}
            <GateStrip production={selected} />

            {/* Truth anchor */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-8">
              <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-1.5">
                The truth this film must deepen
              </p>
              <p className="text-base font-semibold text-[#0F172A] leading-snug mb-2">
                {selected.spine.rememberSentence}
              </p>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {selected.shift.beginning} {selected.shift.end}
              </p>
              {!postApproved && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-xs text-[#64748B]">
                    The post hasn&apos;t cleared its gate yet. Explore concept work now, but nothing here runs until the written argument is approved.
                  </p>
                </div>
              )}
            </div>

            {/* ── SECTION 1: Concept direction ─────────────────────── */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#0F172A]">1. Choose a concept direction</h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Unconventional without meaning is expensive confusion. Pick the one that earns attention <em>because</em> it carries the argument.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {selected.film.concepts.map((c) => {
                  const isActive = selected.film.selectedConcept === c.key
                  return (
                    <div
                      key={c.key}
                      className={`bg-white rounded-lg border shadow-sm flex flex-col transition-shadow ${
                        isActive
                          ? "border-[#0F172A] shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Card header */}
                      <div className={`px-4 pt-4 pb-3 border-b ${isActive ? "border-gray-200" : "border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium">
                            {c.name}
                          </span>
                          {isActive && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#0F172A] text-white">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A] leading-snug">{c.premise}</p>
                      </div>

                      {/* Card body */}
                      <div className="px-4 py-3 space-y-2.5 flex-1 text-xs">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">What happens</p>
                          <p className="text-[#0F172A] leading-relaxed">{c.visualAction}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Why it earns attention</p>
                          <p className="text-[#64748B] leading-relaxed">{c.whyItEarnsAttention}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">The reveal</p>
                          <p className="text-[#64748B] leading-relaxed">{c.reveal}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-0.5">Producibility</p>
                          <p className="text-[#64748B] leading-relaxed">{c.producibility}</p>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-[#64748B]">{c.shotCount} shots</span>
                          <span className="text-xs font-medium text-[#0F172A]">
                            {c.costEstimate.split(" (")[0]}
                          </span>
                        </div>
                        <button
                          onClick={() => selectConcept(c.key)}
                          disabled={isActive}
                          className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#0F172A] text-white cursor-default"
                              : "bg-white border border-gray-300 text-[#0F172A] hover:bg-gray-50"
                          }`}
                        >
                          {isActive ? "Direction locked in" : "Choose this direction"}
                        </button>
                        {isActive && (
                          <div className="mt-2">
                            <TeachStudio
                              productionId={selected.id}
                              surface="film_studio"
                              target={`${c.name} concept`}
                              before={`${c.premise}\n\n${c.visualAction}`}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── SECTION 2: Treatment ─────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Film className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">2. Treatment</h2>
                {activeConcept && (
                  <span className="text-xs text-[#94A3B8]">— {activeConcept.name}</span>
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

            {/* ── SECTION 3: Shot list ─────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Clapperboard className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">3. Shot list</h2>
              </div>
              <p className="text-xs text-[#94A3B8] mb-4 ml-6">
                {selected.film.shots.length} shots — approve all frames first, then test motion before paying for render
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3 w-8">#</th>
                      <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3 w-16">Route</th>
                      <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium py-2 pr-3">Shot</th>
                      <th className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium py-2">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.film.shots.map((shot) => (
                      <tr key={shot.no} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pr-3 text-sm font-semibold text-[#0F172A] align-top">
                          {shot.no}
                        </td>
                        <td className="py-2.5 pr-3 align-top">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#64748B] whitespace-nowrap">
                            {shot.route}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-sm text-[#0F172A] leading-relaxed align-top">
                          {shot.description}
                        </td>
                        <td className="py-2.5 text-xs text-[#64748B] leading-relaxed align-top">
                          {shot.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── SECTION 4: Keyframes ─────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">4. Keyframes</h2>
              </div>
              <p className="text-xs text-[#94A3B8] mb-4 ml-6">
                Approve world, character, and composition here before any motion is generated
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-1.5">First frame</p>
                  <p className="text-sm text-[#0F172A] leading-relaxed">
                    {selected.film.keyframes.firstFrame}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-1.5">Last frame</p>
                  <p className="text-sm text-[#0F172A] leading-relaxed">
                    {selected.film.keyframes.lastFrame}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-1.5">Anchors before render</p>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {selected.film.keyframes.anchors}
                </p>
              </div>
            </div>

            {/* ── SECTION 5: Model route + Continuity ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Route className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">5. Model route</h2>
                </div>
                <div className="space-y-3">
                  {selected.film.modelRoute.map((step, i) => (
                    <div key={step.role} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-[#64748B] text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-xs font-semibold text-[#0F172A]">{step.role}</p>
                          <span className="text-[11px] text-[#94A3B8]">{step.model}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">{step.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-3 pt-3 border-t border-gray-100">
                  No renders run in V1. This is the plan the studio executes by hand.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <ListChecks className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">6. Continuity</h2>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                    continuityAllDone
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-[#64748B]"
                  }`}>
                    {continuityDone} / {continuityTotal}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-4 ml-6">
                  Lock these before the first render credit is spent
                </p>
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
            </div>

            {/* ── EXIT: Package readiness + Approval Desk ─────────── */}
            <div className="bg-[#0F172A] rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Ready for the Approval Desk?</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {(["concept", "keyframes", "film"] as const).map((gate) => {
                      const approved = selected.gates[gate].status === "approved"
                      return (
                        <span key={gate} className={`flex items-center gap-1.5 text-xs ${approved ? "text-green-400" : "text-slate-400"}`}>
                          {approved
                            ? <Check className="w-3 h-3" />
                            : <CircleDashed className="w-3 h-3" />
                          }
                          {GATE_LABELS[gate]}
                        </span>
                      )
                    })}
                  </div>
                  {activeConcept && (
                    <p className="text-xs text-slate-400 mt-2">
                      Estimated render cost: {activeConcept.costEstimate}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => router.push(`/approvals?id=${selected.id}`)}
                    disabled={!continuityAllDone}
                    className="flex-shrink-0 px-5 py-2.5 bg-white text-[#0F172A] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Go to Approval Desk →
                  </button>
                  {!continuityAllDone && (
                    <p className="text-xs text-slate-400 text-right">
                      {continuityTotal - continuityDone} continuity item{continuityTotal - continuityDone !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                </div>
                <TeachStudio
                  productionId={selected.id}
                  surface="film_studio"
                  target="Keyframe and continuity gate"
                  before={`${selected.film.keyframes.firstFrame}\n\n${selected.film.keyframes.lastFrame}`}
                  buttonLabel="Teach Studio"
                />
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
