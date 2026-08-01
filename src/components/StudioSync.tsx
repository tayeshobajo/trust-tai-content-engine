"use client"

import { useEffect } from "react"

/**
 * Silent sync: on first mount, pull from Supabase so localStorage
 * has the latest server data. Also pushes any unsynced local data up.
 *
 * This is a client component rendered once in the root layout.
 * It renders nothing — just triggers the sync as a side effect.
 */
export function StudioSync() {
  useEffect(() => {
    // Pull from Supabase and push any unsynced local data up
    import("@/lib/studio-db").then(({ syncFromServer }) => {
      syncFromServer().catch(() => {})
    })
    // Seed the World Bible canon to Supabase once
    import("@/lib/studio-memory-store").then(({ seedWorldBibleToSupabase }) => {
      seedWorldBibleToSupabase().catch(() => {})
    })
  }, [])

  return null
}
