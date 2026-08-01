/**
 * POST /api/studio/search
 *
 * Semantic search across productions.
 * Sends the search query + spine summaries to Claude, gets back a ranked
 * list with relevance scores and a one-line rationale per match.
 *
 * Body:
 *   query: string
 *   productions: ProductionSummary[]
 *
 * Returns:
 *   results: SearchResult[]   — ordered by relevance desc, irrelevant excluded
 *   interpretation: string    — how Claude read the query (what it searched for)
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

export interface ProductionSummary {
  id: string
  title: string
  sourceThought: string
  spine: {
    whatHappened: string
    whatTaiNoticed: string
    whatOthersMiss: string
    deeperTruth: string
    roadmapConnection: string
    founderValue: string
    rememberSentence: string
  }
  shift: { beginning: string; end: string }
  selectedConcept: string | null
  publishedAt?: string
  createdAt: string
}

export interface SearchResult {
  id: string
  score: number       // 0–100
  why: string         // one sentence: why this production matches the query
  matchedOn: string   // which dimension matched: "truth" | "theme" | "symbol" | "audience" | "concept"
}

export interface SearchResponse {
  results: SearchResult[]
  interpretation: string
}

function buildPrompt(query: string, productions: ProductionSummary[]): string {
  const summaries = productions.map((p, i) => {
    const spine = p.spine
    return `[${i + 1}] ID: ${p.id}
Title: ${p.title}
Source thought: ${p.sourceThought}
What happened: ${spine.whatHappened}
What Tai noticed: ${spine.whatTaiNoticed}
What others miss: ${spine.whatOthersMiss}
The deeper truth: ${spine.deeperTruth}
Roadmap connection: ${spine.roadmapConnection}
Founder value: ${spine.founderValue}
Remember sentence: ${spine.rememberSentence}
Audience shift: "${p.shift.beginning}" → "${p.shift.end}"
Concept: ${p.selectedConcept ?? "none selected"}`
  }).join("\n\n---\n\n")

  return `You are the semantic search engine for Trust Tai Studio, a creative intelligence for a founder content brand.

A user searched for: "${query}"

Your job: find productions that meaningfully match this search — by theme, truth, symbol, emotion, or concept — even if the literal words don't match.

Here are the productions to search across:

${summaries}

Return a JSON object with:
- "interpretation": a one-sentence description of how you read the query (what you actually searched for)
- "results": array of matching productions, ordered by relevance (most relevant first)
  - Only include productions that genuinely match (score ≥ 30)
  - Each result has:
    - "id": the production ID
    - "score": 0–100 relevance score
    - "why": one sentence explaining WHY this production matches the query (be specific, not generic)
    - "matchedOn": the primary dimension that matched — one of: "truth" | "theme" | "symbol" | "audience" | "concept" | "emotion"

Be honest: if nothing meaningfully matches, return an empty results array.
Do not match on superficial word overlap. Match on meaning.

Return ONLY valid JSON.`
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { query: string; productions: ProductionSummary[] }
    const { query, productions } = body

    if (!query?.trim()) {
      return NextResponse.json({ results: [], interpretation: "" } satisfies SearchResponse)
    }
    if (!productions?.length) {
      return NextResponse.json({ results: [], interpretation: "No productions to search." } satisfies SearchResponse)
    }

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(query, productions) }],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
    const parsed = JSON.parse(json) as SearchResponse

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[search]", err)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
