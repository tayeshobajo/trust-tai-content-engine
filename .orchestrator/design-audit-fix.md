# Design Audit Fix

Apply design skill standards. Fix every issue below. Touch only the listed files.

---

## 1. CreatePostModal — src/components/CreatePostModal.tsx

### Problems
- Inputs use underline-only border (looks unfinished). Replace with proper bordered inputs.
- Labels have no bottom margin before inputs.
- Char counters (0/100, 0/3000) get clipped at right edge.
- Schedule Date is an unstyled native datetime-local input.
- No horizontal padding on modal content — content hits edges.
- "Card Color" section has insufficient spacing from row above.

### Fix
- All text inputs and textareas: add `border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full` (remove any underline-only classes)
- Labels: add `mb-1.5` below each label
- Char counter: wrap label+counter in `flex items-center justify-between mb-1.5`, counter gets `text-xs text-[#94A3B8] shrink-0`
- Schedule Date input: add `border border-gray-200 rounded-lg px-3 py-2.5 w-full text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500`
- Modal content wrapper: ensure `px-6` padding (DialogContent already has some — verify it applies to all children)
- Card Color section: add `mt-2` spacing

---

## 2. Dashboard — src/app/dashboard/page.tsx

### Problem
Growth Snapshot panel (right sidebar, inside the dashboard page component) still shows hardcoded values: `2,847`, `18.4K`, `4.2%`, `284` with fake deltas like `↑312` and `↑22%`.

### Fix
Find the Growth Snapshot section and replace all hardcoded metric values with `—` and all delta lines with `"Connect LinkedIn to track"`.

Specifically replace the static data object/array that drives: Followers, Impressions, Engagement, Clicks in the Growth Snapshot panel.

---

## 3. Approvals badge count — src/app/approvals/page.tsx + src/components/Sidebar.tsx

### Problem
Sidebar shows `4` badge on Approvals but only 3 posts exist.

### Fix
Find where the badge count is computed in Sidebar.tsx. It likely calls getPosts() or reads a count. Ensure it uses the same async pattern: `getPosts().then(posts => posts.filter(...).length)`. If it's hardcoded, remove the hardcode and derive from the store.

---

## Build
Run `npm run build` after all changes. Must exit 0, 0 TypeScript errors. Report what changed.

## DO NOT
- Change any page routing or navigation
- Add new dependencies  
- Touch store.ts, supabase.ts, data/posts.ts
- Redesign the layout — fix the specific issues listed only
