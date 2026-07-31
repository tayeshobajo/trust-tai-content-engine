# Trust Tai Studio V1 Brief

**Production URL:** studio.trusttai.com  
**Project:** Trust Tai Content Production Studio  
**Approved direction source:** Tai's content engine architecture spec, 2026-07-30

## Business Goal

Turn one clear Trust Tai thought into an approved written argument and an approved unconventional visual story direction.

## Target User

Tai, operating as founder, strategist, editor, and final approver for Trust Tai authority content.

## Product Promise

Turn one clear thought into an approved Trust Tai post and an unconventional visual story built around the same truth.

## Operating Philosophy

- The post carries the argument.
- The film creates the experience.
- Weird is not enough. The visual must deepen the business truth.
- Nothing advances automatically past an approval gate.

## V1 Scope

V1 must focus on the creative brain, not automated video rendering.

In scope:
- Command Center for the five-gate studio pipeline.
- Thinking Room for thought capture and meaning extraction.
- Trust Tai post drafting workspace with voice critique.
- Approval Desk with five approval gates:
  - Truth approved
  - Post approved
  - Concept approved
  - Keyframes approved
  - Final film approved
- Three visual concept directions:
  - Grounded strange
  - Visual parable
  - Cinematic mechanism
- Film treatment and shot list workspace.
- Keyframe planning surface with first frame and last frame intent.
- Approved content library and ready-to-publish package preview.
- Copy-paste review only. No auto-publish.
- Data persistence using the existing local/Supabase patterns already in the repo.

Out of scope for V1:
- Automated LinkedIn publishing.
- Automated Veo/Runway/Luma video rendering.
- Full account/team permissions.
- Deep analytics dashboards.
- Multi-brand support.

## Content Spine

Every thought must be transformed into:
- What happened.
- What Tai noticed.
- What others may be missing.
- The deeper business truth.
- The Roadmap Thinking connection.
- The practical value for a founder.
- The one sentence the audience should remember.

## Trust Tai Voice Rules

- Smart, direct, everyday language.
- Consultancy first, agency second.
- Story-led and clarity-focused.
- Diagnose -> Design -> Deliver.
- Spirit First.
- Quiet confidence.
- No generic AI language.
- No empty consulting phrases.
- No pressure-based CTA.
- No em dashes.
- No pretending Tai believes something he has never approved.

## North-Star Quality Rule

Before Studio creates anything, it should answer:

What does the audience see at the beginning, and what do they understand differently by the end?

If that shift is weak, the post is not ready. If the visual does not deepen that shift, the film should not be produced.

## Acceptance Criteria

- The app first screen is a production studio command center, not a generic social scheduler.
- The nav reflects Studio product areas: Command Center, Thinking Room, Approval Desk, Film Studio, Library, Settings.
- Tai can capture a thought and see a generated content spine using deterministic V1 logic without requiring video APIs.
- Tai can review a draft argument in Trust Tai voice with section rationale and voice warnings.
- Tai can see three visual concept directions with meaning, reveal, producibility, shot count, and cost estimate.
- Tai can approve or hold each of the five gates from the UI.
- Approved package preview includes LinkedIn post, visual treatment, shot list, keyframe plan, caption, first comment, and accessibility text.
- UI works cleanly at mobile and desktop widths.
- `npm run lint` passes.
- `npm run build` passes.

## Stack

Use the existing Next.js 16 app, React 19, Tailwind 4, shadcn/Radix components, lucide-react, existing Supabase/store patterns.

