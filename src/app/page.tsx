"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  nextGate,
  stageLabel,
  approvedGateCount,
  GATE_QUESTIONS,
  type Production,
  type GateKey,
} from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import {
  thinkingRoomCount,
  approvalDeskCount,
  filmStudioCount,
  totalDecisionCount,
  productionGradient,
} from "@/lib/studio-badges"
import { Search, Plus } from "lucide-react"

// ─── Time helpers ─────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning, Tai."
  if (h < 17) return "Good afternoon, Tai."
  return "Good evening, Tai."
}

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase()
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

function decisionSubtitle(count: number): string {
  if (count === 0) return "Everything is moving. No decisions waiting."
  if (count === 1) return "One decision is holding this week's work."
  return `${count} decisions are holding this week's work.`
}

// ─── Gate helpers ──────────────────────────────────────────────────────────────

function gateRoute(p: Production, gate: GateKey): string {
  if (gate === "truth") return `/thinking-room/${p.id}`
  if (gate === "post") return `/approvals/${p.id}`
  return `/film-studio/${p.id}`
}

function gateCategoryLabel(gate: GateKey): string {
  const map: Record<GateKey, string> = {
    truth: "Truth Approval",
    post: "Post Approval",
    concept: "Concept Approval",
    keyframes: "Keyframe Approval",
    film: "Final Film Approval",
  }
  return map[gate]
}

function gateReviewLabel(gate: GateKey): string {
  const map: Record<GateKey, string> = {
    truth: "Review truth",
    post: "Review post",
    concept: "Review concept",
    keyframes: "Review frames",
    film: "Review film",
  }
  return map[gate]
}

function gateDecisionTime(gate: GateKey): string {
  const map: Record<GateKey, string> = {
    truth: "5 min review",
    post: "10 min review",
    concept: "8 min review",
    keyframes: "12 min review",
    film: "15 min review",
  }
  return map[gate]
}

function stageDotColor(gate: GateKey | null): string {
  if (gate === null) return "#2F62D8"
  const map: Record<GateKey, string> = {
    truth: "#2F62D8",
    post: "#2F62D8",
    concept: "#C29A5B",
    keyframes: "#C29A5B",
    film: "#2F62D8",
  }
  return map[gate]
}

// ─── Stat counter ──────────────────────────────────────────────────────────────

interface StatProps {
  label: string
  value: number
  onClick?: () => void
  first?: boolean
}

function StatCounter({ label, value, onClick, first = false }: StatProps) {
  return (
    <div className="flex items-stretch flex-1">
      {!first && (
        <div className="w-px self-stretch" style={{ backgroundColor: "#DDD8CE" }} />
      )}
      <button
        onClick={onClick}
        className="flex-1 px-6 py-5 text-left transition-colors hover:bg-black/[0.025] disabled:cursor-default"
        disabled={!onClick}
      >
        <p
          className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-2.5"
          style={{ color: "#C29A5B" }}
        >
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="font-serif leading-none"
            style={{ fontSize: "34px", color: "#1A2332", fontWeight: 400 }}
          >
            {value}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#2F62D8" }}
          />
        </div>
      </button>
    </div>
  )
}

// ─── Production thumbnail ──────────────────────────────────────────────────────

function ProductionThumb({ title, size = 52 }: { title: string; size?: number }) {
  return (
    <div
      className="rounded-md flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: productionGradient(title),
      }}
    />
  )
}

