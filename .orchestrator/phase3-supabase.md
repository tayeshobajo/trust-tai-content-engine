# Phase 3 — Migrate localStorage to Supabase

## Supabase Project
- URL: https://kjznbpsvffiysavovgfo.supabase.co
- Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqem5icHN2ZmZpeXNhdm92Z2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjAxNjksImV4cCI6MjA5ODE5NjE2OX0.fSoUO3DIG0QLavXNSjZ-WcK6o1OSC1W2BL1M5Rdwu-g
- Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqem5icHN2ZmZpeXNhdm92Z2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjYyMDE2OSwiZXhwIjoyMDk4MTk2MTY5fQ.wLKACFTRW-Hr5q4G1jcMqOxezDaPVfdus9t8kUYV6Vs

## Step 1 — Update .env.local
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://kjznbpsvffiysavovgfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqem5icHN2ZmZpeXNhdm92Z2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjAxNjksImV4cCI6MjA5ODE5NjE2OX0.fSoUO3DIG0QLavXNSjZ-WcK6o1OSC1W2BL1M5Rdwu-g
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqem5icHN2ZmZpeXNhdm92Z2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjYyMDE2OSwiZXhwIjoyMDk4MTk2MTY5fQ.wLKACFTRW-Hr5q4G1jcMqOxezDaPVfdus9t8kUYV6Vs
```

## Step 2 — Create Supabase client util
Create `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Step 3 — Run schema migration via REST API
Use the Supabase REST API to create the `posts` table. Make an HTTP POST to:
`https://kjznbpsvffiysavovgfo.supabase.co/rest/v1/rpc/` — actually, use the Management API SQL endpoint to run this migration:

POST `https://api.supabase.com/v1/projects/kjznbpsvffiysavovgfo/database/query`
Header: `Authorization: Bearer sbp_6d59ff0baae4a6f26d2eb34503da8124ba72aefa`

SQL to run:
```sql
create table if not exists posts (
  id text primary key,
  hook text not null,
  body text not null default '',
  cta text not null default '',
  platforms text[] not null default '{}',
  status text not null default 'Draft',
  category text not null default 'Founder Insight',
  owner text not null default 'Tai',
  date text not null default '',
  gradient_from text not null default '#2563EB',
  gradient_to text not null default '#7C3AED',
  agent_score integer not null default 0,
  impressions integer,
  engagement numeric,
  clicks integer,
  campaign text,
  content_pillar text,
  schedule_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;
create policy "public read" on posts for select using (true);
create policy "public insert" on posts for insert with check (true);
create policy "public update" on posts for update using (true);
create policy "public delete" on posts for delete using (true);
```

Run this via fetch inside a Node script or directly via curl.

## Step 4 — Update `src/lib/store.ts`
Replace all localStorage functions with Supabase equivalents.

The Post type uses camelCase in the app. The DB uses snake_case. Map accordingly.

