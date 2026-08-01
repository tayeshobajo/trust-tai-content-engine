-- Trust Tai Studio: server-side persistence layer
-- Run this in the Supabase SQL editor for project kjznbpsvffiysavovgfo
-- (Settings → SQL Editor → New query → paste → Run)
-- Then go to Settings → API → click "Reload schema cache"

CREATE TABLE IF NOT EXISTS tts_productions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'Typed thought',
  source_thought TEXT NOT NULL DEFAULT '',
  spine JSONB NOT NULL DEFAULT '{}'::jsonb,
  shift JSONB NOT NULL DEFAULT '{"beginning":"","end":""}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  voice_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  revisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  gates JSONB NOT NULL DEFAULT '{}'::jsonb,
  film JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tts_correction_events (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL DEFAULT '',
  surface TEXT NOT NULL DEFAULT 'approval_desk',
  target TEXT NOT NULL DEFAULT '',
  before TEXT,
  after TEXT,
  labels JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'truth',
  scope TEXT NOT NULL DEFAULT 'this_production',
  keep_unchanged JSONB NOT NULL DEFAULT '[]'::jsonb,
  tai_note TEXT,
  studio_interpretation TEXT NOT NULL DEFAULT '',
  interpretation_status TEXT NOT NULL DEFAULT 'pending',
  principle_id TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tts_studio_principles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  layer TEXT NOT NULL DEFAULT 'world',
  belief TEXT NOT NULL DEFAULT '',
  evidence_event_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  scope TEXT NOT NULL DEFAULT 'all_trust_tai',
  confidence TEXT NOT NULL DEFAULT 'low',
  formats JSONB NOT NULL DEFAULT '[]'::jsonb,
  exceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_reinforced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  behavior TEXT NOT NULL DEFAULT 'consider',
  source TEXT NOT NULL DEFAULT 'tai_confirmed'
);

ALTER TABLE tts_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_correction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_studio_principles ENABLE ROW LEVEL SECURITY;

CREATE POLICY tts_productions_all ON tts_productions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY tts_corrections_all ON tts_correction_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY tts_principles_all ON tts_studio_principles FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tts_productions_created ON tts_productions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_productions_updated ON tts_productions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_corrections_production ON tts_correction_events (production_id);
CREATE INDEX IF NOT EXISTS idx_tts_corrections_at ON tts_correction_events (at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_principles_reinforced ON tts_studio_principles (last_reinforced_at DESC);

GRANT ALL ON tts_productions TO anon, authenticated;
GRANT ALL ON tts_correction_events TO anon, authenticated;
GRANT ALL ON tts_studio_principles TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
