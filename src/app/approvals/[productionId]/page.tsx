"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Shell from "@/components/Shell"
import GateRail from "@/components/GateRail"
import {
  assembleArgument,
  type ArgumentSection,
  type Production,
} from "@/data/studio"
import { nextGate } from "@/data/studio"
import { getProduction, setGate, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { checkVoice } from "@/lib/studio-engine"
import {
  ArrowRight,
  Check,
  AlertTriangle,
  MoreHorizontal,
  MessageSquare,
  Columns2,
} from "lucide-react"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function wordCount(sections: ArgumentSection[]): number {
  return sections.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0)
}

function readTime(words: number): string {
  const min = Math.ceil(words / 200)
  return `${min} min read`
}

function lastEdited(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min === 1) return "1 min ago"
  if (min < 60) return `${min} min ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Post structure: map section names to short labels
const STRUCTURE_LABELS: Record<string, string> = {
  "Pattern interrupt": "Opening",
  "Concrete scene": "Visual scene",
  "Hidden problem": "Hidden problem",
  "Overview perspective": "Founder parallel",
  "Roadmap principle": "Roadmap principle",
  "Practical implication": "Practical value",
  "Calm closing thought": "Closing",
  "Invitation": "Invitation",
}

// Sections that must pass voice check to get a checkmark
function sectionHasWarning(section: ArgumentSection): boolean {
  const warnings = checkVoice(section.text)
  return warnings.length > 0
}

type RightTab = "why" | "voice" | "source"

// ─── Why it works panel ────────────────────────────────────────────────────────

function WhyItWorks({ production, selectedSection }: { production: Production; selectedSection: ArgumentSection | null }) {
  const voiceWarnings = checkVoice(assembleArgument(production.sections))

  return (
    <div className="space-y-5">
      {/* Selected passage */}
      {selectedSection ? (
        <div>
          <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>
            Selected passage
          </p>
          <blockquote
            className="font-serif leading-snug mb-4"
            style={{ fontSize: "18px", color: "#1A2332", fontWeight: 400 }}
          >
            &ldquo;{selectedSection.text.slice(0, 120)}{selectedSection.text.length > 120 ? "..." : ""}&rdquo;
          </blockquote>
          <div className="space-y-2">
            {[
              { label: "Role", value: selectedSection.rationale.split(".")[0] + "." },
              { label: "Supports", value: "The content spine" },
              { label: "Audience shift", value: `From ${production.shift.beginning.slice(0, 40).toLowerCase()}...` },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-[9px] font-bold tracking-[0.1em] uppercase w-24 flex-shrink-0 pt-0.5" style={{ color: "#8A8578" }}>
                  {label}
                </span>
                <span className="text-xs leading-snug" style={{ color: "#4A5568" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>
            Select a passage
          </p>
          <p className="text-xs" style={{ color: "#8A8578" }}>
            Click any section in the post to see why it exists and what it does.
          </p>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #EAE6DF" }} />

      {/* Post structure */}
      <div>
        <p className="text-[13px] font-semibold mb-3" style={{ color: "#1A2332" }}>
          Post structure
        </p>
        <div className="space-y-0">
          {production.sections.map((s) => {
            const label = STRUCTURE_LABELS[s.name] ?? s.name
            const hasWarn = sectionHasWarning(s)
            return (
              <div
                key={s.name}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid #F5F2EC" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-px h-3 flex-shrink-0" style={{ backgroundColor: "#DDD8CE" }} />
                  <span className="text-xs" style={{ color: "#4A5568" }}>{label}</span>
                </div>
                {hasWarn ? (
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#C29A5B" }} />
                ) : (
                  <Check className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Weak closing warning */}
        {production.sections.some((s) => s.name === "Calm closing thought" && sectionHasWarning(s)) && (
          <div
            className="flex items-start gap-2 p-3 rounded-sm mt-3"
            style={{ backgroundColor: "rgba(194,154,91,0.08)", border: "1px solid rgba(194,154,91,0.25)" }}
          >
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#C29A5B" }} />
            <div>
              <p className="text-[11px] leading-snug" style={{ color: "#7A5A20" }}>
                The ending is clear, but it could leave a stronger final image.
              </p>
              <button className="text-[11px] font-medium underline mt-0.5" style={{ color: "#2F62D8" }}>
                Review ending
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #EAE6DF" }} />

      {/* Voice standard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold" style={{ color: "#1A2332" }}>Voice standard</p>
          <span className="text-[11px]" style={{ color: "#8A8578" }}>
            {Math.max(0, 8 - voiceWarnings.length)} checks passed
          </span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "No em dashes", check: (w: typeof voiceWarnings) => !w.some((x) => x.rule === "No em dashes") },
            { label: "No consulting cliches", check: (w: typeof voiceWarnings) => !w.some((x) => x.rule === "No empty consulting phrases") },
            { label: "Sentence length", check: (w: typeof voiceWarnings) => !w.some((x) => x.rule === "Short sentences carry the cadence"), warning: true },
            { label: "No pressure CTA", check: (w: typeof voiceWarnings) => !w.some((x) => x.rule === "No pressure CTA") },
          ].map(({ label, check, warning }) => {
            const passed = check(voiceWarnings)
            return (
              <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F5F2EC" }}>
                <span className="text-xs" style={{ color: "#4A5568" }}>{label}</span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: passed ? "#16A34A" : warning ? "#C29A5B" : "#DC2626" }}
                >
                  {passed ? "Passed" : warning ? "1 warning" : "Failed"}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Voice check panel ─────────────────────────────────────────────────────────

function VoiceCheckPanel({ production }: { production: Production }) {
  const warnings = checkVoice(assembleArgument(production.sections))
  return (
    <div>
      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 py-4">
          <Check className="w-4 h-4" style={{ color: "#16A34A" }} />
          <p className="text-sm" style={{ color: "#4A5568" }}>No voice rule violations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warnings.map((w, i) => (
            <div key={i} className="p-3 rounded-sm" style={{ backgroundColor: "rgba(194,154,91,0.08)", border: "1px solid rgba(194,154,91,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#A07A30" }}>{w.rule}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#7A5A20" }}>{w.detail}</p>
            </div>
          ))}
          <p className="text-[11px] pt-2" style={{ color: "#8A8578" }}>
            Warnings do not block approval. They flag where the post may read as generic or over-produced.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Source panel ──────────────────────────────────────────────────────────────

function SourcePanel({ production }: { production: Production }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>Approved truth</p>
        <p className="text-sm leading-relaxed" style={{ color: "#1A2332" }}>{production.spine.rememberSentence}</p>
      </div>
      <div style={{ borderTop: "1px solid #EAE6DF" }} />
      <div>
        <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>Original thought</p>
        <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>{production.sourceThought}</p>
      </div>
      <div style={{ borderTop: "1px solid #EAE6DF" }} />
      <div>
        <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8578" }}>Content spine</p>
        <div className="space-y-2">
          {[
            { label: "What happened", value: production.spine.whatHappened },
            { label: "The deeper truth", value: production.spine.deeperTruth },
            { label: "Remember sentence", value: production.spine.rememberSentence },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#C29A5B" }}>{label}</p>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#4A5568" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main workspace ────────────────────────────────────────────────────────────

export default function ApprovalDeskWorkspace() {
  const router = useRouter()
  const params = useParams()
  const productionId = params.productionId as string

  const [production, setProduction] = useState<Production | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [rightTab, setRightTab] = useState<RightTab>("why")
  const [selectedSection, setSelectedSection] = useState<ArgumentSection | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = () => { setProduction(getProduction(productionId) ?? null); setLoaded(true) }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [productionId])

  if (loaded && !production) {
    return (
      <Shell>
        <div className="px-8 py-12">
          <p className="text-sm" style={{ color: "#8A8578" }}>Production not found.</p>
          <button onClick={() => router.push("/approvals")} className="text-xs underline mt-2" style={{ color: "#2F62D8" }}>Back to Approval Desk</button>
        </div>
      </Shell>
    )
  }

  if (!production) return <Shell><div className="px-8 py-12" /></Shell>

  const gate = nextGate(production)
  const isPostGate = gate === "post"
  const postAlreadyApproved = production.gates.post.status === "approved"
  const wc = wordCount(production.sections)
  const voiceWarnings = checkVoice(assembleArgument(production.sections))
  const voiceWarnCount = voiceWarnings.length

  function handleApprove() {
    if (!isPostGate || saving) return
    setSaving(true)
    const updated = setGate(production!.id, "post", "approved")
    if (updated) setProduction(updated)
    setSaving(false)
    router.push(`/film-studio/${production!.id}`)
  }

  function handleHold() {
    const updated = setGate(production!.id, "post", "hold")
    if (updated) setProduction(updated)
  }

  return (
    <Shell>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F4F1EA" }}>

        {/* ── Breadcrumb + meta bar ── */}
        <div
          className="flex items-center justify-between px-8 py-[10px] border-b"
          style={{ borderColor: "#DDD8CE" }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase">
            <button onClick={() => router.push("/approvals")} className="hover:underline" style={{ color: "#8A8578" }}>
              Approval Desk
            </button>
            <span style={{ color: "#C0BAB0" }}>/</span>
            <span style={{ color: "#1A2332" }}>Post Review</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1 rounded hover:bg-black/5 transition-colors" aria-label="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8578" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <span className="text-[11px]" style={{ color: "#8A8578" }}>Saved just now</span>
            <button className="p-1 rounded hover:bg-black/5 transition-colors">
              <MoreHorizontal className="w-4 h-4" style={{ color: "#8A8578" }} />
            </button>
          </div>
        </div>

        {/* ── Title + subtitle + gate rail ── */}
        <div className="px-8 pt-6 pb-5 border-b" style={{ borderColor: "#DDD8CE" }}>
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="min-w-0">
              <h1
                className="font-serif leading-tight mb-1"
                style={{ fontSize: "38px", color: "#1A2332", fontWeight: 400, letterSpacing: "-0.01em" }}
              >
                {production.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[13px]" style={{ color: "#8A8578" }}>
                  {postAlreadyApproved
                    ? "Post approved. Moving to visual concept development."
                    : "The truth is approved. Now make sure the writing carries it."}
                </p>
                <span className="text-[11px]" style={{ color: "#C0BAB0" }}>
                  Version 1 · {wc} words · {readTime(wc)}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-right" style={{ color: "#8A8578" }}>Gate 2 of 5</p>
            </div>
          </div>
          <GateRail production={production} />
        </div>

        {/* ── Two-panel workspace ── */}
        <div className="flex flex-1 min-h-0 pb-20">

          {/* Left: Post editor */}
          <div className="flex-1 min-w-0 flex flex-col overflow-y-auto" style={{ borderRight: "1px solid #DDD8CE" }}>
            <div className="px-8 pt-5">

              {/* Editor header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold" style={{ color: "#1A2332" }}>LinkedIn post</p>
                <div className="flex items-center gap-1">
                  {(["Edit", "Preview"] as const).map((tab) => {
                    const isActive = (tab === "Preview") === previewMode
                    return (
                      <button
                        key={tab}
                        onClick={() => setPreviewMode(tab === "Preview")}
                        className="text-xs font-medium px-3 py-1 rounded-sm transition-colors"
                        style={{
                          color: isActive ? "#2F62D8" : "#8A8578",
                          borderBottom: isActive ? "2px solid #2F62D8" : "2px solid transparent",
                        }}
                      >
                        {tab}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Post canvas */}
              <div
                className="rounded-sm overflow-hidden mb-3"
                style={{ border: "1px solid #DDD8CE", backgroundColor: "#FFFFFF" }}
              >
                <div className="px-6 py-5 space-y-4 min-h-[420px]">
                  {previewMode ? (
                    // Preview: assembled full post
                    <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#1A2332" }}>
                      {assembleArgument(production.sections)}
                    </div>
                  ) : (
                    // Edit: sections with click-to-select
                    production.sections.map((s) => {
                      const isSelected = selectedSection?.name === s.name
                      return (
                        <div
                          key={s.name}
                          className="relative group cursor-pointer"
                          onClick={() => {
                            setSelectedSection(isSelected ? null : s)
                            setRightTab("why")
                          }}
                        >
                          {/* Blue left border on selected */}
                          {isSelected && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                              style={{ backgroundColor: "#2F62D8", left: "-16px" }}
                            />
                          )}
                          <p
                            className="text-sm leading-relaxed whitespace-pre-line transition-colors"
                            style={{
                              color: "#1A2332",
                              backgroundColor: isSelected ? "rgba(47,98,216,0.04)" : "transparent",
                              borderRadius: 3,
                              padding: isSelected ? "2px 4px" : undefined,
                            }}
                          >
                            {s.text}
                          </p>

                          {/* Inline action chips on selected */}
                          {isSelected && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <button
                                className="text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors hover:bg-black/5"
                                style={{ border: "1px solid #DDD8CE", color: "#4A5568", backgroundColor: "#FFFFFF" }}
                              >
                                Strengthen
                              </button>
                              <button
                                className="text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors hover:bg-black/5"
                                style={{ border: "1px solid #DDD8CE", color: "#4A5568", backgroundColor: "#FFFFFF" }}
                              >
                                More concrete
                              </button>
                              <button
                                className="p-1.5 rounded-sm transition-colors hover:bg-black/5"
                                style={{ border: "1px solid #DDD8CE", color: "#8A8578", backgroundColor: "#FFFFFF" }}
                                aria-label="Add comment"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between px-6 py-2.5 border-t"
                  style={{ borderColor: "#EAE6DF" }}
                >
                  <span className="text-[11px]" style={{ color: "#C0BAB0" }}>{wc} words</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: "#C0BAB0" }}>
                      Last edited {lastEdited(production.updatedAt)}
                    </span>
                    <button
                      className="p-1 rounded hover:bg-black/5 transition-colors"
                      onClick={() => setPreviewMode(!previewMode)}
                      aria-label="Toggle split view"
                    >
                      <Columns2 className="w-3.5 h-3.5" style={{ color: "#C0BAB0" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Review panel */}
          <div className="w-[340px] flex-shrink-0 overflow-y-auto">
            <div className="px-6 pt-5">

              {/* Tabs */}
              <div className="flex items-center gap-0 mb-5 border-b" style={{ borderColor: "#EAE6DF" }}>
                {([
                  { key: "why" as RightTab, label: "Why it works", badge: undefined as number | undefined },
                  { key: "voice" as RightTab, label: "Voice check", badge: voiceWarnCount as number | undefined },
                  { key: "source" as RightTab, label: "Source", badge: undefined as number | undefined },
                ]).map(({ key, label, badge }) => {
                  const isActive = rightTab === key
                  return (
                    <button
                      key={key}
                      onClick={() => setRightTab(key)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 transition-colors"
                      style={{
                        color: isActive ? "#2F62D8" : "#8A8578",
                        borderBottom: isActive ? "2px solid #2F62D8" : "2px solid transparent",
                        marginBottom: -1,
                      }}
                    >
                      {label}
                      {badge !== undefined && badge > 0 && (
                        <span
                          className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#C29A5B", color: "#FFFFFF" }}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              {rightTab === "why" && <WhyItWorks production={production} selectedSection={selectedSection} />}
              {rightTab === "voice" && <VoiceCheckPanel production={production} />}
              {rightTab === "source" && <SourcePanel production={production} />}
            </div>
          </div>
        </div>

        {/* ── Sticky Post Gate bar ── */}
        <div
          className="fixed bottom-0 right-0 border-t px-8 py-4 flex items-center justify-between gap-6 z-20"
          style={{ left: 140, backgroundColor: "#FFFFFF", borderColor: "#DDD8CE" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#C29A5B" }} />
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "#C29A5B" }}>Post Gate</p>
              <p className="text-xs" style={{ color: "#1A2332" }}>Is the written argument ready?</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-[11px] hidden lg:block" style={{ color: "#8A8578" }}>
              Approval opens visual concept development in Film Studio.
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
              Request revision
            </button>
            <button
              onClick={handleApprove}
              disabled={!isPostGate || saving}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#1A2332", color: "#FFFFFF" }}
            >
              Approve post
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
