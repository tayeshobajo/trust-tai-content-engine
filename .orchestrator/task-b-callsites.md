# Task B — Update all call sites to use async store

store.ts functions are now async (return Promises). Every page that calls them must await inside useEffect.

## Pattern for reading posts
```tsx
const [posts, setPosts] = useState<Post[]>([])
useEffect(() => {
  getPosts().then(setPosts)
}, [])
```

## Pattern for mutations
```tsx
await addPost(data)
getPosts().then(setPosts) // re-fetch
```

## Files to update

### src/app/library/page.tsx
- Find where getPosts() is called (likely in useState initializer or useEffect)
- Move to useEffect: `getPosts().then(setPosts)`
- After addPost/deletePost/updatePost calls: re-fetch with getPosts().then(setPosts)
- The component likely has local state for posts — keep that, just populate async

### src/app/library/[id]/page.tsx
- Already uses useEffect + getPosts() — confirm it's awaited properly
- If it uses `.find()` synchronously on getPosts() result, wrap in .then()

### src/app/dashboard/page.tsx
- Uses getPosts() in getApprovalItems callback — move to async useEffect
- Pattern: `getPosts().then(posts => { setAllPosts(posts); setApprovalItems(...) })`

### src/app/approvals/page.tsx
- Check if it calls getPosts() — update same pattern

### src/components/CreatePostModal.tsx
- addPost() call — make it async: `await addPost(data)` then call onCreated/onSaved

## After all updates
Run: npm run build
Fix any TypeScript errors.
Report what changed and build result.
