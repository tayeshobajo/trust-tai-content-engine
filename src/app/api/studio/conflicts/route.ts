/**
 * POST /api/studio/conflicts
 *
 * Detects whether a newly confirmed principle conflicts with any
 * existing principles in the Studio's memory.
 *
 * Body: { newPrinciple: StudioPrinciple, existingPrinciples: StudioPrinciple[] }
 * Returns: PrincipleConflict[]  (empty array if no conflicts found)
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import type { PrincipleConflict, StudioPrinciple } from "@/data/studio-memory"

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { newPrinciple, existingPrinciples } = await req.json() as {
      newPrinciple: StudioPrinciple
      existingPrinciples: StudioPrinciple[]
    }

    // Only check against high-confidence or canon principles — low-confidence clashes are expected
    const candidates = existingPrinciples.filter(
      (p) => ["medium", "high", "canon"].includes(p.confidence) && p.id !== newPrinciple.id
    )
    if (candidates.length === 0) return NextResponse.json([])

    const candidateList = candidates
      .map((p, i) => `[${i + 1}] id:${p.id} — "${p.title}" (${p.confidence}): ${p.belief}`)
      .join("\n")

    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 768,
      messages: [{
        role: "user",
        content: `You are Trust Tai Studio's consistency guardian.

A new principle was just confirmed:
"${newPrinciple.title}": ${newPrinciple.belief}

Existing principles to check against:
${candidateList}

Find GENUINE conflicts — where following one principle would produce different creative choices than following another. Ignore surface-level differences. Only flag conflicts where both principles could apply to the same production and pull in opposite directions.

Return a JSON array. Each conflict object:
- "principleA": id of the first conflicting principle (always use newPrinciple id for principleA)
- "principleB": id of the existing principle
- "description": one sentence describing the specific tension
- "severity": "minor" | "moderate" | "major"

Return [] if no genuine conflicts exist. Return ONLY valid JSON. No markdown.`,
      }],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "[]"
    const rawConflicts = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")) as Array<{
      principleA: string
      principleB: string
      description: string
      severity: "minor" | "moderate" | "major"
    }>

    const conflicts: PrincipleConflict[] = rawConflicts.map((c) => ({
      id: `conflict-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      detectedAt: new Date().toISOString(),
      principleA: c.principleA,
      principleB: c.principleB,
      description: c.description,
      severity: c.severity,
      resolution: "unresolved",
    }))

    return NextResponse.json(conflicts)
  } catch (err) {
    console.error("[conflicts]", err)
    return NextResponse.json([]) // fail silently — conflicts are non-critical
  }
}
