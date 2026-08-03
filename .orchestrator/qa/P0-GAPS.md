# P0 Gaps — Production Readiness

**Last Updated:** 2026-08-03 01:00 CDT
**Total P0 blockers:** 198

A production CANNOT advance when any P0 question is No, Unknown, or Not checked.

---

## Priority Fix Order (by blast radius)

### Batch 1 — Data Model Foundations
These unlock the most downstream questions. Build these first.

1. **Post versioning + dependency cascade** (S1, ~8 P0)
   - Add `version`, `versionHistory[]`, `approvedVersion` to Post type
   - Build cascade-invalidation when post changes
   - Files: `src/data/posts.ts`, `src/lib/store.ts`, new `src/lib/versioning.ts`

2. **Production definition gaps** (S2, ~4 P0)
   - Add `targetDuration`, `aspectRatios`, `platform`, `decisionOwner` to Production
   - Files: `src/data/studio.ts`

3. **Place/Environment data model** (S7, ~11 P0)
   - Create `Place` entity: id, masterRef, architecture, lighting, spatial layout
   - Create `src/data/places.ts` with same pattern as characters
   - Build `/places` page

4. **Props data model** (S8, ~6 P0)
   - Create `Prop` entity: id, visualRef, size, material, continuity tracking
   - Add to `src/data/`

5. **Character identity enforcement** (S5, ~10 P0)
   - Add master reference image field, identity lock fields (ethnicity, skinTone, facialStructure, hair, build, identifyingFeatures, approvedWardrobe, posture, forbiddenChanges)
   - Add variation system
   - Files: `src/data/characters.ts`, production injection at render time

6. **World Bible binding to productions** (S4, ~8 P0)
   - Add `worldBibleVersion`, `activeRules[]`, `excludedRules[]`, `productionExceptions[]` to Production
   - Build rule-exclusion system
   - Build impact graph when rules change

### Batch 2 — Generation Pipeline
7. **Keyframe generation fields** (S10, ~11 P0)
   - Add camera/shot/lens/composition/lighting/atmosphere/negativeConstraints to Shot
   - Add seed/model/cost/version linkage per frame
   - Build capability-checking before generation

8. **Script model** (S9, ~7 P0)
   - Create `Script` entity with scenes, each linked to purpose + post ref
   - Add duration sum validation
   - Add character/place/prop resolution

### Batch 3 — QA & Verification
9. **Frame QA system** (S11, ~14 P0)
   - Build malformation detector (hands, faces, objects, text, architecture)
   - Build duplicate/near-identical frame detector
   - Build storyboard-as-sequence review

10. **Character continuity checker** (S6, ~16 P0)
    - Build frame-to-frame identity verification
    - Build master-reference comparison tool

11. **Scene QA + Cross-scene continuity** (S13+S14, ~24 P0)
    - Build clip-level stability checker
    - Build cross-scene position/direction/wardrobe tracker

### Batch 4 — Production Operations
12. **Versioning + audit trail** (S18, ~11 P0)
    - Version history for all entities
    - Approval timestamps + person
    - Rollback system
    - Side-by-side comparison

13. **Edit + Package assembly** (S15+S17, ~28 P0)
    - Timeline/scene-order system
    - Package builder with completeness verification
    - Technical QA checklist

14. **Cost tracking** (S22, ~7 P0)
    - Budget model on Production
    - Per-render cost logging
    - Pre-action cost estimates
    - Stalled-task detection

15. **Model routing reliability** (S20, ~10 P0)
    - Capability verification before generation
    - Fallback model system
    - Failed-job detection + safe retry

16. **Operational resilience** (S21, ~12 P0)
    - Background job processing
    - Browser-refresh recovery
    - Concurrent-edit detection

---

## Status Tracking

Each batch should be a task file in `memory/tasks/active/`. Update P0-GAPS.md after each batch completes. The cron job re-audits every 12 hours and will reflect progress.

## Progress Log

- **2026-08-03 01:03** — Batch 1 STARTED. Sub-agent `batch1-data-models` spawned on GPT-5.4 — hit quota. Captain built directly.
- **2026-08-03 01:08** — Cron updated from audit-only to fix cycle. Runs every 12h, picks up next unfinished batch, writes code. Sub-agents now use GLM (z-ai/glm-5.2).
- **2026-08-03 01:08** — Batch 1 data models COMPLETE. Built: posts.ts (VersionedPost + PostVersion), lib/versioning.ts (createVersion/bumpVersion/restoreVersion/compareVersions/cascadeInvalidate/lockPost), studio.ts (+targetDurationSec/aspectRatios/platform/desiredEmotion/finalFeeling/generationBudget/decisionOwner/linkedPostId/linkedPostVersion/centralArgument/protectedClaims/worldBibleVersion/activeWorldRules/excludedWorldRules/productionExceptions/worldMemoryInfluences/WorldRuleException), places.ts (4 canon places), props.ts (5 canon props), characters.ts (+ethnicity/ageRange/skinTone/facialStructure/hairDetail/buildDetail/identifyingFeatures/approvedWardrobe/postureDetail/movementTendencies/forbiddenAppearanceChanges/masterReferenceUrl/variations/CharacterVariation). TypeScript + ESLint: zero errors.
- **2026-08-03 01:08** — GLM sub-agent `batch1-places-props-pages` spawned to build /places, /places/[id], /props pages + Sidebar entries. Waiting for completion.
