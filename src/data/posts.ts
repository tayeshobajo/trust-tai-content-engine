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

export const POSTS: Post[] = [
  // Week 1 LinkedIn posts from content engine brief
  {
    id: "post-001",
    hook: "I was losing 3 hours a day to tasks my business could do without me.",
    body: "Three hours. Every single day.\n\nNot to strategy. Not to clients.\n\nTo tasks my business could — and should — do without me.\n\nThat's when I knew something had to change.\n\nHere's what I automated first (and why it changed everything for my clients too)…",
    cta: "Drop a 🙋 if you're in the same boat — I'll share the full list.",
    platforms: ["LinkedIn"],
    status: "Published",
    category: "Founder Insight",
    owner: "Tai",
    date: "Jul 1, 2026",
    gradientFrom: "#2563EB",
    gradientTo: "#7C3AED",
    agentScore: 91,
    impressions: 3204,
    engagement: 5.1,
    clicks: 112,
    campaign: "Roadmap Launch",
    contentPillar: "Founder Bottlenecks",
    scheduleDate: "2026-07-01T09:00",
  },
  {
    id: "post-002",
    hook: "The 'Content Bottleneck' is the #1 thing killing founder-led brands right now.",
    body: "You know what you want to say.\n\nYou just never have time to say it.\n\nSo your brand goes quiet — and your competitors fill the gap.\n\nThis is the Content Bottleneck. And it's 100% fixable.\n\nI built a system that keeps my brand active even when I'm heads-down in client work…",
    cta: "Want to see how it works? React with 🔑",
    platforms: ["LinkedIn"],
    status: "Scheduled",
    category: "Thought Leadership",
    owner: "Tai",
    date: "Jul 3, 2026",
    gradientFrom: "#16A34A",
    gradientTo: "#0EA5E9",
    agentScore: 87,
    campaign: "Founder Authority Series",
    contentPillar: "Founder Bottlenecks",
    scheduleDate: "2026-07-03T09:00",
  },
  {
    id: "post-003",
    hook: "What if your content strategy could run 80% on autopilot — without losing your voice?",
    body: "Not templates. Not generic AI.\n\nA real system that knows your tone, your pillars, your audience.\n\nThat's what I've been building inside Trust Tai.\n\nAnd the results are wild…",
    cta: "Comment 'SYSTEM' and I'll send you the breakdown.",
    platforms: ["LinkedIn"],
    status: "Scheduled",
    category: "Offer/Sales",
    owner: "Tai",
    date: "Jul 5, 2026",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
    agentScore: 85,
    campaign: "Roadmap Launch",
    contentPillar: "Systems That Scale",
    scheduleDate: "2026-07-05T09:00",
  },
  // Additional posts
  {
    id: "post-004",
    hook: "Here's what a 6-figure client engagement looks like in the first 30 days.",
    body: "Week 1: Audit their current content ecosystem.\nWeek 2: Map every bottleneck to a system gap.\nWeek 3: Deploy the Trust Tai framework.\nWeek 4: First results come in.\n\nReal numbers from a real client…",
    cta: "Save this post for your next strategy session.",
    platforms: ["LinkedIn"],
    status: "Published",
    category: "Proof/Case Study",
    owner: "Tai",
    date: "Jun 28, 2026",
    gradientFrom: "#7C3AED",
    gradientTo: "#2563EB",
    agentScore: 93,
    impressions: 2847,
    engagement: 4.2,
    clicks: 84,
    campaign: "Founder Authority Series",
    contentPillar: "Client Transformation",
    scheduleDate: "2026-06-28T09:00",
  },
  {
    id: "post-005",
    hook: "Behind the scenes: building the Trust Tai Content Engine from scratch.",
    body: "No fancy office. No big team.\n\nJust a founder who got tired of content feeling like a chore.\n\nHere's the honest story of how this product got built — and what I learned along the way.",
    cta: "Follow along — more behind the scenes coming weekly.",
    platforms: ["LinkedIn", "Instagram"],
    status: "Published",
    category: "Behind the Scenes",
    owner: "Tai",
    date: "Jun 25, 2026",
    gradientFrom: "#0EA5E9",
    gradientTo: "#16A34A",
    agentScore: 88,
    impressions: 1920,
    engagement: 6.3,
    clicks: 67,
    contentPillar: "Spirit First",
    scheduleDate: "2026-06-25T10:00",
  },
  {
    id: "post-006",
    hook: "3 questions every founder should ask before posting another piece of content.",
    body: "1. Does this serve your audience or your ego?\n2. Is this pulling them toward a transformation?\n3. Can you say this more specifically?\n\nMost content fails question #3. Here's how to fix it…",
    cta: "Screenshot this and keep it at your desk.",
    platforms: ["X", "LinkedIn"],
    status: "Needs Review",
    category: "Client Education",
    owner: "Tai",
    date: "Jul 7, 2026",
    gradientFrom: "#EF4444",
    gradientTo: "#F59E0B",
    agentScore: 79,
    contentPillar: "The Roadmap",
    scheduleDate: "2026-07-07T12:00",
  },
  {
    id: "post-007",
    hook: "The moment I stopped treating content like marketing — and started treating it like service.",
    body: "Everything changed when I asked: what does my audience actually need to hear today?\n\nNot what I want to say. Not what performs.\n\nWhat do they need?\n\nThat single reframe turned my engagement from vanity metrics to real conversations.",
    cta: "What would you say to your audience if you knew they'd read every word?",
    platforms: ["Instagram"],
    status: "Winning",
    category: "Personal Story",
    owner: "Tai",
    date: "Jun 22, 2026",
    gradientFrom: "#7C3AED",
    gradientTo: "#EF4444",
    agentScore: 96,
    impressions: 4103,
    engagement: 8.7,
    clicks: 203,
    contentPillar: "Spirit First",
    scheduleDate: "2026-06-22T11:00",
  },
  {
    id: "post-008",
    hook: "FAQ: How long does it take to see results from a content system?",
    body: "Honest answer: 30 days to traction, 90 days to momentum, 6 months to brand authority.\n\nBut here's what most people get wrong — they measure the wrong things in month one.\n\nHere's what to track instead…",
    cta: "Drop your biggest content question below 👇",
    platforms: ["LinkedIn", "X"],
    status: "Scheduled",
    category: "FAQs",
    owner: "Tai",
    date: "Jul 8, 2026",
    gradientFrom: "#16A34A",
    gradientTo: "#7C3AED",
    agentScore: 82,
    campaign: "Founder Authority Series",
    contentPillar: "The Roadmap",
    scheduleDate: "2026-07-08T09:00",
  },
  {
    id: "post-009",
    hook: "What 'Spirit First' actually means for how I run Trust Tai.",
    body: "It's not a slogan. It's an operating system.\n\nEvery product decision. Every client interaction. Every piece of content.\n\nFiltered through one question: does this honor the person on the other side?\n\nHere's what that looks like in practice…",
    cta: "Share this with a founder who leads with values.",
    platforms: ["Instagram", "LinkedIn"],
    status: "Published",
    category: "Founder Insight",
    owner: "Tai",
    date: "Jun 20, 2026",
    gradientFrom: "#F59E0B",
    gradientTo: "#7C3AED",
    agentScore: 90,
    impressions: 2210,
    engagement: 5.8,
    clicks: 91,
    contentPillar: "Spirit First",
    scheduleDate: "2026-06-20T09:00",
  },
  {
    id: "post-010",
    hook: "Systems that scale: the difference between a job and a business.",
    body: "A job scales with your hours.\n\nA business scales with your systems.\n\nMost founders are running jobs with business cards.\n\nHere are the 5 systems I'd build first if I was starting over…",
    cta: "Save this. You'll want it when you're ready to scale.",
    platforms: ["Blog"],
    status: "Draft",
    category: "Thought Leadership",
    owner: "Tai",
    date: "Jul 10, 2026",
    gradientFrom: "#2563EB",
    gradientTo: "#16A34A",
    agentScore: 77,
    contentPillar: "Systems That Scale",
    scheduleDate: "2026-07-10T09:00",
  },
  {
    id: "post-011",
    hook: "Client transformation story: from 2 posts/month to 30 — without burning out.",
    body: "Meet Danielle. Agency owner. 6 clients. Zero content bandwidth.\n\nIn 8 weeks on the Trust Tai system:\n→ 30 posts published\n→ 2 inbound leads from content\n→ Entire approval flow automated\n\nHere's exactly how we did it…",
    cta: "Comment 'TRANSFORM' if you want to see the before/after.",
    platforms: ["LinkedIn"],
    status: "Winning",
    category: "Proof/Case Study",
    owner: "Tai",
    date: "Jun 15, 2026",
    gradientFrom: "#16A34A",
    gradientTo: "#F59E0B",
    agentScore: 94,
    impressions: 5811,
    engagement: 7.4,
    clicks: 318,
    campaign: "Spirit First Awareness",
    contentPillar: "Client Transformation",
    scheduleDate: "2026-06-15T09:00",
  },
  {
    id: "post-012",
    hook: "The honest truth about AI content tools — and why most of them fail founders.",
    body: "They're built for volume, not voice.\n\nThey optimize for keywords, not relationships.\n\nAnd they can't tell the difference between your story and everyone else's.\n\nHere's what actually works (and what I built instead)…",
    cta: "Follow for more honest takes on AI + content.",
    platforms: ["X", "Blog"],
    status: "Needs Review",
    category: "Thought Leadership",
    owner: "Tai",
    date: "Jul 9, 2026",
    gradientFrom: "#EF4444",
    gradientTo: "#2563EB",
    agentScore: 83,
    contentPillar: "Founder Bottlenecks",
    scheduleDate: "2026-07-09T14:00",
  },
]
