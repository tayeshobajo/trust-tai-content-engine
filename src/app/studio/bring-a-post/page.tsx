"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { saveProduction, emptyGates } from "@/lib/studio-store"
import { buildSpine, buildArgument, buildFilmPlan, deriveTitle } from "@/lib/studio-engine"
import type { SourceType, Production } from "@/data/studio"
import {
  Plus,
  FileText,
  PenLine,
  Lightbulb,
  Mic,
  Download,
  Sparkles,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  BookOpen,
  Target,
  Film as FilmIcon,
} from "lucide-react"

const ENTRY_CHOICES: { label: string; desc: string; icon: React.ElementType; sourceType: SourceType }[] = [
  { label: "Paste a LinkedIn post", desc: "A finished or near-finished post", icon: FileText, sourceType: "Rough draft" },
  { label: "Write inside the Studio", desc: "Start drafting from scratch", icon: PenLine, sourceType: "Typed thought" },
  { label: "Bring a rough thought", desc: "A sentence, a fragment, an intuition", icon: Lightbulb, sourceType: "Typed thought" },
  { label: "Upload a voice note", desc: "Transcribe and expand from audio", icon: Mic, sourceType: "Voice transcript" },
  { label: "Import a previous post", desc: "Pull from your published library", icon: Download, sourceType: "Article reaction" },
  { label: "Choose from Studio recommendations", desc: "Start from a memory-driven suggestion", icon: Sparkles, sourceType: "Typed thought" },
  { label: "Create from a World story thread", desc: "Continue an ongoing narrative", icon: Globe, sourceType: "Meeting insight" },
  { label: "Ask a question to explore", desc: "Start from curiosity, not certainty", icon: PenLine, sourceType: "Question to explore" },
]

const PRODUCTION_INTENTIONS = [
  "Change how they see a problem",
  "Help them make a decision",
  "Challenge a common belief",
  "Reveal a hidden pattern",
  "Encourage action",
  "Build trust",
  "Introduce a new idea",
]

const FILM_INTENTIONS = [
  "Make the argument felt",
  "Create tension",
  "Reveal a metaphor",
  "Simplify a complex idea",
  "Dramatize a transformation",
  "Create wonder",
  "Leave a lasting image",
]

// Memories are derived from the World Bible store at render time — no static seeds
const SAMPLE_MEMORIES: { label: string; detail: string; source: string }[] = []

const PLAN_STEPS = [
  "Strengthen post",
  "Approve central truth",
  "Create film directions",
  "Write script",
  "Build frames",
  "Generate scenes",
  "Assemble final package",
]

type Step = "source" | "intention" | "memory" | "plan"

