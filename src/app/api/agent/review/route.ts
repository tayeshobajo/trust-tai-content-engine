import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    hook: string
    body: string
    cta: string
    platform: string
  }

  const { hook, body: postBody, cta, platform } = body

  const prompt = `Review this ${platform} post for Tai Shobajo / Trust Tai.

HOOK: ${hook}
BODY: ${postBody}
CTA: ${cta}

Score it 0-100 and give feedback on:
1. Hook strength (does line 1 stand alone and earn the click?)
2. Voice alignment (sharp, direct, named-pain — no fluff)
3. CTA quality (soft, one line, not pushy)
4. Overall structure

Format: Score: XX/100 followed by concise bullet feedback. Max 150 words total.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  const text = content.type === 'text' ? content.text : ''

  // Parse score from response
  const scoreMatch = text.match(/Score:\s*(\d+)\/100/)
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 75

  return NextResponse.json({ review: text, score })
}
