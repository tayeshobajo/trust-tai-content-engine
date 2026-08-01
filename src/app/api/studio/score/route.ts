import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { ContentSpine, AudienceShift, ArgumentSection } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type ScoreDimension = {
  score: "low" | "medium" | "high"
  reasoning: string
  repair?: string
}

export type StoryScore = {
  humanTruth: ScoreDimension
  spiritFirst: ScoreDimension
  perspectiveGained: ScoreDimension
  audienceShift: ScoreDimension
  originality: ScoreDimension
  dramaticStrength: ScoreDimension
  characterAgency: ScoreDimension
  visualMemory: ScoreDimension
  emotionalResidue: ScoreDimension
  producibility: ScoreDimension
  blocking: string[]        // dimension names that block approval
  overallReadiness: "blocked" | "needs_work" | "ready"
  governingQuestion: string // Studio's answer to "What did we help the audience see?"
}

const SYSTEM_PROMPT = `You are the Trust Tai Studio quality evaluator.

You score work across ten dimensions. Three dimensions are blocking: Human Truth, Spirit First, and Audience Shift. Work cannot proceed if any of these score low.

High visual quality cannot compensate for an empty story.
Originality must come from the premise, not unusual imagery.
A score is only useful if it includes honest reasoning and a concrete repair suggestion for weak areas.

SCORING DIMENSIONS:
1. Human Truth — Does this reveal something honest about being human? Would it remain valuable outside the business context?
2. Spirit First — Is the person seen before being evaluated? Is dignity intact? Does compassion coexist with accountability? Is the audience the hero?
3. Perspective Gained — Does the audience see something unavailable at the beginning? Does understanding change?
4. Audience Shift — Does the inner map of the reader change? Is the beginning belief and end understanding clearly different?
5. Originality — Could this only have come from Tai's world? Is the premise unconventional before visual styling?
6. Dramatic Strength — Does something meaningful happen? Is there tension, cost, and revelation?
7. Character Agency — Does the character make the decisive choice? Are they transformed rather than informed?
8. Visual Memory — Is there an image people could describe the next morning?
9. Emotional Residue — Does the work remain with the viewer after it ends?
10. Producibility — Can the idea survive actual execution?

SCORE ONLY: low | medium | high
For every dimension, you must provide:
- score
- reasoning (specific, 1-2 sentences)
- repair (if score is low or medium, a concrete repair suggestion)

After scoring all dimensions, answer the governing question:
"What did we help the audience see, why could they not see it before, and what becomes possible now?"

If you cannot answer this clearly, the work is not ready.`

export async function POST(req: NextRequest) {
  try {
    const { spine, shift, sections } = await req.json() as {
      spine: ContentSpine
      shift: AudienceShift
      sections: ArgumentSection[]
    }

    const postText = sections.map((s) => s.text).join("\n\n")

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Score this Trust Tai Studio production.

APPROVED SPINE:
Deep truth: ${spine.deeperTruth}
Remember sentence: ${spine.rememberSentence}
Roadmap connection: ${spine.roadmapConnection}

AUDIENCE SHIFT:
Beginning: ${shift.beginning}
End: ${shift.end}

POST TEXT:
${postText}

Return a JSON object with exactly this structure:
{
  "humanTruth": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "spiritFirst": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "perspectiveGained": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "audienceShift": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "originality": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "dramaticStrength": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "characterAgency": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "visualMemory": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "emotionalResidue": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "producibility": { "score": "low|medium|high", "reasoning": "...", "repair": "..." },
  "governingQuestion": "What we helped the audience see / why they could not see it before / what becomes possible now. If you cannot answer clearly, say so."
}

Return only valid JSON.`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as Omit<StoryScore, "blocking" | "overallReadiness">

    // Determine blocking dimensions
    const BLOCKING_DIMENSIONS: (keyof typeof parsed)[] = ["humanTruth", "spiritFirst", "audienceShift"]
    const blocking: string[] = []
    for (const dim of BLOCKING_DIMENSIONS) {
      const d = parsed[dim] as ScoreDimension | undefined
      if (d && d.score === "low") blocking.push(dim)
    }

    // Count weak dimensions
    const allDims = ["humanTruth","spiritFirst","perspectiveGained","audienceShift","originality","dramaticStrength","characterAgency","visualMemory","emotionalResidue","producibility"] as const
    const lowCount = allDims.filter((k) => (parsed[k] as ScoreDimension)?.score === "low").length

    const overallReadiness: StoryScore["overallReadiness"] =
      blocking.length > 0 ? "blocked"
      : lowCount >= 3 ? "needs_work"
      : "ready"

    const result: StoryScore = {
      ...parsed,
      blocking,
      overallReadiness,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error("[studio/score]", err)
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 })
  }
}
