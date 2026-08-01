"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { nextGate, stageLabel, type Production } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { productionGradient } from "@/lib/studio-badges"
import { Plus, ArrowRight, Clock, Film } from "lucide-react"
import { Suspense } from "react"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

type FilterKey = "all" | "truth-review" | "developing" | "held"

function filterLabel(k: FilterKey): string {
  const map: Record<FilterKey, string> = {
    all: "All thoughts",
    "truth-review": "Truth review",
    developing: "Developing",
    held: "Held",
  }
  return map[k]
}

// ─── Queue inner (needs Suspense for useSearchParams) ─────────────────────────

function ThinkingRoomQueue() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = (searchParams.get("filter") ?? "all") as FilterKey
  const [productions, setProductions] = useState<Production[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = () => { setProductions(getProductions()); setLoaded(true) }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  // Thinking Room shows only productions that haven't cleared Truth gate yet
  // plus those sitting at truth review
  const thinkingProductions = productions.filter(
    (p) => nextGate(p) === "truth" || p.gates.truth.status !== "approved"
  )

  const filters: FilterKey[] = ["all", "truth-review", "held"]
  const activeFilter: FilterKey = filters.includes(filterParam) ? filterParam : "all"

  const displayed =
    activeFilter === "all"
      ? thinkingProductions
      : activeFilter === "truth-review"
      ? thinkingProductions.filter((p) => nextGate(p) === "truth")
      : activeFilter === "held"
      ? thinkingProductions.filter((p) => Object.values(p.gates).some((g) => g.status === "hold"))
      : thinkingProductions

  const truthReviewCount = thinkingProductions.filter((p) => nextGate(p) === "truth").length

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-8 py-[10px] border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <p
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "#8A8578" }}
          >
            Thinking Room
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/thinking-room/pilot")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#C29A5B", color: "#FFFFFF" }}
            >
              <Film className="w-3 h-3" />
              Pilot film
            </button>
            <button
              onClick={() => router.push("/thinking-room/new")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              Bring a thought
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="px-8 pt-7 pb-16">

          {/* ── Page heading ── */}
          <h1
            className="font-serif mb-1"
            style={{ fontSize: "42px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            Thinking Room
          </h1>
          <p className="text-[13px] mb-7" style={{ color: "#8A8578" }}>
            Where a raw thought becomes an approved truth.
          </p>

          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-1 mb-6">
            {filters.map((f) => {
              const active = f === activeFilter
              const count = f === "truth-review" ? truthReviewCount : undefined
              return (
                <button
                  key={f}
                  onClick={() => router.push(`/thinking-room${f === "all" ? "" : `?filter=${f}`}`)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
                  style={{
                    backgroundColor: active ? "#1A2332" : "transparent",
                    color: active ? "#FFFFFF" : "#8A8578",
                    border: active ? "none" : "1px solid #DDD8CE",
                  }}
                >
                  {filterLabel(f)}
                  {count !== undefined && count > 0 && (
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: active ? "#FFFFFF" : "#2F62D8", color: active ? "#1A2332" : "#FFFFFF" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Production list ── */}
          {loaded && displayed.length === 0 ? (

            /* Empty state */
            <div
              className="flex flex-col items-start py-12 px-8 rounded-md"
              style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
            >
              <p
                className="font-serif mb-2"
                style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}
              >
                The room is quiet.
              </p>
              <p className="text-sm mb-5" style={{ color: "#8A8578" }}>
                Everything starts with one thought worth arguing.
              </p>
              <button
                onClick={() => router.push("/thinking-room/new")}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
              >
                Bring a thought
                <Plus className="w-3 h-3" />
              </button>
            </div>

          ) : (

            <div
              className="rounded-md overflow-hidden"
              style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
            >
              {displayed.map((p, i) => {
                const gate = nextGate(p)
                const isTruthReview = gate === "truth"
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/thinking-room/${p.id}`)}
                    className="w-full text-left flex items-center gap-5 px-5 py-4 transition-colors hover:bg-black/[0.02] group"
                    style={{ borderTop: i === 0 ? "none" : "1px solid #EAE6DF" }}
                  >
                    {/* Gradient thumb */}
                    <div
                      className="w-12 h-12 rounded-sm flex-shrink-0"
                      style={{ background: productionGradient(p.title) }}
                    />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      {isTruthReview && (
                        <p
                          className="text-[9px] font-bold tracking-[0.14em] uppercase mb-0.5"
                          style={{ color: "#C29A5B" }}
                        >
                          Truth Review
                        </p>
                      )}
                      <p
                        className="font-serif text-sm leading-snug group-hover:underline"
                        style={{ color: "#1A2332", fontWeight: 400 }}
                      >
                        {p.title}
                      </p>
                      <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "#8A8578" }}>
                        {p.sourceThought.slice(0, 100)}
                        {p.sourceThought.length > 100 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: isTruthReview ? "rgba(47,98,216,0.08)" : "rgba(194,154,91,0.1)",
                            color: isTruthReview ? "#2F62D8" : "#8A6230",
                          }}
                        >
                          {stageLabel(p)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#C0BAB0" }}>
                          <Clock className="w-2.5 h-2.5" />
                          {relativeTime(p.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium" style={{ color: "#8A8578" }}>
                        {formatDate(p.createdAt)}
                      </span>
                      <div
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm"
                        style={{ border: "1px solid #DDD8CE", color: "#1A2332", backgroundColor: "#FFFFFF" }}
                      >
                        Continue
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* New thought CTA at bottom if list has items */}
          {loaded && displayed.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs" style={{ color: "#8A8578" }}>
                {displayed.length} thought{displayed.length === 1 ? "" : "s"} in the room
              </p>
              <button
                onClick={() => router.push("/thinking-room/new")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors hover:bg-black/5"
                style={{ border: "1px solid #DDD8CE", color: "#1A2332" }}
              >
                Bring another thought
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}

export default function ThinkingRoomPage() {
  return (
    <Suspense>
      <ThinkingRoomQueue />
    </Suspense>
  )
}
