#!/usr/bin/env node
/**
 * Renders shots 9, 10, 11 for Canon Scene 003.
 *
 * Shot 9: Missing from storage — re-render with original description.
 * Shot 10: Regen — child must use ONE hand effortlessly, domestic setting.
 * Shot 11: Regen — drawing must be legible, man relaxed beside city.
 */

const BASE_URL = process.env.STUDIO_URL || "http://localhost:3011"
const PRODUCTION_ID = "prod-pilot-city-001"
const TOTAL_SHOTS = 11

const WORLD_BIBLE_CONTEXT = `Production: "The Man Who Carried a City" — Canon Scene 003.

World context: A civilization where the weight of responsibility, memory, and unseen systems takes physical form. Two architects build bridges in the same city — one anchors every bridge to himself, the other builds bridges that never touch her. The world is retrofuturist: brass instruments, glowing transit lines, carved stone, floating stones, elevated viaducts, market commerce. Black characters are foundational, not applied. Technology is handmade analog — no digital screens.

Active symbols this production: case/container (city as responsibility made visible), living road (intention and dependency made legible), brass (knowledge shaped by hands), light (recognition), height (perspective).

Active world laws: Law 1 (inner realities acquire physical form), Law 3 (every person carries a world), Law 5 (weight contains information).`

const SHOTS = [
  {
    no: 9,
    description: `His hand reaches into the open case. One finger moves one road inside the living city — small, precise, unhurried. Other roads begin reconnecting on their own. Lights come on across the miniature city without his touch. The camera rises slowly as the cascade begins. He watches. He does not touch the lights. He only moved the one road. His expression is recognition — not triumph. The room is dim, intimate, night. The case glows from within.`,
    orchestration: {
      cameraDirection: "rise",
      pace: "measured",
      incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "breath" },
      exitMomentum: { direction: "rise", pace: "measured", transitionType: "dissolve" },
      emotionalBeat: "recognition",
      directorNote: "THE TURN. He reaches in. One hand. One road. He moves it. The camera begins to rise as the roads reconnect without his touch. Lights come on. He does not touch them. The camera should be ascending through the moment of the move — not dramatically, with intention. The rise is not triumph. It is the moment someone understands they have agency they did not know they had.",
    },
  },
  {
    no: 10,
    description: `A quiet domestic hallway, evening. The man closes the leather case and sets it on the wooden floor. His young child — a small Black child in pajamas — walks in from the hallway and picks up the case with ONE hand. Just one. The child's arm is relaxed, hanging naturally at their side with the handle in their fist. No effort. No strain. No bracing. The case does not look heavy — it looks like an ordinary briefcase in a child's hand. The man watches from behind, standing still. The camera drifts right, following the child who carries the case down the hallway without struggle. Warm lamplight. Home. Quiet. The proof is plain: the case was always this light.`,
    orchestration: {
      cameraDirection: "drift-right",
      pace: "slow",
      incomingMomentum: { direction: "rise", pace: "measured", transitionType: "dissolve" },
      exitMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
      emotionalBeat: "arrival",
      directorNote: "PROOF. He closes the case. Sets it on the floor. The child walks in from the hallway and lifts it with one hand. The camera drifts right with the child — gently following the weight as it moves to someone who does not yet know it is heavy. This is not a miracle. It is physics. The case was always this light. He just couldn't feel it. KEY: the child uses ONE HAND. Effortlessly. No strain. The case looks ordinary in the child's grip. Domestic setting — hallway, home, warm light. NOT a grand or cathedral-like space.",
    },
  },
  {
    no: 11,
    description: `The child sits on the floor holding open a drawing — a child's crayon drawing that fills a large portion of the frame. The drawing clearly shows: a simple upright stick-figure man standing BESIDE a small city of buildings. Not underneath. Not above. Beside. There is visible empty space between the man and the city in the drawing. The man in the drawing stands tall and relaxed. The real man sits nearby on the floor, his posture mirroring the drawing — upright, relaxed, at rest. No tension in his shoulders. No weight. The camera pulls back slowly from the drawing in the child's hands, past the child, past the man, revealing the quiet room around them. The drawing is the focal point — large, centered, well-lit, clearly legible. The viewer can read it: man beside city. That reading IS the ending.`,
    orchestration: {
      cameraDirection: "pull-back",
      pace: "glacial",
      incomingMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
      exitMomentum: { direction: "pull-back", pace: "glacial", transitionType: "hard-cut" },
      emotionalBeat: "arrival",
      directorNote: "LANDING. The child opens the drawing. In it: the man stands beside the city — not underneath it. Pull back slowly from the drawing. The world that felt crushing in shot 1 is now at his side. The same scale. A different relationship. Hold the pull-back until the frame is wide enough for the audience to feel the difference from shot 1. That difference is the whole film. KEY: the drawing must be LEGIBLE — the viewer must clearly see a man standing beside a city in the child's drawing. The drawing is large in frame, well-lit, centered. The man's posture is relaxed — upright, not burdened. NOT tense, NOT hunched.",
    },
  },
]

async function renderShot(shot) {
  const body = {
    shotDescription: shot.description,
    worldBibleContext: WORLD_BIBLE_CONTEXT,
    shotNumber: shot.no,
    totalShots: TOTAL_SHOTS,
    productionId: PRODUCTION_ID,
    orchestration: shot.orchestration,
  }

  console.log(`\n[${new Date().toISOString()}] Rendering shot ${shot.no}...`)
  console.log(`  Description length: ${shot.description.length} chars`)

  const res = await fetch(`${BASE_URL}/api/studio/render/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error(`  ❌ Shot ${shot.no} FAILED: ${res.status}`, data.error || data)
    return null
  }

  console.log(`  ✅ Shot ${shot.no} rendered: ${data.imageUrl?.substring(0, 80)}...`)
  console.log(`  Storage path: rendered-frames/${PRODUCTION_ID}/shot-${shot.no}-${data.imageName?.split('-').pop() || 'unknown'}`)
  return data
}

async function main() {
  console.log(`Rendering ${SHOTS.length} shots to ${BASE_URL}`)
  console.log(`Production: ${PRODUCTION_ID}`)

  for (const shot of SHOTS) {
    await renderShot(shot)
    // 3s pause between renders
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log("\n✅ All renders complete.")
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
