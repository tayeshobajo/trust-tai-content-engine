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

const PILOT_SOURCE_THOUGHT = ""

const PILOT_CONTEXT = {
  trigger: "",
  audience: "",
  exclusion: "",
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
          { no: 1, description: "Close on the man mid-stride. City in the background — blurred, secondary. The leather case in his hand. His posture carries weight that the case itself does not show. We are inside the moment, not above it.", durationSec: 5, route: "exterior-city", purpose: "Drop in — mid-action, no establishing" },
          { no: 2, description: "Street level. A colleague holds out something formless — an unanswered question made briefly visible. It dissolves into the case. The case does not grow. His expression does not change. The exchange is ordinary and invisible.", durationSec: 6, route: "street-interaction", purpose: "Valley entry — first weight added" },
          { no: 3, description: "Closer than shot 2. Office. A client places a broken mechanism in his hands. It enters the case. The camera is closer to the case this time than to his face. We watch the weight enter, not the man receiving it.", durationSec: 5, route: "office", purpose: "Valley deepens — second weight, closer" },
          { no: 4, description: "Workshop. Camera low — below eye line, looking up at the man. A worker hands him a decision from above. It descends into the case. The architecture presses down. The weight of the accumulated decisions visible in his stance.", durationSec: 5, route: "workshop", purpose: "Valley pressing down — third weight, below eye line" },
          { no: 5, description: "A memory space — soft at the edges, sharp at the center. A younger version of him holds a folded dream. He passes it to the present-day man. The weight has always included something of his own. Locked frame. The exchange is silent.", durationSec: 6, route: "memory-space", purpose: "Valley floor inner — emotional weight, the weight he gave himself" },
          { no: 6, description: "Home. Evening light. The child holds out a drawing with both hands. He takes it — tenderly. It enters the case. The camera orbits slowly around both of them. This is the heaviest weight because it is the most loved. The child does not know.", durationSec: 6, route: "home", purpose: "Valley floor deepest — deepest weight, the weight of what he loves" },
          { no: 7, description: "Night. The case on a table in a quiet room. Silence. He opens it. Light escapes upward. Inside: a living city — roads that glow, buildings that breathe, machinery that hums. The same city he has been walking through. The same weight, now visible as a world.", durationSec: 10, route: "interior-night", purpose: "The crack — reveal, the city inside the case" },
          { no: 8, description: "Inside the city in the case. Every road leads back to the man. The machinery is still. The lights are dim. Everything is waiting for him to move first. He sees it. This is the maximum weight of the film — not the carrying, but the seeing.", durationSec: 8, route: "city-interior", purpose: "The bottom — dependency made visible, maximum weight" },
          { no: 9, description: "His hand reaches into the case. One finger moves one road — small, precise, unhurried. Other roads begin connecting without his touch. Lights come on across the city. The camera rises slowly as the cascade begins. He does not touch the lights. He only moved the one road.", durationSec: 10, route: "city-interior", purpose: "The turn — one decisive move, camera rises" },
          { no: 10, description: "He closes the case. He sets it on the floor. The child walks in from the hallway and lifts it with one hand. The camera drifts right with the child — following the weight as it moves. The child does not struggle. The case is light now. The camera follows the child, not the man.", durationSec: 6, route: "home-night", purpose: "Proof — weight transferred, child lifts without effort" },
          { no: 11, description: "The child opens the drawing on the floor. In it: the man stands beside the city. Not underneath it. Not above it. Beside it. The camera pulls back — slowly, glacially — from the drawing, past the child, past the man, until the room is small and the world is understood.", durationSec: 7, route: "home-night", purpose: "Landing — earned wide, man beside city not under it" },
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
