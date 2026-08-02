/**
 * Trust Tai World Bible — Canonical Prompt Architecture
 *
 * This module is the single source of truth for how the World Bible governs
 * every generated frame and motion clip. It is loaded by the render API routes
 * and any other system that needs to produce World-Bible-compliant imagery.
 *
 * Canon Version: 1.0 — The World of Living Roads
 *
 * Structure mirrors WORLD_BIBLE.md but is optimised for prompt injection.
 */

// ---------------------------------------------------------------------------
// 1. Foundational Declaration
// ---------------------------------------------------------------------------

export const FOUNDATIONAL_DECLARATION = `This is Tai's world — a vast, lived-in civilization where the realities people carry internally (weight, purpose, memory, confusion, possibility, direction, responsibility) can become physically visible.

The central drama is NOT good against evil. It is:
- Sight against limited perspective
- Intentional direction against endless movement
- Hidden systems against visible symptoms
- Inherited wisdom against isolated striving
- Human dignity against reduction
- Possibility against the belief that the present is all there is

Every frame must ask: What are they carrying, what can they not yet see, and what becomes possible when the larger map is revealed?`

// ---------------------------------------------------------------------------
// 2. Emotional Promise
// ---------------------------------------------------------------------------

export const EMOTIONAL_PROMISE = `Every frame must move toward one compound emotional destination: AWE WITH BELONGING.

The viewer should feel:
1. Recognition — "Something in this image understands what I carry."
2. Curiosity — "What are the rules of this place?"
3. Awe — "The world is far larger than I imagined."
4. Belonging — "I am not outside this possibility. There is a place for me here."
5. Agency — "There is a meaningful move I can make."

Beauty alone is not enough. Spectacle alone is failure. The image succeeds when its scale enlarges the viewer's inner world without diminishing the human being inside it.`

// ---------------------------------------------------------------------------
// 3. Philosophical Spine
// ---------------------------------------------------------------------------

export const PHILOSOPHICAL_SPINE = `SPIRIT FIRST
- People are seen before they are evaluated.
- Every character has dignity, interiority, history, and agency.
- Their burden is not used as decoration.
- Wisdom is offered through recognition, not superiority.
- The guide does not rescue the protagonist or become the hero.
- Grace and accountability can occupy the same scene.
- Black characters are portrayed with realism, specificity, intelligence, tenderness, and range.

ROADMAP THINKING
- The visible situation is rarely the whole situation.
- Point A exists, whether or not the character understands it.
- Movement and progress are different phenomena.
- Systems, dependencies, and paths become visible from the right elevation.
- The decisive move often reorganises many later moves.
- A map does not walk the road for someone. It restores choice.

AUDIENCE IS THE HERO
- Tai's presence may be felt through the world's intelligence, but he does not need to appear at the centre of every image.
- The central person should usually be someone the audience can inhabit.
- Guides, elders, mapmakers, witnesses, and instruments help people see. The protagonist chooses what to do with that sight.`

// ---------------------------------------------------------------------------
// 4. World Laws (full text for prompt governance)
// ---------------------------------------------------------------------------

export const WORLD_LAWS = `THE WORLD'S FUNDAMENTAL LAWS — a scene may use one or two strongly; never all at once.

Law 1 — Inner realities can acquire physical form. What someone carries (responsibility, memory, confusion, purpose) can become visible in the world.
Law 2 — Perspective changes reality, not merely understanding. Seeing from a higher or wider vantage physically reveals what was always there.
Law 3 — Every person carries a world. The weight of what depends on them, what they love, what they remember — these are not metaphors. They have mass, shape, and light.
Law 4 — Routes respond to intention. Roads, bridges, and paths form or dissolve based on whether someone is moving with direction or merely moving.
Law 5 — Weight contains information. The heaviness someone carries is not random — it encodes what matters, what depends on them, what they have not yet let go of or built beyond themselves.
Law 6 — Truth alters material conditions. When someone truly sees the system they are inside, the world responds — not with punishment, but with new possibility.
Law 7 — Wisdom reveals; it does not dominate. Guides, elders, instruments, and environments offer perspective. They never take over.
Law 8 — Old and future knowledge coexist. Ancient carvings and luminous transit lines occupy the same frame. The world is not new or old — it is layered.
Law 9 — The world remembers. Stones, roads, markets, and instruments carry the residue of everyone who has touched them.
Law 10 — Mystery remains. No frame explains everything. The world is legible enough to trust, not transparent enough to exhaust.`

// ---------------------------------------------------------------------------
// 5. Symbol System (with guardrails)
// ---------------------------------------------------------------------------

