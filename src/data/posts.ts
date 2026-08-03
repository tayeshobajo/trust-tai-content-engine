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

/** Snapshot of a post at a specific version */
export interface PostVersion {
  id: string
  version: number
  content: { hook: string; body: string; cta: string }
  approvedBy?: string
  approvedAt?: string
  changeSummary: string
  createdAt: string
}

/** Post extended with versioning, truth-lock, and downstream dependency tracking */
export interface VersionedPost extends Post {
  /** Monotonically increasing version counter */
  version: number
  /** Full history of prior versions */
  versionHistory: PostVersion[]
  /** ID of the version currently approved as source of truth */
  approvedVersionId?: string
  /** Production IDs that reference this post — used for cascade invalidation */
  linkedProductionIds: string[]
  /** The central argument the film must serve */
  centralArgument?: string
  /** How the reader should think/feel differently after reading */
  intendedReaderShift?: string
  /** Claims the film must protect — cannot be contradicted or modified */
  protectedClaims: string[]
  /** When true, downstream assets (script, frames) require re-approval if this post changes */
  locked: boolean
  lockedAt?: string
  lockedBy?: string
}

// No demo data — all posts are created by the user
export const POSTS: Post[] = []
