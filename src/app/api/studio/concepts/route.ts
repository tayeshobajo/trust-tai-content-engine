import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import type { ConceptDirection, ContentSpine, AudienceShift } from "@/data/studio"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the Trust Tai Studio film concept director.

You generate three genuinely different visual film concepts from an approved content spine. Each concept must:
- Be a real story, not advice wearing cinematic clothing
- Have a specific protagonist with a life beyond the metaphor
- Establish a world with one unusual but coherent law
- Contain a reveal that changes the meaning of earlier images
- Earn the audience's attention through a specific premise — not visual spectacle
- Be unconventional before visual styling is applied
- Carry the human truth from the approved spine without explaining it

THE THREE CONCEPT CATEGORIES:
1. GROUNDED STRANGE — A completely believable world with exactly one impossible rule. The viewer leans in to discover the rule. The rule is connected to the human truth.
2. VISUAL PARABLE — Two characters whose contrast reveals a principle. The unexpected character wins. The inversion of the obvious advantage is the hook.
3. CINEMATIC MECHANISM — A physical system or structure that behaves in a way that reveals the human truth. The mechanism becomes legible through observation, not narration.

RULES:
- Each concept must differ in story logic, not merely setting or art style
- The reveal must surprise because perspective changed — not only because information was withheld
- Avoid generic: person walking through maze, eagle soaring, lone figure on mountain, glowing path
- Avoid: empty spectacle, floating particles, unnecessary glowing objects
- The protagonist must make a meaningful choice
- The final image must prove something has changed
- Each concept should be producible: first as approved still frames, then free motion test, then paid render

QUALITY CHECKS — before finalizing each concept, verify:
- Can the story be understood emotionally without narration?
- Does the premise resist predictable motivational storytelling?
- Is there one image people could describe the next morning?
- Could this come only from the Trust Tai world?
- Is the audience the hero?`

export async function POST(req: NextRequest) {
  try {
    const { spine, shift, rawThought, principles } = await req.json() as {
      spine: ContentSpine
      shift: AudienceShift
      rawThought: string
      principles?: Array<{ belief: string; layer: string; confidence: string; behavior: string }>
    }

    if (!spine) {
      return NextResponse.json({ error: "spine required" }, { status: 400 })
    }

    let principlesContext = ""
    if (principles && principles.length > 0) {
      const worldTaste = principles.filter(
        (p) => (p.layer === "world" || p.layer === "story" || p.layer === "taste") &&
          (p.behavior === "follow" || p.behavior === "warn")
      )
      if (worldTaste.length > 0) {
        principlesContext = `\n\nSTUDIO WORLD AND TASTE PRINCIPLES (apply these to concept generation):\n${worldTaste
          .map((p) => `- [${p.layer.toUpperCase()} / ${p.confidence} / ${p.behavior.toUpperCase()}] ${p.belief}`)
          .join("\n")}`
      }
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT + principlesContext,
      messages: [
        {
          role: "user",
          content: `Generate three film concept directions from this approved content spine.

APPROVED SPINE:
- What happened: ${spine.whatHappened}
- What Tai noticed: ${spine.whatTaiNoticed}
- What others miss: ${spine.whatOthersMiss}
- Deeper truth: ${spine.deeperTruth}
- Roadmap connection: ${spine.roadmapConnection}
- Remember sentence: ${spine.rememberSentence}

AUDIENCE SHIFT:
- Beginning belief: ${shift.beginning}
- End understanding: ${shift.end}

ORIGINAL THOUGHT (context only):
${rawThought}

Return a JSON object with exactly this structure:
{
  "concepts": [
    {
      "key": "grounded-strange",
      "name": "Grounded Strange",
      "premise": "One sentence. The world and its impossible rule.",
      "visualAction": "What happens visually, shot by shot. Specific. No abstract descriptions.",
      "whyItEarnsAttention": "The specific hook. Why does a viewer not scroll past in the first 2 seconds?",
      "represents": "What the impossible rule represents in relation to the human truth.",
      "connection": "How the closing image carries the remember sentence without stating it.",
      "reveal": "What the final image proves. How it changes the meaning of the opening.",
      "producibility": "Honest assessment: what makes this easy, what creates risk.",
      "shotCount": 6,
      "costEstimate": "Free first pass (6 approved frames, YouTube motion test before paid render)"
    },
    {
      "key": "visual-parable",
      "name": "Visual Parable",
      "premise": "...",
      "visualAction": "...",
      "whyItEarnsAttention": "...",
      "represents": "...",
      "connection": "...",
      "reveal": "...",
      "producibility": "...",
      "shotCount": 7,
      "costEstimate": "Free first pass (7 approved frames, YouTube motion test before paid render)"
    },
    {
      "key": "cinematic-mechanism",
      "name": "Cinematic Mechanism",
      "premise": "...",
      "visualAction": "...",
      "whyItEarnsAttention": "...",
      "represents": "...",
      "connection": "...",
      "reveal": "...",
      "producibility": "...",
      "shotCount": 6,
      "costEstimate": "Free first pass (6 approved frames, YouTube motion test before paid render)"
    }
  ]
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

    const parsed = JSON.parse(jsonMatch[0]) as { concepts: ConceptDirection[] }
    return NextResponse.json({ concepts: parsed.concepts ?? [] })
  } catch (err) {
    console.error("[studio/concepts]", err)
    return NextResponse.json({ error: "Concept generation failed" }, { status: 500 })
  }
}
