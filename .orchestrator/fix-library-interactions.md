# Fix: Library Post Cards + Create Post Modal

## Bugs to fix

### Bug 1: Post cards are not clickable
File: `src/app/library/page.tsx`

The `PostCard` component renders a `<div>` with no navigation. Clicking a card does nothing.

**Fix:** Make the entire card clickable and navigate to `/library/[id]` when clicked.
- Add `useRouter` from `next/navigation`
- In `PostCard`, add `onClick={() => router.push('/library/' + post.id)}` to the outer div
- Add `cursor-pointer` and `hover:shadow-md transition-shadow` to the outer div className
- The 3-dot menu button should use `e.stopPropagation()` to prevent the card click firing when the menu is opened

### Bug 2: Create Post modal button does nothing
File: `src/app/library/page.tsx`

The `+ Create Post` button in the header has `onClick={handleCreateNew}`. The `handleCreateNew` function sets `modalOpen(true)`. The modal is rendered with `open={modalOpen}`.

Check: is the `CreatePostModal` component receiving `open` and actually rendering? The issue may be that the modal uses a Dialog from shadcn/ui that requires proper `open` prop wiring.

**Check `src/components/CreatePostModal.tsx`** — confirm that:
1. The component accepts `open: boolean` and passes it to `<Dialog open={open}>`
2. The `onOpenChange` prop is wired to the Dialog

If the Dialog `open` prop is hardcoded or missing, fix it.

Also confirm the `+ Create Post` button in the HEADER (around line 260) has the correct onClick. There may be two buttons and one is broken.

## Verification
After fixes:
1. Click any post card → should navigate to `/library/[id]` showing that post's detail
2. Click `+ Create Post` button → modal should open with hook/body/CTA fields visible
3. `npm run build` must exit 0 with no TypeScript errors

## DO NOT
- Touch `src/data/posts.ts`
- Touch `src/lib/store.ts`
- Change any other pages
- Add new dependencies
