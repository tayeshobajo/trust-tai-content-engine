#!/usr/bin/env node
/**
 * render-motion.mjs
 * Generates motion clips for all 11 Canon Scene 003 shots.
 *
 * Reads latest frame URLs from Supabase storage, sends each through
 * the video render API with orchestration data, and updates the
 * production record with video URLs.
 *
 * Usage: node scripts/render-motion.mjs [--shots 1,3,7]  (default: all)
 */

import { readFileSync } from "fs"

const BASE_URL = process.env.STUDIO_URL || "http://localhost:3011"
const SUPABASE_URL = "https://kjznbpsvffiysavovgfo.supabase.co"
const BUCKET = "rendered-frames"
const PREFIX = "prod-pilot-city-001/"
const PROD_ID = "prod-pilot-city-001"
const VIDEO_BUCKET = "rendered-videos"

// ─── Env ──────────────────────────────────────────────────────────────────
const env = readFileSync(process.env.HOME + "/Developer/trust-tai-content-engine/.env.local", "utf8")
function envVal(key) {
  const m = env.match(new RegExp(key + "=(.+)$", "m"))
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : ""
}
const ANON = envVal("NEXT_PUBLIC_SUPABASE_ANON_KEY")
const SERVICE = envVal("SUPABASE_SERVICE_ROLE_KEY")

// ─── Orchestration ────────────────────────────────────────────────────────
const ORCH = {
  1: { cameraDirection:"push-in", pace:"measured", exitMomentum:{direction:"push-in",pace:"measured",transitionType:"hard-cut"}, emotionalBeat:"weight", directorNote:"DROP IN. Start on the man's body — his stride, the case, the weight in his shoulders. Push toward him. Mid-action." },
  2: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"push-in",pace:"measured",transitionType:"hard-cut"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"weight", directorNote:"VALLEY ENTRY. Lock the camera at the moment of exchange. A colleague hands him something — it disappears into the case." },
  3: { cameraDirection:"push-in", pace:"slow", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, emotionalBeat:"weight", directorNote:"VALLEY DEEPENS. Push in closer. The mechanism disappears into the case. Escalation, not repetition." },
  4: { cameraDirection:"descend", pace:"slow", incomingMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, exitMomentum:{direction:"descend",pace:"slow",transitionType:"breath"}, emotionalBeat:"weight", directorNote:"VALLEY PRESSING DOWN. Camera descends below eye line. Architecture towers above him. Gravity is the metaphor." },
  5: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"descend",pace:"slow",transitionType:"breath"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"memory", directorNote:"VALLEY FLOOR — INNER. Locked frame. Memory space. He hands the folded dream to the present-day man." },
  6: { cameraDirection:"orbit-slow", pace:"slow", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"orbit-slow",pace:"slow",transitionType:"match-cut"}, emotionalBeat:"intimacy", directorNote:"VALLEY FLOOR — DEEPEST. Home. The child gives him the drawing. Orbit slowly around both of them." },
  7: { cameraDirection:"push-in", pace:"slow", incomingMomentum:{direction:"orbit-slow",pace:"slow",transitionType:"match-cut"}, exitMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, emotionalBeat:"revelation", directorNote:"THE CRACK. Night. Silence. Case on the table. He opens it. Push in slowly as the light escapes." },
  8: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"breath"}, emotionalBeat:"weight", directorNote:"THE BOTTOM. Locked frame, close. Every road leads back to him. Maximum weight of the film." },
  9: { cameraDirection:"rise", pace:"measured", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"breath"}, exitMomentum:{direction:"rise",pace:"measured",transitionType:"dissolve"}, emotionalBeat:"recognition", directorNote:"THE TURN. He reaches in. One hand. One road. He moves it. The camera begins to rise as the roads reconnect." },
  10: { cameraDirection:"drift-right", pace:"slow", incomingMomentum:{direction:"rise",pace:"measured",transitionType:"dissolve"}, exitMomentum:{direction:"drift-right",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"arrival", directorNote:"PROOF. He closes the case. The child walks in and lifts it with one hand. The camera drifts right." },
  11: { cameraDirection:"pull-back", pace:"glacial", incomingMomentum:{direction:"drift-right",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"pull-back",pace:"glacial",transitionType:"hard-cut"}, emotionalBeat:"arrival", directorNote:"LANDING. The child opens the drawing. The man stands beside the city. Pull back slowly. Hold the pull-back." },
}

