/**
 * Server-side persistence for Trust Tai Studio.
 *
 * Three tables mirror the localStorage model:
 *   tts_productions        — the main Production entity
 *   tts_correction_events  — learning loop captures
 *   tts_studio_principles  — confirmed creative principles
 *
 * This module is isomorphic: it works in both server components/routes
 * and client components. The caller decides which environment it's in.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Production, GateKey, ContentSpine, AudienceShift, ArgumentSection, VoiceWarning, StudioComment, Revision, FilmPlan, Gate } from "@/data/studio"
import type { AudienceFeedback, CorrectionEvent, PrincipleConflict, StudioPrinciple, WorldCanonItem, LearningScope, IntelligenceLayer, LearningConfidence, LearningBehavior, CorrectionCategory, LearningSurface } from "@/data/studio-memory"

// ---------------------------------------------------------------------------
// Client lifecycle
// ---------------------------------------------------------------------------

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  client = createClient(url, anon, { auth: { persistSession: false } })
  return client
}

// ---------------------------------------------------------------------------
// Row types (how data is stored in Postgres — snake_case → camelCase on read)
// ---------------------------------------------------------------------------

interface ProductionRow {
  id: string
  title: string
  source_type: string
  source_thought: string
  spine: ContentSpine
  shift: AudienceShift
  sections: ArgumentSection[]
  voice_warnings: VoiceWarning[]
  comments: StudioComment[]
  revisions: Revision[]
  gates: Record<GateKey, Gate>
  film: FilmPlan
  published_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

interface CorrectionRow {
  id: string
  production_id: string
  surface: string
  target: string
  before: string | null
  after: string | null
  labels: string[]
  category: string
  scope: string
  keep_unchanged: string[]
  tai_note: string | null
  studio_interpretation: string
  interpretation_status: string
  principle_id: string | null
  at: string
}

interface PrincipleRow {
  id: string
  title: string
  layer: string
  belief: string
  evidence_event_ids: string[]
  scope: string
  confidence: string
  formats: string[]
  exceptions: string[]
  last_reinforced_at: string
  behavior: string
  source: string
}

// ---------------------------------------------------------------------------
// Productions
// ---------------------------------------------------------------------------

function rowToProduction(r: ProductionRow): Production {
  return {
    id: r.id,
    title: r.title,
    sourceType: r.source_type as Production["sourceType"],
    sourceThought: r.source_thought,
    spine: r.spine,
    shift: r.shift,
    sections: r.sections ?? [],
    voiceWarnings: r.voice_warnings ?? [],
    comments: r.comments ?? [],
    revisions: r.revisions ?? [],
    gates: r.gates,
    film: r.film,
    publishedAt: r.published_at ?? undefined,
    archivedAt: r.archived_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function productionToRow(p: Production): Omit<ProductionRow, "created_at" | "updated_at"> {
  return {
    id: p.id,
    title: p.title,
    source_type: p.sourceType,
    source_thought: p.sourceThought,
    spine: p.spine,
    shift: p.shift,
    sections: p.sections,
    voice_warnings: p.voiceWarnings,
    comments: p.comments,
    revisions: p.revisions,
    gates: p.gates,
    film: p.film,
    published_at: p.publishedAt ?? null,
    archived_at: p.archivedAt ?? null,
  }
}

export async function dbGetProductions(): Promise<Production[]> {
  const { data, error } = await db()
    .from("tts_productions")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as ProductionRow[]).map(rowToProduction)
}

export async function dbGetProduction(id: string): Promise<Production | null> {
  const { data, error } = await db()
    .from("tts_productions")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToProduction(data as ProductionRow) : null
}

export async function dbUpsertProduction(p: Production): Promise<void> {
  const { error } = await db()
    .from("tts_productions")
    .upsert(productionToRow(p))
  if (error) throw error
}

export async function dbDeleteProduction(id: string): Promise<void> {
  const { error } = await db()
    .from("tts_productions")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Correction Events
// ---------------------------------------------------------------------------

function rowToCorrection(r: CorrectionRow): CorrectionEvent {
  return {
    id: r.id,
    productionId: r.production_id,
    surface: r.surface as LearningSurface,
    target: r.target,
    before: r.before ?? undefined,
    after: r.after ?? undefined,
    labels: r.labels ?? [],
    category: r.category as CorrectionCategory,
    scope: r.scope as LearningScope,
    keepUnchanged: r.keep_unchanged ?? [],
    taiNote: r.tai_note ?? undefined,
    studioInterpretation: r.studio_interpretation,
    interpretationStatus: r.interpretation_status as CorrectionEvent["interpretationStatus"],
    principleId: r.principle_id ?? undefined,
    at: r.at,
  }
}

function correctionToRow(c: CorrectionEvent): Omit<CorrectionRow, "at"> {
  return {
    id: c.id,
    production_id: c.productionId,
    surface: c.surface,
    target: c.target,
    before: c.before ?? null,
    after: c.after ?? null,
    labels: c.labels,
    category: c.category,
    scope: c.scope,
    keep_unchanged: c.keepUnchanged,
    tai_note: c.taiNote ?? null,
    studio_interpretation: c.studioInterpretation,
    interpretation_status: c.interpretationStatus,
    principle_id: c.principleId ?? null,
  }
}

export async function dbGetCorrections(): Promise<CorrectionEvent[]> {
  const { data, error } = await db()
    .from("tts_correction_events")
    .select("*")
    .order("at", { ascending: false })
  if (error) throw error
  return (data as CorrectionRow[]).map(rowToCorrection)
}

export async function dbUpsertCorrection(c: CorrectionEvent): Promise<void> {
  const { error } = await db()
    .from("tts_correction_events")
    .upsert({ ...correctionToRow(c), at: c.at })
  if (error) throw error
}

export async function dbDeleteCorrection(id: string): Promise<void> {
  const { error } = await db()
    .from("tts_correction_events")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Studio Principles
// ---------------------------------------------------------------------------

function rowToPrinciple(r: PrincipleRow): StudioPrinciple {
  return {
    id: r.id,
    title: r.title,
    layer: r.layer as IntelligenceLayer,
    belief: r.belief,
    evidenceEventIds: r.evidence_event_ids ?? [],
    scope: r.scope as LearningScope,
    confidence: r.confidence as LearningConfidence,
    formats: r.formats ?? [],
    exceptions: r.exceptions ?? [],
    lastReinforcedAt: r.last_reinforced_at,
    behavior: r.behavior as LearningBehavior,
    source: r.source as StudioPrinciple["source"],
  }
}

function principleToRow(p: StudioPrinciple): Omit<PrincipleRow, "last_reinforced_at"> {
  return {
    id: p.id,
    title: p.title,
    layer: p.layer,
    belief: p.belief,
    evidence_event_ids: p.evidenceEventIds,
    scope: p.scope,
    confidence: p.confidence,
    formats: p.formats,
    exceptions: p.exceptions,
    behavior: p.behavior,
    source: p.source,
  }
}

export async function dbGetPrinciples(): Promise<StudioPrinciple[]> {
  const { data, error } = await db()
    .from("tts_studio_principles")
    .select("*")
    .order("last_reinforced_at", { ascending: false })
  if (error) throw error
  return (data as PrincipleRow[]).map(rowToPrinciple)
}

export async function dbUpsertPrinciple(p: StudioPrinciple): Promise<void> {
  const { error } = await db()
    .from("tts_studio_principles")
    .upsert({ ...principleToRow(p), last_reinforced_at: p.lastReinforcedAt })
  if (error) throw error
}

export async function dbDeletePrinciple(id: string): Promise<void> {
  const { error } = await db()
    .from("tts_studio_principles")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Full sync: pull from Supabase, write to localStorage
// ---------------------------------------------------------------------------

const PROD_KEY = "tts_productions"
const CORRECTIONS_KEY = "tts_correction_events"
const PRINCIPLES_KEY = "tts_studio_principles"
const SYNC_FLAG = "tts_supabase_synced"

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeArray<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(items))
}

export async function ensureMigrated(): Promise<void> {
  if (typeof window === "undefined") return
  if (localStorage.getItem(SYNC_FLAG)) return

  try {
    const localProds       = readArray<Production>(PROD_KEY)
    const localCorrections = readArray<CorrectionEvent>(CORRECTIONS_KEY)
    const localPrinciples  = readArray<StudioPrinciple>(PRINCIPLES_KEY)
    const localFeedback    = readArray<AudienceFeedback>("tts_au…back")
    const localCanon       = readArray<WorldCanonItem & { isSeed?: boolean }>("***")
    const localConflicts   = readArray<PrincipleConflict>("tts_pr…icts")

    await Promise.all([
      ...localProds.map((p)       => dbUpsertProduction(p).catch(() => {})),
      ...localCorrections.map((c) => dbUpsertCorrection(c).catch(() => {})),
      ...localPrinciples.map((p)  => dbUpsertPrinciple(p).catch(() => {})),
      ...localFeedback.map((f)    => dbUpsertFeedback(f).catch(() => {})),
      ...localCanon.map((c)       => dbUpsertWorldCanonItem(c, c.isSeed ?? false).catch(() => {})),
      ...localConflicts.map((c)   => dbUpsertConflict(c).catch(() => {})),
    ])

    localStorage.setItem(SYNC_FLAG, Date.now().toString())
  } catch {
    // Network failure — try again next session
  }
}

const FEEDBACK_KEY        = "tts_au…back"
const WORLD_CANON_KEY     = "***"
const CONFLICTS_KEY       = "tts_pr…icts"

export async function syncFromServer(): Promise<void> {
  if (typeof window === "undefined") return

  try {
    await ensureMigrated()

    const [
      serverProds, serverCorrections, serverPrinciples,
      serverFeedback, serverCanon, serverConflicts,
    ] = await Promise.all([
      dbGetProductions().catch(() => [] as Production[]),
      dbGetCorrections().catch(() => [] as CorrectionEvent[]),
      dbGetPrinciples().catch(() => [] as StudioPrinciple[]),
      dbGetFeedback().catch(() => [] as AudienceFeedback[]),
      dbGetWorldCanon().catch(() => [] as (WorldCanonItem & { isSeed: boolean })[]),
      dbGetConflicts().catch(() => [] as PrincipleConflict[]),
    ])

    writeArray(PROD_KEY, serverProds)
    writeArray(CORRECTIONS_KEY, serverCorrections)
    writeArray(PRINCIPLES_KEY, serverPrinciples.filter((p) => p.source !== "seed"))
    writeArray(FEEDBACK_KEY, serverFeedback)
    // World canon: server is source of truth; seed items stay marked
    writeArray(WORLD_CANON_KEY, serverCanon)
    writeArray(CONFLICTS_KEY, serverConflicts)

    localStorage.setItem(SYNC_FLAG, Date.now().toString())

    window.dispatchEvent(new Event("tts-productions-changed"))
    window.dispatchEvent(new Event("tts-studio-memory-changed"))
  } catch {
    // Offline or unreachable — localStorage continues working
  }
}

// ---------------------------------------------------------------------------
// Audience Feedback
// ---------------------------------------------------------------------------

interface FeedbackRow {
  id: string
  production_id: string
  at: string
  kind: string
  verbatim: string | null
  channel: string
  tai_note: string | null
  studio_interpretation: string | null
  principle_impact: string | null
  processed: boolean
}

function rowToFeedback(r: FeedbackRow): AudienceFeedback {
  return {
    id: r.id,
    productionId: r.production_id,
    at: r.at,
    kind: r.kind as AudienceFeedback["kind"],
    verbatim: r.verbatim ?? undefined,
    channel: r.channel,
    taiNote: r.tai_note ?? undefined,
    studioInterpretation: r.studio_interpretation ?? undefined,
    principleImpact: r.principle_impact ?? undefined,
    processed: r.processed,
  }
}

export async function dbGetFeedback(): Promise<AudienceFeedback[]> {
  const { data, error } = await db()
    .from("tts_audience_feedback")
    .select("*")
    .order("at", { ascending: false })
  if (error) throw error
  return (data as FeedbackRow[]).map(rowToFeedback)
}

export async function dbUpsertFeedback(f: AudienceFeedback): Promise<void> {
  const { error } = await db().from("tts_audience_feedback").upsert({
    id: f.id,
    production_id: f.productionId,
    at: f.at,
    kind: f.kind,
    verbatim: f.verbatim ?? null,
    channel: f.channel,
    tai_note: f.taiNote ?? null,
    studio_interpretation: f.studioInterpretation ?? null,
    principle_impact: f.principleImpact ?? null,
    processed: f.processed,
  })
  if (error) throw error
}

export async function dbDeleteFeedback(id: string): Promise<void> {
  const { error } = await db().from("tts_audience_feedback").delete().eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// World Canon
// ---------------------------------------------------------------------------

interface CanonRow {
  id: string
  kind: string
  name: string
  status: string
  meaning: string
  never_means: string
  is_seed: boolean
}

function rowToCanon(r: CanonRow): WorldCanonItem & { isSeed: boolean } {
  return {
    id: r.id,
    kind: r.kind as WorldCanonItem["kind"],
    name: r.name,
    status: r.status as WorldCanonItem["status"],
    meaning: r.meaning,
    neverMeans: r.never_means,
    isSeed: r.is_seed,
  }
}

export async function dbGetWorldCanon(): Promise<(WorldCanonItem & { isSeed: boolean })[]> {
  const { data, error } = await db().from("tts_world_canon").select("*")
  if (error) throw error
  return (data as CanonRow[]).map(rowToCanon)
}

export async function dbUpsertWorldCanonItem(item: WorldCanonItem, isSeed = false): Promise<void> {
  const { error } = await db().from("tts_world_canon").upsert({
    id: item.id,
    kind: item.kind,
    name: item.name,
    status: item.status,
    meaning: item.meaning,
    never_means: item.neverMeans,
    is_seed: isSeed,
  })
  if (error) throw error
}

export async function dbDeleteWorldCanonItem(id: string): Promise<void> {
  const { error } = await db().from("tts_world_canon").delete().eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Principle Conflicts
// ---------------------------------------------------------------------------

interface ConflictRow {
  id: string
  detected_at: string
  principle_a: string
  principle_b: string
  description: string
  severity: string
  resolution: string
  tai_note: string | null
}

function rowToConflict(r: ConflictRow): PrincipleConflict {
  return {
    id: r.id,
    detectedAt: r.detected_at,
    principleA: r.principle_a,
    principleB: r.principle_b,
    description: r.description,
    severity: r.severity as PrincipleConflict["severity"],
    resolution: r.resolution as PrincipleConflict["resolution"],
    taiNote: r.tai_note ?? undefined,
  }
}

export async function dbGetConflicts(): Promise<PrincipleConflict[]> {
  const { data, error } = await db()
    .from("tts_principle_conflicts")
    .select("*")
    .order("detected_at", { ascending: false })
  if (error) throw error
  return (data as ConflictRow[]).map(rowToConflict)
}

export async function dbUpsertConflict(c: PrincipleConflict): Promise<void> {
  const { error } = await db().from("tts_principle_conflicts").upsert({
    id: c.id,
    detected_at: c.detectedAt,
    principle_a: c.principleA,
    principle_b: c.principleB,
    description: c.description,
    severity: c.severity,
    resolution: c.resolution,
    tai_note: c.taiNote ?? null,
  })
  if (error) throw error
}
