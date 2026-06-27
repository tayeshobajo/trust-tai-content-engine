# CLAUDE.md — Trust Tai Content Engine

## Project
Next.js 15 + TypeScript + Tailwind + shadcn/ui. App Router. All pages in `src/app/`.

## Design System (STRICT — never deviate)

### Colors
```
Sidebar bg:       #0A0E1A (near-black navy)
Canvas bg:        #F8F9FB
Card bg:          #FFFFFF
Primary blue:     #2563EB
Active blue dark: #1D4ED8
Heading text:     #0F172A
Body text:        #64748B
Muted text:       #94A3B8
Border:           #E5E7EB
Success green:    #16A34A
Warning amber:    #F59E0B
Error red:        #EF4444
Purple accent:    #7C3AED
```

### Status Badge Colors (pill, rounded-full)
```
Scheduled:       bg-blue-100  text-blue-700
Needs Review:    bg-amber-100 text-amber-700
Approved:        bg-green-100 text-green-700
Draft/Idea:      bg-slate-100 text-slate-600
Published:       bg-green-100 text-green-700
Winning:         bg-green-100 text-green-700
Underperforming: bg-red-100   text-red-700
Average:         bg-slate-100 text-slate-600
Planned:         bg-amber-100 text-amber-700
Missing:         bg-red-100   text-red-700
```

### Layout Shell
- Left sidebar: fixed 220px, bg #0A0E1A, full height
- Main content: ml-[220px], bg #F8F9FB, min-h-screen
- Page padding: px-8 py-6
- Card: bg-white rounded-xl border border-gray-200 shadow-sm

### Components
- Use shadcn/ui components from @/components/ui/
- Icons from lucide-react only
- Charts from recharts only
- NO external image dependencies — use placeholder divs with bg colors

### Cards (icon-in-colored-square pattern)
```tsx
<div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>
```

### Typography
- Page title: text-2xl font-bold text-[#0F172A]
- Page subtitle: text-sm text-[#64748B]
- Card title: text-sm font-semibold text-[#0F172A]
- Metric number: text-2xl font-bold text-[#0F172A]
- Section label: text-xs uppercase tracking-wider text-[#94A3B8]

## Build Rules
1. Every page exports a default React component
2. No `any` types
3. All data is mock/inline — no API calls
4. Mobile responsive (md: breakpoints at minimum)
5. Sidebar is a shared component at @/components/Sidebar.tsx
6. Shell layout at @/components/Shell.tsx wraps all pages
7. Run `npm run build` before reporting complete — must exit 0

## Routes
- / → redirects to /dashboard
- /dashboard → Content Command Center
- /calendar → Content Calendar
- /library → Content Library
- /campaigns → Campaigns
- /content-map → Content Map
- /growth → Growth Dashboard
- /approvals → Approval Queue
- /assets → Asset Library
- /agent → Agent Workspace
- /settings → Settings

## Quality Gates
Before marking ANY task complete:
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — exit 0
