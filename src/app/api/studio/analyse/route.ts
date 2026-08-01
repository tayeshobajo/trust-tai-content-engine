import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { ContentSpine, AudienceShift } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the Trust Tai Studio intelligence engine.

Your role is to find the genuine human truth inside a raw thought from Tai Shobajo — founder, consultant, and creator of Trust Tai and Spirit First.

You operate from two governing frameworks:

SPIRIT FIRST
- See the person before evaluating the problem
- Look beneath visible behavior for invisible weight
- Preserve the character's dignity
- Tell the truth without making the person feel small
- Avoid exploiting pain for engagement
- Compassion must coexist with accountability
- The audience is the hero, Tai is the guide
- Create recognition rather than dependence
- Invite the audience forward instead of instructing from above
- Make people feel understood rather than targeted

ROADMAP THINKING
- Distinguish the visible problem from the system producing it
- Identify Point A (where the person is) and Point B (where they want to go)
- Find what the person cannot see from their current position
- Reveal the larger pattern without relying on exposition
- Identify dependencies and consequences
- Distinguish movement from progress
- Identify what should NOT be done yet
- Recommend the move that makes later moves easier, possible, or unnecessary
- The destination the person consciously pursues may differ from their deeper desired outcome

VOICE RULES
- No em dashes
- No: very, really, just, actually, leverage, synergy, unlock, game-changer, seamless, empower, delve
- No exclamation marks
- No hashtags in body copy
- No pressure CTAs
- Short sentences. The argument should not need volume.
- Posts are mirrors (reader's problem) not spotlights (Tai's achievements)
- The audience is always a founder navigating real pressure — not an abstract demographic

WHAT YOU ARE LOOKING FOR
When reading a raw thought:
1. What human truth is present here? Not a business lesson — a human truth that would remain valuable if the business context disappeared.
2. What is the person in this story carrying privately?
3. What assumption are most people making about this situation?
4. What would become visible from above — from outside the problem?
5. What is Point A? Where is the person actually standing?
6. What is Point B — the conscious destination? What is the deeper destination?
7. What one move makes later moves easier or unnecessary?
8. What should the audience remember when they close this post?

QUALITY STANDARD
If a field is genuinely unclear from the thought, say so honestly. Do not fill gaps with generic consulting language. Weak specificity is better than impressive-sounding fabrication.`

export async function POST(req: NextRequest) {
  try {
    const { thought, sourceType, principles, worldBibleContext, pilotContext } = await req.json() as {
      thought: string
      sourceType: string
      principles?: Array<{ belief: string; layer: string; confidence: string; behavior: string }>
      worldBibleContext?: string
      pilotContext?: { trigger?: string; audience?: string; exclusion?: string }
    }

    if (!thought || thought.trim().length < 20) {
      return NextResponse.json({ error: "Thought too short" }, { status: 400 })
    }

    // Build principles context if any exist
    let principlesContext = ""
    if (principles && principles.length > 0) {
      const active = principles.filter((p) => p.behavior === "follow" || p.behavior === "warn")
      if (active.length > 0) {
        principlesContext = `\n\nSTUDIO LEARNED PRINCIPLES (apply these to your analysis):\n${active
          .map((p) => `- [${p.layer.toUpperCase()} / ${p.confidence}] ${p.belief}`)
          .join("\n")}`
      }
    }

    // Inject World Bible context for pilot productions
    const worldBibleSection = worldBibleContext
      ? `\n\nWORLD BIBLE CONTEXT (this is a World Bible production — apply strictly):\n${worldBibleContext}`
      : ""

    // Inject pilot context if provided
    const pilotSection = pilotContext
      ? `\n\nADDITIONAL CONTEXT:\n- What triggered this: ${pilotContext.trigger ?? "not specified"}\n- Audience: ${pilotContext.audience ?? "not specified"}\n- Do not conclude: ${pilotContext.exclusion ?? "nothing excluded"}`
      : ""

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT + principlesContext + worldBibleSection,
      messages: [
        {
          role: "user",
          content: `Analyse this raw thought from Tai. Source type: ${sourceType}.${pilotSection}

RAW THOUGHT:
${thought}

Return a JSON object with exactly these fields:
{
  "whatHappened": "The concrete event, observation, or moment that produced this thought. One or two sentences. Specific.",
  "whatTaiNoticed": "What Tai saw that most people overlook. The precise observation — not a generic version of it.",
  "whatOthersMiss": "The assumption most people are making. The surface they fix. The system they leave unchanged.",
  "deeperTruth": "The human truth that remains true even outside the business context. One sentence. This is the sentence the post must protect.",
  "roadmapConnection": "Point A: where the person is. Point B: where they think they are going. The Gap: what they cannot see from inside it. The move: what makes later moves possible.",
  "founderValue": "The practical question a founder can ask today as a result of this insight. Concrete. Not motivational.",
  "rememberSentence": "The one sentence that should remain with the reader the next morning. Plain language. No consulting vocabulary. Maximum 20 words.",
  "audienceBeginning": "What the audience believes at the start — their current assumption or default position.",
  "audienceEnd": "What the audience understands differently by the end. How their inner map changes.",
  "spiritFirstScore": "low | medium | high — does this thought protect the person's dignity and carry genuine human weight?",
  "spiritFirstNote": "One sentence on what strengthens or risks the Spirit First dimension here.",
  "roadmapScore": "low | medium | high — does this thought reveal a meaningful system or path shift?",
  "roadmapNote": "One sentence on what strengthens or risks the Roadmap Thinking dimension here."
}

Return only valid JSON. No prose before or after.`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      whatHappened: string
      whatTaiNoticed: string
      whatOthersMiss: string
      deeperTruth: string
      roadmapConnection: string
      founderValue: string
      rememberSentence: string
      audienceBeginning: string
      audienceEnd: string
      spiritFirstScore: "low" | "medium" | "high"
      spiritFirstNote: string
      roadmapScore: "low" | "medium" | "high"
      roadmapNote: string
    }

    const spine: ContentSpine = {
      whatHappened: parsed.whatHappened,
      whatTaiNoticed: parsed.whatTaiNoticed,
      whatOthersMiss: parsed.whatOthersMiss,
      deeperTruth: parsed.deeperTruth,
      roadmapConnection: parsed.roadmapConnection,
      founderValue: parsed.founderValue,
      rememberSentence: parsed.rememberSentence,
    }

    const shift: AudienceShift = {
      beginning: parsed.audienceBeginning,
      end: parsed.audienceEnd,
    }

    return NextResponse.json({
      spine,
      shift,
      scores: {
        spiritFirst: { score: parsed.spiritFirstScore, note: parsed.spiritFirstNote },
        roadmap: { score: parsed.roadmapScore, note: parsed.roadmapNote },
      },
    })
  } catch (err) {
    console.error("[studio/analyse]", err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
