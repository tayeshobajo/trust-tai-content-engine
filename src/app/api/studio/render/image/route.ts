import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

const SYSTEM_PROMPT = `You are generating a frame for a Trust Tai cinematic film. Visual grammar: awe with belonging, not spectacle. The world is beautiful and lived-in. Characters — especially Black characters — are portrayed with dignity, intelligence, and tenderness. Light is recognition, not holiness. Height is perspective, not superiority. Every frame must pass the Spirit First soul check: Is a human being seen before being evaluated? Is their dignity intact? Does the scene tell the truth without making them small?`

function chooseSize(shotDescription: string): "1024x1536" | "1536x1024" {
  const lower = shotDescription.toLowerCase()
  const landscapeHints = [
    "wide",
    "landscape",
    "city",
    "valley",
    "panoramic",
    "horizon",
    "establishing",
  ]

  return landscapeHints.some((hint) => lower.includes(hint)) ? "1536x1024" : "1024x1536"
}

export async function POST(req: NextRequest) {
  try {
    const { shotDescription, worldBibleContext, shotNumber, totalShots } = (await req.json()) as {
      shotDescription?: string
      worldBibleContext?: string
      shotNumber?: number
      totalShots?: number
    }

    if (!shotDescription?.trim()) {
      return NextResponse.json({ error: "Missing shotDescription" }, { status: 400 })
    }

    const prompt = [
      SYSTEM_PROMPT,
      "",
      `Frame position: shot ${shotNumber ?? "unknown"} of ${totalShots ?? "unknown"}.`,
      "Create one cinematic keyframe image for this exact moment.",
      "",
      "World Bible visual grammar:",
      worldBibleContext?.trim() || "No additional World Bible context supplied.",
      "",
      "Shot description:",
      shotDescription.trim(),
      "",
      "Output requirements:",
      "- Cinematic realism with emotional clarity",
      "- Strong composition, lived-in detail, and believable light",
      "- Preserve character dignity and interiority",
      "- Avoid spectacle for its own sake",
      "- Make the frame feel production-ready for a premium social film",
    ].join("\n")

    const size = chooseSize(shotDescription)
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      quality: "high",
    })

    const b64 = result.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json({ error: "Image generation returned no image data" }, { status: 502 })
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${b64}`,
      revisedPrompt: result.data?.[0]?.revised_prompt ?? prompt,
      size,
    })
  } catch (error) {
    console.error("[studio/render/image]", error)
    return NextResponse.json({ error: "Image render failed" }, { status: 500 })
  }
}
