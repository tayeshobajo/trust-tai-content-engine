"use client"

import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { Plus, BookOpen, Users, MapPin, Sparkles, Palette, GitBranch, Shield } from "lucide-react"

const WORLD_SECTIONS = [
  { key: "constitution", label: "Constitution", desc: "Non-negotiable principles", icon: Shield },
  { key: "voice", label: "Voice", desc: "Approved traits, patterns, preferences", icon: BookOpen },
  { key: "characters", label: "Characters", desc: "Roster with master appearances", icon: Users },
  { key: "places", label: "Places", desc: "Established environments", icon: MapPin },
  { key: "symbols", label: "Symbols", desc: "Recurring motifs and meanings", icon: Sparkles },
  { key: "visual", label: "Visual Language", desc: "Palette, lighting, composition", icon: Palette },
  { key: "threads", label: "Story Threads", desc: "Ongoing narrative arcs", icon: GitBranch },
  { key: "memory", label: "Memory", desc: "Locked truths and learned preferences", icon: BookOpen },
]

export default function WorldPage() {
  const router = useRouter()

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: "#DDD8CE" }}
        >
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            World
          </p>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90"
            style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
          >
            <Plus className="w-3 h-3" /> Add to World
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="font-serif mb-2" style={{ fontSize: "36px", color: "#1A2332", fontWeight: 400 }}>
            World Bible
          </h1>
          <p className="text-[13px] mb-8" style={{ color: "#4A5568" }}>
            The enduring identity and continuity of the Studio. Everything created pulls from here.
          </p>

          {/* Section grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORLD_SECTIONS.map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                className="flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:shadow-sm"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
              >
                <div
                  className="flex-shrink-0 rounded-md flex items-center justify-center"
                  style={{ width: 36, height: 36, backgroundColor: "rgba(47,98,216,0.06)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#2F62D8" }} />
                </div>
                <div>
                  <p className="font-serif text-sm" style={{ color: "#1A2332" }}>
                    {label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* World Bible link */}
          <div className="mt-8">
            <div
              className="rounded-lg border p-5"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D6" }}
            >
              <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#C29A5B" }}>
                Canonical Document
              </p>
              <p className="font-serif text-base mb-1" style={{ color: "#1A2332" }}>
                WORLD_BIBLE.md v1.0 — The World of Living Roads
              </p>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#4A5568" }}>
                The foundational creative canon governing every frame: foundational declaration, emotional promise, philosophical spine, world laws, symbol system, visual DNA, anti-drift rules, and scene approval test.
              </p>
              <button
                onClick={() => router.push("/world-bible")}
                className="text-[11px] font-semibold hover:underline"
                style={{ color: "#2F62D8" }}
              >
                Open World Bible →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
