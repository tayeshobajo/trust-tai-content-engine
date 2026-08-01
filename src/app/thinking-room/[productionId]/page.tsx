"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Shell from "@/components/Shell"
import GateRail from "@/components/GateRail"
import {
  SPINE_LABELS,
  type ContentSpine,
  type Production,
} from "@/data/studio"
import { nextGate } from "@/data/studio"
import {
  getProduction,
  setGate,
  PRODUCTIONS_CHANGED_EVENT,
} from "@/lib/studio-store"

import {
  Pencil,
  ChevronDown,
  Clock,
  MoreHorizontal,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

// Rows that are structurally significant get a blue accent treatment
const ACCENT_KEYS: (keyof ContentSpine)[] = ["deeperTruth"]
// Rows that may need a warning
const WARNING_KEYS: (keyof ContentSpine)[] = ["roadmapConnection"]

function isWeakValue(val: string): boolean {
  return val.length < 60 || val.includes("TOPIC")
}

// ─── Spine row ─────────────────────────────────────────────────────────────────

function SpineRow({
  index,
  label,
  value,
  isAccent,
  hasWarning,
}: {
  index: number
  label: string
  value: string
  isAccent: boolean
  hasWarning: boolean
}) {
  return (
    <div
      className="flex gap-4 py-4"
      style={{
        borderTop: index === 0 ? "none" : "1px solid #EAE6DF",
        borderLeft: isAccent ? "3px solid #2F62D8" : "3px solid transparent",
        paddingLeft: isAccent ? "16px" : "0",
      }}
    >
      {/* Row number */}
      <span
        className="text-[11px] font-bold flex-shrink-0 mt-0.5 w-5"
        style={{ color: "#C0BAB0" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1"
          style={{ color: "#C29A5B" }}
        >
          {label}
        </p>
        {isAccent ? (
          <p
            className="font-serif leading-snug"
            style={{ fontSize: "17px", color: "#1A2332", fontWeight: 400 }}
          >
            {value}
          </p>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "#1A2332" }}>
            {value}
          </p>
        )}
        {hasWarning && isWeakValue(value) && (
          <div className="flex items-start gap-1.5 mt-2">
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#C29A5B" }} />
            <p className="text-[11px]" style={{ color: "#A07A30" }}>
              Make this more specific before approval
            </p>
          </div>
        )}
      </div>

      {/* Edit icon */}
      <button className="flex-shrink-0 p-1 rounded transition-colors hover:bg-black/5 mt-0.5">
        <Pencil className="w-3 h-3" style={{ color: "#C0BAB0" }} />
      </button>
    </div>
  )
}

// ─── Workspace ─────────────────────────────────────────────────────────────────

export default function ThinkingRoomWorkspace() {
  const router = useRouter()
  const params = useParams()
  const productionId = params.productionId as string

  const [production, setProduction] = useState<Production | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [materialOpen, setMaterialOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState("Saved just now")

  useEffect(() => {
    const load = () => {
      const p = getProduction(productionId)
      setProduction(p ?? null)
      setLoaded(true)
    }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [productionId])

  if (loaded && !production) {
    return (
      <Shell>
        <div className="px-8 py-12">
          <p className="text-sm" style={{ color: "#8A8578" }}>Production not found.</p>
          <button onClick={() => router.push("/thinking-room")} className="text-xs underline mt-2" style={{ color: "#2F62D8" }}>
            Back to Thinking Room
          </button>
        </div>
      </Shell>
    )
  }

  if (!production) return <Shell><div className="px-8 py-12" /></Shell>

  const currentGate = nextGate(production)
  const isTruthGate = currentGate === "truth"
  const voiceWarnings = production.voiceWarnings ?? []

  function handleApprove() {
    if (!isTruthGate) return
    setSaving(true)
    setSaveLabel("Saving...")
    const updated = setGate(production!.id, "truth", "approved")
    if (updated) setProduction(updated)
    setSaveLabel("Saved just now")
    setSaving(false)
    router.push(`/approvals/${production!.id}`)
  }

  function handleHold() {
    const updated = setGate(production!.id, "truth", "hold")
    if (updated) setProduction(updated)
  }

  return (
    <Shell>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#F4F1EA" }}
      >

        {/* ── Breadcrumb + header ── */}
        <div
          className="flex items-center justify-between px-8 py-[10px] border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase">
            <button
              onClick={() => router.push("/thinking-room")}
              className="hover:underline"
              style={{ color: "#8A8578" }}
            >
              Thinking Room
            </button>
            <span style={{ color: "#C0BAB0" }}>/</span>
            <span style={{ color: "#1A2332" }}>Truth Review</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: "#8A8578" }}>
              {saveLabel}
            </span>
            <button className="p-1 rounded hover:bg-black/5 transition-colors">
              <MoreHorizontal className="w-4 h-4" style={{ color: "#8A8578" }} />
            </button>
          </div>
        </div>

        {/* ── Production title + gate rail ── */}
        <div
          className="px-8 pt-6 pb-5 border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <div className="flex items-start justify-between gap-6 mb-5">
            <div className="min-w-0">
              <h1
                className="font-serif leading-tight mb-1"
                style={{ fontSize: "34px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}
              >
                {production.title}
              </h1>
              <p className="text-[13px]" style={{ color: "#8A8578" }}>
                Studio has interpreted the thought. Read what it sees before the writing begins.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "#8A8578" }}>
                Gate 1 of 5
              </p>
            </div>
          </div>

          {/* Gate progress rail */}
          <GateRail production={production} />
        </div>

        {/* ── Two-panel workspace ── */}
        <div className="flex flex-1 min-h-0 pb-24">

          {/* Left panel: Original thought */}
          <div
            className="w-[380px] flex-shrink-0 overflow-y-auto"
            style={{ borderRight: "1px solid #DDD8CE" }}
          >
            <div className="px-6 py-5">
              <h2
                className="font-serif mb-0.5"
                style={{ fontSize: "16px", color: "#1A2332", fontWeight: 400 }}
              >
                Original thought
              </h2>
              <p className="text-[11px] mb-4" style={{ color: "#8A8578" }}>
                {production.sourceType} · {formatDateTime(production.createdAt)}
              </p>

              {/* Text editor display */}
              <div
                className="rounded-sm overflow-hidden mb-4"
                style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
              >
                {/* Toolbar */}
                <div
                  className="flex items-center gap-2.5 px-3 py-2 border-b"
                  style={{ borderColor: "#EAE6DF" }}
                >
                  <span className="text-xs" style={{ color: "#C0BAB0" }}>¶</span>
                  <span className="text-xs font-bold" style={{ color: "#C0BAB0" }}>B</span>
                  <span className="text-xs italic" style={{ color: "#C0BAB0" }}>I</span>
                  <span className="text-xs" style={{ color: "#C0BAB0" }}>—</span>
                  <div className="w-px h-3" style={{ backgroundColor: "#DDD8CE" }} />
                  <span className="text-xs" style={{ color: "#C0BAB0" }}>↗</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm leading-relaxed" style={{ color: "#1A2332" }}>
                    {production.sourceThought}
                  </p>
                </div>
              </div>

              {/* Supporting material */}
              <button
                onClick={() => setMaterialOpen(!materialOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm mb-3 transition-colors hover:bg-black/5"
                style={{ border: "1px solid #DDD8CE", backgroundColor: "#FAFAF8" }}
              >
                <span className="text-xs font-medium" style={{ color: "#8A8578" }}>
                  Supporting material
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#EAE6DF", color: "#8A8578" }}
                  >
                    0
                  </span>
                  <ChevronDown
                    className="w-3 h-3 transition-transform"
                    style={{
                      color: "#C0BAB0",
                      transform: materialOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
              </button>

              {materialOpen && (
                <div
                  className="px-3 py-3 rounded-sm mb-3 text-xs"
                  style={{ backgroundColor: "#F4F1EA", color: "#8A8578" }}
                >
                  No supporting material added yet.
                </div>
              )}

              {/* Edit link */}
              <button className="text-xs font-medium hover:underline" style={{ color: "#2F62D8" }}>
                Edit original thought
              </button>

              {/* Version footer */}
              <div className="flex items-center gap-1.5 mt-5 pt-4" style={{ borderTop: "1px solid #EAE6DF" }}>
                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "#C0BAB0" }} />
                <span className="text-[11px]" style={{ color: "#C0BAB0" }}>
                  Original note · Version 1
                </span>
              </div>

              {/* Voice warnings if any */}
              {voiceWarnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {voiceWarnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-sm"
                      style={{ backgroundColor: "rgba(194,154,91,0.08)", border: "1px solid rgba(194,154,91,0.2)" }}
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#C29A5B" }} />
                      <div>
                        <p className="text-[10px] font-bold" style={{ color: "#A07A30" }}>{w.rule}</p>
                        <p className="text-[10px] leading-snug" style={{ color: "#8A6230" }}>{w.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: What Studio sees */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-8 py-5">
              <h2
                className="font-serif mb-0.5"
                style={{ fontSize: "16px", color: "#1A2332", fontWeight: 400 }}
              >
                What Studio sees
              </h2>
              <p className="text-[11px] mb-5" style={{ color: "#8A8578" }}>
                The content spine
              </p>

              {/* Spine rows */}
              <div
                className="rounded-sm overflow-hidden mb-6"
                style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
              >
                <div className="px-5">
                  {SPINE_LABELS.map(({ key, label }, i) => {
                    const isAccent = ACCENT_KEYS.includes(key)
                    const hasWarning = WARNING_KEYS.includes(key)
                    return (
                      <SpineRow
                        key={key}
                        index={i}
                        label={label.toUpperCase()}
                        value={production.spine[key]}
                        isAccent={isAccent}
                        hasWarning={hasWarning}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Audience shift card */}
              <div
                className="rounded-sm p-5"
                style={{ backgroundColor: "#EDEAE2", border: "1px solid #DDD8CE" }}
              >
                <p
                  className="text-[10px] font-bold tracking-[0.14em] uppercase mb-4"
                  style={{ color: "#8A8578" }}
                >
                  Audience shift
                </p>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2"
                      style={{ color: "#C29A5B" }}
                    >
                      At the beginning
                    </p>
                    <p
                      className="font-serif text-sm leading-snug"
                      style={{ color: "#1A2332", fontWeight: 400 }}
                    >
                      {production.shift.beginning}
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-6">
                    <ArrowRight className="w-4 h-4" style={{ color: "#C0BAB0" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2"
                      style={{ color: "#C29A5B" }}
                    >
                      By the end
                    </p>
                    <p
                      className="font-serif text-sm leading-snug"
                      style={{ color: "#1A2332", fontWeight: 400 }}
                    >
                      {production.shift.end}
                    </p>
                  </div>
                </div>
                {(production.shift.beginning.length < 40 || production.shift.end.length < 40) && (
                  <p className="text-[11px] mt-4 pt-3" style={{ borderTop: "1px solid #DDD8CE", color: "#8A8578" }}>
                    The destination is visible, but the change in understanding is not yet strong enough.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Truth Gate bar ── */}
        <div
          className="fixed bottom-0 right-0 border-t px-8 py-4 flex items-center justify-between gap-6 z-20"
          style={{
            left: 140, // matches sidebar width
            backgroundColor: "#FFFFFF",
            borderColor: "#DDD8CE",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#C29A5B" }}
            />
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "#C29A5B" }}>
                Truth Gate
              </p>
              <p className="text-xs" style={{ color: "#1A2332" }}>
                Is this genuinely what you believe?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-[11px] hidden lg:block" style={{ color: "#8A8578" }}>
              Approval sends this production to the Approval Desk.
            </p>
            <button
              onClick={handleHold}
              className="text-xs font-medium px-3 py-1.5 rounded-sm transition-colors hover:bg-black/5"
              style={{ border: "1px solid #DDD8CE", color: "#8A8578" }}
            >
              Hold
            </button>
            <button
              className="text-xs font-medium px-3 py-1.5 rounded-sm transition-colors hover:bg-black/5"
              style={{ border: "1px solid #1A2332", color: "#1A2332" }}
            >
              Revise interpretation
            </button>
            <button
              onClick={handleApprove}
              disabled={!isTruthGate || saving}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              Approve truth
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
