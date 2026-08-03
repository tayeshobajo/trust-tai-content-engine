"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import type { Production, GateKey } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { nextGate, approvedGateCount } from "@/data/studio"
import { productionGradient } from "@/lib/studio-badges"
import {
  Search,
  Bell,
  Plus,
  Play,
  Sparkles,
  Lightbulb,
  Eye,
  FileText,
  Film,
  Package,
  ChevronRight,
  Activity,
} from "lucide-react"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning, Tai."
  if (h < 17) return "Good afternoon, Tai."
  return "Good evening, Tai."
}

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
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

function statusSummary(productions: Production[]): string {
  const active = productions.filter((p) => nextGate(p) !== null).length
  const ready = productions.filter((p) => nextGate(p) === null).length
  const parts: string[] = []
  if (active > 0) parts.push(`${active} ${active === 1 ? "production is" : "productions are"} moving`)
  if (ready > 0) parts.push(`${ready} ${ready === 1 ? "package is" : "packages are"} ready`)
  if (parts.length === 0) return "The Studio is quiet. Bring a post to begin."
  return parts.join(". ") + "."
}

function gateRoute(p: Production, gate: GateKey): string {
  if (gate === "truth") return `/thinking-room/${p.id}`
  if (gate === "post") return `/approvals/${p.id}`
  return `/film-studio/${p.id}`
}

function gateLabel(gate: GateKey): string {
  const map: Record<GateKey, string> = {
    truth: "Approve truth",
    post: "Approve post",
    concept: "Choose concept",
    keyframes: "Approve keyframes",
    film: "Approve final film",
  }
  return map[gate]
}

function gateStageLabel(gate: GateKey): string {
  const map: Record<GateKey, string> = {
    truth: "Shaping post",
    post: "Post review",
    concept: "Concept selection",
    keyframes: "Keyframe planning",
    film: "Final film review",
  }
  return map[gate]
}

// gateIcon helper removed — components resolved via lookup objects inside render functions

function stageProgress(p: Production): { approved: number; total: number; pct: number } {
  const approved = approvedGateCount(p)
  const total = 5
  return { approved, total, pct: (approved / total) * 100 }
}

// ─── Production Card ───────────────────────────────────────────────────────────

