"use client"

import Image from "next/image"
import { Suspense, startTransition, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import type { Production, Shot } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT, updateProduction } from "@/lib/studio-store"
import { ArrowLeft, Film, ImageIcon, LoaderCircle, Sparkles } from "lucide-react"

const WORLD_BIBLE_CONTEXT = `Production: "The Man Who Carried a City" — Canon Scene 003.

World context: A civilization where the weight of responsibility, memory, and unseen systems takes physical form. Two architects build bridges in the same city — one anchors every bridge to himself, the other builds bridges that never touch her. The world is retrofuturist: brass instruments, glowing transit lines, carved stone, floating stones, elevated viaducts, market commerce. Black characters are foundational, not applied. Technology is handmade analog — no digital screens.

Active symbols this production: case/container (city as responsibility made visible), living road (intention and dependency made legible), brass (knowledge shaped by hands), light (recognition), height (perspective).

Active world laws: Law 1 (inner realities acquire physical form), Law 3 (every person carries a world), Law 5 (weight contains information).`

type ShotState = Record<number, { loading?: boolean; error?: string; videoMessage?: string }>

function RenderWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productionId = searchParams.get("id")
  const [productions, setProductions] = useState<Production[]>([])
  const [loaded, setLoaded] = useState(false)
  const [shotState, setShotState] = useState<ShotState>({})
  const [fullRenderRunning, setFullRenderRunning] = useState(false)

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

  async function generateFrame(shot: Shot) {
    if (!production) return

    setShotState((current) => ({
      ...current,
      [shot.no]: { ...current[shot.no], loading: true, error: undefined },
    }))

    try {
      const response = await fetch("/api/studio/render/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shotDescription: shot.description,
          worldBibleContext: WORLD_BIBLE_CONTEXT,
          shotNumber: shot.no,
          totalShots: production.film.shots.length,
          productionId: production.id,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        imageUrl?: string
        revisedPrompt?: string
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
                  }
                : candidate
            ),
          },
          revisions: [
            {
              at: new Date().toISOString(),
              note: `Rendered frame for shot ${shot.no}.`,
            },
            ...current.revisions,
          ],
        }))
      })

      setShotState((current) => ({
        ...current,
        [shot.no]: { ...current[shot.no], loading: false, error: undefined },
      }))
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

  async function generateMotion(shot: Shot) {
    setShotState((current) => ({
      ...current,
      [shot.no]: { ...current[shot.no], loading: true, error: undefined, videoMessage: undefined },
    }))

    try {
      const response = await fetch("/api/studio/render/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: shot.renderedImageUrl,
          motionPrompt: `Add slow cinematic motion to shot ${shot.no}: ${shot.description}`,
          durationSec: shot.durationSec,
        }),
      })

      const payload = (await response.json()) as { message?: string; fallback?: { note?: string } }
      const videoMessage = payload.message || payload.fallback?.note || "Motion is not configured yet."

      startTransition(() => {
        if (!production) return
        updateProduction(production.id, (current) => ({
          ...current,
          film: {
            ...current.film,
            shots: current.film.shots.map((candidate) =>
              candidate.no === shot.no
                ? { ...candidate, motionStatus: "blocked" }
                : candidate
            ),
          },
        }))
      })

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
                  onClick={renderFullFilm}
                  disabled={fullRenderRunning}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C29A5B] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fullRenderRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Render full film
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
              <div className="mb-6 grid gap-4 md:grid-cols-3">
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
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Keyframes gate</p>
                  <p className="mt-2 text-lg font-semibold text-[#C29A5B]">
                    {production.gates.keyframes.status === "approved" ? "Approved" : "Not approved"}
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
                          </div>

                          <h2 className="text-xl font-semibold text-white">{shot.description}</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                            {shot.purpose}
                          </p>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={() => generateFrame(shot)}
                              disabled={Boolean(state?.loading) || fullRenderRunning}
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
                          </div>

                          {state?.error && (
                            <p className="mt-3 text-sm text-red-300">{state.error}</p>
                          )}

                          {state?.videoMessage && (
                            <p className="mt-3 text-sm text-[#F0D7AD]">{state.videoMessage}</p>
                          )}

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
                            {shot.renderedImageUrl ? (
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
                      <p className="text-xs text-slate-400">Shot {shot.no}</p>
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
