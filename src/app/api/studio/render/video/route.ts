import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  buildWorldBibleMotionPrompt,
  buildConductedMotionPrompt,
  type SceneOrchestration,
} from "@/lib/world-bible"

const FAL_VIDEO_MODEL = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video"
const FAL_QUEUE_URL = `https://queue.fal.run/${FAL_VIDEO_MODEL}`
const DEFAULT_DURATION_SEC = 5
const MAX_POLL_ATTEMPTS = 48
const POLL_INTERVAL_MS = 5000

export const maxDuration = 300

interface VideoRenderRequest {
  imageUrl?: string
  motionPrompt?: string
  durationSec?: number
  shotDescription?: string
  productionId?: string
  shotNumber?: number
  /** Scene Conductor orchestration data for this shot. When provided, the conducted prompt is used. */
  orchestration?: SceneOrchestration
}

interface FalQueueResponse {
  status?: string
  request_id?: string
  response_url?: string
  status_url?: string
  cancel_url?: string
  logs?: unknown
  metrics?: unknown
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeDurationSec(durationSec: unknown): 5 | 10 {
  if (typeof durationSec !== "number" || !Number.isFinite(durationSec) || durationSec <= 0) {
    return DEFAULT_DURATION_SEC
  }

  return durationSec >= 8 ? 10 : 5
}

async function parseFalResponse(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Fal.ai request failed with ${response.status}`)
  }

  if (!text) return {}

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { raw: text }
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars for server-side upload")
  return createClient(url, key, { auth: { persistSession: false } })
}

async function uploadVideoToStorage(
  videoUrl: string,
  productionId: string,
  shotNumber: number,
): Promise<string | null> {
  try {
    const response = await fetch(videoUrl)
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    const supabase = getSupabaseAdmin()
    const fileName = `${productionId}/shot-${shotNumber}.mp4`
    const { error } = await supabase.storage
      .from("rendered-videos")
      .upload(fileName, buffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
        upsert: true,
      })
    if (error) {
      console.error("[studio/render/video] storage upload failed:", error)
      return null
    }
    const { data } = supabase.storage.from("rendered-videos").getPublicUrl(fileName)
    return data.publicUrl
  } catch {
    return null
  }
}

function extractVideoUrl(payload: unknown): string | null {
  const root =
    isRecord(payload) && isRecord(payload.data)
      ? payload.data
      : payload

  if (!isRecord(root)) return null

  const video = root.video
  if (isRecord(video) && typeof video.url === "string") return video.url
  if (typeof root.video_url === "string") return root.video_url

  return null
}

async function falRequest(url: string, init?: RequestInit): Promise<unknown> {
  return parseFalResponse(
    await fetch(url, {
      ...init,
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    })
  )
}

async function submitVideo(input: {
  imageUrl: string
  motionPrompt: string
  shotDescription: string
  durationSec: number
  orchestration?: SceneOrchestration
}): Promise<FalQueueResponse> {
  const prompt = input.orchestration
    ? buildConductedMotionPrompt({
        shotDescription: input.shotDescription,
        motionPrompt: input.motionPrompt,
        orchestration: input.orchestration,
      })
    : buildWorldBibleMotionPrompt({
        shotDescription: input.shotDescription,
        motionPrompt: input.motionPrompt,
      })

  const payload = await falRequest(FAL_QUEUE_URL, {
    method: "POST",
    body: JSON.stringify({
      image_url: input.imageUrl,
      prompt,
      duration: String(input.durationSec),
    }),
  })

  if (!isRecord(payload)) {
    throw new Error("Fal.ai returned an unreadable queue response")
  }

  return payload as FalQueueResponse
}

async function waitForVideo(queue: FalQueueResponse): Promise<{
  videoUrl?: string
  queue: FalQueueResponse
  result?: unknown
}> {
  if (!queue.status_url || !queue.response_url) {
    throw new Error("Fal.ai did not return status/result URLs")
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const statusPayload = await falRequest(queue.status_url)
    const status = isRecord(statusPayload) && typeof statusPayload.status === "string"
      ? statusPayload.status
      : queue.status

    if (status === "COMPLETED") {
      const result = await falRequest(queue.response_url)
      const videoUrl = extractVideoUrl(result)
      return { videoUrl: videoUrl ?? undefined, queue, result }
    }

    if (status === "FAILED" || status === "CANCELLED") {
      throw new Error(`Fal.ai render ${status.toLowerCase()}`)
    }

    if (attempt < MAX_POLL_ATTEMPTS - 1) {
      await sleep(POLL_INTERVAL_MS)
    }
  }

  return { queue }
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, motionPrompt, durationSec, shotDescription, productionId, shotNumber, orchestration } = (await req.json()) as VideoRenderRequest

    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 })
    }

    if (!motionPrompt?.trim()) {
      return NextResponse.json({ error: "Missing motionPrompt" }, { status: 400 })
    }

    const normalizedImageUrl = imageUrl.trim()
    const normalizedMotionPrompt = motionPrompt.trim()
    const normalizedDurationSec = normalizeDurationSec(durationSec)
    const normalizedShotDescription = shotDescription?.trim() || normalizedMotionPrompt

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

    try {
      const queue = await submitVideo({
        imageUrl: normalizedImageUrl,
        motionPrompt: normalizedMotionPrompt,
        shotDescription: normalizedShotDescription,
        durationSec: normalizedDurationSec,
        orchestration,
      })
      const result = await waitForVideo(queue)

      if (!result.videoUrl) {
        return createQueuedResponse(
          "Fal.ai accepted the render but did not return a video URL before the route timeout.",
          {
            imageUrl: normalizedImageUrl,
            motionPrompt: normalizedMotionPrompt,
            durationSec: normalizedDurationSec,
          },
          {
            requestId: queue.request_id ?? null,
            statusUrl: queue.status_url ?? null,
            responseUrl: queue.response_url ?? null,
          },
        )
      }

      // Auto-upload to Supabase Storage for permanent URL
      let permanentUrl = result.videoUrl
      if (productionId && shotNumber) {
        const uploaded = await uploadVideoToStorage(
          result.videoUrl,
          productionId,
          shotNumber,
        )
        if (uploaded) permanentUrl = uploaded
      }

      return NextResponse.json({
        videoUrl: permanentUrl,
        falUrl: result.videoUrl !== permanentUrl ? result.videoUrl : undefined,
        requestId: queue.request_id ?? null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Fal.ai error"
      console.error("[studio/render/video] fal", error)

      return createQueuedResponse(
        "Fal.ai render was queued or could not complete synchronously. Check provider logs or retry.",
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