export default function BringAPostPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("source")
  const [sourceType, setSourceType] = useState<SourceType>("Rough draft")
  const [workingTitle, setWorkingTitle] = useState("")
  const [sourceContent, setSourceContent] = useState("")
  const [productionIntention, setProductionIntention] = useState("")
  const [customIntention, setCustomIntention] = useState("")
  const [filmIntention, setFilmIntention] = useState("")
  const [memoriesToUse, setMemoriesToUse] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]))
  const [creating, setCreating] = useState(false)

  const hasContent = sourceContent.trim().length > 20
  const activeIntention = customIntention.trim() || productionIntention
  const intentionValid = Boolean(activeIntention) && Boolean(filmIntention)

  function toggleMemory(idx: number) {
    setMemoriesToUse((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function handleStartProduction() {
    if (!hasContent) return
    setCreating(true)

    try {
      const thought = sourceContent.trim()
      const spine = buildSpine(thought, sourceType)
      const title = workingTitle.trim() || deriveTitle(spine)

      const production: Production = {
        id: `prod-${Date.now()}`,
        title,
        sourceThought: thought,
        sourceType,
        spine,
        sections: buildArgument(thought, spine),
        film: buildFilmPlan(thought, spine),
        gates: emptyGates(),
        shift: { beginning: "", end: "" },
        voiceWarnings: [],
        comments: [],
        revisions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      saveProduction(production)
      router.push(`/thinking-room/${production.id}`)
    } catch (error) {
      console.error("[bring-a-post] Failed to create production:", error)
      setCreating(false)
    }
  }

  const stepLabels = ["Source", "Intention", "Memory", "Plan"]
  const stepOrder: Step[] = ["source", "intention", "memory", "plan"]

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: "#DDD8CE" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:underline"
              style={{ color: "#8A8578" }}
            >
              <ArrowLeft className="w-3 h-3" />
              Studio
            </button>
            <span style={{ color: "#DDD8CE" }}>&middot;</span>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#1A2332" }}>
              Bring a Post
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="p-1 rounded transition-colors hover:bg-black/5"
            style={{ color: "#8A8578" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="max-w-3xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-8">
            {stepOrder.map((s, i) => {
              const isActive = step === s
              const isPast = stepOrder.indexOf(step) > i
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-colors"
                      style={{
                        backgroundColor: isActive || isPast ? "#1A2332" : "#FFFFFF",
                        color: isActive || isPast ? "#FFFFFF" : "#8A8578",
                        border: isActive || isPast ? "none" : "1px solid #DDD8CE",
                      }}
                    >
                      {isPast ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide transition-colors"
                      style={{ color: isActive ? "#1A2332" : "#8A8578" }}
                    >
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-px mx-2" style={{ backgroundColor: isPast ? "#1A2332" : "#DDD8CE" }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          {/* ═══ STEP 1: SOURCE ═══ */}
          {step === "source" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif mb-2" style={{ fontSize: "32px", color: "#1A2332", fontWeight: 400 }}>
                  Bring a post
                </h1>
                <p className="text-[13px]" style={{ color: "#4A5568" }}>
                  Enter material into the Studio. A finished post, a rough thought, a voice note — whatever starts the work.
                </p>
              </div>

              {/* Entry choices */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "#8A8578" }}>
                  Start with
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ENTRY_CHOICES.map((opt, idx) => {
                    const Icon = opt.icon
                    const isSelected = sourceType === opt.sourceType
                    return (
                      <button
                        key={idx}
                        onClick={() => setSourceType(opt.sourceType)}
                        className="flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: isSelected ? "#1A2332" : "#DDD8CE",
                          borderWidth: isSelected ? 1.5 : 1,
                        }}
                      >
                        <div
                          className="flex-shrink-0 rounded-md flex items-center justify-center"
                          style={{
                            width: 32, height: 32,
                            backgroundColor: isSelected ? "rgba(47,98,216,0.08)" : "rgba(138,133,120,0.06)",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? "#2F62D8" : "#8A8578" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "#1A2332" }}>{opt.label}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>{opt.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Source input */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "#8A8578" }}>
                  Source content
                </p>
                <input
                  type="text"
                  placeholder="Working title (optional — the Studio will suggest one)"
                  value={workingTitle}
                  onChange={(e) => setWorkingTitle(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm mb-3 outline-none transition-colors focus:border-[#2F62D8]"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE", color: "#1A2332" }}
                />
                <textarea
                  placeholder="Paste your post, write your thought, or describe your idea..."
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border px-3 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[#2F62D8] resize-y"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE", color: "#1A2332" }}
                />
                <p className="text-[10px] mt-2" style={{ color: "#8A8578" }}>
                  {sourceContent.trim().split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => router.push("/")}
                  className="text-[11px] font-medium transition-colors hover:underline"
                  style={{ color: "#8A8578" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("intention")}
                  disabled={!hasContent}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: INTENTION ═══ */}
          {step === "intention" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif mb-2" style={{ fontSize: "32px", color: "#1A2332", fontWeight: 400 }}>
                  What should this change?
                </h1>
                <p className="text-[13px]" style={{ color: "#4A5568" }}>
                  The Studio uses this to shape the argument and the film.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-3.5 h-3.5" style={{ color: "#C29A5B" }} />
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "#C29A5B" }}>
                    Production intention
                  </p>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "#4A5568" }}>
                  What should this post change in the reader?
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTION_INTENTIONS.map((intent) => (
                    <button
                      key={intent}
                      onClick={() => { setProductionIntention(intent); setCustomIntention("") }}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
                      style={{
                        backgroundColor: productionIntention === intent ? "#1A2332" : "#FFFFFF",
                        color: productionIntention === intent ? "#FFFFFF" : "#4A5568",
                        borderColor: productionIntention === intent ? "#1A2332" : "#DDD8CE",
                      }}
                    >
                      {intent}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or write your own..."
                  value={customIntention}
                  onChange={(e) => { setCustomIntention(e.target.value); setProductionIntention("") }}
                  className="w-full rounded-lg border px-3 py-2 text-[12px] mt-2 outline-none transition-colors focus:border-[#2F62D8]"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE", color: "#1A2332" }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FilmIcon className="w-3.5 h-3.5" style={{ color: "#C29A5B" }} />
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "#C29A5B" }}>
                    Film intention
                  </p>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "#4A5568" }}>
                  What should the film add that the post cannot do alone?
                </p>
                <div className="flex flex-wrap gap-2">
                  {FILM_INTENTIONS.map((intent) => (
                    <button
                      key={intent}
                      onClick={() => setFilmIntention(intent)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
                      style={{
                        backgroundColor: filmIntention === intent ? "#1A2332" : "#FFFFFF",
                        color: filmIntention === intent ? "#FFFFFF" : "#4A5568",
                        borderColor: filmIntention === intent ? "#1A2332" : "#DDD8CE",
                      }}
                    >
                      {intent}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-2 italic" style={{ color: "#8A8578" }}>
                  The Studio can recommend one based on your content. You can change it later.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep("source")}
                  className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:underline"
                  style={{ color: "#8A8578" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
                <button
                  onClick={() => setStep("memory")}
                  disabled={!intentionValid}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: MEMORY CHECK ═══ */}
          {step === "memory" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif mb-2" style={{ fontSize: "32px", color: "#1A2332", fontWeight: 400 }}>
                  The Studio found connections
                </h1>
                <p className="text-[13px]" style={{ color: "#4A5568" }}>
                  Memories from your World Bible that relate to this post. Include the ones that should shape the production.
                </p>
              </div>

              <div className="space-y-2">
                {SAMPLE_MEMORIES.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center" style={{ borderColor: "#DDD8CE" }}>
                    <p className="text-[12px]" style={{ color: "#8A8578" }}>No World Bible memories connected yet.</p>
                    <p className="text-[10px] mt-1" style={{ color: "#8A8578" }}>As your World Bible grows, relevant memories will surface here.</p>
                  </div>
                )}
                {SAMPLE_MEMORIES.map((mem, idx) => {
                  const selected = memoriesToUse.has(idx)
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMemory(idx)}
                      className="w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm"
                      style={{
                        backgroundColor: selected ? "rgba(47,98,216,0.02)" : "#FFFFFF",
                        borderColor: selected ? "#2F62D8" : "#DDD8CE",
                      }}
                    >
                      <div
                        className="flex-shrink-0 rounded-md flex items-center justify-center mt-0.5"
                        style={{
                          width: 20, height: 20,
                          backgroundColor: selected ? "#2F62D8" : "transparent",
                          border: selected ? "none" : "1px solid #DDD8CE",
                        }}
                      >
                        {selected && <Check className="w-3 h-3" style={{ color: "#FFFFFF" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: "#C29A5B" }}>
                            {mem.label}
                          </p>
                          <span className="text-[9px]" style={{ color: "#8A8578" }}>&middot;</span>
                          <p className="text-[9px]" style={{ color: "#8A8578" }}>{mem.source}</p>
                        </div>
                        <p className="text-[12px] leading-snug" style={{ color: "#1A2332" }}>
                          {mem.detail}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div
                className="rounded-lg border p-3 flex items-start gap-2"
                style={{ backgroundColor: "rgba(194,154,91,0.04)", borderColor: "rgba(194,154,91,0.2)" }}
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#C29A5B" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "#4A5568" }}>
                  These memories will shape the argument, concept directions, and visual choices. You can exclude any that don&apos;t fit — the Studio will adjust.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep("intention")}
                  className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:underline"
                  style={{ color: "#8A8578" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("plan")}
                    className="text-[11px] font-medium transition-colors hover:underline"
                    style={{ color: "#8A8578" }}
                  >
                    Start without memory
                  </button>
                  <button
                    onClick={() => setStep("plan")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: PLAN ═══ */}
          {step === "plan" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif mb-2" style={{ fontSize: "32px", color: "#1A2332", fontWeight: 400 }}>
                  Ready to start
                </h1>
                <p className="text-[13px]" style={{ color: "#4A5568" }}>
                  Here&apos;s the production plan. The Studio will work through each stage — you approve at every gate.
                </p>
              </div>

              {/* Summary card */}
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "#8A8578" }}>
                      Working title
                    </p>
                    <p className="font-serif text-sm" style={{ color: "#1A2332" }}>
                      {workingTitle || "The Studio will suggest one"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "#8A8578" }}>
                      Source
                    </p>
                    <p className="text-[12px]" style={{ color: "#1A2332" }}>
                      {sourceContent.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "#8A8578" }}>
                      Production intention
                    </p>
                    <p className="text-[12px]" style={{ color: "#1A2332" }}>
                      {activeIntention || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "#8A8578" }}>
                      Film intention
                    </p>
                    <p className="text-[12px]" style={{ color: "#1A2332" }}>
                      {filmIntention || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #EAE6DF" }}>
                  <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>
                    Memories included
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {memoriesToUse.size === 0 ? (
                      <span className="text-[10px] italic" style={{ color: "#8A8578" }}>None — starting fresh</span>
                    ) : (
                      Array.from(memoriesToUse).map((idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "rgba(47,98,216,0.06)", color: "#2F62D8" }}
                        >
                          {SAMPLE_MEMORIES[idx].label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Plan steps */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "#8A8578" }}>
                  Production plan
                </p>
                <div className="space-y-1">
                  {PLAN_STEPS.map((s, i) => (
                    <div
                      key={s}
                      className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #EAE6DF" }}
                    >
                      <div
                        className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: "rgba(47,98,216,0.06)", color: "#2F62D8" }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-[12px]" style={{ color: "#1A2332" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleStartProduction}
                  disabled={creating}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold px-4 py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
                >
                  {creating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Starting production...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Start production
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 text-[11px]">
                  <button
                    onClick={() => router.push("/ideas")}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: "#8A8578" }}
                  >
                    Save as idea
                  </button>
                  <span style={{ color: "#DDD8CE" }}>&middot;</span>
                  <button
                    onClick={handleStartProduction}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: "#8A8578" }}
                  >
                    Start with post only
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
