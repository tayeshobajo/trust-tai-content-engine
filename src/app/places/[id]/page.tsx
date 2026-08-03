"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Shell from "@/components/Shell"
import { getPlace, PLACES } from "@/data/places"
import {
  ArrowLeft, ChevronLeft, ChevronRight, Bell, Plus, MapPin,
  MoreHorizontal, Sun, XCircle, StickyNote,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6DF", green: "#22A06B",
  red: "#DC2626",
}

const TYPE_COLORS: Record<string, string> = {
  "Outdoor — Urban": C.gold, "Outdoor — Natural": C.green, "Indoor — Domestic": C.blue,
  "Indoor — Commercial": "#E8802A", "Indoor — Industrial": "#7C6CC4", "Abstract / Symbolic": C.textMuted,
}

const TABS = ["Overview", "Spatial Anchors", "Lighting", "Forbidden Changes", "Notes"] as const

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const place = getPlace(params.id as string)
  if (!place) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
          <div className="text-center">
            <p className="font-serif text-2xl mb-2" style={{ color: C.textDark }}>Place not found</p>
            <Link href="/places" className="text-[12px] font-semibold hover:underline" style={{ color: C.blue }}>← Back to all places</Link>
          </div>
        </div>
      </Shell>
    )
  }

  const idx = PLACES.findIndex((p) => p.id === place.id)
  const prev = idx > 0 ? PLACES[idx - 1] : null
  const next = idx < PLACES.length - 1 ? PLACES[idx + 1] : null
  const typeColor = TYPE_COLORS[place.type] || C.textMuted

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <Link href="/" className="flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: C.textMuted }}>
            <ArrowLeft className="w-3 h-3" /> Studio
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border" style={{ borderColor: C.border, color: C.textMid }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green }} /> Studio activity
            </span>
            <button className="relative"><Bell className="w-4 h-4" style={{ color: C.textMuted }} /></button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded hover:opacity-90" style={{ backgroundColor: C.navy, color: "#fff" }}>
              <Plus className="w-3 h-3" /> Bring a post
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/places" className="flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: C.textMuted }}>
              <ArrowLeft className="w-3 h-3" /> Back to all places
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => prev && router.push(`/places/${prev.id}`)} disabled={!prev} className="p-1 rounded disabled:opacity-30 hover:bg-black/5">
                <ChevronLeft className="w-4 h-4" style={{ color: C.textMid }} />
              </button>
              <span className="text-[11px] font-medium" style={{ color: C.textDark }}>{idx + 1} of {PLACES.length}</span>
              <button onClick={() => next && router.push(`/places/${next.id}`)} disabled={!next} className="p-1 rounded disabled:opacity-30 hover:bg-black/5">
                <ChevronRight className="w-4 h-4" style={{ color: C.textMid }} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(194,154,91,0.1)" }}>
              <MapPin className="w-5 h-5" style={{ color: C.gold }} />
            </div>
            <div>
              <h1 className="font-serif" style={{ fontSize: "30px", color: C.textDark, fontWeight: 400 }}>Place Detail</h1>
              <p className="text-[12px]" style={{ color: C.textMid }}>Master reference for this location. Locked for production use.</p>
            </div>
          </div>

          {/* Hero card */}
          <div className="rounded-xl border overflow-hidden mb-5" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-[200px] h-40 md:h-auto flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}>
                <MapPin className="w-12 h-12" style={{ color: "rgba(255,255,255,0.15)" }} />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: `${typeColor}F0`, color: "#fff" }}>{place.type}</span>
                </div>
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-serif mb-1" style={{ fontSize: "24px", color: C.textDark, fontWeight: 400 }}>{place.name}</h2>
                    <p className="font-serif italic text-[12px]" style={{ color: C.textMid }}>{place.masterRefDescription}</p>
                  </div>
                  <button className="p-1.5 rounded-lg border hover:bg-black/5" style={{ borderColor: C.border }}>
                    <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                  <Attr label="Scale" value={place.scale} />
                  <Attr label="Time of Day" value={place.timeOfDay} />
                  <Attr label="Weather" value={place.weather} />
                  <Attr label="Appearances" value={`${place.appearances} scenes`} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b pb-2 mb-5 overflow-x-auto" style={{ borderColor: C.borderLight }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className="text-[12px] font-semibold transition-colors relative whitespace-nowrap"
                style={{ color: activeTab === i ? C.navy : C.textMuted }}>
                {tab}
                {activeTab === i && <div className="absolute bottom-[-8px] left-0 right-0 h-0.5" style={{ backgroundColor: C.gold }} />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            <div className="space-y-5">
              {activeTab === 0 && (
                <Card label="Overview" subtitle="Core location documentation.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><p className="text-[9px] font-bold tracking-[0.08em] uppercase mb-1" style={{ color: C.textMuted }}>Architecture</p><p className="text-[11px]" style={{ color: C.textMid }}>{place.architecture}</p></div>
                    <div><p className="text-[9px] font-bold tracking-[0.08em] uppercase mb-1" style={{ color: C.textMuted }}>Layout</p><p className="text-[11px]" style={{ color: C.textMid }}>{place.layout}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: C.borderLight }}>
                    <p className="text-[9px] font-bold tracking-[0.08em] uppercase mb-2" style={{ color: C.textMuted }}>Materials</p>
                    <div className="flex flex-wrap gap-1.5">
                      {place.materials.map((m) => (
                        <span key={m} className="text-[9px] font-medium px-2 py-0.5 rounded-full border" style={{ borderColor: C.border, color: C.textMid }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
              {activeTab === 1 && (
                <Card label="Spatial Anchors" subtitle="Fixed reference points that must remain consistent across frames.">
                  <div className="space-y-4">
                    {Object.entries(place.spatialAnchors).filter(([, v]) => v).map(([key, value]) => (
                      <div key={key} className="border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: C.borderLight }}>
                        <p className="text-[9px] font-bold tracking-[0.08em] uppercase mb-1 capitalize" style={{ color: C.textMuted }}>{key}</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {activeTab === 2 && (
                <Card label="Lighting" subtitle="Documented light sources for consistent rendering.">
                  <div className="space-y-4">
                    {place.lighting.map((l, i) => (
                      <div key={i} className="rounded-lg border p-3" style={{ borderColor: C.borderLight }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-3.5 h-3.5" style={{ color: C.gold }} />
                          <p className="text-[11px] font-semibold" style={{ color: C.textDark }}>{l.source}</p>
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "rgba(194,154,91,0.1)", color: C.gold }}>{l.timeOfDay}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Attr label="Direction" value={l.direction} />
                          <Attr label="Quality" value={l.quality} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {activeTab === 3 && (
                <Card label="Forbidden Changes" subtitle="These never change across frames or productions.">
                  <div className="space-y-2">
                    {place.forbiddenChanges.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.red }} />
                        <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{f}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {activeTab === 4 && (
                <Card label="Notes" subtitle="Production and director notes.">
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: C.borderLight }}>
                    <StickyNote className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>{place.productionNotes}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Right rail */}
            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <p className="text-[10px] font-bold tracking-[0.08em] uppercase mb-2" style={{ color: C.textMuted }}>Emotional Purpose</p>
                <p className="font-serif italic text-[12px] leading-relaxed" style={{ color: C.textDark }}>{place.emotionalPurpose}</p>
              </div>
              {place.worldLawConnection && (
                <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <p className="text-[10px] font-bold tracking-[0.08em] uppercase mb-2" style={{ color: C.textMuted }}>World Law Connection</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>{place.worldLawConnection}</p>
                </div>
              )}
              {place.symbolConnection && (
                <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <p className="text-[10px] font-bold tracking-[0.08em] uppercase mb-2" style={{ color: C.textMuted }}>Symbol Connection</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>{place.symbolConnection}</p>
                </div>
              )}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <p className="text-[10px] font-bold tracking-[0.08em] uppercase mb-2" style={{ color: C.textMuted }}>Meta</p>
                <div className="space-y-1.5">
                  <Attr label="Created" value={place.createdDate} />
                  <Attr label="Updated" value={place.updatedDate} />
                  <Attr label="Appearances" value={`${place.appearances} scenes`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Attr({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.08em] uppercase" style={{ color: "#8A8578" }}>{label}</p>
      <p className="text-[11px] mt-0.5" style={{ color: "#1A2332" }}>{value}</p>
    </div>
  )
}

function Card({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "#FFFFFF", borderColor: "#EAE6DF" }}>
      <h3 className="font-serif text-[16px] mb-0.5" style={{ color: "#1A2332" }}>{label}</h3>
      {subtitle && <p className="text-[10px] mb-4" style={{ color: "#8A8578" }}>{subtitle}</p>}
      {children}
    </div>
  )
}
