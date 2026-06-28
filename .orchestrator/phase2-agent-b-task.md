# Phase 2 Agent B: Create Post Flow + Live Library + Approval Actions

## Context
Trust Tai Content Engine is live. Phase 2 adds interactivity. Agent A is wiring the AI. You own the post creation flow, live library filtering, and approval board actions.

## Working Directory
/Users/tayeshobajo/Developer/trust-tai-content-engine

## Files You Own
- `src/app/library/page.tsx` — wire real filtering + localStorage posts
- `src/app/approvals/page.tsx` — wire approve/reject actions to localStorage
- `src/components/CreatePostModal.tsx` — new modal for creating posts
- `src/app/dashboard/page.tsx` — wire "Create Post" button to modal, wire approval queue to localStorage

## Do NOT touch
Sidebar.tsx, Shell.tsx, globals.css, agent/page.tsx, API routes

---

## 1. CreatePostModal (`src/components/CreatePostModal.tsx`)

A full-screen modal (or large dialog) triggered by "+ Create Post" button anywhere in the app.

Fields:
- Hook / Opening line (textarea, 100 char limit with counter)
- Body / Caption (textarea, 3000 char limit with counter)  
- CTA (input, one line)
- Platform (multi-select pills: LinkedIn, Instagram, X, Blog, Newsletter)
- Category (select: Founder Insight, Client Education, Proof/Case Study, Behind the Scenes, Offer/Sales, Thought Leadership, Culture/Values, FAQs, Industry Commentary, Personal Story, Tutorial, Announcement)
- Content Pillar (select: The Roadmap, Founder Bottlenecks, Systems That Scale, Spirit First, Client Transformation)
- Campaign (select: Roadmap Launch, Founder Authority Series, Spirit First Awareness, None)
- Scheduled Date (date/time picker — use HTML input type="datetime-local")
- Status (auto-set to "Draft" on creation)
- Featured image color (since no image upload yet — pick a gradient color from 8 presets that becomes the card gradient bg)

Bottom buttons: "Save as Draft" (outline) + "Send to Review" (blue)

On save: call `addPost()` from src/lib/store.ts (Agent A creates this). If store not ready, use a simple localStorage direct write. Show a toast confirmation "Post saved to library".

Use shadcn Dialog component. Make it responsive.

## 2. Library Page — Live Filtering

Update `src/app/library/page.tsx`:
- On mount: load posts from localStorage (use store from Agent A, or direct localStorage read as fallback)
- Tab filtering (All Posts / Drafts / Scheduled / Published / Winning Posts / Needs Repurpose) — filter against real post.status
- Platform dropdown — filter against post.platform array
- Status dropdown — filter against post.status  
- Category dropdown — filter against post.category
- Search input — filter against post.hook + post.body (case-insensitive)
- All filters combinable
- Show post count: "Showing X of Y posts"
- Empty state: "No posts match your filters. Try adjusting or create a new post."
- Wire the 3-dot menu: Edit (opens CreatePostModal prefilled), Duplicate (copies post with "Copy of" prefix), Archive (sets status to Archived)

## 3. Approvals Page — Live Actions

Update `src/app/approvals/page.tsx`:
- On mount: load posts from localStorage, filter to statuses: Needs Draft, Needs Image, Needs Review, Approved, Scheduled
- "Approve" button → set post.status = 'Approved', update localStorage, re-render board
- "Request Changes" button → show a small inline text input for feedback, set status back to 'Drafting'
- "Schedule" button (in Approved column) → show datetime picker inline, set post.status = 'Scheduled' + post.scheduledDate
- "View" button → navigate to /library/[id]
- Status summary cards at top update reactively
- Show empty column state: "All clear" with checkmark when column is empty

## 4. Dashboard — Wire Create Post

Update `src/app/dashboard/page.tsx`:
- Import and render CreatePostModal
- "Ask the Agent Anything" button in agent recommendations section → navigate to /agent
- "Review All" button in approval queue → navigate to /approvals
- Approval queue items on dashboard → load from localStorage, show real count in the badge

## Quality Gates
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — exit 0

IMPORTANT: If store.ts from Agent A doesn't exist yet, create a simple stub:
```typescript
// src/lib/store.ts (STUB — Agent A will flesh this out)
export function getPosts() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('ce_posts') || '[]') } catch { return [] }
}
export function savePosts(posts: unknown[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ce_posts', JSON.stringify(posts))
}
```

Report: write to `.orchestrator/phase2-agent-b-output.md`
End with: PHASE2-B-COMPLETE
