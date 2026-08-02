#!/usr/bin/env node
/**
 * Migrate prod-pilot-city-001 from old 7-shot Visual Parable plan
 * to 11-shot Canon Scene 003 orchestration with rendered frame URLs.
 *
 * Reads the latest rendered frame for each shot from Supabase storage
 * and writes the full 11-shot plan into the production's film.shots.
 */

const SUPABASE_URL = "https://kjznbpsvffiysavovgfo.supabase.co"
const BUCKET = "rendered-frames"
const PREFIX = "prod-pilot-city-001/"
const PROD_ID = "prod-pilot-city-001"

// Load env
import { readFileSync } from "fs"
const env = readFileSync(process.env.HOME + "/Developer/trust-tai-content-engine/.env.local", "utf8")
const ANON = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim()
const SERVICE = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()

// ─── Orchestration (mirrors world-bible.ts CANON_SCENE_003_ORCHESTRATION) ─────────
const ORCH = {
  1: { cameraDirection:"push-in", pace:"measured", exitMomentum:{direction:"push-in",pace:"measured",transitionType:"hard-cut"}, emotionalBeat:"weight", directorNote:"DROP IN. Do not establish the city. Do not show us where we are. Start on the man's body — his stride, the case, the weight in his shoulders. The audience is inside the experience before they understand it. The city is background, not subject. Push toward him. Mid-action. The film has already been happening before we arrived." },
  2: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"push-in",pace:"measured",transitionType:"hard-cut"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"weight", directorNote:"VALLEY ENTRY. Lock the camera at the moment of exchange. A colleague hands him something — it disappears into the case. The case does not grow. His expression does not change. The weight is invisible. That is the point." },
  3: { cameraDirection:"push-in", pace:"slow", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, emotionalBeat:"weight", directorNote:"VALLEY DEEPENS. Push in closer than shot 2. The mechanism disappears into the case. This beat must feel different from shot 2 — not repetition, escalation." },
  4: { cameraDirection:"descend", pace:"slow", incomingMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, exitMomentum:{direction:"descend",pace:"slow",transitionType:"breath"}, emotionalBeat:"weight", directorNote:"VALLEY PRESSING DOWN. Camera descends below eye line. The architecture of the workshop towers above him. The decision enters the case from above — gravity is the metaphor." },
  5: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"descend",pace:"slow",transitionType:"breath"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"memory", directorNote:"VALLEY FLOOR — INNER. The breath lands here. Locked frame. A younger version of him in a memory space. He hands the folded dream to the present-day man." },
  6: { cameraDirection:"orbit-slow", pace:"slow", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"orbit-slow",pace:"slow",transitionType:"match-cut"}, emotionalBeat:"intimacy", directorNote:"VALLEY FLOOR — DEEPEST. Home. The child gives him the drawing. It enters the case. Orbit slowly around both of them — the child and the man. The tenderness of this must be absolute." },
  7: { cameraDirection:"push-in", pace:"slow", incomingMomentum:{direction:"orbit-slow",pace:"slow",transitionType:"match-cut"}, exitMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, emotionalBeat:"revelation", directorNote:"THE CRACK. Night. Silence. Case on the table. He opens it. Push in slowly as the light escapes. The living city is inside — roads that glow, buildings that breathe, machinery that hums." },
  8: { cameraDirection:"hold-still", pace:"slow", incomingMomentum:{direction:"push-in",pace:"slow",transitionType:"hard-cut"}, exitMomentum:{direction:"hold-still",pace:"slow",transitionType:"breath"}, emotionalBeat:"weight", directorNote:"THE BOTTOM. Locked frame, close. Every road leads back to him. The machinery is waiting. The lights are dim because they are waiting for him. This is the maximum weight of the film." },
  9: { cameraDirection:"rise", pace:"measured", incomingMomentum:{direction:"hold-still",pace:"slow",transitionType:"breath"}, exitMomentum:{direction:"rise",pace:"measured",transitionType:"dissolve"}, emotionalBeat:"recognition", directorNote:"THE TURN. He reaches in. One hand. One road. He moves it. The camera begins to rise as the roads reconnect without his touch. Lights come on. He does not touch them." },
  10: { cameraDirection:"drift-right", pace:"slow", incomingMomentum:{direction:"rise",pace:"measured",transitionType:"dissolve"}, exitMomentum:{direction:"drift-right",pace:"slow",transitionType:"dissolve"}, emotionalBeat:"arrival", directorNote:"PROOF. He closes the case. Sets it on the floor. The child walks in from the hallway and lifts it with one hand. The camera drifts right with the child — gently following the weight as it moves." },
  11: { cameraDirection:"pull-back", pace:"glacial", incomingMomentum:{direction:"drift-right",pace:"slow",transitionType:"dissolve"}, exitMomentum:{direction:"pull-back",pace:"glacial",transitionType:"hard-cut"}, emotionalBeat:"arrival", directorNote:"LANDING. The child opens the drawing. In it: the man stands beside the city — not underneath it. Pull back slowly from the drawing. The world that felt crushing in shot 1 is now at his side." },
}