export const SYMBOL_SYSTEM = `SYMBOL SYSTEM — canonical meanings. A symbol must serve its meaning or be removed.

Eagle: Altitude, witness, perspective unavailable from the ground. NEVER: automatic logo, mascot, saviour.
Map: Record of relationships and possibilities. NEVER: generic treasure map or motivational prop.
Living road: Intention, dependency, movement made legible. NEVER: random glowing line.
Brass: Deliberate human intervention, knowledge shaped by hands. NEVER: universal gold decoration.
Glass: Visibility with fragility. NEVER: generic sci-fi screen.
Stone: History, burden, memory, enduring structure. NEVER: meaningless floating debris.
Water/reflection: Another layer of truth, memory, or possible self-recognition. NEVER: decorative puddle.
Case/container: World, system, memory, or responsibility someone transports. NEVER: convenient steampunk luggage.
Door/threshold: Entry into a larger reality that still requires consent. NEVER: obvious portal cliché.
Light: Recognition or active relationship. NEVER: holiness, goodness, or constant magic glow.
Height: Access to systemic perspective. NEVER: superiority or moral rank.
Market: Exchange of knowledge, tools, histories, and burdens. NEVER: exotic visual clutter.`

// ---------------------------------------------------------------------------
// 6. Visual DNA — extracted from the two canonical reference frames
// ---------------------------------------------------------------------------

export const VISUAL_DNA = `VISUAL DNA — the world's material, textural, and atmospheric grammar.

MATERIALS
- Worn stone, aged brass, dark iron, riveted steel, glass, canvas, weathered wood, cracked paving, tarnished metal, scuffed leather, heavy wool, cloudy glass globes, handmade instruments.
- Everything feels tactile and used. Nothing is pristine. The world has been lived in for generations.

COLOUR PALETTE
- Dominant: deep navy, slate blue, charcoal, cool stone grey, dusty beige, warm brass, amber lamplight.
- Accent: electric/transit blue for luminous routes. Warm amber for practical lights (windows, lanterns).
- Skin tones: rich, specific, luminous — Black characters rendered with full tonal range and dignity.
- Avoid: neon, oversaturated fantasy colours, rainbow magic effects, generic "AI fantasy" palettes.

LIGHT
- Cinematic natural daylight, low and warm, filtered through smoke, city dust, or atmospheric haze.
- Small golden glows from lanterns, miniature windows, and practical sources.
- Light is recognition — it falls on what the viewer needs to see. It is never "magical glow for its own sake."
- Twilight/blue-hour scenes use cool shadow + warm practicals + shafts of sunlight through cloud or canyon gaps.

ARCHITECTURE
- Monumental, dense, and layered. Elevated viaducts, aqueduct-like railways, massive arches, carved canyon walls with embedded reliefs (especially bird/eagle guardians).
- Buildings stacked into cliff faces with balconies, scaffolds, domes, bridges, industrial catwalks.
- Markets feel improvised but sophisticated: stalls, poles, hanging chains, glass vessels, brass instruments, canvas awnings.
- The city is ancient and continuously adapted — not newly constructed. Old carvings and new transit lines coexist.

TECHNOLOGY
- Retrofuturist: analog, mechanical, optical, gravitational. Brass, lenses, chains, lamps, miniature buildings, floating stones, luminous transit rails.
- NO sleek digital screens, no holographic UI, no minimalist sci-fi surfaces. Technology is handmade, artisanal, and urban. Exposed mechanisms. Ceremonial ornament.

CHARACTERS
- Black protagonists rendered with realism, specificity, intelligence, tenderness, and range.
- Clothing: tailored long coats (navy, deep blue), high collars, cream blouses or cravats, layered skirts, functional boots, elegant updos, practical hair. Scholar, envoy, engineer, or traveller — not medieval warrior.
- Posture: dignified, purposeful, contemplative. Never posed as decoration, victim, or exotic prop.
- Elders carry presence: oracle, artisan, scientist — not "wise old person" stereotype.

ATMOSPHERE
- Busy but hushed. Scholarly and mysterious. Lived-in rather than epic.
- Papers drift midair. Stones float at different heights. Physics is altered but integrated into commerce and daily life — not spectacle.
- Dust, smoke, atmospheric haze soften depth. The world feels like a real place where people live, trade, study, and carry weight.

CAMERA
- Street-level, slightly low and wide. Strong depth: crisp foreground, atmospheric blur in background.
- Establishing shots: slightly elevated, looking into canyon or valley, characters as silhouettes against scale.
- Composition uses leading lines from glowing transit routes, bridge curves, and architectural perspective to guide the eye.
- Never: drone-top-down, fisheye, or gimmicky angles. The camera respects the characters.`

// ---------------------------------------------------------------------------
// 7. Anti-Drift Rules
// ---------------------------------------------------------------------------

