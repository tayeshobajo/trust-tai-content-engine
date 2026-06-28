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
    impressions: (row.impressions as number | null) ?? undefined,
    engagement: (row.engagement as number | null) ?? undefined,
    clicks: (row.clicks as number | null) ?? undefined,
    campaign: (row.campaign as string | null) ?? undefined,
    contentPillar: (row.content_pillar as string | null) ?? undefined,
    scheduleDate: (row.schedule_date as string | null) ?? undefined,
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
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []).map(fromRow)
}

export async function addPost(post: Omit<Post, 'id'>): Promise<Post> {
  const newPost: Post = { ...post, id: `post-${Date.now()}` }
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

function isClient() {
  return typeof window !== 'undefined'
}

export function getAgentMessages(): Message[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem('ce_agent_messages')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
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
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  if (!isClient()) return
  localStorage.setItem('ce_settings', JSON.stringify(settings))
}
