# Agent 1 Task: Shell, Sidebar, Design System + Dashboard + Calendar

## Scope
You are building the foundation of the Trust Tai Content Engine. Your files are the spine everything else connects to.

## Files You Own
- `src/app/globals.css` — full design system CSS vars
- `src/app/layout.tsx` — root layout
- `src/app/page.tsx` — redirect to /dashboard
- `src/components/Sidebar.tsx` — shared nav sidebar
- `src/components/Shell.tsx` — shared page wrapper
- `src/components/ui/StatusBadge.tsx` — reusable status badge
- `src/components/ui/MetricCard.tsx` — reusable metric card (icon + number + trend)
- `src/app/dashboard/page.tsx` — Content Command Center
- `src/app/calendar/page.tsx` — Content Calendar

## Do NOT touch
Any files under `/approvals`, `/assets`, `/agent`, `/campaigns`, `/growth`, `/content-map`, `/library`, `/library` — those belong to other agents.

## Sidebar Design
Dark navy `#0A0E1A`. Logo at top (use text "CE" in a blue rounded square + "Content Engine" white text). Nav items with lucide-react icons. Active = blue pill bg. Approvals has a count badge "4". Workspace card at bottom "Trust Tai / Business". User card "Tai / Founder".

Nav items + icons (lucide-react):
- Dashboard → LayoutDashboard
- Calendar → CalendarDays
- Library → BookOpen
- Campaigns → Megaphone
- Content Map → Map
- Growth → TrendingUp
- Approvals → CheckSquare (badge: 4)
- Assets → FolderOpen
- Agent → Sparkles
- Settings → Settings

## Dashboard (Content Command Center)
Page title: "Content Command Center"
Subtitle: "Plan, schedule, and grow your presence without living inside the platforms."

### Top 4 metric cards:
1. Scheduled Posts — 18 — blue icon (CalendarDays) — "↑12% vs last month"
2. Content Coverage — "6 of 8 categories active" — green icon (Target) — "↑2 vs last month"
3. Growth This Month — "+312 followers" — purple icon (TrendingUp) — "↑8% vs last month"
4. Needs Attention — 4 — amber icon (AlertCircle) — "Review pending items"

### Main 2-col layout (65% / 35%):

LEFT COLUMN:
1. "This Week's Content" section — horizontal scrollable cards:
   Each card: colored image placeholder (gradient bg) + "MON 6/30" label + hook title (truncate 2 lines) + platform icon chips (LinkedIn=blue, Instagram=pink) + category badge + status badge + "9:00 AM"
   Show 4 sample posts using the Week 1 content from trust-tai/linkedin-content-engine/week-01.md

2. "Agent Recommendations" section (list):
   - LinkedIn quiet 6 days → "Create a founder insight post" → blue icon
   - Client Education underused → "Schedule 2 educational posts" → amber icon  
   - Last 3 BTS posts above average → "Create 2 more" → green icon
   - No post supports Roadmap offer → "Add offer-aligned post" → purple icon
   - Winning post ready to repurpose → "Turn into email" → blue icon
   "Ask the Agent Anything" button at bottom

RIGHT COLUMN:
3. Growth Snapshot — mini metrics: Followers 2,847 ↑312, Impressions 18.4K ↑22%, Engagement 4.2% ↑0.8%, Clicks 284 ↑18%

4. Approval Queue — 4 items needing review with status badges

5. Monthly goal progress bar — "80% of monthly goal" — blue progress bar

## Calendar Page
Page title: "Content Calendar"

Top toolbar: Month/Week toggle (pill style), Month "July 2026" with prev/next arrows, filter dropdowns (Platform, Category, Status), "+ Create Post" blue button.

Full month grid (7 cols, 5 rows). Current month July 2026. Add post cards on Mon Jun 30, Wed Jul 2, Thu Jul 3, Mon Jul 7, Wed Jul 9, Fri Jul 11.

Each post card in calendar cell:
- Small colored placeholder image block
- 2-line hook title
- Platform icon (tiny)
- Status badge (tiny)

Unscheduled drafts section below calendar.

## Quality Gates
Run before reporting done:
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors  
3. `npm run build` — exit 0

Report: "AGENT-1-COMPLETE" when done. List every file created/modified.
