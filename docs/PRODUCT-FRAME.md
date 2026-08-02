# Trust Tai Studio — Complete Product Frame

**Source:** Tai direct specification
**Captured:** 2026-08-02 18:12 CDT
**Status:** CANONICAL — governs all Studio build decisions

---

## 1. The Product Spine

Trust Tai Studio turns a LinkedIn post into a cinematic video package, remembers the world the work belongs to, and recommends what should be created next.

**Operating flow:**
Thought/post → Approved post → Film concept → Script → Frames → Generated scenes → Final film → Publishing package → Audience signals → Studio memory → Next recommendation

**Three core objects:**
- **Production** — One LinkedIn post and everything created from it
- **Package** — The final approved post, film, formats, captions, and publishing assets
- **World Bible** — Long-term memory: voice, characters, places, symbols, visual rules, creative lessons, recurring narrative threads

## 2. Primary Navigation

**Main:** Studio | Productions | Ideas | World | Signals

**Secondary (bottom):** Search | Notifications | Production settings | Models and tools | Studio memory settings | User profile

Approval Desk, Thinking Room, Film Studio are stages inside a production — NOT separate destinations.

## 3. Global Interface

**Top bar:** page title/breadcrumb (left) | search, notifications, Studio activity indicator, primary action (right)

Primary action changes by page:
- Studio: "Bring a post"
- Productions: "New production"
- Ideas: "Capture idea"
- World: "Add to World"
- Signals: "Log signal"

**Studio Activity Drawer:** active jobs, completed jobs, failed generations, estimated cost, models being used, queued actions, recent memory updates. Actions: pause, cancel, retry, change model, view result, open production.

## 4. Pages

### Page 1: Studio Home
- Greeting + status summary
- "Now Showing" — latest finished film hero
- "In Production" — large cards with stage, progress, next decision
- "Needs Your Decision" — focused, contextual decisions only
- "The Studio Sees Something" — memory-driven recommendations
- "Recent Packages" — visual shelf of completed work

### Page 2: Bring a Post
- Source input (paste, write, voice note, import, recommendation, World thread)
- Production intention: "What should this change in the reader?"
- Film intention: "What should the film add?"
- Memory check: Studio surfaces relevant memories before starting
- Production plan confirmation before creation

### Page 3: Productions Index
- Views: Active, Needs decision, Ready, Published, Held, Archived, All
- Gallery + Table display modes
- Filters: stage, publication status, story thread, character, world, format, date, model, response, cost
- Bulk actions: archive, assign, hold, export, apply rule, compare

### Page 4: Production Workspace
**Tabs:** Post | Concept | Script | Frames | Scenes | Edit | Package | Memory

**4A. Post Tab:**
- Post editor (original, Studio revision, approved, history)
- Post intelligence: central argument, reader before/after, emotional movement, claims to protect, voice alignment
- Approval locks the post as source of truth
- Post-approval changes trigger impact warnings

**4B. Concept Tab:**
- Three concept directions with premise, metaphor, tone, opening/closing images, complexity, cost, World memories used
- Concept detail drawer: narrative structure, visual references, character reuse, world compatibility, originality check
- Approval creates Script draft

**4C. Script Tab:**
- Full script / narration / scene-by-scene / timing / post-to-script map views
- Each scene: number, title, duration, visual action, narration, sound, purpose, post connection
- Right panel: total duration, word count, pacing, emotional arc, continuity, World conflicts, complexity
- Scene-level approval before full script approval
- Changes to approved scenes show downstream impact

**4D. Frames Tab:**
- Visual treatment (palette, lighting, camera, realism, texture, aspect ratios, references, prohibitions)
- Character casting (approved face, body, wardrobe, posture, age, range, continuity lock)
- Keyframe board (master + alternates per scene, continuity status, camera/lens/lighting/composition/model/prompt)
- Continuity panel (face, clothing, geography, objects, lighting, time, architecture, color, scale)
- Promote approved changes to World Bible

**4E. Scenes Tab:**
- Scene timeline (approved frame, generation status, selected take, duration, continuity)
- Per-scene: approved script, master frame, motion direction, generated takes with quality/continuity scores
- Take actions: select, compare, regenerate, extend, trim, repair face, stabilize, alter speed, preserve frames
- Scene states: not started → generating → review → approved → revision → blocked

**4F. Edit Tab:**
- Video preview + timeline (video, narration, music, SFX, captions, overlays tracks)
- Scene bin, edit controls, format variants (vertical, landscape, square, trailer, captioned, clean, audio-described)
- Review modes: normal, fullscreen, mobile, LinkedIn feed, muted autoplay, captions-only
- Master cut + per-format approval

