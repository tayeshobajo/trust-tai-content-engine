# Phase 2 Agent A: Real AI Agent Workspace + Local Persistence

## Context
The Trust Tai Content Engine is live at https://trust-tai-content-engine.vercel.app
Supabase new project blocked (overdue org invoice). Strategy: wire real Anthropic AI into /agent page, wire localStorage persistence for posts/campaigns across all pages.

## Working Directory
/Users/tayeshobajo/Developer/trust-tai-content-engine

## Files You Own
- `src/app/api/agent/route.ts` — new API route for AI chat
- `src/app/api/agent/plan/route.ts` — weekly plan generation endpoint  
- `src/app/api/agent/review/route.ts` — post review/scoring endpoint
- `src/app/agent/page.tsx` — update to use real streaming AI
- `src/lib/store.ts` — localStorage-based state store (posts, campaigns, settings)
- `src/lib/ai.ts` — Anthropic client + system prompt
- `src/hooks/useLocalStore.ts` — React hook for store

## Do NOT touch
Sidebar.tsx, Shell.tsx, globals.css, or any other page except agent/page.tsx

---

## 1. AI API Route (`src/app/api/agent/route.ts`)

Use Anthropic SDK with streaming via the `ai` package.

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the Trust Tai Content Agent — a strategic content planner and analyst for Tai Shobajo, founder of Trust Tai.

CONTEXT:
- Tai is a founder-led business consultant (Fractional CTO, $1M+ on Upwork, 261 clients)
- Trust Tai sells The Operating Map ($10K-$25K) and monthly paces ($2.5K-$4.5K/mo)
- DiscoveryCall.ai is the entry point for new clients
- Primary platforms: LinkedIn (3x/week), Instagram (3x/week), X (2x/week), Newsletter (1x/week)
- Content pillars: The Roadmap, Founder Bottlenecks, Systems That Scale, Spirit First, Client Transformation
- Voice: Sharp, direct, no preamble. Named-pain posts. Specific stories. Never motivational fluff.
- Every post ends with a soft CTA to discoverycall.ai

YOUR ROLE:
You help Tai plan, create, review, and optimize content. You think like a strategic content director, not a social media manager.

CAPABILITIES:
- Plan next week's posts (Mon/Wed/Fri LinkedIn, Tue/Thu Instagram, rotating X)
- Generate posts in Tai's voice (Writer/Author register — specific, named-pain, story-led)
- Review posts for hook strength, voice alignment, CTA quality
- Identify content gaps (which pillars/categories are underserved)
- Recommend repurposing of top posts
- Analyze what content is working and why

VOICE RULES (critical):
- No em dashes ever
- No: very, really, just, actually, something, things
- First line of every post stands alone — earns the click
- Named pain first, credentials second
- Every CTA: one line, soft, never pushy
- Posts are mirrors (reader's problem) not spotlights (Tai's achievements)

FORMAT RULES:
- When generating a content plan, use a clear table or structured list
- When writing posts, wrap each post in --- separators
- Keep recommendations to: Observation → Why it matters → Recommended action
- Be concise. Tai is a founder. He doesn't need 500 words when 100 will do.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: messages.map((m: {role: string; content: string}) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  })

  const encoder = new TextEncoder()
  
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    }
  })
}
```

## 2. Local Store (`src/lib/store.ts`)

Simple localStorage wrapper with TypeScript types matching the existing posts.ts data.

```typescript
// Re-export types from data/posts.ts and add store CRUD
// Keys: 'ce_posts', 'ce_campaigns', 'ce_settings', 'ce_agent_messages'
// Each key stores a JSON array

export function getPosts(): Post[]
export function savePosts(posts: Post[]): void
export function addPost(post: Omit<Post, 'id'>): Post
export function updatePost(id: string, updates: Partial<Post>): void
export function deletePost(id: string): void

export function getAgentMessages(): Message[]
export function saveAgentMessages(messages: Message[]): void
export function clearAgentMessages(): void
```

Initialize with the existing mock data from src/data/posts.ts on first load (check if key exists).

## 3. useLocalStore Hook (`src/hooks/useLocalStore.ts`)

```typescript
// useState + useEffect wrapper around store.ts
// Returns { posts, addPost, updatePost, deletePost, isLoading }
// Syncs to localStorage on every change
// SSR safe (check typeof window !== 'undefined')
```

## 4. Agent Page Update (`src/app/agent/page.tsx`)

Replace the static mock chat with real streaming AI:

- Keep ALL existing UI (3-col layout, quick actions, health score, etc.)
- Wire the composer input to call POST /api/agent
- Stream the response token by token into the chat bubble (show cursor while streaming)
- Save conversation to localStorage via store
- Quick action buttons prepopulate the input and auto-submit:
  - "Plan next week's posts" → sends "Plan my content for next week. I post Mon/Wed/Fri on LinkedIn, Tue/Thu on Instagram. Focus on The Roadmap and Founder Bottlenecks pillars."
  - "Find content gaps" → sends "Review my content pillars and tell me which categories are underused this month. My pillars: The Roadmap, Founder Bottlenecks, Systems That Scale, Spirit First, Client Transformation."
  - "What should I post next?" → sends "Based on my content strategy and recent performance, what's the single best post I should create today and why?"
  - "Create posts for an offer" → sends "Create 3 LinkedIn posts promoting The Operating Map (my $10K-$25K strategic roadmap service). Use named-pain hooks. Different angles for each post."
  - "Review my content" → sends "Review my recent content and tell me: what's working, what's not, and what I should do differently next week."
  - "Create a 30-day campaign" → sends "Create a 30-day LinkedIn content campaign for The Operating Map offer. I want 3 posts per week. Mix: founder insight, client story, and direct offer posts. Give me a full plan."
- Add a "New conversation" button that clears localStorage messages
- Show message timestamps

## 5. Environment Variables

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-REDACTED
```
(Use the TrustTai AI / 12WY OS key from CREDENTIALS.md — this app is for Trust Tai)

Also create `vercel.json`:
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key-trusttai"
  }
}
```

Actually — just add the env var directly to Vercel after build. Don't hardcode.

## 6. Vercel Env Var
After build, run:
```bash
npx vercel env add ANTHROPIC_API_KEY production --token "vcp_2U…4YYs" <<< "sk-ant-REDACTED"
```

## Quality Gates
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — exit 0
4. Test the API route locally: `curl -X POST http://localhost:3030/api/agent -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"What should I post on LinkedIn today?"}]}'` — must return streaming text

Report: write to `.orchestrator/phase2-agent-a-output.md`
End with: PHASE2-A-COMPLETE
