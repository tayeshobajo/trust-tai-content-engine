import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

/**
 * POST /api/studio/render/coherence-check
 *
 * Runs a vision-based comparison between a rendered frame, locked character
 * reference images, and optionally the previous shot.
 * Returns whether the characters match and notes on any discrepancies.
 *
 * Body:
 *   frameUrl: string       — the rendered frame to check
 *   referenceUrl: string   — one approved character reference image
 *   referenceUrls: string[] | Record<string, string>
 *                          — multiple approved character reference images
 *   previousFrameUrl?: string
 *                          — prior rendered frame for shot-to-shot continuity
 *   shotNumber?: number    — for context in the prompt
 *   shotDescription?: string — for context
 */
export async function POST(req: NextRequest) {
  try {
    const { frameUrl, referenceUrl, referenceUrls, previousFrameUrl, shotNumber, shotDescription } = (await req.json()) as {
      frameUrl?: string
      referenceUrl?: string
      referenceUrls?: string[] | Record<string, string>
      previousFrameUrl?: string
      shotNumber?: number
      shotDescription?: string
    }

    const refs: { label: string; url: string }[] = []
    if (referenceUrl) refs.push({ label: "reference", url: referenceUrl })
    if (Array.isArray(referenceUrls)) {
      referenceUrls.forEach((url, index) => refs.push({ label: `reference_${index + 1}`, url }))
    } else if (referenceUrls && typeof referenceUrls === "object") {
      Object.entries(referenceUrls).forEach(([label, url]) => {
        if (typeof url === "string" && url.trim()) refs.push({ label, url })
      })
    }

    if (!frameUrl || refs.length === 0) {
      return NextResponse.json(
        { error: "Missing frameUrl or reference image URL(s)" },
        { status: 400 }
      )
    }

    const prompt = [
      `You are a continuity supervisor on a cinematic film production.`,
      `Compare the rendered frame (image 1) against the locked reference image(s).`,
      previousFrameUrl
        ? `Also compare it against the previous shot image to judge whether the visual story chains cleanly.`
        : ``,
      ``,
      `Shot context: Shot ${shotNumber ?? "unknown"}${shotDescription ? ` — ${shotDescription}` : ""}.`,
      ``,
      `Reference images:`,
      ...refs.map((ref, index) => `- Image ${index + 2}: ${ref.label}`),
      previousFrameUrl ? `- Image ${refs.length + 2}: previous_shot` : ``,
      ``,
      `Answer these questions:`,
      `1. Does the adult man appear to be the SAME PERSON as the locked reference whenever he appears? Check face, build, skin tone, hairline, wardrobe, posture, and case.`,
      `2. If the child appears, does the child match the locked child/family reference? Check age, face, hair, scale, and relationship to the man.`,
      `3. Does this shot chain from the previous shot without confusing location, object, character, or action jumps?`,
      `4. Can the frame support the silent-film story test, or does it introduce visual confusion that narration would have to explain?`,
      ``,
      `Respond as JSON:`,
      `{ "match": boolean, "confidence": "high" | "medium" | "low", "silentFilmPass": boolean, "referenceMatches": { "<label>": boolean }, "notes": string }`,
      ``,
      `Notes should be specific and actionable: "The man's coat changed from navy to black" or "The child appears to be a different gender than the reference".`,
    ].join("\n")

    const result = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: frameUrl } },
            ...refs.map((ref) => ({ type: "image_url" as const, image_url: { url: ref.url } })),
            ...(previousFrameUrl ? [{ type: "image_url" as const, image_url: { url: previousFrameUrl } }] : []),
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const text = result.choices?.[0]?.message?.content?.trim() ?? ""

    // Try to parse JSON from the response
    let parsed: {
      match?: boolean
      confidence?: string
      silentFilmPass?: boolean
      referenceMatches?: Record<string, boolean>
      notes?: string
    }
    try {
      // Strip markdown code fences if present
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      // If parsing fails, treat the whole text as notes
      parsed = { match: false, confidence: "low", notes: text }
    }

    const referenceMatches = parsed.referenceMatches ?? {}
    const allReferencesPassed =
      Object.values(referenceMatches).length > 0
        ? Object.values(referenceMatches).every(Boolean)
        : parsed.match === true

    const status: "pass" | "fail" | "warning" = parsed.match && allReferencesPassed && parsed.silentFilmPass !== false
      ? parsed.confidence === "high"
        ? "pass"
        : "warning"
      : "fail"

    return NextResponse.json({
      status,
      match: parsed.match ?? false,
      confidence: parsed.confidence ?? "low",
      silentFilmPass: parsed.silentFilmPass ?? false,
      referenceMatches,
      notes: parsed.notes ?? "No notes returned",
      rawResponse: text,
    })
  } catch (error) {
    console.error("[studio/render/coherence-check]", error)
    return NextResponse.json(
      { error: "Coherence check failed", status: "warning" },
      { status: 500 }
    )
  }
}
