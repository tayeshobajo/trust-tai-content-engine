"use client"

import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { Plus, Lightbulb } from "lucide-react"

export default function IdeasPage() {
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
            Ideas
          </p>
          <button
            onClick={() => router.push("/thinking-room/new")}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90"
            style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
          >
            <Plus className="w-3 h-3" /> Capture idea
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="font-serif mb-2" style={{ fontSize: "36px", color: "#1A2332", fontWeight: 400 }}>
            Ideas
          </h1>
          <p className="text-[13px] mb-8" style={{ color: "#4A5568" }}>
            Raw material and intelligent recommendations for what to build next.
          </p>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6">
            {["Recommended", "Captured", "Developing", "Held", "Used", "Archived"].map((tab, i) => (
              <button
                key={tab}
                className="text-[11px] font-medium px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: i === 0 ? "#1A2332" : "transparent",
                  color: i === 0 ? "#FFFFFF" : "#8A8578",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Placeholder state */}
          <div className="py-16 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ backgroundColor: "rgba(47,98,216,0.06)" }}
            >
              <Lightbulb className="w-6 h-6" style={{ color: "#2F62D8" }} />
            </div>
            <h3 className="font-serif mb-2" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
              No ideas captured yet.
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto leading-relaxed" style={{ color: "#4A5568" }}>
              Save a rough thought, a sentence from a conversation, or an audience comment. The Studio will connect it to your World and recommend when to develop it.
            </p>
            <button
              onClick={() => router.push("/thinking-room/new")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              <Plus className="w-4 h-4" /> Capture an idea
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
