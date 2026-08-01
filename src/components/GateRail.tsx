"use client"

import { Lock } from "lucide-react"
import { GATE_ORDER, GATE_SHORT_LABELS, type Production } from "@/data/studio"
import { nextGate } from "@/data/studio"

interface GateRailProps {
  production: Production
}

export default function GateRail({ production }: GateRailProps) {
  const current = nextGate(production)

  return (
    <div className="flex items-center gap-0">
      {GATE_ORDER.map((key, i) => {
        const isApproved = production.gates[key].status === "approved"
        const isCurrent = key === current
        const isLocked = !isApproved && !isCurrent
        const label = GATE_SHORT_LABELS[key]
        const num = i + 1

        return (
          <div key={key} className="flex items-center">
            {/* Connector line */}
            {i > 0 && (
              <div
                className="w-6 h-px flex-shrink-0"
                style={{ backgroundColor: isApproved ? "#2F62D8" : "#DDD8CE" }}
              />
            )}

            {/* Gate node */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: isApproved
                    ? "#2F62D8"
                    : isCurrent
                    ? "transparent"
                    : "transparent",
                  border: isApproved
                    ? "none"
                    : isCurrent
                    ? "1.5px solid #1A2332"
                    : "1.5px solid #DDD8CE",
                }}
              >
                {isLocked ? (
                  <Lock
                    className="w-3 h-3"
                    style={{ color: "#C0BAB0" }}
                  />
                ) : (
                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: isApproved ? "#FFFFFF" : isCurrent ? "#1A2332" : "#C0BAB0",
                    }}
                  >
                    {num}
                  </span>
                )}
              </div>
              <span
                className="text-[9px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap"
                style={{
                  color: isApproved
                    ? "#2F62D8"
                    : isCurrent
                    ? "#1A2332"
                    : "#C0BAB0",
                }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
