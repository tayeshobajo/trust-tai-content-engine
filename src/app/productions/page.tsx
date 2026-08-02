"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import type { Production } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { nextGate, approvedGateCount, stageLabel } from "@/data/studio"
import { productionGradient } from "@/lib/studio-badges"
import { Plus, Search, LayoutGrid, List } from "lucide-react"

type ViewFilter = "active" | "needs_decision" | "ready" | "published" | "held" | "archived" | "all"
type DisplayMode = "gallery" | "table"

const FILTER_LABELS: Record<ViewFilter, string> = {
  active: "Active",
  needs_decision: "Needs decision",
  ready: "Ready to publish",
  published: "Published",
  held: "Held",
  archived: "Archived",
  all: "All",
}

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

export default function ProductionsPage() {
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<ViewFilter>("active")
  const [display, setDisplay] = useState<DisplayMode>("gallery")

  useEffect(() => {
    const load = () => { setProductions(getProductions()); setLoaded(true) }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const filtered = useMemo(() => {
    switch (view) {
      case "active":
        return productions.filter((p) => nextGate(p) !== null)
      case "needs_decision":
        return productions.filter((p) => nextGate(p) !== null)
      case "ready":
        return productions.filter((p) => nextGate(p) === null)
      case "published":
        return productions.filter((p) => p.publishedAt)
      case "held":
        return []
      case "archived":
        return productions.filter((p) => p.archivedAt)
      default:
        return productions
    }
  }, [productions, view])

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: "#DDD8CE" }}
        >
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            Productions
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-black/5" style={{ color: "#8A8578" }}>
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => router.push("/thinking-room/new")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              <Plus className="w-3 h-3" /> New production
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <h1 className="font-serif mb-6" style={{ fontSize: "36px", color: "#1A2332", fontWeight: 400 }}>
            Productions
          </h1>

          {/* Filters + display toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1 flex-wrap">
              {(Object.keys(FILTER_LABELS) as ViewFilter[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: view === key ? "#1A2332" : "transparent",
                    color: view === key ? "#FFFFFF" : "#8A8578",
                  }}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDisplay("gallery")}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: display === "gallery" ? "rgba(47,98,216,0.08)" : "transparent",
                  color: display === "gallery" ? "#2F62D8" : "#8A8578",
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDisplay("table")}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: display === "table" ? "rgba(47,98,216,0.08)" : "transparent",
                  color: display === "table" ? "#2F62D8" : "#8A8578",
                }}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {loaded && filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm" style={{ color: "#8A8578" }}>
                No {FILTER_LABELS[view].toLowerCase()} productions.
              </p>
            </div>
          ) : display === "gallery" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => {
                const gate = nextGate(p)
                const approved = approvedGateCount(p)
                const pct = (approved / 5) * 100
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(gate ? `/thinking-room/${p.id}` : `/library/${p.id}`)}
                    className="group flex flex-col text-left rounded-lg border overflow-hidden transition-all hover:shadow-md"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
                  >
                    <div className="relative aspect-video" style={{ background: productionGradient(p.title) }}>
                      {gate && (
                        <span
                          className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(13,22,38,0.7)", color: "#C29A5B" }}
                        >
                          {stageLabel(p)}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-serif text-xs leading-snug group-hover:underline" style={{ color: "#1A2332" }}>
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "#EAE6DF" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#2F62D8" }} />
                        </div>
                        <span className="text-[10px]" style={{ color: "#8A8578" }}>{approved}/5</span>
                      </div>
                      <p className="text-[10px] mt-1.5" style={{ color: "#8A8578" }}>{relativeTime(p.updatedAt)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}>
              <div
                className="hidden md:grid text-[9px] font-bold tracking-[0.1em] uppercase px-4 py-2.5"
                style={{ color: "#8A8578", gridTemplateColumns: "1fr 130px 100px 90px", borderBottom: "1px solid #EAE6DF" }}
              >
                <span>Title</span>
                <span>Stage</span>
                <span>Progress</span>
                <span>Updated</span>
              </div>
              {filtered.map((p, i) => {
                const gate = nextGate(p)
                const approved = approvedGateCount(p)
                const pct = (approved / 5) * 100
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(gate ? `/thinking-room/${p.id}` : `/library/${p.id}`)}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-black/[0.02]"
                    style={{ borderTop: i === 0 ? "none" : "1px solid #EAE6DF" }}
                  >
                    <div className="hidden md:grid items-center" style={{ gridTemplateColumns: "1fr 130px 100px 90px" }}>
                      <span className="text-xs font-medium truncate pr-3" style={{ color: "#1A2332" }}>{p.title}</span>
                      <span className="text-[11px]" style={{ color: "#4A5568" }}>{stageLabel(p)}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "#EAE6DF", width: 50 }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#2F62D8" }} />
                        </div>
                      </div>
                      <span className="text-[11px]" style={{ color: "#8A8578" }}>{relativeTime(p.updatedAt)}</span>
                    </div>
                    <div className="md:hidden">
                      <p className="text-xs font-medium" style={{ color: "#1A2332" }}>{p.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>{stageLabel(p)} · {relativeTime(p.updatedAt)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
