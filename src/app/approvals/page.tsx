"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Shell from "@/components/Shell"
import { nextGate, stageLabel, type Production } from "@/data/studio"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { productionGradient } from "@/lib/studio-badges"
import { ArrowRight, Clock } from "lucide-react"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  if (Math.floor(hr / 24) === 1) return "Yesterday"
  return `${Math.floor(hr / 24)}d ago`
}

type FilterKey = "all" | "post-review" | "held" | "approved"

function filterLabel(k: FilterKey): string {
  return { all: "All", "post-review": "Post review", held: "Held", approved: "Recently approved" }[k]
}

function ApprovalDeskQueue() {
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

  // Approval Desk shows productions that have cleared Truth but not Post yet,
  // plus held productions and recently approved posts
  const deskProductions = productions.filter((p) => {
    const gate = nextGate(p)
    if (p.gates.truth.status !== "approved") return false // hasn't cleared Truth yet
    return true
  })

  const filters: FilterKey[] = ["all", "post-review", "held", "approved"]
  const active: FilterKey = filters.includes(filterParam) ? filterParam : "all"

  const displayed = active === "all"
    ? deskProductions
    : active === "post-review"
    ? deskProductions.filter((p) => nextGate(p) === "post")
    : active === "held"
    ? deskProductions.filter((p) => Object.values(p.gates).some((g) => g.status === "hold"))
    : deskProductions.filter((p) => p.gates.post.status === "approved")

  const postReviewCount = deskProductions.filter((p) => nextGate(p) === "post").length

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-[10px] border-b" style={{ borderColor: "#DDD8CE" }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            Approval Desk
          </p>
        </div>

        <div className="px-8 pt-7 pb-16">
          <h1 className="font-serif mb-1" style={{ fontSize: "42px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}>
            Approval Desk
          </h1>
          <p className="text-[13px] mb-7" style={{ color: "#8A8578" }}>
            Where the approved truth becomes the final written argument.
          </p>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-6">
            {filters.map((f) => {
              const isActive = f === active
              const count = f === "post-review" ? postReviewCount : undefined
              return (
                <button
                  key={f}
                  onClick={() => router.push(`/approvals${f === "all" ? "" : `?filter=${f}`}`)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
                  style={{
                    backgroundColor: isActive ? "#1A2332" : "transparent",
                    color: isActive ? "#FFFFFF" : "#8A8578",
                    border: isActive ? "none" : "1px solid #DDD8CE",
                  }}
                >
                  {filterLabel(f)}
                  {count !== undefined && count > 0 && (
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isActive ? "#FFFFFF" : "#2F62D8", color: isActive ? "#1A2332" : "#FFFFFF" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* List */}
          {loaded && displayed.length === 0 ? (
            <div className="flex flex-col items-start py-12 px-8 rounded-md" style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}>
              <p className="font-serif mb-2" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
                {active === "post-review" ? "No posts waiting for review." : "Nothing here yet."}
              </p>
              <p className="text-sm" style={{ color: "#8A8578" }}>
                {active === "post-review"
                  ? "Approve a truth in the Thinking Room to begin post drafting."
                  : "Productions appear here once their truth is approved."}
              </p>
              <button
                onClick={() => router.push("/thinking-room")}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-sm mt-5 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
              >
                Open Thinking Room
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="rounded-md overflow-hidden" style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}>
              {displayed.map((p, i) => {
                const isPostReview = nextGate(p) === "post"
                const wordCount = p.sections.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0)
                const warningCount = p.voiceWarnings?.length ?? 0
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/approvals/${p.id}`)}
                    className="w-full text-left flex items-center gap-5 px-5 py-4 transition-colors hover:bg-black/[0.02] group"
                    style={{ borderTop: i === 0 ? "none" : "1px solid #EAE6DF" }}
                  >
                    <div className="w-12 h-12 rounded-sm flex-shrink-0" style={{ background: productionGradient(p.title) }} />
                    <div className="flex-1 min-w-0">
                      {isPostReview && (
                        <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-0.5" style={{ color: "#C29A5B" }}>
                          Post Review
                        </p>
                      )}
                      <p className="font-serif text-sm leading-snug group-hover:underline" style={{ color: "#1A2332", fontWeight: 400 }}>
                        {p.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-sm"
                          style={{ backgroundColor: isPostReview ? "rgba(47,98,216,0.08)" : "rgba(194,154,91,0.1)", color: isPostReview ? "#2F62D8" : "#8A6230" }}
                        >
                          {stageLabel(p)}
                        </span>
                        {wordCount > 0 && (
                          <span className="text-[10px]" style={{ color: "#C0BAB0" }}>{wordCount} words</span>
                        )}
                        {warningCount > 0 && (
                          <span className="text-[10px]" style={{ color: "#C29A5B" }}>
                            {warningCount} voice {warningCount === 1 ? "warning" : "warnings"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#C0BAB0" }}>
                          <Clock className="w-2.5 h-2.5" />
                          {relativeTime(p.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm flex-shrink-0"
                      style={{ border: "1px solid #DDD8CE", color: "#1A2332" }}
                    >
                      Review post
                      <ArrowRight className="w-3 h-3" />
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

export default function ApprovalDeskPage() {
  return <Suspense><ApprovalDeskQueue /></Suspense>
}
