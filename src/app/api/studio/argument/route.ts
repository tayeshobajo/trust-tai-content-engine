import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { ArgumentSection, VoiceWarning, ContentSpine, AudienceShift } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the Trust Tai Studio argument writer.

You write LinkedIn posts in Tai Shobajo's voice. Tai is a founder-led business consultant. His posts are precise, story-led, and written from lived experience.

VOICE RULES — these are absolute:
- No em dashes (— or –). Use a period or a new line.
- No: very, really, just, actually, leverage, synergy, unlock, game-changer, seamless, empower, delve, revolutionize, 10x
- No exclamation marks
- No hashtags in body copy
- No pressure CTAs (act now, don't miss, limited time)
- Short sentences. Under 25 words is the target. Over 32 is a warning.
- First sentence of the post stands alone and earns the scroll
- Posts are mirrors (reader's problem) not spotlights (Tai's achievements)
- Tai is the guide. The audience is the hero.
- Invitation rather than instruction
- Quiet confidence, not volume

STRUCTURE
The post must move through four parts:
1. OPENING: A scene, observation, or moment. Concrete. Earns attention before making any claim.
2. THE TENSION: What most people miss. The pattern beneath the surface problem.
3. THE SHIFT: The perspective change. What becomes visible from above.
4. THE CLOSE: One move. One question. One invitation. Opens a door rather than summarizing.

QUALITY STANDARD
- Every paragraph must advance the audience shift
- Remove any sentence that explains what the story already communicates
- Remove any sentence that exists for applause rather than truth
- Replace business terminology with human language wherever possible
- The post should remain valuable with Tai's name removed — and still unmistakably carry his worldview`

export async function POST(req: NextRequest) {
  try {
    const { spine, shift, rawThought, principles } = await req.json() as {
      spine: ContentSpine
      shift: AudienceShift
      rawThought: string
      principles?: Array<{ belief: string; layer: string; confidence: string; behavior: string }>
    }

    if (!spine || !shift) {
      return NextResponse.json({ error: "spine and shift required" }, { status: 400 })
    }

    let principlesContext = ""
    if (principles && principles.length > 0) {
      const active = principles.filter((p) => p.behavior === "follow" || p.behavior === "warn")
      if (active.length > 0) {
        principlesContext = `\n\nSTUDIO LEARNED VOICE PRINCIPLES:\n${active
          .map((p) => `- [${p.layer.toUpperCase()} / ${p.confidence}] ${p.belief}`)
          .join("\n")}`
      }
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT + principlesContext,
      messages: [
        {
          role: "user",
          content: `Write a LinkedIn post from this approved content spine.

APPROVED SPINE:
- What happened: ${spine.whatHappened}
- What Tai noticed: ${spine.whatTaiNoticed}
- What others miss: ${spine.whatOthersMiss}
- Deeper truth: ${spine.deeperTruth}
- Roadmap connection: ${spine.roadmapConnection}
- Founder value: ${spine.founderValue}
- Remember sentence: ${spine.rememberSentence}

AUDIENCE SHIFT:
- Beginning belief: ${shift.beginning}
- End understanding: ${shift.end}

ORIGINAL THOUGHT (for context only — do not copy from this):
${rawThought}

Return a JSON object with exactly these fields:
{
  "sections": [
    {
      "name": "Opening",
      "text": "The opening scene or observation. 2-4 sentences maximum. Concrete. No generalizations.",
      "rationale": "Why this opening earns attention"
    },
    {
      "name": "The tension",
      "text": "The pattern beneath the surface. What most people miss.",
      "rationale": "Why this sharpens the reader's self-recognition"
    },
    {
      "name": "The shift",
      "text": "The perspective change. What becomes visible from above.",
      "rationale": "How this advances the audience shift"
    },
    {
      "name": "The close",
      "text": "One move, question, or invitation. Opens a door. No summary.",
      "rationale": "Why this ending serves the reader rather than wrapping the post"
    }
  ],
  "voiceWarnings": [
    {
      "rule": "rule name if a voice rule was violated",
      "detail": "specific detail"
    }
  ]
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
      sections: ArgumentSection[]
      voiceWarnings: VoiceWarning[]
    }

    return NextResponse.json({
      sections: parsed.sections ?? [],
      voiceWarnings: parsed.voiceWarnings ?? [],
    })
  } catch (err) {
    console.error("[studio/argument]", err)
    return NextResponse.json({ error: "Argument generation failed" }, { status: 500 })
  }
}