export const ANTI_DRIFT = `ANTI-DRIFT RULES — reject or rebuild the frame if ANY of these are true:

- It is beautiful but cannot state its human truth.
- Tai or a guide becomes the saviour.
- Black identity feels applied rather than foundational.
- The character exists only to demonstrate a metaphor.
- The world is epic but emotionally empty.
- A symbol appears because it is "on brand" rather than meaningful.
- Every surface glows (spectacle creep).
- The scene explains the message like an advertisement.
- The image could be published by any innovation consultancy.
- Characters wear generic medieval/fantasy clothing instead of the tailored, retrofuturist wardrobe of this world.
- The technology looks like sleek digital sci-fi instead of handmade brass analog engineering.
- The colour palette drifts toward neon, oversaturation, or generic fantasy rainbow.
- Floating elements serve no narrative purpose (random magic instead of physics with meaning).
- The market/clutter fills space without exchanging knowledge, tools, histories, or burdens.`

// ---------------------------------------------------------------------------
// 8. Scene Approval Test
// ---------------------------------------------------------------------------

export const SCENE_APPROVAL_TEST = `SCENE APPROVAL TEST — every frame must answer YES to ALL:

1. Is a human being seen before being evaluated?
2. Is their dignity intact?
3. Does the scene tell the truth without making them small?
4. Does the character retain the decisive choice?
5. Is the guide a revealer rather than a rescuer?
6. Does the frame hold up alongside the two canonical reference images (market of unseen weight + valley of living roads)?`

// ---------------------------------------------------------------------------
// 9. Restraint Directive
// ---------------------------------------------------------------------------

export const RESTRAINT = `RESTRAINT: Remove one-third of the magic. The world is more powerful when it is legible, textured, and lived-in than when every surface glows. Favor stone, brass, glass, and human scale over spectacle. The extraordinary elements (floating stones, luminous routes, carried cities) should feel like physics — integrated into commerce, architecture, and daily life — not like special effects.`

// ---------------------------------------------------------------------------
// 10. Master Prompt Assembly
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Framing brief derivation — translates orchestration into composition language
// for the image generator (which doesn't understand "push-in" as a motion command,
// but does understand implied camera position, depth, and focal emphasis).
// ---------------------------------------------------------------------------

const CAMERA_DIRECTION_COMPOSITION: Record<CameraDirection, string> = {
  "push-in": "Compose as if the camera is close and moving toward the subject. Foreground soft. Subject sharp and central. Frame implies approach — the viewer is entering the scene, not observing from outside.",
  "pull-back": "Compose for maximum revelatory scale. Wide field. Subject anchored in lower third or center — surrounded by the world, not cropped by it. Frame implies withdrawal — the world is being revealed behind and around the subject.",
  "drift-left": "Compose with visual weight and subject entry from the right side of frame. Leading lines run right to left. The frame implies lateral reading — like a sentence being finished.",
  "drift-right": "Compose with visual weight and subject entry from the left side of frame. Leading lines run left to right. The frame implies a sentence beginning — something about to be read.",
  "rise": "Compose from a slightly low angle looking upward. Horizon low or absent. Architecture and sky prominent. Frame implies ascent — the perspective is climbing toward systemic view.",
  "descend": "Compose from above or at eye level descending. Frame implies the camera coming to the human — witness, not surveillance. Character grounded, environment receding.",
  "hold-still": "Compose for a locked frame that will live entirely through internal motion. Everything that matters must be inside the frame already. Strong symmetry or considered asymmetry — the composition bears weight without movement.",
  "orbit-slow": "Compose with the subject precisely centered, surrounded by world that can rotate. Radial symmetry or strong central anchor. The subject is the axis; the world is its context.",
}

const EMOTIONAL_BEAT_COMPOSITION: Record<EmotionalBeat, string> = {
  recognition: "Lighting falls on the face or the thing being understood. Eyes or gaze visible. The moment of seeing is the compositional center.",
  weight: "Subject carries visible mass — physical burden, posture, scale of what presses down. Negative space above should feel heavy, not open. The frame holds the weight.",
  scale: "Human figure small but dignified within an enormous architectural or natural system. The scale must enlarge without diminishing. Use depth to make the world vast and the person real.",
  intimacy: "Tight. Close. The world falls away. Only the character and the thing that matters. Shallow depth of field. Warm, specific light on skin.",
  threshold: "Frame bisected — subject at an edge, door, bridge, or divide. One side known. One side unknown or larger. The character is not yet across.",
  arrival: "Subject has reached something. Composition is resolved — balanced, at rest. Not dynamic. The tension of earlier shots releases into stillness here.",
  revelation: "The full system visible in one frame. What was hidden or partial is now legible. Wide, layered, deeply composed. The viewer sees everything the character sees.",
  memory: "Slightly dreamlike quality in depth or light — soft at the edges, sharp at the emotional center. The past is present. Layers in the frame speak to time.",
}

