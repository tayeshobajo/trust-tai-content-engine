// Client-side persistence for Studio productions.
// Deterministic, local, and synchronous. Posts keep their existing Supabase store.

import type { GateKey, GateStatus, Production } from "@/data/studio"
import { GATE_ORDER } from "@/data/studio"

const STORAGE_KEY = "tts_productions"
export const PRODUCTIONS_CHANGED_EVENT = "tts-productions-changed"

function isClient(): boolean {
  return typeof window !== "undefined"
}

function emitChange(): void {
  if (isClient()) window.dispatchEvent(new Event(PRODUCTIONS_CHANGED_EVENT))
}

export function getProductions(): Production[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Production[]) : []
  } catch {
    return []
  }
}

export function getProduction(id: string): Production | undefined {
  return getProductions().find((p) => p.id === id)
}

function persist(productions: Production[]): void {
  if (!isClient()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productions))
  emitChange()
}

export function saveProduction(production: Production): void {
  const all = getProductions()
  const idx = all.findIndex((p) => p.id === production.id)
  if (idx >= 0) all[idx] = production
  else all.unshift(production)
  persist(all)
}

export function updateProduction(
  id: string,
  updater: (p: Production) => Production
): Production | undefined {
  const all = getProductions()
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated = { ...updater(all[idx]), updatedAt: new Date().toISOString() }
  all[idx] = updated
  persist(all)
  return updated
}

export function deleteProduction(id: string): void {
  persist(getProductions().filter((p) => p.id !== id))
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

// Number of productions with a decision waiting at any gate.
export function openDecisionCount(productions?: Production[]): number {
  const all = productions ?? getProductions()
  return all.filter((p) => GATE_ORDER.some((k) => p.gates[k].status !== "approved")).length
}