// ─── Command Center ────────────────────────────────────────────────────────────

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

  const decisionQueue = productions
    .filter((p) => nextGate(p) !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const inProduction = productions
    .filter((p) => {
      const g = nextGate(p)
      return g !== null && g !== "truth"
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)

  const readyThisWeek = productions.filter((p) => nextGate(p) === null)

  const thoughtsWaiting = thinkingRoomCount(productions)
  const truthReview = thinkingRoomCount(productions)
  const postReview = approvalDeskCount(productions)
  const filmsInProd = filmStudioCount(productions)
  const totalDecisions = totalDecisionCount(productions)

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>

        {/* ── Header bar ── */}
        <div
          className="flex items-center justify-between px-8 py-4 border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "#8A8578" }}
          >
            {todayLabel()}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md transition-colors hover:bg-black/5"
              style={{ color: "#8A8578" }}
              aria-label="Search productions"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/thinking-room/new")}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              Bring a thought
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Greeting ── */}
        <div className="px-8 pt-8 pb-6">
          <h1
            className="font-serif leading-tight"
            style={{ fontSize: "48px", color: "#1A2332", fontWeight: 400 }}
          >
            {greeting()}
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: "#8A8578" }}>
            {decisionSubtitle(totalDecisions)}
          </p>
        </div>

        {/* ── Production pulse (5 stat counters) ── */}
        <div
          className="mx-8 rounded-md overflow-hidden flex"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #DDD8CE",
          }}
        >
          <StatCounter
            label="Thoughts waiting"
            value={thoughtsWaiting}
            onClick={() => router.push("/thinking-room")}
            first
          />
          <StatCounter
            label="Truth review"
            value={truthReview}
            onClick={() => router.push("/thinking-room?filter=truth-review")}
          />
          <StatCounter
            label="Post review"
            value={postReview}
            onClick={() => router.push("/approvals?filter=post-review")}
          />
          <StatCounter
            label="Films in production"
            value={filmsInProd}
            onClick={() => router.push("/film-studio")}
          />
          <StatCounter
            label="Ready this week"
            value={readyThisWeek.length}
            onClick={() => router.push("/library")}
          />
        </div>

        {/* ── Main two-column layout ── */}
        <div className="flex mt-8 mx-8 pb-16 gap-0">

          {/* Left column */}
          <div
            className="flex-1 min-w-0 pr-10"
            style={{ borderRight: "1px solid #DDD8CE" }}
          >

            {/* Needs your decision */}
            <section className="mb-12">
              <h2
                className="font-serif mb-1"
                style={{ fontSize: "24px", color: "#1A2332", fontWeight: 400 }}
              >
                Needs your decision
              </h2>
              <p className="text-sm mb-6" style={{ color: "#8A8578" }}>
                The work only moves when you do.
              </p>

              {loaded && decisionQueue.length === 0 ? (
                <p className="text-sm py-6" style={{ color: "#8A8578" }}>
                  No decisions waiting. The studio is clear.
                </p>
              ) : (
                <div
                  className="rounded-md overflow-hidden"
                  style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
                >
                  {decisionQueue.map((p, i) => {
                    const gate = nextGate(p)!
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-5 px-5 py-4"
                        style={{
                          borderTop: i === 0 ? "none" : "1px solid #EAE6DF",
                        }}
                      >
                        <ProductionThumb title={p.title} size={52} />

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-1"
                            style={{ color: "#C29A5B" }}
                          >
                            {gateCategoryLabel(gate)}
                          </p>
                          <p
                            className="font-serif text-[15px] leading-snug"
                            style={{ color: "#1A2332", fontWeight: 400 }}
                          >
                            {p.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#8A8578" }}>
                            {GATE_QUESTIONS[gate]}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-xs hidden lg:block" style={{ color: "#8A8578" }}>
                            {gateDecisionTime(gate)}
                          </span>
                          <button
                            onClick={() => router.push(gateRoute(p, gate))}
                            className="text-sm font-medium px-4 py-1.5 rounded-md transition-colors hover:bg-black/5"
                            style={{
                              border: "1px solid #1A2332",
                              color: "#1A2332",
                              backgroundColor: "transparent",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {gateReviewLabel(gate)}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* In production table */}
            <section>
              <h2
                className="font-serif mb-6"
                style={{ fontSize: "24px", color: "#1A2332", fontWeight: 400 }}
              >
                In production
              </h2>

              {loaded && inProduction.length === 0 ? (
                <p className="text-sm" style={{ color: "#8A8578" }}>
                  No productions past Truth review yet.
                </p>
              ) : (
                <div
                  className="rounded-md overflow-hidden"
                  style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
                >
                  {/* Table header */}
                  <div
                    className="hidden md:grid text-[10px] font-semibold tracking-[0.1em] uppercase px-5 py-3"
                    style={{
                      color: "#8A8578",
                      gridTemplateColumns: "1fr 150px 160px 72px 90px",
                      borderBottom: "1px solid #EAE6DF",
                    }}
                  >
                    <span>Production</span>
                    <span>Stage</span>
                    <span>Progress</span>
                    <span>Spend</span>
                    <span>Updated</span>
                  </div>

                  {inProduction.map((p, i) => {
                    const gate = nextGate(p)
                    const approved = approvedGateCount(p)
                    const pct = (approved / 5) * 100
                    return (
                      <button
                        key={p.id}
                        onClick={() => router.push(gate ? gateRoute(p, gate) : "/library")}
                        className="w-full text-left px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                        style={{
                          borderTop: i === 0 ? "none" : "1px solid #EAE6DF",
                        }}
                      >
                        {/* Mobile: stacked */}
                        <div className="md:hidden">
                          <p className="text-sm font-medium" style={{ color: "#1A2332" }}>
                            {p.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageDotColor(gate) }} />
                            <span className="text-xs" style={{ color: "#4A5568" }}>{stageLabel(p)}</span>
                            <span className="text-xs" style={{ color: "#8A8578" }}>{relativeTime(p.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Desktop: grid row */}
                        <div
                          className="hidden md:grid items-center"
                          style={{ gridTemplateColumns: "1fr 150px 160px 72px 90px" }}
                        >
                          <span
                            className="text-sm font-medium truncate pr-4"
                            style={{ color: "#1A2332" }}
                          >
                            {p.title}
                          </span>

                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: stageDotColor(gate) }}
                            />
                            <span className="text-xs truncate" style={{ color: "#4A5568" }}>
                              {stageLabel(p)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pr-4">
                            <div
                              className="h-1 rounded-full overflow-hidden"
                              style={{ backgroundColor: "#EAE6DF", width: 80 }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: "#2F62D8" }}
                              />
                            </div>
                            <span className="text-xs whitespace-nowrap" style={{ color: "#8A8578" }}>
                              {approved} of 5
                            </span>
                          </div>

                          <span className="text-xs" style={{ color: "#8A8578" }}>
                            $0.00
                          </span>

                          <span className="text-xs" style={{ color: "#8A8578" }}>
                            {relativeTime(p.updatedAt)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right rail */}
          <div className="w-[300px] flex-shrink-0 pl-10">

            {/* Ready this week */}
            <section className="mb-8">
              <div className="flex items-baseline justify-between mb-5">
                <h2
                  className="font-serif"
                  style={{ fontSize: "24px", color: "#1A2332", fontWeight: 400 }}
                >
                  Ready this week
                </h2>
                <button
                  onClick={() => router.push("/library")}
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: "#2F62D8" }}
                >
                  Open Library ›
                </button>
              </div>

              {readyThisWeek.length === 0 ? (
                <p className="text-sm" style={{ color: "#8A8578" }}>
                  No approved packages yet this week.
                </p>
              ) : (
                <div className="space-y-4">
                  {readyThisWeek.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/library/${p.id}`)}
                      className="w-full text-left flex items-center gap-3 group"
                    >
                      <div
                        className="rounded-md flex-shrink-0"
                        style={{
                          width: 72,
                          height: 52,
                          background: productionGradient(p.title),
                        }}
                      />
                      <div className="min-w-0">
                        <p
                          className="font-serif text-sm leading-snug group-hover:underline"
                          style={{ color: "#1A2332", fontWeight: 400 }}
                        >
                          {p.title}
                        </p>
                        <p
                          className="text-[11px] font-semibold mt-1"
                          style={{ color: "#2F62D8" }}
                        >
                          Ready
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #DDD8CE", marginBottom: "28px" }} />

            {/* Quote block */}
            <div className="relative">
              <span
                className="font-serif absolute -top-2 -left-1 leading-none select-none pointer-events-none"
                style={{ fontSize: "60px", color: "#C29A5B", lineHeight: 1, opacity: 0.9 }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote
                className="font-serif pt-7 leading-relaxed"
                style={{ fontSize: "17px", color: "#1A2332", fontWeight: 400 }}
              >
                The post carries the argument. The film creates the experience.
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
