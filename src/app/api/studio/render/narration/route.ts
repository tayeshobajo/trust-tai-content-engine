import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const maxDuration = 60

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "gWMuaRaohNdGMVM2whfP"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface NarrationRequest {
  text?: string
  productionId?: string
  shotNumber?: number
  voiceId?: string
  stability?: number
  clarity?: number
  style?: number
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Missing Supabase env vars")
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      productionId,
      shotNumber,
      voiceId,
      stability = 0.5,
      clarity = 0.75,
      style = 0.0,
    } = (await req.json()) as NarrationRequest

    if (!text?.trim()) {
      return NextResponse.json({ error: "Missing narration text" }, { status: 400 })
    }

    if (!ELEVENLABS_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY." },
        { status: 503 },
      )
    }

    console.log("[narration] key length:", ELEVENLABS_API_KEY.length, "prefix:", ELEVENLABS_API_KEY.slice(0, 6))

    const useVoiceId = voiceId?.trim() || VOICE_ID
    const cleanText = text.trim()

    // Generate audio via ElevenLabs Turbo v2
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${useVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability,
            similarity_boost: clarity,
            style,
            use_speaker_boost: true,
          },
        }),
      },
    )

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text().catch(() => "Unknown error")
      console.error("[studio/render/narration] ElevenLabs error:", errorText)
      return NextResponse.json(
        { error: `ElevenLabs TTS failed: ${elevenResponse.status}` },
        { status: 502 },
      )
    }

    const audioBuffer = Buffer.from(await elevenResponse.arrayBuffer())

    // Upload to Supabase Storage if configured
    if (productionId) {
      try {
        const supabase = getSupabaseAdmin()
        const fileName = `${productionId}/narration-${shotNumber ?? "full"}.mp3`
        const { error: uploadError } = await supabase.storage
          .from("rendered-videos")
          .upload(fileName, audioBuffer, {
            contentType: "audio/mpeg",
            cacheControl: "3600",
            upsert: true,
          })

        if (!uploadError) {
          const { data } = supabase.storage
            .from("rendered-videos")
            .getPublicUrl(fileName)

          return NextResponse.json({
            audioUrl: data.publicUrl,
            voiceId: useVoiceId,
            textLength: cleanText.length,
            durationEstimate: Math.ceil(cleanText.length / 15), // ~15 chars/sec for natural pace
          })
        }
        console.error("[studio/render/narration] storage upload failed:", uploadError)
      } catch {
        // Fall through to base64 response
      }
    }

    // Fallback: return base64 audio
    const base64 = audioBuffer.toString("base64")
    return NextResponse.json({
      audioUrl: `data:audio/mpeg;base64,${base64}`,
      voiceId: useVoiceId,
      textLength: cleanText.length,
      durationEstimate: Math.ceil(cleanText.length / 15),
    })
  } catch (error) {
    console.error("[studio/render/narration]", error)
    return NextResponse.json({ error: "Narration generation failed" }, { status: 500 })
  }
}
