import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars for server-side upload")
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const {
      shotDescription,
      worldBibleContext,
      shotNumber,
      totalShots,
      productionId,
    } = (await req.json()) as {
      shotDescription?: string
      worldBibleContext?: string
      shotNumber?: number
      totalShots?: number
      productionId?: string
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

    // Convert base64 to buffer
    const buffer = Buffer.from(b64, "base64")

    // Upload to Supabase Storage — public bucket, no auth needed for reads
    const supabase = getSupabaseAdmin()
    const fileName = `${productionId ?? "production"}/shot-${shotNumber ?? "x"}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from("rendered-frames")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("[studio/render/image] storage upload failed:", uploadError)
      // Fallback to data URL if storage fails — still works, just larger for localStorage
      return NextResponse.json({
        imageUrl: `data:image/png;base64,${b64}`,
        revisedPrompt: result.data?.[0]?.revised_prompt ?? prompt,
        size,
      })
    }

    const { data: publicUrlData } = supabase.storage
      .from("rendered-frames")
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    return NextResponse.json({
      imageUrl: publicUrl,
      revisedPrompt: result.data?.[0]?.revised_prompt ?? prompt,
      size,
      storagePath: fileName,
    })
  } catch (error) {
    console.error("[studio/render/image]", error)
    return NextResponse.json({ error: "Image render failed" }, { status: 500 })
  }
}
