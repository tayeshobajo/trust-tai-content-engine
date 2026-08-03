"use client"

import { useState } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import { PROPS } from "@/data/props"
import type { PropCategory } from "@/data/props"
import {
  ArrowLeft, Plus, Bell, Search, Package, ChevronRight, MoreHorizontal,
} from "lucide-react"

const C = {
  cream: "#F4F1EA", white: "#FFFFFF", navy: "#1A2332", navyDeep: "#0D1626",
  gold: "#C29A5B", blue: "#2F62D8", textDark: "#1A2332", textMid: "#4A5568",
  textMuted: "#8A8578", border: "#DDD8CE", borderLight: "#EAE6DF", green: "#22A06B",
}

const CAT_COLORS: Record<PropCategory, string> = {
  Container: C.gold,
  Instrument: C.blue,
  Document: "#7C6CC4",
  Clothing: "#E8802A",
  Tool: C.green,
  Structural: C.textMuted,
  Symbol: C.navy,
}

const FILTERS: ("All" | PropCategory)[] = [
  "All", "Container", "Instrument", "Document", "Clothing", "Tool", "Structural", "Symbol",
]

export default function PropsPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | PropCategory>("All")
  const [search, setSearch] = useState("")

  const filtered = PROPS.filter((p) => {
    if (activeFilter !== "All" && p.category !== activeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.symbolMeaning.toLowerCase().includes(q)
    }
    return true
  })

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
            <button className="relative">
              <Bell className="w-4 h-4" style={{ color: C.textMuted }} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: C.gold }}>3</span>
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded hover:opacity-90" style={{ backgroundColor: C.navy, color: "#fff" }}>
              <Plus className="w-3 h-3" /> New prop
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          <div className="flex items-start justify-between gap-4 pt-6 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>Props & Symbols</h1>
                <Package className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>Every recurring prop documented. Size, material, hand, position — tracked across scenes.</p>
            </div>
            <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>{PROPS.length} props</span>
          </div>

          <div className="relative rounded-xl overflow-hidden mb-6" style={{ height: 110, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 80% 40%, ${C.gold}15, transparent 60%)` }} />
            <div className="relative h-full flex flex-col justify-center px-8">
              <h2 className="font-serif text-white mb-1" style={{ fontSize: "20px", fontWeight: 400 }}>A symbol must serve its meaning or be removed.</h2>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>Continuity, canonical meaning, and prior usage tracked for every prop in the world.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-5">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f
              const count = f === "All" ? PROPS.length : PROPS.filter((p) => p.category === f).length
              if (count === 0 && f !== "All") return null
              return (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: isActive ? C.navy : C.white, color: isActive ? "#fff" : C.textMid, border: `1px solid ${isActive ? C.navy : C.border}` }}>
                  {f} <span className="text-[8px] opacity-60">{count}</span>
                </button>
              )
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: C.border, backgroundColor: C.white }}>
              <Search className="w-3 h-3" style={{ color: C.textMuted }} />
              <input type="text" placeholder="Search props…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="text-[10px] bg-transparent outline-none w-32" style={{ color: C.textDark }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((prop) => {
              const catColor = CAT_COLORS[prop.category] || C.textMuted
              return (
                <div key={prop.id} className="rounded-xl border overflow-hidden flex flex-col transition-all hover:shadow-md group cursor-pointer" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <div className="relative h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${catColor}15, ${C.navy}06)` }}>
                    <Package className="w-8 h-8" style={{ color: `${catColor}30` }} />
                    <div className="absolute top-2 left-2">
                      <span className="text-[8px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catColor}E6`, color: "#fff" }}>{prop.category}</span>
                    </div>
                    <button className="absolute top-2 right-2">
                      <MoreHorizontal className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                    </button>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-serif text-[14px] leading-tight mb-1" style={{ color: C.textDark }}>{prop.name}</h3>
                    <p className="text-[10px] leading-snug mb-1.5 line-clamp-2" style={{ color: C.textMid }}>{prop.symbolMeaning}</p>
                    <p className="text-[9px] mb-2" style={{ color: C.textMuted }}>Condition: {prop.condition.substring(0, 50)}</p>
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {prop.material.slice(0, 3).map((m) => (
                        <span key={m} className="text-[8px] font-medium px-1.5 py-0.5 rounded border" style={{ borderColor: C.border, color: C.textMuted }}>{m}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: C.borderLight }}>
                      <span className="text-[8px]" style={{ color: C.textMuted }}>{prop.symbolName ? `Symbol: ${prop.symbolName}` : "No symbol link"}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.textDark }}>
                        Open <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <button className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 hover:bg-black/[0.02]" style={{ borderColor: C.border }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.borderLight }}>
                <Plus className="w-4 h-4" style={{ color: C.textMuted }} />
              </div>
              <p className="text-[12px] font-semibold" style={{ color: C.textMid }}>Add a new prop</p>
              <p className="text-[10px] text-center max-w-xs" style={{ color: C.textMuted }}>Props and symbols are added as the script requires. Each needs a visual reference and continuity documentation.</p>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