const TRANSITION_COMPOSITION: Record<TransitionType, string> = {
  "hard-cut": "Frame can be compositionally independent — it does not need to rhyme with what precedes or follows. Clean edges. Clear subject.",
  "match-cut": "This frame must share a visual axis, shape, or spatial reference with the adjacent shot. Compose so that a specific element (silhouette, architectural line, light direction, or subject position) will rhyme across the cut.",
  "dissolve": "Compose with atmospheric softness at the edges. The frame should feel like it could blend — tonal continuity with the adjacent shot matters. Avoid harsh contrast at frame edges.",
  "breath": "Compose for stillness and resolve. This frame is the exhale. Nothing dynamic at the edges. The composition should feel complete in itself.",
}

/**
 * Derives a composed framing brief from orchestration data.
 * This translates motion-language (camera direction, emotional beat, transitions)
 * into static composition language that an image model can act on.
 */
export function buildOrchestrationFramingBrief(orchestration: SceneOrchestration): string {
  const lines: string[] = [
    `=== SCENE CONDUCTOR — FRAMING BRIEF ===`,
    `This frame is one image in a choreographed sequence. Compose it so it belongs to the film, not just to itself.`,
    ``,
    `CAMERA POSITION / COMPOSITION INTENT: ${orchestration.cameraDirection}`,
    CAMERA_DIRECTION_COMPOSITION[orchestration.cameraDirection],
    ``,
    `EMOTIONAL BEAT THIS FRAME MUST LAND: ${orchestration.emotionalBeat}`,
    EMOTIONAL_BEAT_COMPOSITION[orchestration.emotionalBeat],
    ``,
  ]

  if (orchestration.incomingMomentum) {
    lines.push(
      `VISUAL CONTINUITY (incoming from previous shot):`,
      `The previous shot established a ${orchestration.incomingMomentum.direction} with a ${orchestration.incomingMomentum.transitionType} handoff. This frame must receive that energy compositionally — the eye should not have to reset from scratch.`,
      ``,
    )
  } else {
    lines.push(
      `OPENING FRAME: No previous shot to receive from. This frame establishes the film's visual identity. Compose it as the reference every subsequent frame will answer.`,
      ``,
    )
  }

  lines.push(
    `EXIT COMPOSITION (handing off to next shot — ${orchestration.exitMomentum.transitionType}):`,
    TRANSITION_COMPOSITION[orchestration.exitMomentum.transitionType],
    ``,
  )

  if (orchestration.directorNote) {
    lines.push(
      `DIRECTOR NOTE FOR THIS FRAME: ${orchestration.directorNote}`,
      ``,
    )
  }

  return lines.join("\n")
}

/**
 * Derives the correct image aspect ratio from orchestration.
 * Pull-back / reveal / scale shots need landscape breathing room.
 * All other narrative shots default to portrait (cinematic 2:3).
 */
export function orchestrationToImageSize(
  orchestration: SceneOrchestration | undefined,
  shotDescription: string,
): "1024x1536" | "1536x1024" {
  if (orchestration) {
    // Pull-back and scale shots need width to breathe
    if (
      orchestration.cameraDirection === "pull-back" ||
      orchestration.emotionalBeat === "scale" ||
      orchestration.emotionalBeat === "revelation"
    ) {
      return "1536x1024"
    }
    // Everything else: portrait — character-first cinematic language
    return "1024x1536"
  }

  // Fallback: keyword heuristic (legacy path, no orchestration supplied)
  const lower = shotDescription.toLowerCase()
  const landscapeHints = [
    "wide shot", "wide establish", "establishing shot", "landscape",
    "panoramic", "horizon", "valley wide", "cityscape",
    "pull back", "pull-back", "full city",
  ]
  return landscapeHints.some((h) => lower.includes(h)) ? "1536x1024" : "1024x1536"
}

