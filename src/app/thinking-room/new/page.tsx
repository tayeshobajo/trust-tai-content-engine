"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  SOURCE_TYPES,
  type Production,
  type SourceType,
} from "@/data/studio"
import {
  buildArgument,
  buildFilmPlan,
  buildShift,
  buildSpine,
  checkVoice,
  deriveTitle,
  extractTopic,
} from "@/lib/studio-engine"
import { emptyGates, saveProduction } from "@/lib/studio-store"
import { ChevronDown, ArrowRight, Lightbulb } from "lucide-react"
import { assembleArgument } from "@/data/studio"

export default function NewThoughtPage() {
  const router = useRouter()
  const [thought, setThought] = useState("")
  const [sourceType, setSourceType] = useState<SourceType>("Typed thought")
  const [contextOpen, setContextOpen] = useState(false)
  const [trigger, setTrigger] = useState("")
  const [audience, setAudience] = useState("")
  const [exclusion, setExclusion] = useState("")
  const [working, setWorking] = useState(false)

  const canExtract = thought.trim().length >= 40

  function handleExtract() {
    if (!canExtract || working) return
    setWorking(true)

    const text = thought.trim()
    const spine = buildSpine(text, sourceType)
    const sections = buildArgument(text, spine)
    const shift = buildShift(text, spine)
    const warnings = checkVoice(text + "\n" + assembleArgument(sections))
    const now = new Date().toISOString()

    const production: Production = {
      id: `prod-${Date.now()}`,
      title: deriveTitle(spine),
      sourceType,
      sourceThought: text,
      createdAt: now,
      updatedAt: now,
      spine,
      shift,
      sections,
      voiceWarnings: warnings,
      comments: [],
      revisions: [
        {
          at: now,
          note: "Content spine extracted in the Thinking Room.",
        },
      ],
      gates: emptyGates(),
      film: buildFilmPlan(text, spine),
    }

    saveProduction(production)
    router.push(`/thinking-room/${production.id}`)
  }

  const charCount = thought.trim().length
  const topic = charCount >= 20 ? extractTopic(thought) : null

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-8 py-[10px] border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            <button onClick={() => router.push("/thinking-room")} className="hover:underline">
              Thinking Room
            </button>
            <span style={{ color: "#C0BAB0" }}>/</span>
            <span style={{ color: "#1A2332" }}>New thought</span>
          </div>
        </div>

        <div className="px-8 pt-8 pb-16 max-w-3xl">

          {/* ── Heading ── */}
          <h1
            className="font-serif mb-1"
            style={{ fontSize: "38px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            What have you been thinking about?
          </h1>
          <p className="text-[13px] mb-8" style={{ color: "#8A8578" }}>
            Write the thought the way you would say it. A moment with a client, a pattern you keep
            seeing, a question you cannot put down.
          </p>

          {/* ── Source type ── */}
          <div className="flex items-center gap-2 mb-3">
            <label className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "#8A8578" }}>
              Capture type
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="text-xs font-medium px-2.5 py-1 rounded-sm outline-none transition-colors"
              style={{
                border: "1px solid #DDD8CE",
                backgroundColor: "#FFFFFF",
                color: "#1A2332",
              }}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ── Main textarea ── */}
          <div
            className="rounded-md overflow-hidden mb-3"
            style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
          >
            {/* Formatting hint row */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-b"
              style={{ borderColor: "#EAE6DF" }}
            >
              <span className="text-xs" style={{ color: "#C0BAB0" }}>¶</span>
              <span className="text-xs font-bold" style={{ color: "#C0BAB0" }}>B</span>
              <span className="text-xs italic" style={{ color: "#C0BAB0" }}>I</span>
              <div className="w-px h-3 flex-shrink-0" style={{ backgroundColor: "#DDD8CE" }} />
              <span className="text-[10px]" style={{ color: "#C0BAB0" }}>Type or paste your thought</span>
            </div>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              rows={10}
              autoFocus
              placeholder="Start writing..."
              className="w-full px-5 py-4 text-sm outline-none resize-none leading-relaxed"
              style={{ color: "#1A2332", backgroundColor: "#FFFFFF", fontFamily: "inherit" }}
            />
            <div
              className="flex items-center justify-between px-4 py-2 border-t"
              style={{ borderColor: "#EAE6DF" }}
            >
              <span className="text-[11px]" style={{ color: "#C0BAB0" }}>
                {charCount < 40 ? `${40 - charCount} more characters to unlock analysis` : "Ready to find the deeper truth"}
              </span>
              {topic && (
                <span className="text-[11px]" style={{ color: "#8A8578" }}>
                  Detected topic: <span style={{ color: "#1A2332", fontWeight: 500 }}>{topic}</span>
                </span>
              )}
            </div>
          </div>

          {/* ── Optional context ── */}
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className="flex items-center gap-2 text-[11px] font-medium mb-4 transition-colors"
            style={{ color: "#8A8578" }}
          >
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{ transform: contextOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            Optional context
          </button>

          {contextOpen && (
            <div
              className="rounded-md p-5 mb-6 space-y-4"
              style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
            >
              <div>
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase block mb-1.5" style={{ color: "#8A8578" }}>
                  What triggered this thought?
                </label>
                <input
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="A client call, an article, a repeated pattern..."
                  className="w-full text-sm px-3 py-2 rounded-sm outline-none"
                  style={{ border: "1px solid #DDD8CE", color: "#1A2332", backgroundColor: "#FAFAF8" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase block mb-1.5" style={{ color: "#8A8578" }}>
                  Who is this for?
                </label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Founders navigating growth, mid-market ops teams..."
                  className="w-full text-sm px-3 py-2 rounded-sm outline-none"
                  style={{ border: "1px solid #DDD8CE", color: "#1A2332", backgroundColor: "#FAFAF8" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase block mb-1.5" style={{ color: "#8A8578" }}>
                  Is there something you do not want Studio to conclude?
                </label>
                <input
                  value={exclusion}
                  onChange={(e) => setExclusion(e.target.value)}
                  placeholder="Avoid implying X, do not frame this as Y..."
                  className="w-full text-sm px-3 py-2 rounded-sm outline-none"
                  style={{ border: "1px solid #DDD8CE", color: "#1A2332", backgroundColor: "#FAFAF8" }}
                />
              </div>
            </div>
          )}

          {/* ── Primary action ── */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/thinking-room")}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: "#8A8578" }}
            >
              Cancel
            </button>
            <button
              onClick={handleExtract}
              disabled={!canExtract || working}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              {working ? (
                <>Analysing<span className="animate-pulse">...</span></>
              ) : (
                <>
                  <Lightbulb className="w-3.5 h-3.5" />
                  Find the deeper truth
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
