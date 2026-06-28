export type Platform = "LinkedIn" | "Instagram" | "X" | "Blog"
export type PostStatus =
  | "Scheduled"
  | "Published"
  | "Needs Review"
  | "Draft"
  | "Winning"
export type PostCategory =
  | "Founder Insight"
  | "Client Education"
  | "Proof/Case Study"
  | "Behind the Scenes"
  | "Offer/Sales"
  | "Thought Leadership"
  | "Personal Story"
  | "FAQs"

export interface Post {
  id: string
  hook: string
  body: string
  cta: string
  platforms: Platform[]
  status: PostStatus
  category: PostCategory
  owner: string
  date: string
  gradientFrom: string
  gradientTo: string
  agentScore: number
  impressions?: number
  engagement?: number
  clicks?: number
  campaign?: string
  contentPillar?: string
  scheduleDate?: string
}

// No demo data — all posts are created by the user
export const POSTS: Post[] = []