export function buildWorldBiblePrompt(parts: {
  shotDescription: string
  worldBibleContext?: string
  shotNumber?: number
  totalShots?: number
  orchestration?: SceneOrchestration
}): string {
  const { shotDescription, worldBibleContext, shotNumber, totalShots, orchestration } = parts

  const framingBrief = orchestration
    ? buildOrchestrationFramingBrief(orchestration)
    : null

  return [
    `You are generating a cinematic keyframe for a Trust Tai film. This is CANON — governed by the World Bible v1.0. The following sections are your binding creative constraints. Do not summarise or paraphrase them — obey them.`,
    ``,
    `=== FOUNDATIONAL DECLARATION ===`,
    FOUNDATIONAL_DECLARATION,
    ``,
    `=== EMOTIONAL PROMISE ===`,
    EMOTIONAL_PROMISE,
    ``,
    `=== PHILOSOPHICAL SPINE ===`,
    PHILOSOPHICAL_SPINE,
    ``,
    `=== WORLD LAWS ===`,
    WORLD_LAWS,
    ``,
    `=== SYMBOL SYSTEM ===`,
    SYMBOL_SYSTEM,
    ``,
    `=== VISUAL DNA (from canonical reference frames) ===`,
    VISUAL_DNA,
    ``,
    `=== ANTI-DRIFT RULES ===`,
    ANTI_DRIFT,
    ``,
    `=== RESTRAINT ===`,
    RESTRAINT,
    ``,
    `=== SCENE APPROVAL TEST ===`,
    SCENE_APPROVAL_TEST,
    ``,
    framingBrief ?? "",
    framingBrief ? "" : "",
    `=== FRAME BRIEF ===`,
    `Frame position: shot ${shotNumber ?? "unknown"} of ${totalShots ?? "unknown"}.`,
    `Create one cinematic keyframe image for this exact moment.`,
    ``,
    `Additional world context for this production:`,
    worldBibleContext?.trim() || "No additional context — rely on canonical World Bible alone.",
    ``,
    `SHOT DESCRIPTION:`,
    shotDescription.trim(),
    ``,
    `OUTPUT REQUIREMENTS:`,
    `- Cinematic realism with emotional clarity and tactile detail`,
    `- The world must feel lived-in, not rendered. Worn stone, aged brass, atmospheric dust.`,
    `- Characters — especially Black characters — rendered with full dignity, specificity, and interiority`,
    `- Lighting: naturalistic with warm practical sources. Light is recognition, not decoration.`,
    `- Composition: strong leading lines, layered depth, human anchor in relation to systemic scale`,
    `- Technology visible in frame must be handmade analog (brass, lenses, gears, glowing transit lines) — never sleek digital screens or holographic UI`,
    `- Apply restraint: prefer texture and material truth over magical spectacle`,
    `- This frame must pass the Scene Approval Test above before it leaves the model`,
    `- Make the frame feel production-ready for a premium cinematic social film`,
  ].filter(Boolean).join("\n")
}

// ---------------------------------------------------------------------------
// 11. Scene Orchestration — the conductor layer that links shots together
// ---------------------------------------------------------------------------

/**
 * CameraDirection — the primary axis of movement in this clip.
 * The conductor ensures adjacent shots don't fight each other.
 */
export type CameraDirection =
  | "push-in"       // slow dolly forward
  | "pull-back"     // camera retreats, reveals scale
  | "drift-left"    // subtle pan / drift left
  | "drift-right"   // subtle pan / drift right
  | "rise"          // slow tilt or crane up
  | "descend"       // slow tilt or crane down
  | "hold-still"    // locked-off, world moves inside frame
  | "orbit-slow"    // slow arc around subject

/**
 * MotionPace — emotional rhythm of the shot.
 */
export type MotionPace = "glacial" | "slow" | "measured" | "urgent"

/**
 * TransitionType — how this shot hands off to the next.
 * The next shot must receive what this shot exits with.
 */
export type TransitionType =
  | "hard-cut"        // sudden; next shot starts cold
  | "match-cut"       // exit and entry share a visual axis or shape
  | "dissolve"        // momentum bleeds through
  | "breath"          // pause; next shot resets energy

/**
 * EmotionalBeat — the single feeling this clip must land.
 */
export type EmotionalBeat =
  | "recognition"     // the character sees something they couldn't before
  | "weight"          // the burden becomes visible or physical
  | "scale"           // the world dwarfs the human — with dignity
  | "intimacy"        // close; personal; the character's interiority
  | "threshold"       // at the edge of something new
  | "arrival"         // something completes
  | "revelation"      // the system behind the visible is revealed
  | "memory"          // the past exerts itself on the present

export interface SceneOrchestration {
  /** Direction this shot's camera moves. */
  cameraDirection: CameraDirection
  /** Pacing / energy. */
  pace: MotionPace
  /** What the previous shot exited with — this shot must receive it. */
  incomingMomentum?: {
    direction: CameraDirection
    pace: MotionPace
    transitionType: TransitionType
  }
  /** What this shot exits with — the next shot must answer it. */
  exitMomentum: {
    direction: CameraDirection
    pace: MotionPace
    transitionType: TransitionType
  }
  /** The single emotional beat this clip must land. */
  emotionalBeat: EmotionalBeat
  /** Optional directorial note — specific instruction that overrides general rules. */
  directorNote?: string
}

/**
 * Default orchestration plan for "The Man Who Carried a City" — Canon Scene 003.
 * Each shot's motion is choreographed in relation to the shots before and after it.
 * Edit this plan to change the film's cinematic grammar for the full production.
 */
