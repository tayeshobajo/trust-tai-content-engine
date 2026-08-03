"use client"

import Image from "next/image"
import { Suspense, startTransition, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import type { Production, Shot } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT, updateProduction } from "@/lib/studio-store"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Eye,
  Film,
  ImageIcon,
  Link2,
  LoaderCircle,
  Music2,
  Sparkles,
  Unlock,
  Users,
  Video,
  XCircle,
  AlertCircle,
} from "lucide-react"
import {
  CANON_SCENE_003_ORCHESTRATION,
  type SceneOrchestration,
} from "@/lib/world-bible"

function buildWorldBibleContext(production: Production): string {
  const selectedConcept =
    production.film.concepts.find((concept) => concept.key === production.film.selectedConcept) ??
    production.film.concepts[0]
  const contextParts = [
    production.title ? `Production: "${production.title}".` : "",
    production.spine.rememberSentence ? `Core truth: ${production.spine.rememberSentence}` : "",
    selectedConcept?.premise ? `Concept premise: ${selectedConcept.premise}` : "",
  ]

  return contextParts.filter(Boolean).join("\n\n")
}

type ShotState = Record<number, {
  loading?: boolean
  error?: string
  videoMessage?: string
  conductorOpen?: boolean
  coherenceChecking?: boolean
}>

// ─── Character Reference Manager ───

