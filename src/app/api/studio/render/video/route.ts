import { fal } from "@fal-ai/client"
import { NextRequest, NextResponse } from "next/server"

const FAL_VIDEO_MODEL = "kwen-video-generation/kling-v2-master"
const DEFAULT_DURATION_SEC = 5

interface VideoRenderRequest {
  imageUrl?: string
  motionPrompt?: string
  durationSec?: number
}

interface FalVideoResult {
  data?: {
    video_url?: string
  }
  requestId?: string
}

function createQueuedResponse(
  message: string,
  input: Required<Pick<VideoRenderRequest, "imageUrl" | "motionPrompt">> & { durationSec: number },
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({
    status: "queued",
    note: message,
    provider: "fal.ai",
    ...input,
    ...extra,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, motionPrompt, durationSec } = (await req.json()) as VideoRenderRequest

    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 })
    }

    if (!motionPrompt?.trim()) {
      return NextResponse.json({ error: "Missing motionPrompt" }, { status: 400 })
    }

    const normalizedImageUrl = imageUrl.trim()
    const normalizedMotionPrompt = motionPrompt.trim()
    const normalizedDurationSec =
      typeof durationSec === "number" && Number.isFinite(durationSec) && durationSec > 0
        ? durationSec
        : DEFAULT_DURATION_SEC

    if (!process.env.FAL_KEY?.trim()) {
      return createQueuedResponse(
        "Fal.ai is not configured. Set process.env.FAL_KEY to enable real video generation.",
        {
          imageUrl: normalizedImageUrl,
          motionPrompt: normalizedMotionPrompt,
          durationSec: normalizedDurationSec,
        },
      )
    }

    fal.config({ credentials: process.env.FAL_KEY })

    try {
      const result = (await fal.subscribe(FAL_VIDEO_MODEL, {
        input: {
          image_url: normalizedImageUrl,
          prompt: normalizedMotionPrompt,
          duration: normalizedDurationSec,
          aspect_ratio: "9:16",
        },
      })) as FalVideoResult

      const videoUrl = result.data?.video_url

      if (!videoUrl) {
        return createQueuedResponse(
          "Fal.ai accepted the render but did not return a video URL yet.",
          {
            imageUrl: normalizedImageUrl,
            motionPrompt: normalizedMotionPrompt,
            durationSec: normalizedDurationSec,
          },
          { requestId: result.requestId ?? null },
        )
      }

      return NextResponse.json({ videoUrl })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Fal.ai error"
      const lowered = message.toLowerCase()
      const isDataUrl = normalizedImageUrl.startsWith("data:")
      const dataUrlRejected =
        isDataUrl &&
        (lowered.includes("data:") ||
          lowered.includes("image_url") ||
          lowered.includes("invalid url") ||
          lowered.includes("publicly accessible") ||
          lowered.includes("download"))

      if (dataUrlRejected) {
        return NextResponse.json(
          {
            error: "Fal.ai rejected the data URL image. Upload the image to Supabase Storage first and pass a public URL.",
            detail: message,
          },
          { status: 422 },
        )
      }

      console.error("[studio/render/video] fal", error)

      return createQueuedResponse(
        "Fal.ai render was queued or could not complete synchronously. Check provider logs or retry with a hosted image URL.",
        {
          imageUrl: normalizedImageUrl,
          motionPrompt: normalizedMotionPrompt,
          durationSec: normalizedDurationSec,
        },
        { detail: message },
      )
    }
  } catch (error) {
    console.error("[studio/render/video]", error)
    return NextResponse.json({ error: "Video render queue failed" }, { status: 500 })
  }
}