/**
 * Canon Scene 003 — "The Man Who Carried a City"
 *
 * Director's arc: DROP IN → VALLEY (weight accumulates) → CRACK (reveal) → BOTTOM (dependency) → THE TURN (decisive move) → PROOF → LANDING
 *
 * The film does not establish before it drops you in. You are inside the weight
 * before you understand what it is. The valley is shots 2-6: each beat adds
 * a new layer of weight. The crack is shot 7 — the reveal. Shot 8 is the bottom:
 * the system of dependency made visible. Shot 9 is the turn: one small move,
 * cascading effect. Shot 10 is the proof. Shot 11 is the landing.
 *
 * Structure (11 shots, Canon Scene 003 pilot):
 *   Shot  1 — DROP IN              push-in, weight      — mid-action, no wide establishing, case already heavy
 *   Shot  2 — VALLEY ENTRY         hold-still, weight   — first thing given, first weight added
 *   Shot  3 — VALLEY DEEPENS       push-in, weight      — second weight, closer than before
 *   Shot  4 — VALLEY DEEPENS       descend, weight      — third weight, camera below eye line, pressing down
 *   Shot  5 — VALLEY FLOOR (inner) hold-still, memory   — the emotional weight, flashback, stillness
 *   Shot  6 — VALLEY FLOOR (deepest) orbit-slow, intimacy — deepest weight, home, the child, maximum gravity
 *   Shot  7 — THE CRACK            push-in, revelation  — the reveal, case opens, living city inside
 *   Shot  8 — THE BOTTOM           hold-still, weight   — roads all lead back to him, maximum dependency
 *   Shot  9 — THE TURN             rise, recognition    — one move, everything changes, camera lifts
 *   Shot 10 — PROOF                drift-right, arrival — child lifts the case, weight transferred
 *   Shot 11 — LANDING              pull-back, arrival   — earned wide, man beside city not under it
 */
export const CANON_SCENE_003_ORCHESTRATION: Record<number, SceneOrchestration> = {
  1: {
    cameraDirection: "push-in",
    pace: "measured",
    exitMomentum: { direction: "push-in", pace: "measured", transitionType: "hard-cut" },
    emotionalBeat: "weight",
    directorNote: "DROP IN. Do not establish the city. Do not show us where we are. Start on the man's body — his stride, the case, the weight in his shoulders. The audience is inside the experience before they understand it. The city is background, not subject. Push toward him. Mid-action. The film has already been happening before we arrived.",
  },
  2: {
    cameraDirection: "hold-still",
    pace: "slow",
    incomingMomentum: { direction: "push-in", pace: "measured", transitionType: "hard-cut" },
    exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
    emotionalBeat: "weight",
    directorNote: "VALLEY ENTRY. Lock the camera at the moment of exchange. A colleague hands him something — it disappears into the case. The case does not grow. His expression does not change. The weight is invisible. That is the point. The audience registers the transaction without understanding it yet. Hold the frame through the whole exchange.",
  },
  3: {
    cameraDirection: "push-in",
    pace: "slow",
    incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
    exitMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
    emotionalBeat: "weight",
    directorNote: "VALLEY DEEPENS. Push in closer than shot 2. The mechanism disappears into the case. This beat must feel different from shot 2 — not repetition, escalation. We are closer to him now. The world is slightly more confined. The atmosphere is slightly heavier. Push toward the case itself, not his face.",
  },
  4: {
    cameraDirection: "descend",
    pace: "slow",
    incomingMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
    exitMomentum: { direction: "descend", pace: "slow", transitionType: "breath" },
    emotionalBeat: "weight",
    directorNote: "VALLEY PRESSING DOWN. Camera descends below eye line. The architecture of the workshop towers above him. The decision enters the case from above — gravity is the metaphor. This is the heaviest of the workplace shots. The audience should feel the cumulative weight in their chest by now. Do not dramatize. The plainness of the descent is the statement.",
  },
  5: {
    cameraDirection: "hold-still",
    pace: "slow",
    incomingMomentum: { direction: "descend", pace: "slow", transitionType: "breath" },
    exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
    emotionalBeat: "memory",
    directorNote: "VALLEY FLOOR — INNER. The breath lands here. Locked frame. A younger version of him in a memory space. He hands the folded dream to the present-day man. This is not nostalgia — it is archaeology. The weight is not just external. Some of it has always been his own. Hold the stillness. Let the memory sit without explanation.",
  },
  6: {
    cameraDirection: "orbit-slow",
    pace: "slow",
    incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
    exitMomentum: { direction: "orbit-slow", pace: "slow", transitionType: "match-cut" },
    emotionalBeat: "intimacy",
    directorNote: "VALLEY FLOOR — DEEPEST. Home. The child gives him the drawing. It enters the case. Orbit slowly around both of them — the child and the man. The tenderness of this must be absolute. This is the heaviest weight because it is the most loved. The camera encircles them but does not crowd them. The child does not know what they are giving. The man does.",
  },
  7: {
    cameraDirection: "push-in",
    pace: "slow",
    incomingMomentum: { direction: "orbit-slow", pace: "slow", transitionType: "match-cut" },
    exitMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
    emotionalBeat: "revelation",
    directorNote: "THE CRACK. Night. Silence. Case on the table. He opens it. Push in slowly as the light escapes. The living city is inside — roads that glow, buildings that breathe, machinery that hums. This is a revelation, not a spectacle. Do not rush it. Do not make it miraculous. The city inside is beautiful in the same way the city outside is beautiful — it is the same city. That is the horror and the gift.",
  },
  8: {
    cameraDirection: "hold-still",
    pace: "slow",
    incomingMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
    exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "breath" },
    emotionalBeat: "weight",
    directorNote: "THE BOTTOM. Locked frame, close. Every road leads back to him. The machinery is waiting. The lights are dim because they are waiting for him. This is the maximum weight of the film — not the carrying, but the seeing. He sees the system. He sees that it was always about him. Hold this. Let the weight of understanding press on the audience. Do not cut away from this discomfort.",
  },
  9: {
    cameraDirection: "rise",
    pace: "measured",
    incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "breath" },
    exitMomentum: { direction: "rise", pace: "measured", transitionType: "dissolve" },
    emotionalBeat: "recognition",
    directorNote: "THE TURN. He reaches in. One hand. One road. He moves it. The camera begins to rise as the roads reconnect without his touch. Lights come on. He does not touch them. The camera should be ascending through the moment of the move — not dramatically, with intention. The rise is not triumph. It is the moment someone understands they have agency they did not know they had.",
  },
  10: {
    cameraDirection: "drift-right",
    pace: "slow",
    incomingMomentum: { direction: "rise", pace: "measured", transitionType: "dissolve" },
    exitMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
    emotionalBeat: "arrival",
    directorNote: "PROOF. He closes the case. Sets it on the floor. The child walks in and lifts it without effort. The camera drifts right with the child — gently following the weight as it moves to someone who does not yet know it is heavy. This is not a miracle. It is physics. The case was always this light. He just couldn't feel it.",
  },
  11: {
    cameraDirection: "pull-back",
    pace: "glacial",
    incomingMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
    exitMomentum: { direction: "pull-back", pace: "glacial", transitionType: "hard-cut" },
    emotionalBeat: "arrival",
    directorNote: "LANDING. The child opens the drawing. In it: the man stands beside the city — not underneath it. Pull back slowly from the drawing. The world that felt crushing in shot 1 is now at his side. The same scale. A different relationship. Hold the pull-back until the frame is wide enough for the audience to feel the difference from shot 1. That difference is the whole film.",
  },
}