const SHOTS = [
  { no:1, description:"Close on the man mid-stride. City in the background — blurred, secondary. The leather case in his hand. His posture carries weight that the case itself does not show.", durationSec:5, motionPrompt:"Slow push-in toward the man walking. His stride is measured, unhurried. The city moves softly behind him. Dust drifts in the light. The case swings slightly with his gait. Nothing dramatic — just weight." },
  { no:2, description:"Street level. A colleague holds out something formless. It dissolves into the case.", durationSec:6, motionPrompt:"Locked camera. The colleague extends their hand. A faint, formless shape dissolves into the leather case. The man's expression does not change. Pedestrians pass in the background. Subtle atmospheric dust movement." },
  { no:3, description:"Office. A client places a broken mechanism in his hands. It enters the case.", durationSec:5, motionPrompt:"Slow push-in toward the case. The client's hands place a small broken brass mechanism into his palms. It dissolves into the case. The camera inches closer. Ambient office dust drifts in warm light." },
  { no:4, description:"Workshop. Camera low. A worker hands him a decision from above.", durationSec:5, motionPrompt:"Slow camera descent. The worker lowers a folded paper from above. It descends into the case. The workshop architecture looms overhead. Dust particles settle slowly. The weight is palpable." },
  { no:5, description:"Memory space. A younger version of him holds a folded dream.", durationSec:6, motionPrompt:"Locked frame, dreamlike softness at the edges. The younger man extends the folded dream. The present-day man receives it. It dissolves into the case. Light shifts very slowly — memory time, not real time." },
  { no:6, description:"Home. Evening light. The child holds out a drawing.", durationSec:6, motionPrompt:"Slow orbit around the man and child. The child extends the drawing with both hands. He takes it tenderly. It enters the case. The camera arcs gently around them. Evening light shifts through a window. Warm, intimate, still." },
  { no:7, description:"Night. He opens the case. A living city is inside.", durationSec:6, motionPrompt:"Slow push-in toward the open case. Light escapes upward as it opens. Inside: a miniature living city — glowing roads, tiny lit windows, machinery humming. The camera approaches slowly. The man's face is lit from below. Reverence, not spectacle." },
  { no:8, description:"Close on the open case. Every road leads back to him.", durationSec:6, motionPrompt:"Locked frame. The living city inside the case glows softly. Tiny roads pulse with faint light. Each road curves back toward the center where his hands rest. The machinery waits. Lights dim and brighten gently — breathing. He stares. Stillness." },
  { no:9, description:"His hand reaches in. One finger moves one road.", durationSec:10, motionPrompt:"The camera begins to rise slowly. His hand enters the case. One finger nudges a single glowing road aside. The road reconnects to a different path. Then another road shifts on its own. Lights begin turning on across the miniature city — one by one — without his touch. The camera continues rising as the cascade builds. Recognition, not triumph." },
  { no:10, description:"He closes the case. The child lifts it with one hand.", durationSec:6, motionPrompt:"He closes the case lid. Sets it on the floor. The child walks in from the hallway and picks it up with one hand — relaxed, effortless. The camera drifts right, following the child carrying the case. Warm hallway light. The man watches from behind, standing still." },
  { no:11, description:"The child opens the drawing. The man stands beside the city.", durationSec:7, motionPrompt:"The child opens the drawing on the floor. It shows a man standing beside a city. The camera begins to pull back — slowly, glacially — from the drawing. Past the child's hands. Past the child. Past the man sitting nearby. The room expands. The world that felt crushing is now at his side. Hold the pull-back until the frame is wide and quiet." },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

async function getLatestFrames() {
  console.log("Fetching latest frames from storage...")
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: PREFIX, limit: 100 }),
  })
  const files = await res.json()
  
  const latest = {}
  for (const f of files) {
    const match = f.name.match(/^shot-(\d+)-/)
    if (match) {
      const num = parseInt(match[1])
      if (!latest[num] || f.created_at > latest[num].created_at) {
        latest[num] = f
      }
    }
  }
  
  const result = {}
  for (const [num, file] of Object.entries(latest)) {
    result[parseInt(num)] = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}${file.name}`
  }
  return result
}

async function renderMotion(shot, imageUrl) {
  const body = {
    imageUrl,
    motionPrompt: shot.motionPrompt,
    shotDescription: shot.description,
    durationSec: shot.durationSec,
    productionId: PROD_ID,
    shotNumber: shot.no,
    orchestration: ORCH[shot.no],
  }

  const startTime = Date.now()
  console.log(`\n[${new Date().toISOString()}] Shot ${shot.no}: submitting motion render...`)
  console.log(`  Duration: ${shot.durationSec}s | Camera: ${ORCH[shot.no].cameraDirection} | Beat: ${ORCH[shot.no].emotionalBeat}`)

  const res = await fetch(`${BASE_URL}/api/studio/render/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  if (!res.ok) {
    console.error(`  ❌ Shot ${shot.no} FAILED (${elapsed}s): ${res.status}`, data.error || data.detail || data)
    return null
  }

  if (data.videoUrl) {
    console.log(`  ✅ Shot ${shot.no}: motion rendered (${elapsed}s)`)
    console.log(`     URL: ${data.videoUrl.substring(0, 100)}...`)
    return data.videoUrl
  }

  console.log(`  ⏳ Shot ${shot.no}: queued (${elapsed}s) — ${data.note || data.detail || 'no URL yet'}`)
  console.log(`     Request ID: ${data.requestId || 'n/a'}`)
  return data
}