**4G. Package Tab:**
- Film player + approved post side-by-side
- Contents: post, first comment, final video, vertical/landscape/square cuts, captioned version, thumbnail, accessibility text, script PDF, production archive
- Publication record (URL, date, platform, published by)
- No publish button unless LinkedIn integration exists — mark as published manually

**4H. Memory Tab:**
- Memory used (grouped: brand rules, voice, characters, places, symbols, visual rules, corrections, related posts, signals)
- Memory learned (potential new learnings from this production)
- Governance: nothing permanent without Tai's approval

### Page 5: Ideas
- Views: Recommended | Captured | Developing | Held | Used | Archived
- Recommendation cards: working title, argument, why now, related thread, memories used, possible film, overlap risk
- Captured ideas from any source (thought, voice, comment, conversation, thread)
- Idea detail: raw thought, emerging argument, contradictions, related memories, possible concepts, development notes

### Page 6: World
**Sections:** Constitution | Voice | Characters | Places | Symbols | Visual Language | Story Threads | Memory

**6A. Constitution:** Non-negotiable principles (Spirit First, value, clarity, metaphor, dignity, no spectacle)
**6B. Voice:** Approved traits, sentence patterns, Tai's language, phrases to avoid, emotional range, learned tendencies
**6C. Characters:** Roster with master appearance, alternates, wardrobe, production history, continuity confidence. Production-only variations don't overwrite master.
**6D. Places:** Environments with visual identity, architecture, geography, lighting, weather, time-of-day states
**6E. Symbols:** Meaning, previous uses, approved interpretations, overuse risk, prohibited clichés
**6F. Visual Language:** Palette, lighting, lenses, composition, movement, pace, realism, texture, grain, transitions, typography, prohibitions
**6G. Story Threads:** Recurring ideas as ongoing narratives. Published posts, active productions, unresolved questions, next chapters, recurring characters/symbols
**6H. Memory:** Locked truths, learned preferences, temporary context, production lessons, audience patterns. Confidence, approval, usage, conflicts.

### Page 7: Signals
- Overview: published packages, performance change, audience questions, themes, saves/comments, completion data
- Sources: manual LinkedIn results, imported analytics, comments, DMs, client conversations, observations, team notes
- Per-package performance: post + video metrics, comments, sentiment, questions, reach, business outcomes, Tai's reflection
- Pattern analysis: recurring questions, depth-producing themes, resonant metaphors, attention-grabbing openings, high-completion films, conversation-creating ideas, gaps
- Every recommendation explains its evidence

### Page 8: Search
- Searches: posts, scripts, scenes, frames, clips, packages, ideas, characters, symbols, places, threads, signals, memories
- Semantic queries: "Show every film where the founder character appears" / "Find posts about being needed"

### Page 9: Notifications & Decisions
- Types: approval requested, render complete, generation failed, continuity conflict, memory conflict, package ready, performance available, recommendation created, collaborator comment
- Priority: requires decision > production update > insight > informational

### Page 10: Production Settings
- Model routing (preferred image/video models, fallback order, task routing, quality thresholds)
- Cost controls (budget, limits, approval gates, alerts)
- Format defaults (ratios, durations, captions, export quality, naming)
- Automation (auto concept generation, auto continuity check, auto frame variations, auto-render after approval, memory suggestions)
- Memory governance (auto-learn rules, approval thresholds, retention, sensitive exclusions)

## 5. Key Experience Rules

1. **The post remains the source of truth** — film must never drift into a different argument
2. **The film creates an experience** — not merely illustrate or repeat the post
3. **Every generated asset has lineage** — traceable to post line, World memories, model, corrections
4. **Memory is governed** — Studio suggests, Tai decides what becomes permanent
5. **Homepage shows outcomes** — production machinery appears only inside a production
6. **Decisions are contextual** — no generic approval queue; go directly to the asset
7. **Recommendations explain themselves** — every suggestion shows why now

## 6. Recommended Design Order

1. Studio Home
2. Bring a Post
3. Production Workspace: Post
4. Production Workspace: Concept
5. Production Workspace: Script
6. Production Workspace: Frames
7. Production Workspace: Scenes
8. Production Workspace: Edit
9. Production Workspace: Package
10. Ideas
11. World Overview
12. Character Detail
13. Story Thread Detail
14. Signals
15. Production Memory

This order follows the user journey and locks core before supporting intelligence.