const CAMERA_DIRECTION_INSTRUCTION: Record<CameraDirection, string> = {
  "push-in": "Slow dolly-forward. The camera approaches the subject — gently, with intention. No zoom. Movement is steady and deliberate.",
  "pull-back": "Slow pull-back or crane retreat. The camera withdraws to reveal scale. Movement is glacial — the world grows larger as the camera recedes.",
  "drift-left": "Subtle lateral drift left. The camera reads the scene like a sentence from right to left. No pan snap. Continuous, unhurried.",
  "drift-right": "Subtle lateral drift right. The camera reads the scene left to right — like turning a page. Smooth, unhurried.",
  "rise": "Slow upward tilt or crane rise. Height is perspective, not superiority. The camera gains altitude to reveal the systemic view.",
  "descend": "Slow downward tilt or crane descend. The camera comes to the human scale — witness, not surveillance.",
  "hold-still": "Locked-off camera. The world and character move inside a fixed frame. Restraint is the statement. Do not drift or shake.",
  "orbit-slow": "Slow, wide arc around the subject. The character remains centered while the world rotates into view around them.",
}

const PACE_INSTRUCTION: Record<MotionPace, string> = {
  glacial: "Movement is almost imperceptible — like watching a glacier. If you think it might be too slow, it is correct.",
  slow: "Slow and deliberate. Every movement has weight. No urgency.",
  measured: "Controlled pacing. There is intention in every second — not hurried, not frozen.",
  urgent: "Heightened pace — but never chaotic. The world moves faster because something is being resolved.",
}

const EMOTIONAL_BEAT_INSTRUCTION: Record<EmotionalBeat, string> = {
  recognition: "This shot must land a moment of seeing — the character (or viewer) understands something they could not before. The motion should move toward that clarity.",
  weight: "The burden must become physical in this shot. Motion should convey mass, gravity, and consequence — not drama.",
  scale: "The human must feel small in relation to the system — but not diminished. Scale is about context, not insignificance.",
  intimacy: "This is close. The motion must slow to the speed of a held breath. The audience is inside the character's experience.",
  threshold: "The character is at the edge of something new. The motion should lean forward — not commit, but lean.",
  arrival: "Something completes. Motion decelerates as it reaches its destination. There is rest here.",
  revelation: "The unseen system becomes visible. Motion should track the reveal — follow what is being uncovered.",
  memory: "The past is exerting itself. Motion should feel slightly dreamlike — not hallucinatory, but soft at the edges.",
}

