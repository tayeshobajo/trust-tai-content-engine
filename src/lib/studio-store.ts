// Client-side persistence for Studio productions.
// V2: localStorage as cache, Supabase as source of truth (write-behind).
//
// All read functions stay synchronous (localStorage = instant UI).
// Write functions update localStorage synchronously AND fire-and-forget to Supabase.
// Call-site signatures are unchanged from V1.

import type { GateKey, GateStatus, Production } from "@/data/studio"
import { GATE_ORDER } from "@/data/studio"
import { dbUpsertProduction, dbDeleteProduction, syncFromServer, ensureMigrated } from "@/lib/studio-db"

const STORAGE_KEY = "tts_productions"
export const PRODUCTIONS_CHANGED_EVENT = "tts-productions-changed"

function isClient(): boolean {
  return typeof window !== "undefined"
}

function emitChange(): void {
  if (isClient()) window.dispatchEvent(new Event(PRODUCTIONS_CHANGED_EVENT))
}

function readArray<T>(key: string): T[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function persist(productions: Production[]): void {
  if (!isClient()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productions))
  emitChange()
}

// ---------------------------------------------------------------------------
// Read API (synchronous — from localStorage cache)
// ---------------------------------------------------------------------------

export function getProductions(): Production[] {
  return readArray<Production>(STORAGE_KEY).sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1
  )
}

export function getProduction(id: string): Production | undefined {
  return getProductions().find((p) => p.id === id)
}

// ---------------------------------------------------------------------------
// Write API (synchronous localStorage + fire-and-forget Supabase)
// ---------------------------------------------------------------------------

export function saveProduction(production: Production): void {
  const all = readArray<Production>(STORAGE_KEY)
  const idx = all.findIndex((p) => p.id === production.id)
  if (idx >= 0) all[idx] = production
  else all.unshift(production)
  persist(all)

  // Write-behind to Supabase
  if (isClient()) dbUpsertProduction(production).catch(() => {})
}

export function updateProduction(
  id: string,
  updater: (p: Production) => Production
): Production | undefined {
  const all = readArray<Production>(STORAGE_KEY)
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated = { ...updater(all[idx]), updatedAt: new Date().toISOString() }
  all[idx] = updated
  persist(all)

  if (isClient()) dbUpsertProduction(updated).catch(() => {})
  return updated
}

export function deleteProduction(id: string): void {
  persist(readArray<Production>(STORAGE_KEY).filter((p) => p.id !== id))
  if (isClient()) dbDeleteProduction(id).catch(() => {})
}

export function setGate(id: string, gate: GateKey, status: GateStatus): Production | undefined {
  return updateProduction(id, (p) => ({
    ...p,
    gates: {
      ...p.gates,
      [gate]: { key: gate, status, decidedAt: new Date().toISOString() },
    },
  }))
}

export function emptyGates(): Production["gates"] {
  return Object.fromEntries(
    GATE_ORDER.map((key) => [key, { key, status: "open" as GateStatus }])
  ) as Production["gates"]
}

export function markPublished(id: string): Production | undefined {
  return updateProduction(id, (p) => ({
    ...p,
    publishedAt: new Date().toISOString(),
    archivedAt: undefined,
  }))
}

export function markArchived(id: string): Production | undefined {
  return updateProduction(id, (p) => ({
    ...p,
    archivedAt: new Date().toISOString(),
  }))
}

export function unarchive(id: string): Production | undefined {
  return updateProduction(id, (p) => ({
    ...p,
    archivedAt: undefined,
  }))
}

export function openDecisionCount(productions?: Production[]): number {
  const all = productions ?? getProductions()
  return all.filter((p) => GATE_ORDER.some((k) => p.gates[k].status !== "approved")).length
}

// ---------------------------------------------------------------------------
// Sync: pull from Supabase to localStorage (call on app load)
// ---------------------------------------------------------------------------

export async function syncProductionsFromServer(): Promise<void> {
  await syncFromServer()
}

export async function ensureProductionsMigrated(): Promise<void> {
  await ensureMigrated()
}
