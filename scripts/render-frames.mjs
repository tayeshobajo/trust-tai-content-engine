#!/usr/bin/env node
/**
 * render-frames.mjs
 * Renders all 11 frames for Canon Scene 003 — "The Man Who Carried a City"
 * using the full director's arc orchestration.
 *
 * Usage: node scripts/render-frames.mjs [--dry-run] [--shots 1,3,7]
 *
 * Each shot is rendered sequentially with a 3s pause between calls
 * to avoid hammering the OpenAI image API.
 */

const BASE_URL = process.env.STUDIO_URL || "http://localhost:3011"
const PRODUCTION_ID = "prod-pilot-city-001"
const WORLD_BIBLE_CONTEXT = `Production: "The Man Who Carried a City" — Canon Scene 003.

World context: A civilization where the weight of responsibility, memory, and unseen systems takes physical form. Two architects build bridges in the same city — one anchors every bridge to himself, the other builds bridges that never touch her. The world is retrofuturist: brass instruments, glowing transit lines, carved stone, floating stones, elevated viaducts, market commerce. Black characters are foundational, not applied. Technology is handmade analog — no digital screens.

Active symbols this production: case/container (city as responsibility made visible), living road (intention and dependency made legible), brass (knowledge shaped by hands), light (recognition), height (perspective).

Active world laws: Law 1 (inner realities acquire physical form), Law 3 (every person carries a world), Law 5 (weight contains information).`

// --- Director's arc: DROP IN → VALLEY → CRACK → BOTTOM → TURN → PROOF → LANDING ---