New `src/lib/store.ts`:
```ts
import { supabase } from './supabase'
import type { Post } from '@/data/posts'

function toRow(post: Post) {
  return {
    id: post.id,
    hook: post.hook,
    body: post.body,
    cta: post.cta,
    platforms: post.platforms,
    status: post.status,
    category: post.category,
    owner: post.owner,
    date: post.date,
    gradient_from: post.gradientFrom,
    gradient_to: post.gradientTo,
    agent_score: post.agentScore,
    impressions: post.impressions ?? null,
    engagement: post.engagement ?? null,
    clicks: post.clicks ?? null,
    campaign: post.campaign ?? null,
    content_pillar: post.contentPillar ?? null,
    schedule_date: post.scheduleDate ?? null,
  }
}

function fromRow(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    hook: row.hook as string,
    body: row.body as string,
    cta: row.cta as string,
    platforms: row.platforms as Post['platforms'],
    status: row.status as Post['status'],
    category: row.category as Post['category'],
    owner: row.owner as string,
    date: row.date as string,
    gradientFrom: row.gradient_from as string,
    gradientTo: row.gradient_to as string,
    agentScore: row.agent_score as number,
    impressions: row.impressions as number | undefined,
    engagement: row.engagement as number | undefined,
    clicks: row.clicks as number | undefined,
    campaign: row.campaign as string | undefined,
    contentPillar: row.content_pillar as string | undefined,
    scheduleDate: row.schedule_date as string | undefined,
  }
}

export type { Post }

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(fromRow)
}

export async function addPost(post: Omit<Post, 'id'>): Promise<Post> {
  const newPost = { ...post, id: `post-${Date.now()}` }
  const { error } = await supabase.from('posts').insert(toRow(newPost))
  if (error) console.error(error)
  return newPost
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (updates.hook !== undefined) row.hook = updates.hook
  if (updates.body !== undefined) row.body = updates.body
  if (updates.cta !== undefined) row.cta = updates.cta
  if (updates.platforms !== undefined) row.platforms = updates.platforms
  if (updates.status !== undefined) row.status = updates.status
  if (updates.category !== undefined) row.category = updates.category
  if (updates.scheduleDate !== undefined) row.schedule_date = updates.scheduleDate
  if (updates.campaign !== undefined) row.campaign = updates.campaign
  if (updates.contentPillar !== undefined) row.content_pillar = updates.contentPillar
  row.updated_at = new Date().toISOString()
  const { error } = await supabase.from('posts').update(row).eq('id', id)
  if (error) console.error(error)
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) console.error(error)
}

// ─── Agent Messages (keep in localStorage — ephemeral, no need for DB) ────────

function isClient() { return typeof window !== 'undefined' }

export function getAgentMessages(): Message[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem('ce_agent_messages')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveAgentMessages(messages: Message[]): void {
  if (!isClient()) return
  localStorage.setItem('ce_agent_messages', JSON.stringify(messages))
}

export function clearAgentMessages(): void {
  if (!isClient()) return
  localStorage.removeItem('ce_agent_messages')
}

// ─── Settings (keep in localStorage — user preferences) ──────────────────────

export interface Settings {
  postingRhythm: { linkedin: string; instagram: string; x: string; newsletter: string }
  contentPillars: string[]
  primaryOffer: string
}

const DEFAULT_SETTINGS: Settings = {
  postingRhythm: { linkedin: '3x/wk', instagram: '3x/wk', x: '2x/wk', newsletter: '1x/wk' },
  contentPillars: ['The Roadmap', 'Founder Bottlenecks', 'Systems That Scale', 'Spirit First', 'Client Transformation'],
  primaryOffer: 'The Roadmap — Operating Map',
}

export function getSettings(): Settings {
  if (!isClient()) return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem('ce_settings')
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

export function saveSettings(settings: Settings): void {
  if (!isClient()) return
  localStorage.setItem('ce_settings', JSON.stringify(settings))
}
```

## Step 5 — Update all call sites
Every component that calls store functions must now `await` them since they are async.

Files to update:
- `src/app/library/page.tsx` — `getPosts()` → `await getPosts()` inside useEffect
- `src/app/library/[id]/page.tsx` — same
- `src/app/dashboard/page.tsx` — same
- `src/app/approvals/page.tsx` — check if it calls getPosts
- `src/components/CreatePostModal.tsx` — `addPost()` → `await addPost()`

Pattern for all pages that read posts:
```tsx
const [posts, setPosts] = useState<Post[]>([])
useEffect(() => {
  getPosts().then(setPosts)
}, [])
```

For mutations (addPost, updatePost, deletePost):
```tsx
await addPost(newPost)
setPosts(await getPosts()) // re-fetch after mutation
```

## Step 6 — Seed the 3 real Week 1 posts into Supabase
After schema is created, insert these 3 posts via supabase client or REST:

Post 1:
- id: post-w1-001
- hook: "The founder had a $3M ceiling. He was convinced he needed a CMO."
- status: Needs Review, category: Proof/Case Study, platforms: [LinkedIn]
- gradient_from: #2563EB, gradient_to: #7C3AED, agent_score: 91
- schedule_date: 2026-06-30T09:00, campaign: Roadmap Launch, content_pillar: The Roadmap
- date: Jun 30, 2026, owner: Tai
- body: (full body text from week-01.md POST 1)
- cta: "→ discoverycall.ai"

Post 2:
- id: post-w1-002
- hook: "261 clients. One pattern separates the ones who grew from the ones who stayed stuck."
- status: Needs Review, category: Founder Insight, platforms: [LinkedIn]
- gradient_from: #16A34A, gradient_to: #0EA5E9, agent_score: 89
- schedule_date: 2026-07-02T09:00, campaign: Founder Authority Series, content_pillar: Founder Bottlenecks
- date: Jul 2, 2026, owner: Tai
- body: (full body text from week-01.md POST 2)
- cta: "→ discoverycall.ai"

Post 3:
- id: post-w1-003
- hook: "My daughter was born last July. Eight days later, I was back on a client call."
- status: Needs Review, category: Personal Story, platforms: [LinkedIn]
- gradient_from: #F59E0B, gradient_to: #EF4444, agent_score: 94
- schedule_date: 2026-07-03T09:00, content_pillar: Spirit First
- date: Jul 3, 2026, owner: Tai
- body: (full body text from week-01.md POST 3)
- cta: ""

Read the full body text for each post from:
`trust-tai/linkedin-content-engine/week-01.md`

## Step 7 — Build verification
`npm run build` must exit 0 with no TypeScript errors.

## DO NOT
- Add auth/login — this is single-user for now, RLS is open
- Add new pages
- Touch growth/campaigns/calendar pages
- Change any UI/design
