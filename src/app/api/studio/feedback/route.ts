/**
 * POST /api/studio/feedback
 *
 * Interprets a single audience feedback signal in the context of
 * existing Studio principles. Returns:
 *  - studioInterpretation: what this signal means for the body of work
 *  - principleImpact: which principle this touches (by name)
 *  - reinforcePrincipleId?: if a principle should gain confidence
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import type { AudienceFeedback, StudioPrinciple } from "@/data/studio-memory"

const client = new Anthropic()

export interface FeedbackInterpretation {
  studioInterpretation: string
  principleImpact: string
  reinforcePrincipleId?: string
}

export async function POST(req: Request) {
  try {
    const { feedback, principles } = await req.json() as {
      feedback: AudienceFeedback
      principles: StudioPrinciple[]
    }

    const principleList = principles
      .slice(0, 10) // cap to avoid huge prompts
      .map((p, i) => `[${i + 1}] id:${p.id} — "${p.title}": ${p.belief}`)
      .join("\n")

    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `You are Trust Tai Studio's audience learning engine.

A piece of content received this audience signal:

Kind: ${feedback.kind}
Channel: ${feedback.channel}
Verbatim: "${feedback.verbatim ?? "none"}"
Tai's note: "${feedback.taiNote ?? "none"}"

Current Studio principles:
${principleList}

Return a JSON object with:
- "studioInterpretation": one clear sentence — what does this signal teach Studio about the audience?
- "principleImpact": which principle this touches (name only, or "none")
- "reinforcePrincipleId": the exact id of the principle to reinforce (only if the signal clearly validates a principle — omit if signal is confusion, wrong_reading, or indifference)

Return ONLY valid JSON. No markdown.`,
      }],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}"
    const parsed = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")) as FeedbackInterpretation

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[feedback]", err)
    return NextResponse.json({ error: "Feedback processing failed" }, { status: 500 })
  }
}
