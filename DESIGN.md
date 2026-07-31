# Trust Tai Studio V1 Design Direction

## Aesthetic Commit

Quiet production studio. Editorial, restrained, high-trust. It should feel closer to a strategy war room and film pre-production desk than a social media dashboard.

Avoid:
- Marketing hero pages.
- Purple-blue gradient domination.
- Decorative orbs.
- Oversized cards nested inside cards.
- Generic SaaS "AI writer" visuals.

Use:
- Dense but calm work surfaces.
- Clear status lanes.
- Small labels and strong hierarchy.
- Production language: spine, truth, argument, concept, treatment, keyframes, package.
- Warm signal colors only where they carry state.

## Layout Wireframes

### Command Center

```text
+----------------------+------------------------------------------------------+
| Studio nav           | Command Center                                      |
|                      | Pipeline health + primary capture button            |
| - Command Center     +------------------+------------------+---------------+
| - Thinking Room      | Truth gate       | Post gate        | Concept gate  |
| - Approval Desk      +------------------+------------------+---------------+
| - Film Studio        | Keyframe gate    | Final gate       | Weekly cadence|
| - Library            +--------------------------------------+---------------+
| - Settings           | Active productions                 | Decisions due |
|                      | list with stage, thesis, shift     | compact queue |
+----------------------+--------------------------------------+---------------+
```

### Thinking Room

```text
+----------------------+------------------------------------------------------+
| Studio nav           | Source capture                                      |
|                      | textarea + source type + create spine               |
|                      +-----------------------------+------------------------+
|                      | Extracted content spine     | Audience shift         |
|                      | what happened              | beginning / end        |
|                      | what Tai noticed           |                        |
|                      | hidden truth               |                        |
|                      +-----------------------------+------------------------+
|                      | Draft argument preview                              |
+----------------------+------------------------------------------------------+
```

### Approval Desk

```text
+----------------------+------------------------------------------------------+
| Studio nav           | Original thought | Current argument | Why it works   |
|                      +------------------------------------------------------+
|                      | Five approval gates as stable horizontal controls    |
|                      +------------------------------------------------------+
|                      | Voice warnings | Tai notes | Revision history        |
+----------------------+------------------------------------------------------+
```

### Film Studio

```text
+----------------------+------------------------------------------------------+
| Studio nav           | Approved post summary                               |
|                      +----------------+----------------+------------------+
|                      | Grounded strange| Visual parable | Mechanism       |
|                      +----------------+----------------+------------------+
|                      | Selected treatment + shot list + keyframe plan       |
|                      | model route + producibility + cost estimate          |
+----------------------+------------------------------------------------------+
```

## Theme

Colors:
- Background: oklch(0.985 0.005 250)
- Panel: oklch(1 0 0)
- Ink: oklch(0.18 0.025 260)
- Muted: oklch(0.52 0.03 260)
- Border: oklch(0.9 0.018 255)
- Primary: oklch(0.43 0.085 235) deep trust blue
- Truth: oklch(0.56 0.11 165)
- Post: oklch(0.57 0.1 80)
- Concept: oklch(0.52 0.12 25)
- Keyframe: oklch(0.48 0.1 300)
- Final: oklch(0.42 0.09 145)

Typography:
- Use the existing Geist/Inter-like sans.
- Editorial body copy should be line-height relaxed but compact.
- Do not scale text with viewport width.

Cards:
- 8px radius max for work panels.
- Cards only for repeated items and framed tools.
- No card-inside-card shells.

Interactions:
- Gate toggles should be explicit and reversible.
- Concept cards should show "why it earns attention" before cost.
- Copy buttons use icons.
- State changes should not resize layouts.

## V1 Screens To Build

- `/dashboard`: Command Center.
- `/thinking-room`: Thought capture and content spine.
- `/approvals`: Approval Desk.
- `/film-studio`: Visual concept, treatment, shot list, keyframes.
- `/library`: Approved content library adapted to Studio language.

