"use client"

/**
 * Pilot Import — "The Man Who Carried a City"
 *
 * Loads the full creative brief into Studio, runs real LLM analysis against
 * the World Bible and studio principles, then routes to the Thinking Room
 * for Tai to review the spine before approving Gate 1 (Truth).
 *
 * This page is the entry point for the first video pilot.
 * Everything after this point runs through the normal frontend gate flow.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { emptyGates, saveProduction } from "@/lib/studio-store"
import { getStudioPrinciples } from "@/lib/studio-memory-store"
import { buildArgument, buildFilmPlan, buildShift, buildSpine, checkVoice } from "@/lib/studio-engine"
import { assembleArgument, type Production } from "@/data/studio"
import { Film, ArrowRight, Sparkles } from "lucide-react"

// ─── The brief ────────────────────────────────────────────────────────────────

const PILOT_SOURCE_THOUGHT = `The Man Who Carried a City.

In the Trust Tai world, every responsibility a person accepts becomes a real structure inside a small case they carry.

The protagonist is a Black man in his late 30s. He moves through a beautiful city while holding an ordinary leather case.

People approach him throughout the day:
- A colleague hands him an unanswered question.
- A client gives him a broken mechanism.
- A worker gives him a decision.
- His younger self gives him a folded dream.
- At home, his child gives him a small drawing.

Each item disappears into the case. The case never grows larger, but it becomes heavier. The man keeps smiling and saying, "I've got it."

The reveal: late that night, he places the case on a table and opens it. Inside is an entire living city. Its roads lead to him. Its lights wait for him. Its machinery stops whenever his hands leave it. Thousands of people appear to be moving, but every route eventually arrives at the same small room where he stands. He has not merely been carrying work. He has been carrying a world that was built to require him.

The decisive moment: he does not destroy the city or abandon it. He reaches inside and moves one central road away from himself. That single move allows several other roads to connect. Lights begin switching on without his touch. Bridges extend between buildings. People begin carrying knowledge to one another. The city does not need less care — it gains more capable hands.

He closes the case. For the first time, it is light enough for his child to lift.

Final image: the child opens the drawing they gave him earlier. It shows the man standing beside the city, not underneath it.

The deeper truth: you may have started carrying everything out of love. But love must eventually build what other people can carry too.`

const PILOT_CONTEXT = {
  trigger: "Recognizing that founders often normalize the weight of everything depending on them — and mistake that weight for leadership.",
  audience: "Founders and operators who have built systems around themselves without realizing it. They are competent, loved, and load-bearing in ways that limit everyone beneath them.",
  exclusion: "Do not frame this as a story about burnout. It is not about exhaustion — it is about the difference between carrying and building. Do not make the protagonist a victim. He is strong. The question is what strength should build toward.",
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  "Reading the brief through the World Bible...",
  "Extracting the deeper human truth...",
  "Building the content spine...",
  "Mapping the audience shift...",
  "Writing the post argument...",
  "Drafting the film plan...",
  "Checking voice and principles...",
  "Saving to Studio...",
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PilotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function launch() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const principles = getStudioPrinciples().map((p) => ({
        belief: p.belief,
        layer: p.layer,
        confidence: p.confidence,
        behavior: p.behavior,
      }))

      setStep(1)

      // Run real LLM analysis with World Bible context injected
      type AnalysisResult = {
        spine: Production["spine"]
        shift: Production["shift"]
        scores: { spiritFirst: { score: string; note: string }; roadmap: { score: string; note: string } }
      }

      let spine = buildSpine(PILOT_SOURCE_THOUGHT, "Typed thought")
      let shift = buildShift(PILOT_SOURCE_THOUGHT, spine)
      let scores: AnalysisResult["scores"] | null = null

      setStep(2)

      try {
        const res = await fetch("/api/studio/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thought: PILOT_SOURCE_THOUGHT,
            sourceType: "Typed thought",
            principles,
            pilotContext: PILOT_CONTEXT,
            worldBibleContext: `
This is a WORLD BIBLE PRODUCTION. Apply these governing principles strictly:

WORLD: Inner realities acquire physical form. The case becomes a city because responsibility is real, not metaphorical.

EMOTIONAL DESTINATION: Awe with belonging. The viewer should feel: Recognition → Curiosity → Awe → Belonging → Agency.

HUMAN TRUTH: Competent people often mistake structural dependency for love. A world that requires you is not a world you have served — it is a world that has not yet grown beyond you.

ANTI-DRIFT: The protagonist is not a victim. He is not burned out. He is strong and loved. The question is what strength should eventually build toward. Do not make this about exhaustion.

SYMBOL IN USE: Case/container (world, system, responsibility someone transports). Living roads (intention and dependency made legible). Light (recognition — what begins to work without him).

SPIRIT FIRST: The protagonist is a Black man in his late 30s. He is portrayed with dignity, tenderness, intelligence, and range. His burden is not used as decoration. His strength is real.

THE DECISIVE MOVE: Moving one road away from himself is a Roadmap Thinking move — the move that makes later moves easier and eventually unnecessary.

FINAL IMAGE: He stands beside the city, not underneath it. This is the shift from load-bearing to architect.
`,
          }),
        })
        if (res.ok) {
          const data = await res.json() as AnalysisResult
          spine = data.spine
          shift = data.shift
          scores = data.scores
        }
      } catch {
        // Fallback to deterministic engine
      }

      setStep(3)
      // Allow UI to update
      await new Promise((r) => setTimeout(r, 200))

      setStep(4)
      const sections = buildArgument(PILOT_SOURCE_THOUGHT, spine)

      setStep(5)
      const warnings = checkVoice(PILOT_SOURCE_THOUGHT + "\n" + assembleArgument(sections))

      setStep(6)
      const now = new Date().toISOString()
      const filmPlan = buildFilmPlan(PILOT_SOURCE_THOUGHT, spine)

      // Override film plan with pilot-specific shot structure
      const pilotFilmPlan: Production["film"] = {
        ...filmPlan,
        selectedConcept: "cinematic-mechanism",
        treatment: [
          "Open on a man in a beautiful city. He carries a leather case. It looks ordinary. He looks strong.",
          "Throughout the day, people give him things: a question, a broken mechanism, a decision, a folded dream, a child's drawing. Each disappears into the case.",
          "The case never grows. But his gait changes — almost imperceptibly.",
          "Late at night. He sets the case on a table and opens it.",
          "Inside: a living city. Roads that glow. Buildings that breathe. Machinery that hums. And every road leads back to him.",
          "He looks at it for a long time.",
          "Then he reaches in and moves one road. Just one.",
          "Other roads connect. Lights switch on without his touch. People begin moving toward each other instead of toward him.",
          "He closes the case. Lifts it. Sets it on the floor.",
          "His child walks in, picks it up without effort.",
          "The child opens the drawing they gave him. In it: the man stands beside the city. Not underneath it.",
        ],
        shots: [
          { no: 1, description: "Wide: man walking through beautiful city, case in hand", durationSec: 5, route: "exterior-city", purpose: "Establish world and protagonist" },
          { no: 2, description: "Colleague hands him an unanswered question — it dissolves into the case", durationSec: 6, route: "street-interaction", purpose: "First weight" },
          { no: 3, description: "Client gives broken mechanism — disappears into case", durationSec: 5, route: "office", purpose: "Second weight" },
          { no: 4, description: "Worker hands him a decision — it enters the case", durationSec: 5, route: "workshop", purpose: "Third weight" },
          { no: 5, description: "Younger self (flashback) hands him a folded dream", durationSec: 6, route: "memory-space", purpose: "Emotional weight" },
          { no: 6, description: "At home — child gives him a drawing. It enters the case", durationSec: 6, route: "home", purpose: "Deepest weight" },
          { no: 7, description: "Night. Case on table. He opens it. Reveal: living city inside", durationSec: 10, route: "interior-night", purpose: "The reveal" },
          { no: 8, description: "Close: roads leading back to him. Machinery waiting. Lights dim.", durationSec: 8, route: "city-interior", purpose: "The weight of dependency" },
          { no: 9, description: "He reaches in. Moves one road. Roads reconnect. Lights ignite.", durationSec: 10, route: "city-interior", purpose: "The decisive move" },
          { no: 10, description: "He closes the case. Child lifts it easily.", durationSec: 6, route: "home-night", purpose: "The transfer" },
          { no: 11, description: "Child opens the drawing. Man stands beside the city.", durationSec: 7, route: "home-night", purpose: "Final image — truth lands" },
        ],
        keyframes: {
          firstFrame: "Man walking through city, case in hand — strength and beauty, no visible burden",
          lastFrame: "Child holds the drawing: man standing beside the city, not underneath it",
          anchors: "The reveal shot (case opening to living city). The decisive move (hand moving the road). The child lifting the case.",
        },
        continuity: [
          { item: "Case is always the same size — the weight is never visible in the object", checked: false },
          { item: "Protagonist's dignity is intact through every scene — no pity", checked: false },
          { item: "The child is not used as emotional manipulation — they are the answer", checked: false },
          { item: "The city inside the case is beautiful, not dystopian", checked: false },
          { item: "The decisive move is small and precise — not dramatic", checked: false },
          { item: "Final image: man beside city, not above or below it", checked: false },
          { item: "World Bible: Spirit First soul check passes all 5 questions", checked: false },
        ],
        modelRoute: [
          { role: "Spine + human truth", model: "claude-sonnet-4-6", why: "Needs genuine understanding of load-bearing vs. building distinction" },
          { role: "Film concepts", model: "claude-sonnet-4-6", why: "World Bible visual grammar must be applied precisely" },
          { role: "Keyframe prompts", model: "claude-sonnet-4-6 → image model", why: "Each frame must pass Spirit First soul check" },
          { role: "Motion render", model: "TBD — runway / kling", why: "Evaluate after keyframes approved" },
        ],
      }

      setStep(7)
      const production: Production = {
        id: `prod-pilot-city-${Date.now()}`,
        title: "The Man Who Carried a City",
        sourceType: "Typed thought",
        sourceThought: PILOT_SOURCE_THOUGHT,
        createdAt: now,
        updatedAt: now,
        spine,
        shift,
        sections,
        voiceWarnings: warnings,
        comments: [
          {
            at: now,
            text: "World Bible Production · Canon Scene 003 · Pilot film",
          },
        ],
        revisions: [
          {
            at: now,
            note: scores
              ? `World Bible analysis complete. Spirit First: ${scores.spiritFirst.score}. Roadmap Thinking: ${scores.roadmap.score}.`
              : "World Bible analysis complete (deterministic fallback). Review spine before approving Truth gate.",
            sections,
          },
        ],
        gates: emptyGates(),
        film: pilotFilmPlan,
      }

      setStep(8)
      await saveProduction(production)

      // Brief pause so Supabase write-behind fires before navigation
      await new Promise((r) => setTimeout(r, 400))

      router.push(`/thinking-room/${production.id}`)
    } catch (err) {
      console.error("[pilot]", err)
      setError("Analysis failed. Check your connection and try again.")
      setLoading(false)
      setStep(0)
    }
  }

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-[10px] border-b" style={{ borderColor: "#DDD8CE" }}>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            <button onClick={() => router.push("/thinking-room")} className="hover:underline">
              Thinking Room
            </button>
            <span style={{ color: "#C0BAB0" }}>/</span>
            <span style={{ color: "#1A2332" }}>Pilot</span>
          </div>
        </div>

        <div className="px-8 pt-12 pb-16 max-w-2xl">

          {/* Pilot badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "#1A2332", color: "#C29A5B" }}>
            <Film className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase">World Bible Production · Canon Scene 003</span>
          </div>

          <h1 className="font-serif mb-3" style={{ fontSize: "42px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.1 }}>
            The Man Who Carried a City
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#8A8578" }}>
            A 75–90 second cinematic film. A Black man carries a city inside an ordinary case.
            A world built to require him. One move that begins to change that.
          </p>

          {/* Brief summary */}
          <div className="rounded-lg p-6 mb-8 space-y-4" style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}>
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: "#C29A5B" }}>Human truth</p>
              <p className="text-sm leading-relaxed" style={{ color: "#1A2332" }}>
                Competent people often mistake structural dependency for love. A world that requires you is not a world you have served — it is a world that has not yet grown beyond you.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: "#C29A5B" }}>Decisive move</p>
              <p className="text-sm leading-relaxed" style={{ color: "#1A2332" }}>
                He moves one road away from himself. That single move allows several others to connect. Love must eventually build what other people can carry too.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: "#C29A5B" }}>World Bible symbols</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Case / container", "Living roads", "Light (recognition)", "Height / elevation"].map((s) => (
                  <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-sm" style={{ backgroundColor: "#F4F1EA", color: "#8A8578", border: "1px solid #DDD8CE" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: "#C29A5B" }}>Gates to pass</p>
              <p className="text-[11px]" style={{ color: "#8A8578" }}>Truth → Post → Concept → Keyframes → Film</p>
            </div>
          </div>

          {/* What happens when you start */}
          <div className="rounded-lg p-5 mb-8" style={{ backgroundColor: "#F4F1EA", border: "1px solid #DDD8CE" }}>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#8A8578" }}>What Studio will do</p>
            <ol className="space-y-2">
              {[
                "Analyse the brief against the World Bible and your learned principles",
                "Extract the content spine (7 fields you can edit before approving)",
                "Draft the LinkedIn post argument",
                "Pre-load the film plan with 11 shots and a continuity checklist",
                "Route you to the Thinking Room to review everything before Gate 1",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold mt-0.5 flex-shrink-0" style={{ color: "#C29A5B" }}>{i + 1}.</span>
                  <span className="text-[12px] leading-relaxed" style={{ color: "#1A2332" }}>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="rounded-lg p-5 mb-6" style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "#C29A5B" }} />
                <p className="text-sm font-medium" style={{ color: "#1A2332" }}>Studio is reading the brief...</p>
              </div>
              <div className="space-y-1.5">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                      i < step ? "bg-green-500" : i === step ? "bg-amber-400 animate-pulse" : "bg-gray-200"
                    }`} />
                    <span className={`text-[11px] transition-colors ${
                      i < step ? "line-through" : i === step ? "font-medium" : ""
                    }`} style={{ color: i < step ? "#94A3B8" : i === step ? "#1A2332" : "#C0BAB0" }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg p-4 mb-6 text-sm" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/thinking-room")}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: "#8A8578" }}
            >
              Back
            </button>
            <button
              onClick={launch}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              {loading ? (
                <>Analysing<span className="animate-pulse">...</span></>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Begin analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
