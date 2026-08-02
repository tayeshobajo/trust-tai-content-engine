import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

/**
 * POST /api/studio/render/coherence-check
 *
 * Runs a vision-based comparison between a rendered frame and a character reference image.
 * Returns whether the characters match and notes on any discrepancies.
 *
 * Body:
 *   frameUrl: string       — the rendered frame to check
 *   referenceUrl: string   — the approved character reference image
 *   shotNumber?: number    — for context in the prompt
 *   shotDescription?: string — for context
 */
export async function POST(req: NextRequest) {
  try {
    const { frameUrl, referenceUrl, shotNumber, shotDescription } = (await req.json()) as {
      frameUrl?: string
      referenceUrl?: string
      shotNumber?: number
      shotDescription?: string
    }

    if (!frameUrl || !referenceUrl) {
      return NextResponse.json(
        { error: "Missing frameUrl or referenceUrl" },
        { status: 400 }
      )
    }

    const prompt = [
      `You are a continuity supervisor on a cinematic film production.`,
      `Compare the rendered frame (image 1) against the character reference (image 2).`,
      ``,
      `Shot context: Shot ${shotNumber ?? "unknown"}${shotDescription ? ` — ${shotDescription}` : ""}.`,
      ``,
      `Answer these questions:`,
      `1. Does the main character in the rendered frame appear to be the SAME PERSON as in the reference? (face, build, skin tone, hair, wardrobe)`,
      `2. If there is a child visible, does the child match across both images?`,
      `3. Are there any obvious continuity breaks (different clothing, different person, different child)?`,
      ``,
      `Respond as JSON:`,
      `{ "match": boolean, "confidence": "high" | "medium" | "low", "notes": string }`,
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
            { type: "image_url", image_url: { url: referenceUrl } },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const text = result.choices?.[0]?.message?.content?.trim() ?? ""

    // Try to parse JSON from the response
    let parsed: { match?: boolean; confidence?: string; notes?: string }
    try {
      // Strip markdown code fences if present
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      // If parsing fails, treat the whole text as notes
      parsed = { match: false, confidence: "low", notes: text }
    }

    const status: "pass" | "fail" | "warning" = parsed.match
      ? parsed.confidence === "high"
        ? "pass"
        : "warning"
      : "fail"

    return NextResponse.json({
      status,
      match: parsed.match ?? false,
      confidence: parsed.confidence ?? "low",
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