function ProductionCard({ production, onClick }: { production: Production; onClick: () => void }) {
  const gate = nextGate(production)
  const { approved, total, pct } = stageProgress(production)
  const hasFrame = production.film.shots.some((s) => s.renderedImageUrl)

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left rounded-lg border transition-all hover:shadow-md"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#DDD8CE",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video flex items-center justify-center" style={{ backgroundColor: "#0D1626" }}>
        {hasFrame ? (
          <div
            className="absolute inset-0"
            style={{
              background: productionGradient(production.title),
              opacity: 0.9,
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: productionGradient(production.title), opacity: 0.6 }}
          />
        )}
        <div className="relative z-10 px-4 text-center">
          <p className="font-serif text-sm leading-snug" style={{ color: "rgba(255,255,255,0.85)" }}>
            {production.title}
          </p>
        </div>
        {gate && (
          <div
            className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: "rgba(13,22,38,0.7)", color: "#C29A5B" }}
          >
            {gateStageLabel(gate)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <p className="text-[11px] leading-snug line-clamp-2" style={{ color: "#4A5568" }}>
          {production.sourceThought}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "#EAE6DF" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#2F62D8" }} />
          </div>
          <span className="text-[10px]" style={{ color: "#8A8578" }}>{approved}/{total}</span>
        </div>

        {/* Next action */}
        {gate && (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#C29A5B" }}>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="font-semibold uppercase tracking-wide">{gateLabel(gate)}</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Decision Card ─────────────────────────────────────────────────────────────

function DecisionCard({ production, onClick }: { production: Production; onClick: () => void }) {
  const gate = nextGate(production)!
  const gateIcons: Record<GateKey, React.ElementType> = {
    truth: Lightbulb,
    post: FileText,
    concept: Sparkles,
    keyframes: Eye,
    film: Film,
  }
  const Icon = gateIcons[gate]

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border p-4 transition-all hover:shadow-sm"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 rounded-md flex items-center justify-center"
          style={{ width: 36, height: 36, backgroundColor: "rgba(47,98,216,0.08)" }}
        >
          <Icon className="w-4 h-4" style={{ color: "#2F62D8" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-0.5" style={{ color: "#C29A5B" }}>
            {gateStageLabel(gate)}
          </p>
          <p className="font-serif text-sm leading-snug" style={{ color: "#1A2332" }}>
            {production.title}
          </p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#4A5568" }}>
            {gateLabel(gate)} — {relativeTime(production.updatedAt)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#8A8578" }} />
      </div>
    </button>
  )
}

// ─── Recommendation Card (mock — will be memory-driven) ─────────────────────────

interface Recommendation {
  type: "continue_thread" | "revisit_idea" | "new_direction" | "reuse_character" | "respond_signal"
  title: string
  argument: string
  why: string
  memoriesUsed: string[]
}

const SAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    type: "continue_thread",
    title: "The Founder Who Became the System",
    argument: "The Man Who Carried a City ends with the child lifting the case. What happens when the city outgrows the child?",
    why: "Story thread 'The Founder Must Become Unnecessary' has one published post and an unresolved question: what does the founder do after the weight transfers?",
    memoriesUsed: ["Canon Scene 003", "Story thread: Founder independence", "Symbol: case/container"],
  },
  {
    type: "reuse_character",
    title: "The Mapmaker Returns",
    argument: "The mapmaker from 'Living Roads' could anchor a post about planning vs. preparedness.",
    why: "This character has one appearance and strong visual identity. Audience response to the first film was positive.",
    memoriesUsed: ["Character: The Mapmaker", "Visual language: Transit blue", "Symbol: Map"],
  },
]

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const router = useRouter()

  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D6" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#C29A5B" }} />
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: "#C29A5B" }}>
          {rec.type.replace(/_/g, " ")}
        </span>
      </div>
      <p className="font-serif text-sm leading-snug mb-1" style={{ color: "#1A2332" }}>
        {rec.title}
      </p>
      <p className="text-[11px] leading-relaxed mb-2" style={{ color: "#4A5568" }}>
        {rec.argument}
      </p>
      <p className="text-[10px] leading-relaxed mb-3 italic" style={{ color: "#8A8578" }}>
        {rec.why}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {rec.memoriesUsed.map((m) => (
          <span
            key={m}
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "rgba(47,98,216,0.06)", color: "#2F62D8" }}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/thinking-room/new")}
          className="text-[11px] font-semibold transition-colors hover:underline"
          style={{ color: "#2F62D8" }}
        >
          Develop this post →
        </button>
        <button className="text-[11px] transition-colors hover:underline" style={{ color: "#8A8578" }}>
          Save to Ideas
        </button>
      </div>
    </div>
  )
}

// ─── Package Card ──────────────────────────────────────────────────────────────

