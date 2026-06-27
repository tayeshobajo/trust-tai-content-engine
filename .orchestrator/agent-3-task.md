# Agent 3 Task: Growth Dashboard, Approvals, Asset Library, Agent Workspace

## Scope
4 pages of the Trust Tai Content Engine. Read CLAUDE.md first for the full design system.

## Dependency
Agent 1 owns Sidebar.tsx and Shell.tsx. Use Shell in every page.
If Shell.tsx does not exist, stub it:
```tsx
export default function Shell({ children }: { children: React.ReactNode }) {
  return <div className="ml-[220px] bg-[#F8F9FB] min-h-screen">{children}</div>
}
```
If Sidebar.tsx missing, stub it:
```tsx
export default function Sidebar() { return <div className="fixed left-0 top-0 w-[220px] h-screen bg-[#0A0E1A]" /> }
```

## Files You Own
- `src/app/growth/page.tsx`
- `src/app/approvals/page.tsx`
- `src/app/assets/page.tsx`
- `src/app/agent/page.tsx`
- `src/app/settings/page.tsx`

## Do NOT touch
dashboard, calendar, library, campaigns, content-map, globals.css, layout.tsx, Sidebar.tsx, Shell.tsx

---

## Growth Dashboard Page

Page title: "Growth Dashboard"
Subtitle: "What is working, what is not, and what to do next."

Top 4 metric cards (with sparkline placeholder — use a simple recharts LineChart 80px tall, no axes):
1. Total Followers — 2,847 — blue — ↑312 this month — sparkline (upward trend)
2. Total Impressions — 18.4K — green — ↑22% — sparkline
3. Avg Engagement Rate — 4.2% — purple — ↑0.8% — sparkline
4. Website Clicks — 284 — amber — ↑18% — sparkline

Main 2-col (65% / 35%):

LEFT:
1. Audience Growth chart — recharts AreaChart, gradient fill, 6 months of data (Jan–Jun), Followers on Y axis. Data: [1200, 1450, 1780, 2100, 2450, 2847]. Blue gradient.

2. Engagement Trend — recharts LineChart, same 6 months, engagement rate %. Data: [2.1, 2.8, 3.2, 3.6, 3.9, 4.2]. Green line.

3. Platform Performance table:
   Cols: Platform | Impressions | Eng Rate | Clicks | Leads
   Rows:
   - LinkedIn (blue icon): 9,200 / 5.8% / 142 / 8
   - Instagram (pink icon): 5,100 / 3.9% / 84 / 3
   - X/Twitter (black icon): 2,800 / 2.1% / 38 / 1
   - Blog (gray icon): 1,300 / — / 20 / 0

RIGHT:
4. Best Posts (top 3 cards): hook title + platform + Impressions + Engagement
5. Agent Insights (3 items): observation + why it matters + recommended action — each in a white card with blue sparkle icon
6. Goals progress:
   - LinkedIn followers 3K: 95% progress bar (green)
   - Monthly impressions 25K: 74% (blue)
   - Leads from content: 40% (amber)

---

## Approval Queue Page

Page title: "Approval Queue"
Subtitle: "Review and approve content before it goes live."

Top 6 status summary cards (circular icon + number + label):
- 14 Total Items (blue)
- 3 Needs Draft (amber)
- 2 Needs Image (purple)
- 4 Needs Review (amber)
- 3 Approved (green)
- 2 Scheduled (blue)

Main layout: Kanban board (horizontal scroll, 5 columns)

Columns:
1. NEEDS DRAFT (amber header) — 3 cards
2. NEEDS IMAGE (purple header) — 2 cards
3. NEEDS REVIEW (amber header) — 4 cards
4. APPROVED (green header) — 3 cards
5. SCHEDULED (blue header) — 2 cards

Each card in kanban:
- Featured image placeholder (colored block, small)
- Hook title (2 lines, semibold)
- Platform icon + Category badge
- Owner "Tai" (small)
- Date
- Action buttons at bottom:
  - "Needs Review" column: "Approve" (green) + "Request Changes" (outline)
  - "Approved" column: "Schedule" (blue) + "View" (outline)
  - Others: "Open" button

Populate with mix of the LinkedIn/Instagram posts from the content calendar.

---

## Asset Library Page

Page title: "Asset Library"
Subtitle: "Every image, document, and brand asset in one place."

Top 5 metric cards:
1. Total Assets — 1,248 — blue — ↑18 this week
2. Images — 342 — green
3. Documents — 189 — purple
4. Videos — 96 — amber
5. Other Files — 621 — pink

Main 2-col (72% / 28%):

