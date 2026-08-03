"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import {
  Plus,
  Sparkles,
  Mic,
  MessageSquare,
  GitBranch,
  ChevronDown,
  ChevronRight,
  X,
  Brain,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Archive,
  Clock,
  Check,
  PenLine,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  cream: "#F4F1EA",
  white: "#FFFFFF",
  navy: "#1A2332",
  gold: "#C29A5B",
  blue: "#2F62D8",
  textDark: "#1A2332",
  textMid: "#4A5568",
  textMuted: "#8A8578",
  border: "#DDD8CE",
  borderLight: "#EAE6DF",
  green: "#22A06B",
  orange: "#E8802A",
  purple: "#7C3AED",
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type IdeaView = "recommended" | "captured" | "developing" | "held" | "used" | "archived"

interface RecommendedIdea {
  id: string
  title: string
  argument: string
  whyNow: string
  relatedThread: string
  memoriesUsed: string[]
  possibleFilm: string
  overlapRisk: "low" | "medium" | "high"
  overlapNote?: string
}

interface CapturedIdea {
  id: string
  title: string
  rawThought: string
  source: "thought" | "voice" | "comment" | "conversation" | "thread"
  capturedAt: string
  emergingArgument?: string
  contradictions?: string[]
  relatedMemories?: string[]
  possibleConcepts?: string[]
  developmentNotes?: string
  status: IdeaView
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const RECOMMENDED_IDEAS: RecommendedIdea[] = [
  {
    id: "rec-1",
    title: "The Founder Who Became the System",
    argument: "What happens when a founder builds themselves into their company so thoroughly that the company cannot function without them? And what does it cost to become unnecessary?",
    whyNow: "The Man Who Carried a City ended with the child lifting the case. The audience saw the transfer. The next chapter asks: what does the founder do after the weight moves?",
    relatedThread: "The Founder Must Become Unnecessary",
    memoriesUsed: ["Continuity confidence: The Architect character (84%)", "Symbol: the case/container", "Story thread: Founder independence"],
    possibleFilm: "A man plants a tree, then slowly disappears from the frame as others grow to sit in its shade.",
    overlapRisk: "low",
  },
  {
    id: "rec-2",
    title: "What Systems Cannot Hold",
    argument: "Every system is built to hold something. But some things — grief, wonder, love — resist being systematized. What's the cost of trying anyway?",
    whyNow: "The systems-thinking thread has run 4 posts. Audience is primed for the counterweight: the limits of structure.",
    relatedThread: "Hidden Systems / Visible Symptoms",
    memoriesUsed: ["Voice: emotional range — awe is allowed", "Symbol: water/flow", "Story thread: What systems cannot hold"],
    possibleFilm: "A man builds elaborate containers. The last one holds only light, which escapes immediately.",
    overlapRisk: "medium",
    overlapNote: "Some overlap with 'The Hidden Cost of Convenience' — different enough if angle is limit, not cost.",
  },
  {
    id: "rec-3",
    title: "The Client Who Read the Room",
    argument: "Sales isn't persuasion. It's recognition — reading what someone already knows they need but hasn't said out loud yet.",
    whyNow: "No posts yet on client intelligence. Audience includes founders who sell. Opportunity to name something they experience but haven't articulated.",
    relatedThread: "Value Before Price",
    memoriesUsed: ["Voice: direct, no softening", "Story thread: The TrustTai client journey", "Visual: conversation spaces — boardrooms, quiet offices"],
    possibleFilm: "Two people across a table. The salesperson is silent. The client talks themselves into the purchase.",
    overlapRisk: "low",
  },
  {
    id: "rec-4",
    title: "The Map That Was Wrong",
    argument: "We navigate by maps we inherited — career maps, success maps, relationship maps. What happens when you discover the map was drawn by someone else's priorities?",
    whyNow: "The Mapmaker character from 'Living Roads' can re-enter. Audience responded positively to first appearance.",
    relatedThread: "The Mapmaker Returns",
    memoriesUsed: ["Character: The Mapmaker (79% continuity confidence)", "Symbol: map/territory", "Visual: Transit blue palette"],
    possibleFilm: "A woman follows a map to its end. Finds a door that wasn't on the map. Behind it: the person who drew it.",
    overlapRisk: "low",
  },
]

const CAPTURED_IDEAS: CapturedIdea[] = [
  {
    id: "cap-1",
    title: "Something about the first meeting",
    rawThought: "Every important relationship in my life started with one specific thing being said in a first meeting. Not the pitch, not the credentials — something real. What is that thing?",
    source: "thought",
    capturedAt: "Today, 7:44 AM",
    emergingArgument: "The first meeting that matters isn't the one you prepare for. It's the one where something unscripted gets said.",
    contradictions: ["But preparation creates the conditions for the unscripted moment — is that a contradiction or a paradox?"],
    relatedMemories: ["Voice: Tai's language around 'first real conversation'", "Story thread: The TrustTai client journey"],
    possibleConcepts: ["Two people in a meeting. One scripted line. Everything else is real."],
    developmentNotes: "Strong hook but needs a non-generic frame. Avoid 'authenticity' language.",
    status: "developing",
  },
  {
    id: "cap-2",
    title: "The gap between knowing and doing",
    rawThought: "I have clients who know exactly what to do. They've known for months. They still haven't done it. Why?",
    source: "conversation",
    capturedAt: "Yesterday, 3:12 PM",
    emergingArgument: "Knowledge without motion isn't preparation — it's a different kind of stuck.",
    contradictions: ["Is the gap always fear? Or sometimes it's wisdom — waiting for the right moment?"],
    relatedMemories: ["Voice: Systems-thinking register", "Symbol: thresholds/doorways"],
    possibleConcepts: ["A man standing at an open door. The room is exactly what he wants. He does not enter."],
    status: "captured",
  },
  {
    id: "cap-3",
    title: "What happens after the win",
    rawThought: "Nobody talks about what happens right after a big win. The weird quiet. The anti-climax. The immediate search for the next thing.",
    source: "voice",
    capturedAt: "3 days ago",
    status: "held",
  },
  {
    id: "cap-4",
    title: "The Invisible Work Post",
    rawThought: "A post about all the work that happens before any client sees anything.",
    source: "thought",
    capturedAt: "Last week",
    status: "used",
  },
  {
    id: "cap-5",
    title: "Early draft: trust and risk",
    rawThought: "Trust isn't built by being safe. It's built by being honest when it costs you something.",
    source: "comment",
    capturedAt: "2 weeks ago",
    status: "archived",
  },
]

const SOURCE_LABELS: Record<CapturedIdea["source"], string> = {
  thought: "Typed thought",
  voice: "Voice note",
  comment: "Comment",
  conversation: "Conversation",
  thread: "Story thread",
}

const SOURCE_ICONS: Record<CapturedIdea["source"], React.ElementType> = {
  thought: PenLine,
  voice: Mic,
  comment: MessageSquare,
  conversation: MessageSquare,
  thread: GitBranch,
}

const OVERLAP_COLORS = {
  low: C.green,
  medium: C.orange,
  high: "#DC2626",
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function IdeasPage() {
  const [view, setView] = useState<IdeaView>("recommended")
  const [selectedRec, setSelectedRec] = useState<RecommendedIdea | null>(null)
  const [selectedCap, setSelectedCap] = useState<CapturedIdea | null>(null)
  const [showCapture, setShowCapture] = useState(false)
  const [captureText, setCaptureText] = useState("")

  const VIEWS: { key: IdeaView; label: string; icon: React.ElementType; count: number }[] = [
    { key: "recommended", label: "Recommended", icon: Sparkles, count: RECOMMENDED_IDEAS.length },
    { key: "captured", label: "Captured", icon: Lightbulb, count: CAPTURED_IDEAS.filter(i => i.status === "captured").length },
    { key: "developing", label: "Developing", icon: TrendingUp, count: CAPTURED_IDEAS.filter(i => i.status === "developing").length },
    { key: "held", label: "Held", icon: Clock, count: CAPTURED_IDEAS.filter(i => i.status === "held").length },
    { key: "used", label: "Used", icon: Check, count: CAPTURED_IDEAS.filter(i => i.status === "used").length },
    { key: "archived", label: "Archived", icon: Archive, count: CAPTURED_IDEAS.filter(i => i.status === "archived").length },
  ]

  const capturedForView = CAPTURED_IDEAS.filter(i => i.status === view)

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: C.textMuted }}>Ideas</p>
          <button
            onClick={() => setShowCapture(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" /> Capture idea
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-serif mb-1.5" style={{ fontSize: 36, color: C.textDark, fontWeight: 400 }}>Ideas</h1>
            <p className="text-[13px]" style={{ color: C.textMid }}>
              {view === "recommended"
                ? "Recommendations drawn from your World Bible, production history, and audience signals."
                : "Ideas you've captured — thoughts, voice notes, conversations, and threads waiting to become posts."}
            </p>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto">
            {VIEWS.map((v) => {
              const Icon = v.icon
              const isActive = view === v.key
              return (
                <button
                  key={v.key}
                  onClick={() => { setView(v.key); setSelectedRec(null); setSelectedCap(null) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? C.white : "transparent",
                    color: isActive ? C.textDark : C.textMuted,
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    border: isActive ? `1px solid ${C.borderLight}` : "1px solid transparent",
                  }}>
                  <Icon className="w-3 h-3" />
                  {v.label}
                  {v.count > 0 && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                      style={{ backgroundColor: isActive ? `${C.gold}18` : "rgba(138,133,120,0.1)", color: isActive ? C.gold : C.textMuted }}>
                      {v.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ─── RECOMMENDED VIEW ─── */}
          {view === "recommended" && (
            <div className="grid grid-cols-[1fr_360px] gap-5">
              <div className="space-y-3">
                {RECOMMENDED_IDEAS.map((idea) => (
                  <RecommendationCard
                    key={idea.id}
                    idea={idea}
                    selected={selectedRec?.id === idea.id}
                    onSelect={() => setSelectedRec(selectedRec?.id === idea.id ? null : idea)}
                  />
                ))}
              </div>
              <div>
                {selectedRec ? (
                  <RecommendationDetail idea={selectedRec} onClose={() => setSelectedRec(null)} />
                ) : (
                  <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: C.gold }} />
                    <p className="font-serif text-sm mb-1" style={{ color: C.textDark }}>Select a recommendation</p>
                    <p className="text-[10px]" style={{ color: C.textMid }}>See the full argument, why now, film concept, and memory lineage.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── CAPTURED / DEVELOPING / HELD / USED / ARCHIVED VIEWS ─── */}
          {view !== "recommended" && (
            <div className="grid grid-cols-[1fr_360px] gap-5">
              <div className="space-y-3">
                {capturedForView.length === 0 ? (
                  <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <Lightbulb className="w-8 h-8 mx-auto mb-3" style={{ color: C.gold }} />
                    <p className="font-serif text-sm mb-1" style={{ color: C.textDark }}>No {view} ideas yet</p>
                    <p className="text-[10px]" style={{ color: C.textMid }}>
                      {view === "captured" ? "Capture a thought, voice note, or conversation to get started." : `Ideas in the ${view} state will appear here.`}
                    </p>
                  </div>
                ) : (
                  capturedForView.map((idea) => (
                    <CapturedIdeaCard
                      key={idea.id}
                      idea={idea}
                      selected={selectedCap?.id === idea.id}
                      onSelect={() => setSelectedCap(selectedCap?.id === idea.id ? null : idea)}
                    />
                  ))
                )}
              </div>
              <div>
                {selectedCap ? (
                  <IdeaDetail idea={selectedCap} onClose={() => setSelectedCap(null)} />
                ) : (
                  <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                    <Lightbulb className="w-8 h-8 mx-auto mb-3" style={{ color: C.gold }} />
                    <p className="font-serif text-sm mb-1" style={{ color: C.textDark }}>Select an idea</p>
                    <p className="text-[10px]" style={{ color: C.textMid }}>See the raw thought, emerging argument, contradictions, and possible concepts.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── CAPTURE MODAL ─── */}
        {showCapture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: C.white }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-serif text-lg" style={{ color: C.textDark }}>Capture an idea</p>
                <button onClick={() => { setShowCapture(false); setCaptureText("") }} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
                  <X className="w-4 h-4" style={{ color: C.textMuted }} />
                </button>
              </div>
              <p className="text-[11px] mb-3" style={{ color: C.textMid }}>Raw thought, rough draft, voice note transcript, comment that stuck — anything goes.</p>
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full rounded-xl border p-4 text-[13px] leading-relaxed resize-none outline-none mb-4"
                style={{ borderColor: C.border, color: C.textDark, minHeight: 140, fontFamily: "inherit" }}
              />
              <div className="flex items-center gap-2">
                {(["thought", "voice", "comment", "conversation", "thread"] as CapturedIdea["source"][]).map((src) => {
                  const Icon = SOURCE_ICONS[src]
                  return (
                    <button key={src} className="flex items-center gap-1.5 text-[9px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                      style={{ borderColor: C.border, color: C.textMid }}>
                      <Icon className="w-2.5 h-2.5" />
                      {SOURCE_LABELS[src]}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => { setShowCapture(false); setCaptureText("") }}
                  className="text-[11px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5"
                  style={{ borderColor: C.border, color: C.textMid }}>
                  Cancel
                </button>
                <button
                  disabled={!captureText.trim()}
                  className="text-[11px] font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
                  Capture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATION CARD
// ═══════════════════════════════════════════════════════════════════════════════

function RecommendationCard({ idea, selected, onSelect }: { idea: RecommendedIdea; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border p-4 transition-all"
      style={{
        backgroundColor: selected ? `${C.gold}06` : C.white,
        borderColor: selected ? `${C.gold}50` : C.borderLight,
        boxShadow: selected ? `0 0 0 1px ${C.gold}30` : "none",
      }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.gold }} />
          <p className="font-serif text-[15px] leading-snug" style={{ color: C.textDark }}>{idea.title}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: OVERLAP_COLORS[idea.overlapRisk] }} />
          <span className="text-[8px] font-medium capitalize" style={{ color: OVERLAP_COLORS[idea.overlapRisk] }}>
            {idea.overlapRisk} overlap
          </span>
        </div>
      </div>
      <p className="text-[11px] leading-snug mb-2.5 line-clamp-2" style={{ color: C.textMid }}>{idea.argument}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${C.blue}10`, color: C.blue }}>
          {idea.relatedThread}
        </span>
        <span className="text-[9px]" style={{ color: C.textMuted }}>
          {idea.memoriesUsed.length} memories used
        </span>
      </div>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATION DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

function RecommendationDetail({ idea, onClose }: { idea: RecommendedIdea; onClose: () => void }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.borderLight }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: C.gold }} />
          <p className="text-[10px] font-bold" style={{ color: C.textMid }}>Recommendation detail</p>
        </div>
        <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-black/5">
          <X className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="font-serif text-base mb-1" style={{ color: C.textDark }}>{idea.title}</p>
          <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{idea.argument}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: C.textMuted }}>Why now</p>
          <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{idea.whyNow}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: C.textMuted }}>Possible film</p>
          <p className="text-[11px] leading-snug italic" style={{ color: C.textMid }}>{idea.possibleFilm}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>Memory lineage</p>
          <div className="space-y-1.5">
            {idea.memoriesUsed.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <Brain className="w-2.5 h-2.5 flex-shrink-0" style={{ color: C.textMuted }} />
                <p className="text-[10px]" style={{ color: C.textMid }}>{m}</p>
              </div>
            ))}
          </div>
        </div>
        {idea.overlapRisk !== "low" && (
          <div className="rounded-lg border p-3" style={{ backgroundColor: "rgba(232,128,42,0.05)", borderColor: "rgba(232,128,42,0.25)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3 h-3" style={{ color: C.orange }} />
              <p className="text-[10px] font-semibold" style={{ color: C.orange }}>Overlap risk: {idea.overlapRisk}</p>
            </div>
            {idea.overlapNote && <p className="text-[10px]" style={{ color: "#92400E" }}>{idea.overlapNote}</p>}
          </div>
        )}
        <div className="flex flex-col gap-2 pt-1">
          <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" style={{ color: C.gold }} />
            Develop this post
          </button>
          <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5"
            style={{ borderColor: C.border, color: C.textMid }}>
            Save to Ideas
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPTURED IDEA CARD
// ═══════════════════════════════════════════════════════════════════════════════

function CapturedIdeaCard({ idea, selected, onSelect }: { idea: CapturedIdea; selected: boolean; onSelect: () => void }) {
  const Icon = SOURCE_ICONS[idea.source]
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border p-4 transition-all"
      style={{
        backgroundColor: selected ? `${C.navy}04` : C.white,
        borderColor: selected ? `${C.navy}30` : C.borderLight,
      }}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${C.navy}08` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: C.textMid }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-serif text-[14px] leading-snug" style={{ color: C.textDark }}>{idea.title}</p>
            <p className="text-[9px] flex-shrink-0" style={{ color: C.textMuted }}>{idea.capturedAt}</p>
          </div>
          <p className="text-[10px] leading-snug line-clamp-2" style={{ color: C.textMid }}>{idea.rawThought}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(138,133,120,0.08)", color: C.textMuted }}>
              {SOURCE_LABELS[idea.source]}
            </span>
            {idea.emergingArgument && (
              <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${C.blue}10`, color: C.blue }}>
                Argument emerging
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: C.textMuted }} />
      </div>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// IDEA DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

function IdeaDetail({ idea, onClose }: { idea: CapturedIdea; onClose: () => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["argument", "memories"]))
  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const Icon = SOURCE_ICONS[idea.source]

  const sections = [
    idea.emergingArgument && {
      key: "argument", label: "Emerging argument",
      content: <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{idea.emergingArgument}</p>
    },
    idea.contradictions && idea.contradictions.length > 0 && {
      key: "contradictions", label: "Contradictions / tensions",
      content: <div className="space-y-1.5">{idea.contradictions!.map((c, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-[10px] mt-0.5" style={{ color: C.orange }}>↯</span>
          <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{c}</p>
        </div>
      ))}</div>
    },
    idea.relatedMemories && idea.relatedMemories.length > 0 && {
      key: "memories", label: "Related memories",
      content: <div className="space-y-1.5">{idea.relatedMemories!.map((m) => (
        <div key={m} className="flex items-center gap-2">
          <Brain className="w-2.5 h-2.5 flex-shrink-0" style={{ color: C.textMuted }} />
          <p className="text-[10px]" style={{ color: C.textMid }}>{m}</p>
        </div>
      ))}</div>
    },
    idea.possibleConcepts && idea.possibleConcepts.length > 0 && {
      key: "concepts", label: "Possible film concepts",
      content: <div className="space-y-1.5">{idea.possibleConcepts!.map((c, i) => (
        <p key={i} className="text-[11px] leading-snug italic" style={{ color: C.textMid }}>{c}</p>
      ))}</div>
    },
    idea.developmentNotes && {
      key: "notes", label: "Development notes",
      content: <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{idea.developmentNotes}</p>
    },
  ].filter(Boolean) as { key: string; label: string; content: React.ReactNode }[]

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.borderLight }}>
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: C.textMid }} />
          <p className="text-[10px] font-bold" style={{ color: C.textMid }}>{SOURCE_LABELS[idea.source]}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[9px]" style={{ color: C.textMuted }}>{idea.capturedAt}</p>
          <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-black/5">
            <X className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="font-serif text-base mb-1.5" style={{ color: C.textDark }}>{idea.title}</p>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${C.navy}04`, borderLeft: `2px solid ${C.navy}30` }}>
            <p className="text-[11px] leading-relaxed" style={{ color: C.textMid }}>{idea.rawThought}</p>
          </div>
        </div>

        {sections.map(({ key, label, content }) => (
          <div key={key} className="border-t pt-3" style={{ borderColor: C.borderLight }}>
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: C.textMuted }}>{label}</p>
              <ChevronDown className="w-3 h-3 transition-transform" style={{ color: C.textMuted, transform: expanded.has(key) ? "rotate(180deg)" : "none" }} />
            </button>
            {expanded.has(key) && content}
          </div>
        ))}

        <div className="flex flex-col gap-2 pt-1 border-t" style={{ borderColor: C.borderLight }}>
          <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" style={{ color: C.gold }} />
            Develop into a post
          </button>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
              style={{ borderColor: C.border, color: C.textMid }}>
              <BookOpen className="w-2.5 h-2.5" /> Add to World
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
              style={{ borderColor: C.border, color: C.textMid }}>
              <Archive className="w-2.5 h-2.5" /> Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
