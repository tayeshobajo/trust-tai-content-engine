# Fix: Post Detail Page reads from store, not static POSTS array

## Problem
`src/app/library/[id]/page.tsx` currently reads post data from the static `POSTS` array imported from `src/data/posts.ts`.
That array is now empty (we cleared all demo data). All real posts live in localStorage via the store.

The page must be a client component that reads from `getPosts()` in `src/lib/store.ts`.

## Fix

Convert `src/app/library/[id]/page.tsx` to a `"use client"` component that:
1. Adds `"use client"` at the top
2. Uses `useParams()` from `next/navigation` to get the `id`
3. Uses `useState` + `useEffect` to call `getPosts()` from `@/lib/store` on mount
4. Finds the post by `id`
5. If not found → show a "Post not found" message with a back link to `/library`
6. If found → render exactly as before (same layout, same UI)

## Important
- Remove any `generateStaticParams` or `params` prop since this will be a dynamic client component
- Keep all existing UI — only change the data source
- `npm run build` must exit 0 with no TypeScript errors
- Do NOT touch any other files