LEFT:
Tab row: All Assets | Images | Documents | Videos | Audio | Templates | Brand | Voice & Copy

Folders row (horizontal): 
- Brand Assets (120 files) — blue folder
- Campaigns (28 files) — green folder
- Content Pillars (36 files) — purple folder
- Templates (64 files) — amber folder
- Founder Voice (16 files) — pink folder
- "+ New Folder" dashed card

Recent Assets table:
Cols: Name | Type | Folder | Tags | Modified | Size | (actions ...)
8 rows:
- Roadmap Quote.png — Image — Content Pillars — [roadmap][quote] — Jun 27 — 2.4MB
- Founder Story.docx — Document — Founder Voice — [voice] — Jun 26 — 84KB
- Brand Guidelines.pdf — Document — Brand Assets — [brand] — Jun 15 — 1.2MB
- Behind the Scenes.mp4 — Video — Campaigns — [btc] — Jun 24 — 18MB
- Q2 Strategy.pptx — Document — Brand Assets — [strategy] — Jun 10 — 3.1MB
- Logo.png — Image — Brand Assets — [brand][logo] — Jun 1 — 240KB
- Voice & Tone Guide.pdf — Document — Founder Voice — [voice][brand] — Jun 20 — 512KB
- Roadmap Hero.png — Image — Campaigns — [roadmap][hero] — Jun 27 — 4.1MB

Pagination: "Showing 1 to 8 of 1,248"

RIGHT sidebar:
- Upload dropzone (dashed border, cloud icon, "Drag & drop or click to browse")
- Founder Voice card: "Active" green badge, "Voice Score: 92/100" green progress bar, "Upload Document" + "Link Google Doc" action rows, "View Voice Insights" button
- Storage: "18.4 GB of 50 GB — 36%" progress bar + breakdown (Images 8.2GB, Documents 5.1GB, Videos 3.6GB, Other 1.5GB)

---

## Agent Workspace Page

Page title: "Content Agent"
Subtitle: "Your AI content strategist. Plan, create, review, and optimize."

3-column layout:

LEFT (25%):
"Quick Actions" card — 8 action rows (icon + title + subtitle + chevron):
- Plan next week's posts
- Create posts for an offer
- What should I post next?
- Turn one idea into content
- Review my content
- Find content gaps
- Create a 30-day campaign
- Analyze what's working

"Content Strategy" card:
- Pillars: tag chips (The Roadmap, Founder Bottlenecks, Systems That Scale, Spirit First, Client Transformation, +3 more)
- Posting rhythm: LinkedIn 3x/wk, Instagram 3x/wk, X 2x/wk, Newsletter 1x/wk
- Primary offer: "The Roadmap — Operating Map"

CENTER (50%):
Chat interface:
- Agent intro message (blue/purple sparkle avatar): "Hi Tai, I'm your Content Agent. I know your voice, your strategy, and your audience. What would you like to build today?"
- User bubble (right-aligned, light blue bg): "Plan my posts for next week across LinkedIn and Instagram."
- Agent response with embedded content plan card:
  Card header: "Next Week's Content Plan" + "10 Posts" badge + "2 Platforms" badge
  Table: Date | Platform | Category | Hook | Status
  5 rows (Mon-Fri next week), mix of LinkedIn and Instagram, showing hooks from the Week 1 content calendar
  Footer: "Add to Calendar" (blue button) + "Export Plan" (outline) + "Regenerate" (outline)

Input composer at bottom:
- Rounded input field: "Ask me anything about your content..."
- Blue send button (paper plane icon)
- "Add context:" chip row: My goals / Current campaigns / Top performing posts / Content gaps

RIGHT (25%):
- Agent Recommendations: 4 items with icon + description
- Content Health Score: circular gauge "78/100" green ring + 5 bar metrics (Consistency 82, Category Balance 74, Offer Alignment 76, Engagement Potential 79, Platform Balance 78)
- Recent Activity: 4 timeline rows

---

## Settings Page (simple — not complex)
Page title: "Settings"
Tabs: Workspace | Integrations | Voice | Notifications | Billing

Show Workspace tab by default:
- Business name: "Trust Tai" (editable input)
- Website: "trusttai.com"
- Industry: "Web Development / AI"
- Timezone: "America/Chicago"
- Posting defaults (platform checkboxes)
- "Save Changes" blue button

Integrations tab stub: show 6 integration cards (LinkedIn, Instagram, X, WordPress, Google Analytics, Mailchimp) each with "Connect" button and status indicator.

---

## Quality Gates
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — exit 0

Report: "AGENT-3-COMPLETE" when done. List every file created/modified.