const SHOTS = [
  {
    no: 1,
    description: "Close on the man mid-stride. City in the background — blurred, secondary. The leather case in his hand. His posture carries weight that the case itself does not show. We are inside the moment, not above it.",
    durationSec: 5,
    purpose: "Drop in — mid-action, no establishing",
    orchestration: {
      cameraDirection: "push-in",
      pace: "measured",
      exitMomentum: { direction: "push-in", pace: "measured", transitionType: "hard-cut" },
      emotionalBeat: "weight",
      directorNote: "DROP IN. Do not establish the city. Do not show us where we are. Start on the man's body — his stride, the case, the weight in his shoulders. The audience is inside the experience before they understand it. The city is background, not subject. Push toward him. Mid-action. The film has already been happening before we arrived.",
    },
  },
  {
    no: 2,
    description: "Street level. A colleague holds out something formless — an unanswered question made briefly visible. It dissolves into the case. The case does not grow. His expression does not change. The exchange is ordinary and invisible.",
    durationSec: 6,
    purpose: "Valley entry — first weight added",
    orchestration: {
      cameraDirection: "hold-still",
      pace: "slow",
      incomingMomentum: { direction: "push-in", pace: "measured", transitionType: "hard-cut" },
      exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
      emotionalBeat: "weight",
      directorNote: "VALLEY ENTRY. Lock the camera at the moment of exchange. A colleague hands him something — it disappears into the case. The case does not grow. His expression does not change. The weight is invisible. That is the point. The audience registers the transaction without understanding it yet. Hold the frame through the whole exchange.",
    },
  },
  {
    no: 3,
    description: "Closer than shot 2. Office. A client places a broken mechanism in his hands. It enters the case. The camera is closer to the case this time than to his face. We watch the weight enter, not the man receiving it.",
    durationSec: 5,
    purpose: "Valley deepens — second weight, closer",
    orchestration: {
      cameraDirection: "push-in",
      pace: "slow",
      incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
      exitMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
      emotionalBeat: "weight",
      directorNote: "VALLEY DEEPENS. Push in closer than shot 2. The mechanism disappears into the case. This beat must feel different from shot 2 — not repetition, escalation. We are closer to him now. The world is slightly more confined. The atmosphere is slightly heavier. Push toward the case itself, not his face.",
    },
  },
  {
    no: 4,
    description: "Workshop. Camera low — below eye line, looking up at the man. A worker hands him a decision from above. It descends into the case. The architecture of the workshop towers above him. The weight of accumulated decisions visible in his stance.",
    durationSec: 5,
    purpose: "Valley pressing down — third weight, below eye line",
    orchestration: {
      cameraDirection: "descend",
      pace: "slow",
      incomingMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
      exitMomentum: { direction: "descend", pace: "slow", transitionType: "breath" },
      emotionalBeat: "weight",
      directorNote: "VALLEY PRESSING DOWN. Camera descends below eye line. The architecture of the workshop towers above him. The decision enters the case from above — gravity is the metaphor. This is the heaviest of the workplace shots. The audience should feel the cumulative weight in their chest by now. Do not dramatize. The plainness of the descent is the statement.",
    },
  },
  {
    no: 5,
    description: "A memory space — soft at the edges, sharp at the center. A younger version of him holds a folded dream. He passes it to the present-day man. The weight has always included something of his own. Locked frame. The exchange is silent.",
    durationSec: 6,
    purpose: "Valley floor inner — emotional weight, the weight he gave himself",
    orchestration: {
      cameraDirection: "hold-still",
      pace: "slow",
      incomingMomentum: { direction: "descend", pace: "slow", transitionType: "breath" },
      exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
      emotionalBeat: "memory",
      directorNote: "VALLEY FLOOR — INNER. The breath lands here. Locked frame. A younger version of him in a memory space. He hands the folded dream to the present-day man. This is not nostalgia — it is archaeology. The weight is not just external. Some of it has always been his own. Hold the stillness. Let the memory sit without explanation.",
    },
  },
  {
    no: 6,
    description: "Home. Evening light. The child holds out a drawing with both hands. He takes it — tenderly. It enters the case. The camera orbits slowly around both of them. This is the heaviest weight because it is the most loved. The child does not know.",
    durationSec: 6,
    purpose: "Valley floor deepest — deepest weight, the weight of what he loves",
    orchestration: {
      cameraDirection: "orbit-slow",
      pace: "slow",
      incomingMomentum: { direction: "hold-still", pace: "slow", transitionType: "dissolve" },
      exitMomentum: { direction: "orbit-slow", pace: "slow", transitionType: "match-cut" },
      emotionalBeat: "intimacy",
      directorNote: "VALLEY FLOOR — DEEPEST. Home. The child gives him the drawing. It enters the case. Orbit slowly around both of them — the child and the man. The tenderness of this must be absolute. This is the heaviest weight because it is the most loved. The camera encircles them but does not crowd them. The child does not know what they are giving. The man does.",
    },
  },
  {
    no: 7,
    description: "Night. The case on a table in a quiet room. Silence. He opens it. Light escapes upward. Inside: a living city — roads that glow, buildings that breathe, machinery that hums. The same city he has been walking through. The same weight, now visible as a world.",
    durationSec: 10,
    purpose: "The crack — reveal, the city inside the case",
    orchestration: {
      cameraDirection: "push-in",
      pace: "slow",
      incomingMomentum: { direction: "orbit-slow", pace: "slow", transitionType: "match-cut" },
      exitMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
      emotionalBeat: "revelation",
      directorNote: "THE CRACK. Night. Silence. Case on the table. He opens it. Push in slowly as the light escapes. The living city is inside — roads that glow, buildings that breathe, machinery that hums. This is a revelation, not a spectacle. Do not rush it. Do not make it miraculous. The city inside is beautiful in the same way the city outside is beautiful — it is the same city. That is the horror and the gift.",
    },
  },
  {
    no: 8,
    description: "Inside the city in the case. Every road leads back to the man. The machinery is still. The lights are dim. Everything is waiting for him to move first. He sees it. This is the maximum weight of the film — not the carrying, but the seeing.",
    durationSec: 8,
    purpose: "The bottom — dependency made visible, maximum weight",
    orchestration: {
      cameraDirection: "hold-still",
      pace: "slow",
      incomingMomentum: { direction: "push-in", pace: "slow", transitionType: "hard-cut" },
      exitMomentum: { direction: "hold-still", pace: "slow", transitionType: "breath" },
      emotionalBeat: "weight",
      directorNote: "THE BOTTOM. Locked frame, close. Every road leads back to him. The machinery is waiting. The lights are dim because they are waiting for him. This is the maximum weight of the film — not the carrying, but the seeing. He sees the system. He sees that it was always about him. Hold this. Let the weight of understanding press on the audience. Do not cut away from this discomfort.",
    },
  },
  {
    no: 9,
    description: "His hand reaches into the case. One finger moves one road — small, precise, unhurried. Other roads begin connecting without his touch. Lights come on across the city. The camera rises slowly as the cascade begins. He does not touch the lights. He only moved the one road.",
    durationSec: 10,
    purpose: "The turn — one decisive move, camera rises",
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
    description: "He closes the case. He sets it on the floor. The child walks in from the hallway and lifts it with one hand. The camera drifts right with the child — gently following the weight as it moves. The child does not struggle. The case is light now.",
    durationSec: 6,
    purpose: "Proof — weight transferred, child lifts without effort",
    orchestration: {
      cameraDirection: "drift-right",
      pace: "slow",
      incomingMomentum: { direction: "rise", pace: "measured", transitionType: "dissolve" },
      exitMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
      emotionalBeat: "arrival",
      directorNote: "PROOF. He closes the case. Sets it on the floor. The child walks in from the hallway and lifts it with one hand. The camera drifts right with the child — gently following the weight as it moves to someone who does not yet know it is heavy. This is not a miracle. It is physics. The case was always this light. He just couldn't feel it.",
    },
  },
  {
    no: 11,
    description: "The child opens the drawing on the floor. In it: the man stands beside the city. Not underneath it. Not above it. Beside it. The camera pulls back — slowly, glacially — from the drawing, past the child, past the man, until the room is small and the world is understood.",
    durationSec: 7,
    purpose: "Landing — earned wide, man beside city not under it",
    orchestration: {
      cameraDirection: "pull-back",
      pace: "glacial",
      incomingMomentum: { direction: "drift-right", pace: "slow", transitionType: "dissolve" },
      exitMomentum: { direction: "pull-back", pace: "glacial", transitionType: "hard-cut" },
      emotionalBeat: "arrival",
      directorNote: "LANDING. The child opens the drawing. In it: the man stands beside the city — not underneath it. Not above it. Beside it. Pull back slowly from the drawing. The world that felt crushing in shot 1 is now at his side. The same scale. A different relationship. Hold the pull-back until the frame is wide enough for the audience to feel the difference from shot 1. That difference is the whole film.",
    },
  },
]

