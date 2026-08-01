import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { AudienceShift, ArgumentSection, ContentSpine } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type CompareResult = {
  differences: Array<{
    dimension: "truth" | "tone" | "emotion" | "audience" | "structure"
    summary: string
    strongerVersion: "current" | "original" | "neither"
  }>
  recommendation: "current" | "original" | "neither"
  reasoning: string
}

const SYSTEM_PROMPT =
  "You compare two versions of a Trust Tai Studio post by meaning, not just word changes. You identify what shifted in truth, tone, emotional weight, audience effect, and which version is stronger."

function postText(sections: ArgumentSection[]): string {
  return sections.map((section) => section.text.trim()).filter(Boolean).join("\n\n")
}

export async function POST(req: NextRequest) {
  try {
    const { spine, shift, currentSections, originalSections } = await req.json() as {
      spine: ContentSpine
      shift: AudienceShift
      currentSections: ArgumentSection[]
      originalSections: ArgumentSection[] | null
    }

    if (!Array.isArray(currentSections) || currentSections.length === 0) {
      return NextResponse.json({ error: "Current sections are required" }, { status: 400 })
    }

    if (!originalSections || originalSections.length === 0) {
      const fallback: CompareResult = {
        differences: [
          {
            dimension: "structure",
            summary: "No earlier section snapshot is available yet, so Studio cannot compare this version against a prior post draft.",
            strongerVersion: "neither",
          },
        ],
        recommendation: "neither",
        reasoning: "There is no previous post version stored in production revisions. Revise manually if the post still feels weak, or approve the current version if it already carries the truth cleanly.",
      }
      return NextResponse.json(fallback)
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Compare these two Trust Tai Studio post versions.

APPROVED SPINE:
What happened: ${spine.whatHappened}
What Tai noticed: ${spine.whatTaiNoticed}
What others miss: ${spine.whatOthersMiss}
Deeper truth: ${spine.deeperTruth}
Roadmap connection: ${spine.roadmapConnection}
Founder value: ${spine.founderValue}
Remember sentence: ${spine.rememberSentence}

AUDIENCE SHIFT:
Beginning: ${shift.beginning}
End: ${shift.end}

CURRENT VERSION:
${postText(currentSections)}

PREVIOUS VERSION:
${postText(originalSections)}

Return valid JSON only with exactly this structure:
{
  "differences": [
    {
      "dimension": "truth|tone|emotion|audience|structure",
      "summary": "...",
      "strongerVersion": "current|original|neither"
    }
  ],
  "recommendation": "current|original|neither",
  "reasoning": "..."
}

Include all five dimensions exactly once. Judge by meaning, not line edits.`,
        },
      ],
    })

    const raw = message.content[0]?.type === "text" ? message.content[0].text : ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as CompareResult
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[studio/compare]", err)
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 })
  }
}
