import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import {
  buildWorldBiblePrompt,
  orchestrationToImageSize,
  type SceneOrchestration,
} from "@/lib/world-bible"

const openai = new OpenAI()

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars for server-side upload")
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Fetches an image URL and returns it as a File object suitable for openai.images.edit().
 * Handles both remote URLs and data URLs.
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) throw new Error(`Invalid data URL for ${filename}`)
    const buffer = Buffer.from(match[2], "base64")
    return new File([buffer], filename, { type: match[1] })
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch reference image ${url}: ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get("content-type") ?? "image/png"
  return new File([buffer], filename, { type: contentType })
}

export async function POST(req: NextRequest) {
  try {
    const {
      shotDescription,
      worldBibleContext,
      shotNumber,
      totalShots,
      productionId,
      orchestration,
      referenceImages,
      previousShotUrl,
    } = (await req.json()) as {
      shotDescription?: string
      worldBibleContext?: string
      shotNumber?: number
      totalShots?: number
      productionId?: string
      orchestration?: SceneOrchestration
      /** Character reference image URLs — locked after keyframe approval. */
      referenceImages?: string[]
      /** Previous shot's rendered frame URL — for sequential visual chaining. */
      previousShotUrl?: string
    }

    if (!shotDescription?.trim()) {
      return NextResponse.json({ error: "Missing shotDescription" }, { status: 400 })
    }

    const prompt = buildWorldBiblePrompt({
      shotDescription,
      worldBibleContext,
      shotNumber,
      totalShots,
      orchestration,
    })

    const size = orchestrationToImageSize(orchestration, shotDescription)

    // Collect all reference images (character refs + previous shot for chaining)
    const allRefUrls: string[] = []
    if (referenceImages && referenceImages.length > 0) {
      allRefUrls.push(...referenceImages.slice(0, 15)) // API limit is 16 total
    }
    if (previousShotUrl) {
      allRefUrls.push(previousShotUrl)
    }

    let result: OpenAI.Images.ImagesResponse | null = null

    // ─── Reference-aware path: use images.edit() ───
    if (allRefUrls.length > 0) {
      try {
        // Fetch all reference URLs and convert to File objects
        const files: File[] = await Promise.all(
          allRefUrls.map((url, i) =>
            urlToFile(url, `ref-${i}-${Date.now()}.png`)
          )
        )

        // gpt-image-1 supports up to 16 reference images via images.edit()
        // The first image is treated as the primary, rest as additional references
        result = await openai.images.edit({
          model: "gpt-image-1",
          image: files,
          prompt,
          size,
          quality: "high",
        })
      } catch (editError) {
        console.error("[studio/render/image] images.edit() failed, falling back to generate:", editError)
        result = null // Fall through to generate path
      }
    }

    // ─── Fallback: text-only generation (backward compat) ───
    if (!result) {
      result = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size,
        quality: "high",
      })
    }

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
        usedReferenceImages: allRefUrls.length > 0,
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
      usedReferenceImages: allRefUrls.length > 0,
      referenceCount: allRefUrls.length,
    })
  } catch (error) {
    console.error("[studio/render/image]", error)
    return NextResponse.json({ error: "Image render failed" }, { status: 500 })
  }
}
