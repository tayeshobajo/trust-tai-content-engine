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

export function buildWorldBiblePrompt(parts: {
  shotDescription: string
  worldBibleContext?: string
  shotNumber?: number
  totalShots?: number
}): string {
  const { shotDescription, worldBibleContext, shotNumber, totalShots } = parts

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
  ].join("\n")
}