function PackageCard({ production, onClick }: { production: Production; onClick: () => void }) {
  const hasVideo = production.film.shots.some((s) => s.renderedVideoUrl)
  const shotCount = production.film.shots.length

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left"
    >
      <div
        className="relative aspect-video rounded-lg overflow-hidden mb-2"
        style={{ background: productionGradient(production.title) }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {hasVideo ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
              <Play className="w-4 h-4" style={{ color: "#0D1626" }} />
            </div>
          ) : (
            <Package className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />
          )}
        </div>
      </div>
      <p className="font-serif text-xs leading-snug group-hover:underline" style={{ color: "#1A2332" }}>
        {production.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px]" style={{ color: "#2F62D8" }}>Ready</span>
        {shotCount > 0 && (
          <span className="text-[10px]" style={{ color: "#8A8578" }}>
            · {shotCount} shots · ~{shotCount * 8}s
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Studio Activity Indicator ─────────────────────────────────────────────────

function StudioActivityIndicator({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded transition-colors"
        style={{
          backgroundColor: open ? "rgba(47,98,216,0.08)" : "transparent",
          color: active ? "#2F62D8" : "#8A8578",
        }}
      >
        <Activity className="w-3 h-3" />
        <span className="hidden sm:inline">{active ? "Studio is working" : "Studio is idle"}</span>
        <span className="sm:hidden">{active ? "Working" : "Idle"}</span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: active ? "#2F62D8" : "#8A8578",
            animation: active ? "pulse 2s infinite" : undefined,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-lg border shadow-xl z-50"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
        >
          <div className="p-3 border-b" style={{ borderColor: "#EAE6DF" }}>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "#8A8578" }}>
              Studio Activity
            </p>
          </div>
          <div className="p-3">
            <p className="text-[11px] leading-relaxed" style={{ color: "#4A5568" }}>
              {active
                ? "The Studio is processing your production. This may take a few minutes."
                : "No active jobs. The Studio is waiting for your next move."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudioHomePage() {
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = () => { setProductions(getProductions()); setLoaded(true) }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  // ─── Derived data ───
  const decisionQueue = useMemo(() =>
    productions
      .filter((p) => nextGate(p) !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [productions]
  )

  const inProduction = useMemo(() =>
    productions
      .filter((p) => {
        const g = nextGate(p)
        return g !== null
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6),
    [productions]
  )

  const readyPackages = useMemo(() =>
    productions.filter((p) => nextGate(p) === null),
    [productions]
  )

  const nowShowing = useMemo(() => {
    // Latest production with a rendered video, or latest ready package
    const withVideo = productions
      .filter((p) => p.film.shots.some((s) => s.renderedVideoUrl))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (withVideo.length > 0) return withVideo[0]
    return readyPackages[0] ?? null
  }, [productions, readyPackages])

  const hasActivity = false // Will be wired to real job status

  // ─── Render ───
  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>
        {/* ─── Global Top Bar ─── */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(244,241,234,0.92)",
            borderColor: "#DDD8CE",
          }}
        >
          {/* Left: page title */}
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
              Studio
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded transition-colors hover:bg-black/5"
              style={{ color: "#8A8578" }}
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded transition-colors hover:bg-black/5 relative"
              style={{ color: "#8A8578" }}
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {decisionQueue.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
                >
                  {decisionQueue.length}
                </span>
              )}
            </button>
            <StudioActivityIndicator active={hasActivity} />
            <button
              onClick={() => router.push("/thinking-room/new")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              <Plus className="w-3 h-3" />
              Bring a post
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* ─── A. Header ─── */}
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "#8A8578" }}>
              {todayLabel()}
            </p>
            <h1
              className="font-serif leading-none"
              style={{ fontSize: "48px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              {greeting()}
            </h1>
            <p className="mt-2.5 text-[13px]" style={{ color: "#4A5568" }}>
              {statusSummary(productions)}
            </p>
          </div>

          {/* ─── B. Now Showing ─── */}
          {nowShowing && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-serif" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                  Now showing
                </h2>
              </div>

              <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
              >
                <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
                  {/* Video / frame preview — custom overlay, no native controls */}
                  <div
                    className="relative aspect-video group cursor-pointer"
                    style={{ backgroundColor: "#0D1626" }}
                    onClick={() => {
                      const video = document.getElementById('now-showing-video') as HTMLVideoElement | null
                      if (video) {
                        if (video.paused) video.play()
                        else video.pause()
                      }
                    }}
                  >
                    {nowShowing.film.shots.find((s) => s.renderedVideoUrl)?.renderedVideoUrl ? (
                      <video
                        id="now-showing-video"
                        src={nowShowing.film.shots.find((s) => s.renderedVideoUrl)?.renderedVideoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: productionGradient(nowShowing.title), opacity: 0.85 }}
                      />
                    )}
                    {/* Custom play overlay — always visible on hero */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.92)" }}>
                        <Play className="w-6 h-6 ml-0.5" style={{ color: "#0D1626" }} />
                      </div>
                    </div>
                  </div>

                  {/* Info panel — balanced, no dead space */}
                  <div className="p-5 flex flex-col" style={{ borderLeft: "1px solid #EAE6DF" }}>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#C29A5B" }}>
                      Latest film
                    </p>
                    <h3 className="font-serif text-xl leading-tight mb-3" style={{ color: "#1A2332" }}>
                      {nowShowing.title}
                    </h3>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#8A8578" }}>
                      Video companion for
                    </p>
                    <p className="text-[11px] leading-relaxed italic mb-4" style={{ color: "#1A2332" }}>
                      {nowShowing.sourceThought.length > 140
                        ? `“${nowShowing.sourceThought.slice(0, 137)}…”`
                        : `“${nowShowing.sourceThought}”`
                      }
                    </p>

                    {/* Metadata + world tags */}
                    <div className="flex flex-wrap items-center gap-1 mb-3">
                      <span className="text-[10px]" style={{ color: "#8A8578" }}>
                        {nowShowing.film.shots.length} shots · ~{nowShowing.film.shots.length * 8}s
                      </span>
                      {nowShowing.film.shots.filter((s) => s.renderedVideoUrl).length > 0 && (
                        <span className="text-[10px] font-medium ml-1" style={{ color: "#2F62D8" }}>
                          · Motion ready
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: "#2F62D8" }}>
                        Canon Scene 003
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(194,154,91,0.08)", color: "#C29A5B" }}>
                        World Bible v1
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(194,154,91,0.08)", color: "#C29A5B" }}>
                        Spirit First
                      </span>
                    </div>

                    {/* CTA — single primary, clean hierarchy */}
                    <div className="mt-auto">
                      <button
                        onClick={() => router.push(`/film-studio/render?id=${nowShowing.id}`)}
                        className="flex items-center justify-center gap-1.5 text-[11px] font-semibold w-full px-3 py-2 rounded transition-colors mb-1.5"
                        style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
                      >
                        <Play className="w-3 h-3" />
                        Open in render studio
                      </button>
                      <div className="flex items-center justify-center gap-3 text-[10px]">
                        <button
                          onClick={() => router.push(`/film-studio?id=${nowShowing.id}`)}
                          className="font-medium transition-colors hover:underline"
                          style={{ color: "#2F62D8" }}
                        >
                          Production
                        </button>
                        <span style={{ color: "#DDD8CE" }}>·</span>
                        <button
                          onClick={() => router.push(`/library/${nowShowing.id}`)}
                          className="font-medium transition-colors hover:underline"
                          style={{ color: "#2F62D8" }}
                        >
                          Package
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ─── C. In Production ─── */}
          {inProduction.length > 0 && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-serif" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                  In production
                </h2>
                <button
                  onClick={() => router.push("/approvals")}
                  className="text-[11px] font-medium hover:underline"
                  style={{ color: "#2F62D8" }}
                >
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {inProduction.map((p) => (
                  <ProductionCard
                    key={p.id}
                    production={p}
                    onClick={() => {
                      const gate = nextGate(p)
                      if (gate) router.push(gateRoute(p, gate))
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── D. Needs Your Decision ─── */}
          {decisionQueue.length > 0 && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="font-serif" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                    Needs your decision
                  </h2>
                  <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>
                    The work only moves when you do.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {decisionQueue.map((p) => (
                  <DecisionCard
                    key={p.id}
                    production={p}
                    onClick={() => {
                      const gate = nextGate(p)!
                      router.push(gateRoute(p, gate))
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── E. The Studio Sees Something ─── */}
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="font-serif" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                  The Studio sees something
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>
                  Recommendations drawn from your World Bible and production history.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {SAMPLE_RECOMMENDATIONS.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          </section>

          {/* ─── F. Recent Packages ─── */}
          {readyPackages.length > 0 && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-serif" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                  Recent packages
                </h2>
                <button
                  onClick={() => router.push("/library")}
                  className="text-[11px] font-medium hover:underline"
                  style={{ color: "#2F62D8" }}
                >
                  Open Library →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {readyPackages.slice(0, 4).map((p) => (
                  <PackageCard
                    key={p.id}
                    production={p}
                    onClick={() => router.push(`/library/${p.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── Empty State ─── */}
          {loaded && productions.length === 0 && (
            <section className="py-20 text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{ backgroundColor: "rgba(47,98,216,0.06)" }}
              >
                <Sparkles className="w-7 h-7" style={{ color: "#2F62D8" }} />
              </div>
              <h2 className="font-serif mb-3" style={{ fontSize: "28px", color: "#1A2332", fontWeight: 400 }}>
                The Studio is ready.
              </h2>
              <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: "#4A5568" }}>
                Bring a LinkedIn post, a rough thought, or a voice note. The Studio will help you turn it into a cinematic film.
              </p>
              <button
                onClick={() => router.push("/thinking-room/new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
              >
                <Plus className="w-4 h-4" />
                Bring a post
              </button>
            </section>
          )}
        </div>
      </div>
    </Shell>
  )
}
