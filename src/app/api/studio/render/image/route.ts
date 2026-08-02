import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { buildWorldBiblePrompt } from "@/lib/world-bible"

const openai = new OpenAI()

function chooseSize(shotDescription: string): "1024x1536" | "1536x1024" {
  const lower = shotDescription.toLowerCase()
  // Only force landscape for explicit wide/establishing shots.
  // "city" alone is not a landscape trigger — most narrative shots are
  // character-focused and read better at 2:3 portrait.
  const landscapeHints = [
    "wide shot",
    "wide establish",
    "establishing shot",
    "landscape",
    "panoramic",
    "horizon",
    "valley wide",
    "cityscape",
    "pull back",
    "pull-back",
    "full city",
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

    const prompt = buildWorldBiblePrompt({
      shotDescription,
      worldBibleContext,
      shotNumber,
      totalShots,
    })

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

    const buffer = Buffer.from(b64, "base64")

    // Upload to Supabase Storage
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
      return NextResponse.json({
        imageUrl: `data:image/png;base64,${b64}`,
        revisedPrompt: result.data?.[0]?.revised_prompt ?? prompt,
        size,
      })
    }

    const { data: publicUrlData } = supabase.storage
      .from("rendered-frames")
      .getPublicUrl(fileName)

    return NextResponse.json({
      imageUrl: publicUrlData.publicUrl,
      revisedPrompt: result.data?.[0]?.revised_prompt ?? prompt,
      size,
      storagePath: fileName,
    })
  } catch (error) {
    console.error("[studio/render/image]", error)
    return NextResponse.json({ error: "Image render failed" }, { status: 500 })
  }
}