function CharacterRefManager({
  production,
  onSetRef,
  onClearRef,
}: {
  production: Production
  onSetRef: (name: string, url: string) => void
  onClearRef: (name: string) => void
}) {
  const [showPanel, setShowPanel] = useState(false)
  const refs = production.film.characterRefs ?? {}
  const renderedShots = production.film.shots.filter((s) => s.renderedImageUrl)

  const presetCharacters = [
    { name: "man", label: "The Man" },
    { name: "child", label: "The Child" },
  ]

  return (
    <div className="rounded-2xl border border-[#C29A5B]/30 bg-[#C29A5B]/5 p-4">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#C29A5B]" />
          <span className="text-sm font-semibold text-[#F0D7AD]">Character Reference Lock</span>
          {Object.keys(refs).length > 0 && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-300">
              {Object.keys(refs).length} locked
            </span>
          )}
        </div>
        {showPanel ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {showPanel && (
        <div className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed text-slate-300">
            Lock character reference frames after keyframe approval. Every subsequent render will pass these
            as reference images to <code className="text-[#F0D7AD]">images.edit()</code>, ensuring visual
            continuity across all shots.
          </p>

          {presetCharacters.map(({ name, label }) => (
            <div key={name} className="flex items-center gap-3">
              <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                {refs[name] ? (
                  <Image src={refs[name]} alt={`${label} reference`} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-slate-500">Not set</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{label}</p>
                {refs[name] ? (
                  <button
                    onClick={() => onClearRef(name)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-300 hover:text-red-200"
                  >
                    <Unlock className="h-3 w-3" /> Unlock
                  </button>
                ) : (
                  <select
                    onChange={(e) => e.target.value && onSetRef(name, e.target.value)}
                    value=""
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-slate-300"
                  >
                    <option value="">Pick from rendered frame...</option>
                    {renderedShots.map((s) => (
                      <option key={s.no} value={s.renderedImageUrl}>
                        Shot {s.no}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Coherence Status Badge ───

function CoherenceBadge({ shot, onClick, checking }: {
  shot: Shot
  onClick: () => void
  checking?: boolean
}) {
  if (checking) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        <LoaderCircle className="h-3 w-3 animate-spin" /> Checking...
      </span>
    )
  }

  switch (shot.coherenceStatus) {
    case "pass":
      return (
        <button onClick={onClick} className="inline-flex items-center gap-1 text-[11px] text-green-300 hover:text-green-200">
          <CheckCircle2 className="h-3 w-3" /> Coherence: Pass
        </button>
      )
    case "fail":
      return (
        <button onClick={onClick} className="inline-flex items-center gap-1 text-[11px] text-red-300 hover:text-red-200">
          <XCircle className="h-3 w-3" /> Coherence: FAIL
        </button>
      )
    case "warning":
      return (
        <button onClick={onClick} className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200">
          <AlertCircle className="h-3 w-3" /> Coherence: Warning
        </button>
      )
    default:
      return shot.renderedImageUrl ? (
        <button onClick={onClick} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-300">
          <Eye className="h-3 w-3" /> Check coherence
        </button>
      ) : null
  }
}

function RenderWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productionId = searchParams.get("id")
  const [productions, setProductions] = useState<Production[]>([])
  const [loaded, setLoaded] = useState(false)
  const [shotState, setShotState] = useState<ShotState>({})
  const [fullRenderRunning, setFullRenderRunning] = useState(false)
  const [chainMode, setChainMode] = useState(true)
  const [continuityRenderRunning, setContinuityRenderRunning] = useState(false)

  useEffect(() => {
    const load = () => {
      setProductions(getProductions())
      setLoaded(true)
    }

    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const production = productions.find((item) => item.id === productionId) ?? null
  const allFramesGenerated =
    production?.film.shots.length
      ? production.film.shots.every((shot) => Boolean(shot.renderedImageUrl))
      : false
  const allMotionGenerated =
    production?.film.shots.length
      ? production.film.shots.every((shot) => Boolean(shot.renderedVideoUrl))
      : false

  const characterRefs = production?.film.characterRefs ?? {}
  const hasCharacterRefs = Object.keys(characterRefs).length > 0

  function setCharacterRef(name: string, url: string) {
    if (!production) return
    startTransition(() => {
      updateProduction(production.id, (current) => ({
        ...current,
        film: {
          ...current.film,
          characterRefs: {
            ...(current.film.characterRefs ?? {}),
            [name]: url,
          },
        },
      }))
    })
  }

  function clearCharacterRef(name: string) {
    if (!production) return
    startTransition(() => {
      updateProduction(production.id, (current) => {
        const next = { ...(current.film.characterRefs ?? {}) }
        delete next[name]
        return {
          ...current,
          film: { ...current.film, characterRefs: next },
        }
      })
    })
  }

  async function runCoherenceCheck(shot: Shot) {
    if (!shot.renderedImageUrl || !hasCharacterRefs) return

    setShotState((s) => ({
      ...s,
      [shot.no]: { ...s[shot.no], coherenceChecking: true },
    }))

    try {
      // Check against first available character ref
      const firstRef = Object.values(characterRefs)[0]
      const response = await fetch("/api/studio/render/coherence-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameUrl: shot.renderedImageUrl,
          referenceUrl: firstRef,
          shotNumber: shot.no,
          shotDescription: shot.description,
        }),
      })

      const payload = await response.json()

      startTransition(() => {
        if (!production) return
        updateProduction(production.id, (current) => ({
          ...current,
          film: {
            ...current.film,
            shots: current.film.shots.map((c) =>
              c.no === shot.no
                ? {
                    ...c,
                    coherenceStatus: payload.status ?? "warning",
                    coherenceNote: payload.notes ?? payload.error ?? "No notes",
                  }
                : c
            ),
          },
        }))
      })
    } catch {
      startTransition(() => {
        if (!production) return
        updateProduction(production.id, (current) => ({
          ...current,
          film: {
            ...current.film,
            shots: current.film.shots.map((c) =>
              c.no === shot.no
                ? { ...c, coherenceStatus: "warning", coherenceNote: "Check failed — network error" }
                : c
            ),
          },
        }))
      })
    } finally {
      setShotState((s) => ({
        ...s,
        [shot.no]: { ...s[shot.no], coherenceChecking: false },
      }))
    }
  }

  async function generateFrame(shot: Shot, previousShotUrl?: string) {
    if (!production) return

    setShotState((current) => ({
      ...current,
      [shot.no]: { ...current[shot.no], loading: true, error: undefined },
    }))

    try {
      const refArray = hasCharacterRefs ? Object.values(characterRefs) : undefined

      const response = await fetch("/api/studio/render/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shotDescription: shot.description,
          worldBibleContext: buildWorldBibleContext(production),
          shotNumber: shot.no,
          totalShots: production.film.shots.length,
          productionId: production.id,
          orchestration: shot.orchestration ?? CANON_SCENE_003_ORCHESTRATION[shot.no],
          referenceImages: refArray,
          previousShotUrl,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        imageUrl?: string
        revisedPrompt?: string
        usedReferenceImages?: boolean
      }

      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Frame generation failed")
      }

      startTransition(() => {
        updateProduction(production.id, (current) => ({
          ...current,
          film: {
            ...current.film,
            shots: current.film.shots.map((candidate) =>
              candidate.no === shot.no
                ? {
                    ...candidate,
                    renderedImageUrl: payload.imageUrl,
                    renderPrompt: payload.revisedPrompt,
                    motionStatus: "idle",
                    coherenceStatus: "unchecked",
                    coherenceNote: undefined,
                    previousShotUrl,
                  }
                : candidate
            ),
          },
          revisions: [
            {
              at: new Date().toISOString(),
              note: `Rendered frame for shot ${shot.no}${payload.usedReferenceImages ? " (with character refs)" : ""}.`,
            },
            ...current.revisions,
          ],
        }))
      })

      setShotState((current) => ({
        ...current,
        [shot.no]: { ...current[shot.no], loading: false, error: undefined },
      }))

      // Auto-run coherence check if we have character refs
      if (hasCharacterRefs) {
        // Small delay to let state settle
        setTimeout(() => runCoherenceCheck({ ...shot, renderedImageUrl: payload.imageUrl }), 500)
      }
    } catch (error) {
      setShotState((current) => ({
        ...current,
        [shot.no]: {
          ...current[shot.no],
          loading: false,
          error: error instanceof Error ? error.message : "Frame generation failed",
        },
      }))
    }
  }

  /**
   * Sequential render with character continuity + shot chaining.
   * Each shot receives:
   *   1. All locked character reference images
   *   2. The previous shot's rendered output (if chain mode is on)
   */
  async function renderWithContinuity() {
    if (!production) return
    setContinuityRenderRunning(true)

    try {
      const shots = production.film.shots
      let prevUrl: string | undefined

      for (const shot of shots) {
        await generateFrame(shot, chainMode ? prevUrl : undefined)

        // Read the updated production to get the newly rendered URL for chaining
        const updated = getProductions().find((p) => p.id === production.id)
        const rendered = updated?.film.shots.find((s) => s.no === shot.no)
        if (rendered?.renderedImageUrl) {
          prevUrl = rendered.renderedImageUrl
        }
      }
    } finally {
      setContinuityRenderRunning(false)
    }
  }

  async function generateMotion(shot: Shot) {
    if (!shot.renderedImageUrl) return
    if (!production) return
    const prodId = production.id

    setShotState((current) => ({
      ...current,
      [shot.no]: { ...current[shot.no], loading: true, error: undefined, videoMessage: undefined },
    }))

    try {
      const orchestration: SceneOrchestration | undefined =
        shot.orchestration ?? CANON_SCENE_003_ORCHESTRATION[shot.no]

      const response = await fetch("/api/studio/render/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: shot.renderedImageUrl,
          motionPrompt: `Add slow cinematic motion to shot ${shot.no}: ${shot.description}`,
          shotDescription: shot.description,
          durationSec: shot.durationSec,
          productionId: prodId,
          shotNumber: shot.no,
          orchestration,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        videoUrl?: string
        status?: string
        note?: string
        detail?: string
        requestId?: string | null
      }

      if (!response.ok) {
        throw new Error(payload.error || "Motion request failed")
      }

      startTransition(() => {
        if (!production) return
        const prodId = production.id
        updateProduction(prodId, (current) => ({
          ...current,
          film: {
            ...current.film,
            shots: current.film.shots.map((candidate) =>
              candidate.no === shot.no
                ? {
                    ...candidate,
                    renderedVideoUrl: payload.videoUrl ?? candidate.renderedVideoUrl,
                    motionStatus: payload.videoUrl ? "rendered" : "queued",
                  }
                : candidate
            ),
          },
          revisions: payload.videoUrl
            ? [
                {
                  at: new Date().toISOString(),
                  note: `Rendered motion clip for shot ${shot.no}.`,
                },
                ...current.revisions,
              ]
            : current.revisions,
        }))
      })

      const videoMessage = payload.videoUrl
        ? "Motion clip rendered."
        : payload.note || payload.detail || `Motion queued${payload.requestId ? ` (${payload.requestId})` : ""}.`

      setShotState((current) => ({
        ...current,
        [shot.no]: { ...current[shot.no], loading: false, videoMessage },
      }))
    } catch (error) {
      setShotState((current) => ({
        ...current,
        [shot.no]: {
          ...current[shot.no],
          loading: false,
          error: error instanceof Error ? error.message : "Motion request failed",
        },
      }))
    }
  }

  async function renderFullFilm() {
    if (!production) return
    setFullRenderRunning(true)
    try {
      for (const shot of production.film.shots) {
        await generateFrame(shot)
      }
    } finally {
      setFullRenderRunning(false)
    }
  }

  async function renderFullMotion() {
    if (!production) return
    setFullRenderRunning(true)
    try {
      for (const shot of production.film.shots) {
        if (shot.renderedImageUrl && !shot.renderedVideoUrl) {
          await generateMotion(shot)
        }
      }
    } finally {
      setFullRenderRunning(false)
    }
  }

  return (
    <Shell>
      <div className="min-h-screen bg-[#0F172A] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <button
                onClick={() => router.push(production ? `/film-studio?id=${production.id}` : "/film-studio")}
                className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Film Studio
              </button>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C29A5B]">
                Trust Tai Studio Render Pipeline
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {production?.title ?? "Render workspace"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                Generate cinematic keyframes shot by shot, persist them onto the production, and review the full filmstrip before motion rendering.
              </p>
            </div>

            {production && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={renderWithContinuity}
                  disabled={continuityRenderRunning || fullRenderRunning}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C29A5B] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {continuityRenderRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  Render with Continuity
                </button>
                <button
                  onClick={renderFullFilm}
                  disabled={fullRenderRunning || continuityRenderRunning}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fullRenderRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Render full film
                </button>
                <button
                  onClick={renderFullMotion}
                  disabled={fullRenderRunning || continuityRenderRunning || !allFramesGenerated || allMotionGenerated}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fullRenderRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  Render all motion
                </button>
              </div>
            )}
          </div>

          {!loaded && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
              Loading productions...
            </div>
          )}

          {loaded && !production && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
              No production found for this render session.
            </div>
          )}

          {production && (
            <>
              {/* Stats Bar */}
              <div className="mb-6 grid gap-4 md:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Shots</p>
                  <p className="mt-2 text-3xl font-semibold">{production.film.shots.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Frames ready</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {production.film.shots.filter((shot) => shot.renderedImageUrl).length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Motion clips</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {production.film.shots.filter((shot) => shot.renderedVideoUrl).length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Character refs</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {Object.keys(characterRefs).length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Keyframes gate</p>
                  <p className="mt-2 text-lg font-semibold text-[#C29A5B]">
                    {production.gates.keyframes.status === "approved" ? "Approved" : "Not approved"}
                  </p>
                </div>
              </div>

              {/* Continuity Controls */}
              <div className="mb-6 space-y-3">
                <CharacterRefManager
                  production={production}
                  onSetRef={setCharacterRef}
                  onClearRef={clearCharacterRef}
                />

                {/* Chain Mode Toggle */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <button
                    onClick={() => setChainMode(!chainMode)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      chainMode
                        ? "bg-[#C29A5B]/20 text-[#F0D7AD]"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {chainMode ? <Link2 className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    Shot Chaining: {chainMode ? "ON" : "OFF"}
                  </button>
                  <p className="text-xs text-slate-400">
                    {chainMode
                      ? "Each shot receives the previous shot's output as an additional reference, creating visual flow."
                      : "Shots render independently with only character reference images."}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {production.film.shots.map((shot) => {
                  const state = shotState[shot.no]
                  const motionDisabled = !allFramesGenerated || !shot.renderedImageUrl

                  return (
                    <div
                      key={shot.no}
                      className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.75))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                    >
                      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-[#C29A5B]/40 bg-[#C29A5B]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#F0D7AD]">
                              Shot {shot.no}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                              {shot.route}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                              {shot.durationSec}s
                            </span>
                            {shot.previousShotUrl && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#C29A5B]/30 bg-[#C29A5B]/5 px-2 py-1 text-[10px] text-[#F0D7AD]">
                                <Link2 className="h-2.5 w-2.5" /> Chained
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl font-semibold text-white">{shot.description}</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                            {shot.purpose}
                          </p>

                          {/* Coherence Status */}
                          {shot.renderedImageUrl && (
                            <div className="mt-3">
                              <CoherenceBadge
                                shot={shot}
                                checking={state?.coherenceChecking}
                                onClick={() => runCoherenceCheck(shot)}
                              />
                              {shot.coherenceNote && shot.coherenceStatus !== "unchecked" && (
                                <p className={`mt-1 text-xs ${
                                  shot.coherenceStatus === "pass" ? "text-green-300/70" :
                                  shot.coherenceStatus === "fail" ? "text-red-300/70" :
                                  "text-amber-300/70"
                                }`}>
                                  {shot.coherenceNote}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={() => generateFrame(shot)}
                              disabled={Boolean(state?.loading) || fullRenderRunning || continuityRenderRunning}
                              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {state?.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                              {shot.renderedImageUrl ? "Regenerate frame" : "Generate frame"}
                            </button>

                            <button
                              onClick={() => generateMotion(shot)}
                              disabled={Boolean(state?.loading) || motionDisabled}
                              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Film className="h-4 w-4" />
                              Generate motion
                            </button>

                            <button
                              onClick={() =>
                                setShotState((current) => ({
                                  ...current,
                                  [shot.no]: {
                                    ...current[shot.no],
                                    conductorOpen: !current[shot.no]?.conductorOpen,
                                  },
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#C29A5B]/30 bg-[#C29A5B]/5 px-3 py-2.5 text-xs font-semibold text-[#F0D7AD] transition-colors hover:bg-[#C29A5B]/15"
                            >
                              <Clapperboard className="h-3.5 w-3.5" />
                              Conductor
                              {state?.conductorOpen ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          </div>

                          {state?.error && (
                            <p className="mt-3 text-sm text-red-300">{state.error}</p>
                          )}

                          {state?.videoMessage && (
                            <p className="mt-3 text-sm text-[#F0D7AD]">{state.videoMessage}</p>
                          )}

                          {state?.conductorOpen && (() => {
                            const plan: SceneOrchestration | undefined =
                              shot.orchestration ?? CANON_SCENE_003_ORCHESTRATION[shot.no]
                            if (!plan) return null
                            return (
                              <div className="mt-4 rounded-2xl border border-[#C29A5B]/25 bg-[#C29A5B]/5 p-4 space-y-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C29A5B] flex items-center gap-2">
                                  <Music2 className="h-3.5 w-3.5" />
                                  Scene Conductor — Shot {shot.no}
                                </p>

                                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                  <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Camera</p>
                                    <p className="mt-1 text-xs font-semibold text-white">{plan.cameraDirection}</p>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Pace</p>
                                    <p className="mt-1 text-xs font-semibold text-white">{plan.pace}</p>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Beat</p>
                                    <p className="mt-1 text-xs font-semibold text-white">{plan.emotionalBeat}</p>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Exit via</p>
                                    <p className="mt-1 text-xs font-semibold text-white">{plan.exitMomentum.transitionType}</p>
                                  </div>
                                </div>

                                {plan.incomingMomentum && (
                                  <p className="text-xs text-slate-400">
                                    <span className="text-[#F0D7AD] font-medium">Receives:</span>{" "}
                                    {plan.incomingMomentum.direction} at {plan.incomingMomentum.pace} pace
                                    {" "}→{" "}
                                    <span className="text-[#F0D7AD] font-medium">Exits:</span>{" "}
                                    {plan.exitMomentum.direction} via {plan.exitMomentum.transitionType}
                                  </p>
                                )}

                                {plan.directorNote && (
                                  <p className="text-xs leading-relaxed text-slate-300 border-l-2 border-[#C29A5B]/40 pl-3 italic">
                                    {plan.directorNote}
                                  </p>
                                )}
                              </div>
                            )
                          })()}

                          {shot.renderPrompt && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                              <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Revised prompt
                              </p>
                              <p className="text-xs leading-relaxed text-slate-300">{shot.renderPrompt}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                            {shot.renderedVideoUrl ? (
                              <video
                                src={shot.renderedVideoUrl}
                                controls
                                playsInline
                                className="h-full w-full object-cover"
                              />
                            ) : shot.renderedImageUrl ? (
                              <Image
                                src={shot.renderedImageUrl}
                                alt={`Rendered frame for shot ${shot.no}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-relaxed text-slate-500">
                                Generated frame appears here at 2:3.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C29A5B]">
                      Filmstrip
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Review the sequence as one film before motion rendering.
                    </p>
                  </div>
                  {!allFramesGenerated && (
                    <p className="text-xs text-slate-400">
                      Generate every frame to unlock motion passes.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                  {production.film.shots.map((shot) => (
                    <div key={shot.no} className="space-y-2">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        {shot.renderedImageUrl ? (
                          <Image
                            src={shot.renderedImageUrl}
                            alt={`Filmstrip frame ${shot.no}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            Shot {shot.no}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">Shot {shot.no}</p>
                        {shot.coherenceStatus === "pass" && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                        {shot.coherenceStatus === "fail" && <XCircle className="h-3 w-3 text-red-400" />}
                      </div>
                      {shot.renderedVideoUrl && (
                        <p className="text-xs font-medium text-[#F0D7AD]">Motion ready</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  )
}

export default function RenderPage() {
  return (
    <Suspense>
      <RenderWorkspace />
    </Suspense>
  )
}