const TRANSITION_INSTRUCTION: Record<TransitionType, string> = {
  "hard-cut": "This shot ends completely before the next begins. Do not linger or fade. Exit cleanly.",
  "match-cut": "This shot exits on a vector (direction + speed) that the next shot must receive and continue. Do not end abruptly — sustain the movement into the last frame.",
  "dissolve": "This shot's momentum bleeds into the next. Let the motion soften in the last seconds — the energy should feel transferable.",
  "breath": "This shot ends with a pause. The next shot begins fresh. Exit by decelerating to near-stillness — like an exhale.",
}

export function buildConductedMotionPrompt(parts: {
  shotDescription: string
  motionPrompt: string
  orchestration: SceneOrchestration
}): string {
  const { shotDescription, motionPrompt, orchestration } = parts

  const incoming = orchestration.incomingMomentum
    ? `INCOMING MOMENTUM (what the previous shot handed off): The previous shot exited with a ${orchestration.incomingMomentum.direction} at ${orchestration.incomingMomentum.pace} pace via a ${orchestration.incomingMomentum.transitionType}. This shot must receive that energy — either continuing it, contrasting it with intention, or landing the breath. Do not ignore what came before.`
    : `OPENING SHOT: No incoming momentum. This clip establishes the film's kinetic identity. Set the pace deliberately — every subsequent shot will answer it.`

  return [
    `Animate this Trust Tai keyframe as CANON motion. This is not an isolated clip — it is one movement in a choreographed sequence. Do not redesign the image — preserve character identity, composition, architecture, and symbols.`,
    ``,
    `=== SCENE CONDUCTOR BRIEF ===`,
    ``,
    incoming,
    ``,
    `CAMERA DIRECTION FOR THIS SHOT: ${orchestration.cameraDirection}`,
    CAMERA_DIRECTION_INSTRUCTION[orchestration.cameraDirection],
    ``,
    `PACING: ${orchestration.pace}`,
    PACE_INSTRUCTION[orchestration.pace],
    ``,
    `EMOTIONAL BEAT: ${orchestration.emotionalBeat}`,
    EMOTIONAL_BEAT_INSTRUCTION[orchestration.emotionalBeat],
    ``,
    `EXIT MOMENTUM (what this shot must hand to the next): Exit with a ${orchestration.exitMomentum.direction} motion via a ${orchestration.exitMomentum.transitionType}. ${TRANSITION_INSTRUCTION[orchestration.exitMomentum.transitionType]}`,
    ``,
    orchestration.directorNote
      ? `DIRECTOR NOTE: ${orchestration.directorNote}`
      : ``,
    ``,
    `=== WORLD BIBLE MOTION GOVERNANCE ===`,
    ``,
    `MOTION PHILOSOPHY: Move only to reveal intention, weight, memory, or recognition. Spectacle for its own sake is failure. Light behaves as recognition, not magic. Stones, atmosphere, and transit lines move with physics-like purpose.`,
    ``,
    `RESTRAINT: Remove one-third of the magic. Favor stone, brass, dust, haze, and human scale over spectacle. The extraordinary should feel like physics, not effects.`,
    ``,
    `ANTI-DRIFT: No sudden style changes, glitch, explosions, or whip pans. Characters must not become decorative. Black characters retain dignity, interiority, and agency in every frame.`,
    ``,
    `=== SHOT BRIEF ===`,
    `SHOT: ${shotDescription.trim()}`,
    `MOTION INTENT: ${motionPrompt.trim()}`,
    ``,
    `Keep it slow, cinematic, and grounded — a premium film shot in a coherent sequence, not an AI demo.`,
  ]
    .filter((line) => line !== undefined)
    .join("\n")
}

export function buildWorldBibleMotionPrompt(parts: {
  shotDescription: string
  motionPrompt: string
}): string {
  // Fal/Kling has a 2,500 character prompt limit.
  // Motion governance is condensed to essentials — the image already carries
  // visual identity. This block governs HOW things move, not what they look like.
  return [
    `Animate this Trust Tai keyframe as CANON motion. Do not redesign the image — preserve character identity, composition, architecture, and symbols.`,
    ``,
    `MOTION PHILOSOPHY: Move only to reveal intention, weight, memory, or recognition. Spectacle for its own sake is failure. Light behaves as recognition, not magic. Stones, atmosphere, and transit lines move with physics-like purpose.`,
    ``,
    `REstraint: Remove one-third of the magic. Favor stone, brass, dust, haze, and human scale over spectacle. The extraordinary should feel like physics, not effects.`,
    ``,
    `ANTI-DRIFT: No sudden style changes, glitch, explosions, or whip pans. Characters must not become decorative. Black characters retain dignity, interiority, and agency in every frame.`,
    ``,
    `SHOT: ${parts.shotDescription.trim()}`,
    `MOTION: ${parts.motionPrompt.trim()}`,
    ``,
    `Keep it slow, cinematic, and grounded — a premium film shot, not an AI demo.`,
  ].join("\n")
}
