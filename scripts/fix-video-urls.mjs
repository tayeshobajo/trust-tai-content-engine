#!/usr/bin/env node
/**
 * fix-video-urls.mjs — v2
 * Uses @supabase/supabase-js for uploads (handles large files properly).
 */
import { readFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://kjznbpsvffiysavovgfo.supabase.co"
const PROD_ID = "prod-pilot-city-001"

const env = readFileSync(process.env.HOME + "/Developer/trust-tai-content-engine/.env.local", "utf8")
function envVal(key) {
  const m = env.match(new RegExp(key + "=(.+)$", "m"))
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : ""
}
const SERVICE = envVal("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL, SERVICE, {
  auth: { persistSession: false },
  global: { headers: { "x-client-info": "video-fix-script" } },
})

async function main() {
  // Fetch production
  const { data: rows, error: fetchErr } = await supabase
    .from("tts_productions")
    .select("film")
    .eq("id", PROD_ID)

  if (fetchErr || !rows?.length) {
    console.error("Failed to fetch production:", fetchErr)
    process.exit(1)
  }

  const film = rows[0].film
  let changed = false

  for (const shot of film.shots) {
    const url = shot.renderedVideoUrl
    if (!url || !url.includes("fal.media")) continue

    console.log(`\nShot ${shot.no}: downloading from fal.media...`)
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`  ❌ Download failed: ${res.status}`)
      continue
    }
    const arrayBuf = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    console.log(`  Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)} MB`)

    const fileName = `shot-${shot.no}.mp4`
    const filePath = `${PROD_ID}/${fileName}`

    const { error: uploadErr } = await supabase
      .storage
      .from("rendered-videos")
      .upload(filePath, buffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadErr) {
      console.error(`  ❌ Upload failed:`, uploadErr.message)
      continue
    }

    const { data: urlData } = supabase
      .storage
      .from("rendered-videos")
      .getPublicUrl(filePath)

    const permanentUrl = urlData.publicUrl
    console.log(`  ✅ Uploaded to Supabase`)
    shot.renderedVideoUrl = permanentUrl
    changed = true
  }

  if (changed) {
    const { error: patchErr } = await supabase
      .from("tts_productions")
      .update({ film, updated_at: new Date().toISOString() })
      .eq("id", PROD_ID)

    if (!patchErr) {
      console.log("\n✅ Production updated — all video URLs now permanent on Supabase")
    } else {
      console.error(`\n❌ Production update failed:`, patchErr.message)
    }
  } else {
    console.log("\nNo changes needed.")
  }
}

main().catch(err => { console.error("Fatal:", err); process.exit(1) })
