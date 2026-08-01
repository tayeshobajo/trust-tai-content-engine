import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { ContentSpine, AudienceShift } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface PatternAnalysis {
  recurringThemes: Array<{
    theme: string
    appearances: number
    sourceIds: string[]
    observation: string
  }>
  contentGaps: Array<{
    gap: string
    why: string
    urgency: "low" | "medium" | "high"
  }>
  productiveTensions: Array<{
    tension: string
    detail: string
  }>
  topicRecommendations: Array<{
    title: string
    observedPattern: string
    humanTruth: string
    unconventionalAngle: string
    roadmapConnection: string
    audienceShift: string
    premises: string[]
    confidenceLevel: "low" | "medium" | "high"
    whatStudioMayMisunderstand: string
  }>
  studioObservation: string
}

const SYSTEM_PROMPT = `You are the Trust Tai Studio pattern intelligence.

You read across multiple productions from Tai Shobajo to find recurring themes, productive tensions, content gaps, and new directions worth exploring.

Your job is not to tell Tai what he already knows. Your job is to name the pattern he is living in before he can name it himself — and show him what becomes possible once it is named.

WHAT YOU ARE LOOKING FOR:

RECURRING THEMES
- What concern has appeared in multiple productions in different forms?
- Which problems does Tai describe using different language but the same underlying principle?
- Which approved posts belong to a larger unnamed theme?
- What belief has shifted in Tai's recent thinking?

CONTENT GAPS
- Which part of Tai's worldview has been implied but never explained?
- What would a new audience member misunderstand after reading the last five posts?
- Have recent posts diagnosed problems without showing possibility?
- Are too many posts addressing founders while neglecting leaders, teams, or families?
- Is the next post adding to the body of work or merely filling a publishing slot?

PRODUCTIVE TENSIONS
- Where does Tai disagree with accepted business advice?
- What behavior is praised publicly but damaging privately?
- Where does efficiency conflict with humanity?
- What truth would make a founder initially uncomfortable but ultimately feel understood?

TOPIC RECOMMENDATIONS
Every recommendation must contain:
- The observed pattern and source
- Why the idea matters now
- The human truth
- The unconventional angle
- The Roadmap connection
- The audience shift
- Three genuinely different story premises
- Confidence level
- What Studio may be misunderstanding

RULES:
- Name patterns honestly, including uncomfortable ones
- Do not recommend a topic Tai has already fully explored
- Distinguish meaningful continuation from repetition
- The studio observation should be specific, not motivational
- If the body of work is too small for patterns, say so`

export async function POST(req: NextRequest) {
  try {
    const { productions } = await req.json() as {
      productions: Array<{
        id: string
        title: string
        spine: ContentSpine
        shift: AudienceShift
        publishedAt?: string
        createdAt: string
      }>
    }

    if (!productions || productions.length < 2) {
      return NextResponse.json({
        recurringThemes: [],
        contentGaps: [],
        productiveTensions: [],
        topicRecommendations: [],
        studioObservation: "Add more productions before pattern analysis becomes meaningful.",
      } as PatternAnalysis)
    }

    const summary = productions.slice(0, 20).map((p) => ({
      id: p.id,
      title: p.title,
      deeperTruth: p.spine.deeperTruth,
      rememberSentence: p.spine.rememberSentence,
      audienceBeginning: p.shift.beginning,
      audienceEnd: p.shift.end,
      whatOthersMiss: p.spine.whatOthersMiss,
      roadmapConnection: p.spine.roadmapConnection,
      createdAt: p.createdAt,
    }))

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyse this body of work from Trust Tai Studio.

PRODUCTIONS (${summary.length} total):
${summary.map((p, i) => `
${i + 1}. "${p.title}" (${new Date(p.createdAt).toLocaleDateString()})
   Deep truth: ${p.deeperTruth}
   Remember: ${p.rememberSentence}
   Audience shift: ${p.audienceBeginning} → ${p.audienceEnd}
   What others miss: ${p.whatOthersMiss}
   Roadmap: ${p.roadmapConnection.slice(0, 120)}`).join("\n")}

Return a JSON object with exactly this structure:
{
  "recurringThemes": [
    {
      "theme": "Short theme name",
      "appearances": 3,
      "sourceIds": ["id1", "id2", "id3"],
      "observation": "One specific sentence about what this pattern reveals."
    }
  ],
  "contentGaps": [
    {
      "gap": "Short gap description",
      "why": "Why this gap matters to the audience",
      "urgency": "low|medium|high"
    }
  ],
  "productiveTensions": [
    {
      "tension": "Short tension description",
      "detail": "One sentence on why this tension is worth exploring"
    }
  ],
  "topicRecommendations": [
    {
      "title": "Proposed topic title",
      "observedPattern": "The pattern from existing work that led to this recommendation",
      "humanTruth": "The human truth this topic would protect",
      "unconventionalAngle": "What most creators would miss",
      "roadmapConnection": "The Roadmap Thinking dimension this touches",
      "audienceShift": "Beginning belief → end understanding",
      "premises": ["Premise 1", "Premise 2", "Premise 3"],
      "confidenceLevel": "low|medium|high",
      "whatStudioMayMisunderstand": "What Studio might be getting wrong about this recommendation"
    }
  ],
  "studioObservation": "A specific observation about the overall body of work — what pattern Tai is living in, what territory has been covered, what is emerging."
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

    const parsed = JSON.parse(jsonMatch[0]) as PatternAnalysis
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[studio/patterns]", err)
    return NextResponse.json({ error: "Pattern analysis failed" }, { status: 500 })
  }
}
