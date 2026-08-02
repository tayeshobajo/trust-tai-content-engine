"use client"

import Shell from "@/components/Shell"
import { Plus, TrendingUp, MessageSquare, ThumbsUp, Eye } from "lucide-react"

export default function SignalsPage() {
  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F1EA" }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: "#DDD8CE" }}
        >
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8A8578" }}>
            Signals
          </p>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90"
            style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
          >
            <Plus className="w-3 h-3" /> Log signal
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="font-serif mb-2" style={{ fontSize: "36px", color: "#1A2332", fontWeight: 400 }}>
            Signals
          </h1>
          <p className="text-[13px] mb-8" style={{ color: "#4A5568" }}>
            What audiences respond to, translated into better creative decisions. Engagement informs — never dictates.
          </p>

          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Published", value: "0", icon: Eye },
              { label: "Total reach", value: "—", icon: TrendingUp },
              { label: "Meaningful comments", value: "0", icon: MessageSquare },
              { label: "Saves / shares", value: "0", icon: ThumbsUp },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-lg border p-4"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
              >
                <Icon className="w-3.5 h-3.5 mb-2" style={{ color: "#8A8578" }} />
                <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "#8A8578" }}>
                  {label}
                </p>
                <p className="font-serif text-2xl" style={{ color: "#1A2332" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Placeholder */}
          <div className="py-16 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ backgroundColor: "rgba(47,98,216,0.06)" }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: "#2F62D8" }} />
            </div>
            <h3 className="font-serif mb-2" style={{ fontSize: "22px", color: "#1A2332", fontWeight: 400 }}>
              No signals logged yet.
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto leading-relaxed" style={{ color: "#4A5568" }}>
              After you publish a package, log comments, saves, and audience responses here. The Studio will surface patterns and recommend follow-up content.
            </p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              <Plus className="w-4 h-4" /> Log a signal
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