async function updateProductionVideoUrls(videoUrls) {
  // Fetch current production
  const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/tts_productions?id=eq.${PROD_ID}`, {
    headers: { "apikey": ANON, "Authorization": `Bearer ${SERVICE}` },
  })
  const [production] = await fetchRes.json()
  if (!production) {
    console.error("Could not fetch production to update video URLs")
    return
  }

  const updatedShots = production.film.shots.map(shot => {
    const videoUrl = videoUrls[shot.no]
    if (videoUrl) {
      return {
        ...shot,
        renderedVideoUrl: videoUrl,
        motionStatus: "rendered",
      }
    }
    return shot
  })

  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/tts_productions?id=eq.${PROD_ID}`, {
    method: "PATCH",
    headers: {
      "apikey": ANON,
      "Authorization": `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      film: { ...production.film, shots: updatedShots },
      updated_at: new Date().toISOString(),
    }),
  })

  if (patchRes.ok) {
    console.log(`\n✅ Production updated with video URLs`)
  } else {
    console.error(`\n❌ Production update failed: ${patchRes.status}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const shotsArg = process.argv.find(a => a.startsWith("--shots"))
  let shotNums = shotsArg
    ? shotsArg.split("=")[1]?.split(",").map(Number)
    : Array.from({ length: 11 }, (_, i) => i + 1)

  console.log(`Trust Tai Studio — Motion Render Pipeline`)
  console.log(`Target: ${BASE_URL}`)
  console.log(`Shots: ${shotNums.join(", ")}`)
  console.log(`Total: ${shotNums.length} clips`)

  const frameUrls = await getLatestFrames()

  const videoUrls = {}
  let succeeded = 0
  let failed = 0

  for (const num of shotNums) {
    const shot = SHOTS.find(s => s.no === num)
    if (!shot) {
      console.log(`\nShot ${num}: not found in shot list, skipping`)
      continue
    }

    const imageUrl = frameUrls[num]
    if (!imageUrl) {
      console.log(`\nShot ${num}: no frame URL found, skipping`)
      failed++
      continue
    }

    try {
      const result = await renderMotion(shot, imageUrl)
      if (result && typeof result === "string") {
        videoUrls[num] = result
        succeeded++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`  ❌ Shot ${shot.no} exception:`, err.message)
      failed++
    }

    // Brief pause between renders
    if (num !== shotNums[shotNums.length - 1]) {
      console.log("  Pausing 5s before next render...")
      await new Promise(r => setTimeout(r, 5000))
    }
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`Motion render complete: ${succeeded} succeeded, ${failed} failed`)

  // Update production record
  if (Object.keys(videoUrls).length > 0) {
    await updateProductionVideoUrls(videoUrls)
  }

  console.log("Done.")
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