const SHOTS = [
  { no:1, description:"Close on the man mid-stride. City in the background — blurred, secondary. The leather case in his hand. His posture carries weight that the case itself does not show. We are inside the moment, not above it.", durationSec:5, route:"ChatGPT frame", purpose:"Drop in — mid-action, no establishing" },
  { no:2, description:"Street level. A colleague holds out something formless — an unanswered question made briefly visible. It dissolves into the case. The case does not grow. His expression does not change. The exchange is ordinary and invisible.", durationSec:6, route:"ChatGPT frame", purpose:"Valley entry — first weight added" },
  { no:3, description:"Closer than shot 2. Office. A client places a broken mechanism in his hands. It enters the case. The camera is closer to the case this time than to his face. We watch the weight enter, not the man receiving it.", durationSec:5, route:"ChatGPT frame", purpose:"Valley deepens — second weight, closer" },
  { no:4, description:"Workshop. Camera low — below eye line, looking up at the man. A worker hands him a decision from above. It descends into the case. The architecture of the workshop towers above him. The weight of accumulated decisions visible in his stance.", durationSec:5, route:"ChatGPT frame", purpose:"Valley pressing down — third weight, below eye line" },
  { no:5, description:"A memory space — soft at the edges, sharp at the center. A younger version of him holds a folded dream. He passes it to the present-day man. The weight has always included something of his own. Locked frame. The exchange is silent.", durationSec:6, route:"ChatGPT frame", purpose:"Valley floor inner — emotional weight, the weight he gave himself" },
  { no:6, description:"Home. Evening light. The child holds out a drawing with both hands. He takes it — tenderly. It enters the case. The camera orbits slowly around both of them. This is the heaviest weight because it is the most loved. The child does not know.", durationSec:6, route:"ChatGPT frame", purpose:"Valley floor deepest — deepest weight, the weight of what he loves" },
  { no:7, description:"Night. Silence. He places the case on the table and opens it. Inside is an entire living city. Roads that glow. Buildings that breathe. Machinery that hums. Every route eventually arrives at the same small room where he stands.", durationSec:6, route:"ChatGPT frame", purpose:"The crack — case opens, living city revealed" },
  { no:8, description:"Close on the open case. The living city inside. Every road leads back to him. The machinery waits for his hands. Lights are dim — waiting for him. He sees the system. He sees that it was always about him.", durationSec:6, route:"ChatGPT frame", purpose:"The bottom — maximum dependency made visible" },
  { no:9, description:"His hand reaches into the open case. One finger moves one road — small, precise, unhurried. Other roads begin reconnecting without his touch. Lights come on across the city. The camera rises slowly as the cascade begins.", durationSec:10, route:"YouTube motion test", purpose:"The turn — one decisive move, camera rises" },
  { no:10, description:"He closes the case and sets it on the floor. The child walks in from the hallway and lifts it with one hand — effortlessly, without strain. The camera drifts right, following the child who carries the case without struggle.", durationSec:6, route:"ChatGPT frame", purpose:"Proof — weight transferred, child lifts without effort" },
  { no:11, description:"The child opens the drawing on the floor. In it: the man stands beside the city — not underneath it, not above it, beside it. The camera pulls back slowly from the drawing, past the child, past the man, until the room is small and the world is understood.", durationSec:7, route:"ChatGPT frame", purpose:"Landing — earned wide, man beside city not under it" },
]

async function getLatestFrames() {
  console.log("Fetching file list from Supabase storage...")
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: PREFIX, limit: 100 }),
  })
  const files = await res.json()
  
  // Group by shot number, get latest
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

async function main() {
  const frameUrls = await getLatestFrames()
  console.log("Latest frames found:")
  for (const [num, url] of Object.entries(frameUrls)) {
    console.log(`  Shot ${num}: ...${url.split('/').pop()}`)
  }
  
  // Check we have all 11
  const missing = []
  for (let i = 1; i <= 11; i++) {
    if (!frameUrls[i]) missing.push(i)
  }
  if (missing.length) {
    console.error(`❌ Missing frames for shots: ${missing.join(", ")}`)
    process.exit(1)
  }
  
  // Build the new shots array
  const newShots = SHOTS.map(s => ({
    ...s,
    renderedImageUrl: frameUrls[s.no],
    renderedVideoUrl: undefined,
    motionStatus: "idle",
    orchestration: ORCH[s.no],
  }))
  
  // Fetch current production
  const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/tts_productions?id=eq.${PROD_ID}`, {
    headers: {
      "apikey": ANON,
      "Authorization": `Bearer ${SERVICE}`,
    },
  })
  const [production] = await fetchRes.json()
  if (!production) {
    console.error("Production not found!")
    process.exit(1)
  }
  
  console.log(`\nCurrent production: ${production.title}`)
  console.log(`Current shots: ${production.film?.shots?.length || 0}`)
  
  // Update film.shots
  const updatedFilm = {
    ...production.film,
    shots: newShots,
  }
  
  // Patch the production
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/tts_productions?id=eq.${PROD_ID}`, {
    method: "PATCH",
    headers: {
      "apikey": ANON,
      "Authorization": `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      film: updatedFilm,
      updated_at: new Date().toISOString(),
    }),
  })
  
  const [updated] = await patchRes.json()
  if (updated) {
    console.log(`\n✅ Production updated!`)
    console.log(`   Shots: ${updated.film.shots.length}`)
    console.log(`   Frames with images: ${updated.film.shots.filter(s => s.renderedImageUrl).length}`)
  } else {
    console.error("❌ Update failed:", patchRes.status, await patchRes.text())
  }
}

main().catch(err => { console.error("Fatal:", err); process.exit(1) })