const dryRun = process.argv.includes("--dry-run")
const shotFilter = (() => {
  const idx = process.argv.indexOf("--shots")
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].split(",").map(Number)
  }
  return null
})()

const shotsToRender = shotFilter
  ? SHOTS.filter((s) => shotFilter.includes(s.no))
  : SHOTS

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function renderShot(shot) {
  console.log(`\n═══════════════════════════════════════════`)
  console.log(`  SHOT ${shot.no} / 11 — ${shot.purpose.toUpperCase()}`)
  console.log(`  Beat: ${shot.orchestration.emotionalBeat} | Camera: ${shot.orchestration.cameraDirection} | Pace: ${shot.orchestration.pace}`)
  console.log(`═══════════════════════════════════════════`)

  if (dryRun) {
    console.log(`  [DRY RUN] Skipping API call.`)
    return { shot: shot.no, status: "dry-run" }
  }

  const body = {
    shotDescription: shot.description,
    worldBibleContext: WORLD_BIBLE_CONTEXT,
    shotNumber: shot.no,
    totalShots: 11,
    productionId: PRODUCTION_ID,
    orchestration: shot.orchestration,
  }

  const start = Date.now()
  console.log(`  → Calling /api/studio/render/image...`)

  try {
    const res = await fetch(`${BASE_URL}/api/studio/render/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const payload = await res.json()

    if (!res.ok || payload.error) {
      console.error(`  ✗ FAILED: ${payload.error || res.status}`)
      return { shot: shot.no, status: "error", error: payload.error }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`  ✓ Done in ${elapsed}s`)
    console.log(`  Size: ${payload.size}`)
    console.log(`  URL: ${payload.imageUrl}`)
    if (payload.revisedPrompt) {
      const preview = payload.revisedPrompt.slice(0, 120).replace(/\n/g, " ")
      console.log(`  Revised: ${preview}...`)
    }

    return { shot: shot.no, status: "ok", url: payload.imageUrl, size: payload.size }
  } catch (err) {
    console.error(`  ✗ ERROR: ${err.message}`)
    return { shot: shot.no, status: "error", error: err.message }
  }
}

async function main() {
  console.log(`\n╔══════════════════════════════════════════════╗`)
  console.log(`  TRUST TAI STUDIO — FRAME RENDER`)
  console.log(`  Canon Scene 003 — "The Man Who Carried a City"`)
  console.log(`  Director's Arc: Drop In → Valley → Turn → Landing`)
  console.log(`  Shots: ${shotsToRender.map(s => s.no).join(", ")} (${shotsToRender.length} total)`)
  if (dryRun) console.log(`  MODE: DRY RUN`)
  console.log(`╚══════════════════════════════════════════════╝`)

  const results = []

  for (let i = 0; i < shotsToRender.length; i++) {
    const shot = shotsToRender[i]
    const result = await renderShot(shot)
    results.push(result)

    // Pause between shots — avoid rate-limiting, let each render settle
    if (i < shotsToRender.length - 1) {
      console.log(`  ⏸  Pausing 4s before next shot...`)
      await sleep(4000)
    }
  }

  console.log(`\n╔══════════════════════════════════════════════╗`)
  console.log(`  RENDER COMPLETE`)
  console.log(`╚══════════════════════════════════════════════╝`)

  const ok = results.filter(r => r.status === "ok")
  const errors = results.filter(r => r.status === "error")

  console.log(`  ✓ ${ok.length} rendered successfully`)
  if (errors.length) {
    console.log(`  ✗ ${errors.length} failed:`)
    errors.forEach(e => console.log(`    Shot ${e.shot}: ${e.error}`))
  }

  if (ok.length > 0) {
    console.log(`\n  Frames stored at:`)
    ok.forEach(r => console.log(`    Shot ${r.shot}: ${r.url}`))
  }
}

main().catch(console.error)
