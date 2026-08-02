import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

export const maxDuration = 60

type TtsVoice = "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer"

interface NarrationRequest {
  text?: string
  productionId?: string
  shotNumber?: number
  voice?: TtsVoice
  speed?: number
  model?: string
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      productionId,
      shotNumber,
      voice = "onyx",
      speed = 0.85,
      model = "tts-1-hd",
    } = (await req.json()) as NarrationRequest

    if (!text?.trim()) {
      return NextResponse.json({ error: "Missing narration text" }, { status: 400 })
    }

    const openai = new OpenAI()
    const audioResponse = await openai.audio.speech.create({
      model,
      input: text.trim(),
      voice,
      speed,
    })

    const buffer = Buffer.from(await audioResponse.arrayBuffer())

    // Auto-upload to Supabase Storage
    if (productionId) {
      try {
        const supabase = getSupabaseAdmin()
        const fileName = `${productionId}/narration-${shotNumber ?? "full"}.mp3`
        const { error } = await supabase.storage
          .from("rendered-videos")
          .upload(fileName, buffer, {
            contentType: "audio/mpeg",
            cacheControl: "3600",
            upsert: true,
          })

        if (!error) {
          const { data } = supabase.storage.from("rendered-videos").getPublicUrl(fileName)
          return NextResponse.json({
            audioUrl: data.publicUrl,
            voice,
            model,
            textLength: text.trim().length,
          })
        }
        console.error("[narration] storage upload failed:", error)
      } catch (e) {
        console.error("[narration] storage error:", e)
      }
    }

    // Fallback: base64
    return NextResponse.json({
      audioUrl: `data:audio/mpeg;base64,${buffer.toString("base64")}`,
      voice,
      model,
      textLength: text.trim().length,
    })
  } catch (error) {
    console.error("[studio/render/narration]", error)
    return NextResponse.json({ error: "Narration generation failed" }, { status: 500 })
  }
}
