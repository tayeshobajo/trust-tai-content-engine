# Task A — Rewrite src/lib/store.ts + create src/lib/supabase.ts

## Create src/lib/supabase.ts
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Rewrite src/lib/store.ts

Replace the entire file with async Supabase-backed functions. DB uses snake_case; app uses camelCase — map accordingly.

The posts table schema:
- id, hook, body, cta, platforms (text[]), status, category, owner, date
- gradient_from, gradient_to, agent_score
- impressions, engagement, clicks, campaign, content_pillar, schedule_date
- created_at, updated_at

Keep Message, Settings, getAgentMessages, saveAgentMessages, clearAgentMessages, getSettings, saveSettings in localStorage (no DB needed for those).

Export these async functions:
- getPosts(): Promise<Post[]>
- addPost(post: Omit<Post,'id'>): Promise<Post>
- updatePost(id: string, updates: Partial<Post>): Promise<void>
- deletePost(id: string): Promise<void>

Also export: Post, Message, Settings (types).

Use `@/lib/supabase` for the client. Order by created_at desc in getPosts.

## DO NOT
- Touch any page files
- Add auth
- Run build (next task will do that)
