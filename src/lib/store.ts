import { Post, POSTS } from '@/data/posts'

// Storage keys
const KEYS = {
  POSTS: 'ce_posts',
  CAMPAIGNS: 'ce_campaigns',
  SETTINGS: 'ce_settings',
  AGENT_MESSAGES: 'ce_agent_messages',
} as const

export type { Post }

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Campaign {
  id: string
  name: string
  status: 'Active' | 'Planned' | 'Completed' | 'Paused'
  startDate: string
  endDate: string
  postsCount: number
  platforms: string[]
}

export interface Settings {
  postingRhythm: {
    linkedin: string
    instagram: string
    x: string
    newsletter: string
  }
  contentPillars: string[]
  primaryOffer: string
}

// ─── SSR guard ───────────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function getItem<T>(key: string): T | null {
  if (!isClient()) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or private mode
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export function getPosts(): Post[] {
  const stored = getItem<Post[]>(KEYS.POSTS)
  if (stored) return stored
  // Initialize with mock data on first load
  setItem(KEYS.POSTS, POSTS)
  return POSTS
}

export function savePosts(posts: Post[]): void {
  setItem(KEYS.POSTS, posts)
}

export function addPost(post: Omit<Post, 'id'>): Post {
  const newPost: Post = {
    ...post,
    id: `post-${Date.now()}`,
  }
  const posts = getPosts()
  posts.unshift(newPost)
  savePosts(posts)
  return newPost
}

export function updatePost(id: string, updates: Partial<Post>): void {
  const posts = getPosts()
  const idx = posts.findIndex((p) => p.id === id)
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates }
    savePosts(posts)
  }
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id)
  savePosts(posts)
}

// ─── Agent Messages ───────────────────────────────────────────────────────────

export function getAgentMessages(): Message[] {
  return getItem<Message[]>(KEYS.AGENT_MESSAGES) ?? []
}

export function saveAgentMessages(messages: Message[]): void {
  setItem(KEYS.AGENT_MESSAGES, messages)
}

export function clearAgentMessages(): void {
  if (!isClient()) return
  localStorage.removeItem(KEYS.AGENT_MESSAGES)
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export function getCampaigns(): Campaign[] {
  return getItem<Campaign[]>(KEYS.CAMPAIGNS) ?? []
}

export function saveCampaigns(campaigns: Campaign[]): void {
  setItem(KEYS.CAMPAIGNS, campaigns)
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  postingRhythm: {
    linkedin: '3x/wk',
    instagram: '3x/wk',
    x: '2x/wk',
    newsletter: '1x/wk',
  },
  contentPillars: [
    'The Roadmap',
    'Founder Bottlenecks',
    'Systems That Scale',
    'Spirit First',
    'Client Transformation',
  ],
  primaryOffer: 'The Roadmap — Operating Map',
}

export function getSettings(): Settings {
  return getItem<Settings>(KEYS.SETTINGS) ?? DEFAULT_SETTINGS
}

export function saveSettings(settings: Settings): void {
  setItem(KEYS.SETTINGS, settings)
}
