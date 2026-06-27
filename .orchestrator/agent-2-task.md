# Agent 2 Task: Library, Post Detail, Content Map, Campaigns

## Scope
You are building 4 pages of the Trust Tai Content Engine. Read CLAUDE.md first — it contains the full design system.

## Dependency
Agent 1 is building Sidebar.tsx and Shell.tsx. You MUST import Shell from "@/components/Shell" in every page.
If Shell.tsx does not exist yet, create a temporary stub:
```tsx
// src/components/Shell.tsx (STUB - Agent 1 owns this)
export default function Shell({ children }: { children: React.ReactNode }) {
  return <div className="ml-[220px] bg-[#F8F9FB] min-h-screen">{children}</div>
}
```
Also stub Sidebar if missing:
```tsx
// src/components/Sidebar.tsx (STUB)
export default function Sidebar() { return <div className="fixed left-0 top-0 w-[220px] h-screen bg-[#0A0E1A]" /> }
```

## Files You Own
- `src/app/library/page.tsx`
- `src/app/library/[id]/page.tsx` (Post Detail)
- `src/app/content-map/page.tsx`
- `src/app/campaigns/page.tsx`
- `src/data/posts.ts` (shared mock data — export a POSTS array used by all your pages)

## Do NOT touch
dashboard, calendar, approvals, assets, agent, growth, globals.css, layout.tsx, Sidebar.tsx, Shell.tsx

---

## Library Page (Content Library)

Page title: "Content Library"
Subtitle: "Every post, organized. Nothing lost."

Top: Tab row (All Posts | Drafts | Scheduled | Published | Winning Posts | Needs Repurpose)
Filter row: Platform dropdown, Status dropdown, Category dropdown, Search input, "+ Create Post" button

Table/Grid view (default grid):
Show 12 mock posts as cards. Each card:
- Featured image placeholder (colored gradient block, 16:9, rounded-t-xl)
- Category badge (top-left overlay on image)
- Status badge (top-right overlay)
- Hook title (font-semibold, 2 lines)
- Platform icons row
- Date + "·" + Owner "Tai"
- 3-dot menu (Edit, Duplicate, Archive)

Mock posts (mix of platforms, statuses, categories):
Include the 3 Week 1 LinkedIn posts from the content engine brief. Add 9 more covering LinkedIn, Instagram, X, Blog. Mix statuses: Scheduled, Published, Needs Review, Draft, Winning.

---

## Post Detail Page (`/library/[id]`)

3-column layout:

LEFT (45%): Post Preview
- Large featured image placeholder (gradient block, full width, rounded-xl)
- Below: "Platform Versions" — pill tabs: LinkedIn (active) | Instagram | X
- Under tabs: hook input, body textarea with char counter (e.g. "254/3000"), CTA input
- "Agent Tip" box: pale blue bg, sparkle icon, "Strong hook. Consider adding a specific number or client story to strengthen credibility."

CENTER (35%): Status & Scheduling rail
- Status selector (dropdown, current: "Approved")
- Schedule date picker field
- Category select
- Content Pillar select
- Campaign select
- Offer alignment field
- Approval status: green "Approved by Tai" with checkmark
- "Save Changes" blue button
- "Preview" outline button

RIGHT (20%): Agent Score
- Circular score ring: "87/100" in green
- "Strong" label
- 5 bar metrics: Clarity 92, Audience Fit 88, Hook Strength 85, CTA Quality 84, Brand Voice 90
- Performance section (if published): Impressions 2,847, Engagement 4.2%, Clicks 84
- "Repurpose Suggestions": "Turn into Instagram carousel", "Convert to email intro"

---

## Content Map Page

Page title: "Content Map"
Subtitle: "Are we saying enough of the right things?"

Top 4 metric cards:
1. Active Categories — 8 of 10 — green — "80% of planned mix"
2. Coverage Score — 82% — blue — "↑7% vs last month"
3. Missing Content Gaps — 6 — amber — "Across 3 categories"
4. Planned Posts — 24 — purple — "Across 5 platforms"

Main 2-col (70% / 30%):

LEFT: Category Coverage Matrix
Table: rows = 8 categories, cols = Week 1–4 (Jul 2026)
Each cell is a status pill:
- Founder Insight: W1=Published, W2=Scheduled, W3=Planned, W4=Missing
- Client Education: W1=Published, W2=Planned, W3=Missing, W4=Missing
- Proof/Case Study: W1=Scheduled, W2=Planned, W3=Planned, W4=Missing
- Behind the Scenes: W1=Published, W2=Scheduled, W3=Planned, W4=Planned
- Offer/Sales: W1=Missing, W2=Missing, W3=Planned, W4=Planned
- Thought Leadership: W1=Published, W2=Scheduled, W3=Scheduled, W4=Planned
- Personal Story: W1=Published, W2=Planned, W3=Missing, W4=Missing
- FAQs: W1=Missing, W2=Missing, W3=Missing, W4=Planned

Legend: 4 colored dots — Published (green) Scheduled (blue) Planned (amber) Missing (red)

RIGHT:
- Content Gaps alerts list (5 items with icon + description)
- Pillar Distribution: 5 horizontal bars (The Roadmap 32%, Founder Bottlenecks 23%, Systems That Scale 18%, Spirit First 14%, Client Transformation 11%)
- "Ask the Agent Anything" button

---

## Campaigns Page

Page title: "Campaigns"
Subtitle: "Focused content pushes tied to business outcomes."

Top stats: Active Campaigns 3, Scheduled Posts 18, Campaign Reach 8.2K, Leads Influenced 12

Campaign cards (3 active):
1. "Roadmap Launch" — Goal: "Generate 20 qualified leads" — Jul 1–Jul 31 — LinkedIn + Instagram — 8 posts — Status: Active (green badge) — Progress bar 35%
2. "Founder Authority Series" — Goal: "Build LinkedIn presence to 3K followers" — Jun 30–Aug 15 — LinkedIn — 12 posts — Status: Active — Progress 22%
3. "Spirit First Awareness" — Goal: "Establish thought leadership" — Jul 7–Jul 28 — All platforms — 6 posts — Status: Planning (amber)

Each card: campaign name, goal, dates, platform chips, post count, status badge, progress bar, "View Campaign" button + "Add Posts" outline button.

"+ Create Campaign" blue button top right.

---

## Quality Gates
Run before reporting done:
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — exit 0

Report: "AGENT-2-COMPLETE" when done. List every file created/modified.
