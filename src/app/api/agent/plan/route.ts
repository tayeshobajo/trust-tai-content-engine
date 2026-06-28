import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    focus?: string[]
    platforms?: string[]
    weekOf?: string
  }

  const { focus = [], platforms = ['LinkedIn', 'Instagram'], weekOf = 'next week' } = body

  const prompt = `Generate a detailed content plan for ${weekOf}.
Platforms: ${platforms.join(', ')}
Focus pillars: ${focus.length > 0 ? focus.join(', ') : 'balanced mix of all pillars'}

Return a structured plan with: date, platform, content pillar, hook, post format, and status (all Draft).
LinkedIn posts: Monday, Wednesday, Friday
Instagram posts: Tuesday, Thursday
Keep hooks sharp — first line must stand alone.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  const text = content.type === 'text' ? content.text : ''

  return NextResponse.json({ plan: text })
}
