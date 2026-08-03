"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  getProduction,
  updateProduction,
  PRODUCTIONS_CHANGED_EVENT,
} from "@/lib/studio-store"
import type { Production, ConceptDirection, ConceptKey } from "@/data/studio"
import { GATE_ORDER } from "@/data/studio"
import {
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Megaphone,
  Heart,
  Sparkles,
  Eye,
  Zap,
  Film as FilmIcon,
  FileText,
  PenLine,
  Clapperboard,
  Scissors,
  Package,
  Brain,
  Lightbulb,
  Target,
  Clock,
  Compass,
  Scale,
  Bookmark,
  RefreshCw,
  X,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = "post" | "concept" | "script" | "frames" | "scenes" | "edit" | "package" | "memory"

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "post", label: "Post", icon: FileText },
  { key: "concept", label: "Concept", icon: Lightbulb },
  { key: "script", label: "Script", icon: PenLine },
  { key: "frames", label: "Frames", icon: Clapperboard },
  { key: "scenes", label: "Scenes", icon: FilmIcon },
  { key: "edit", label: "Edit", icon: Scissors },
  { key: "package", label: "Package", icon: Package },
  { key: "memory", label: "Memory", icon: Brain },
]

const STEPPER = [
  { label: "Post", icon: FileText },
  { label: "Concept", icon: Lightbulb },
  { label: "Frames", icon: Clapperboard },
  { label: "Scenes", icon: FilmIcon },
  { label: "Edit", icon: Scissors },
  { label: "Package", icon: Package },
]

const COLORS = {
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProductionWorkspacePage() {
  const params = useParams<{ id: string }>()
  const [production, setProduction] = useState<Production | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("concept")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return

    const sync = () => {
      const p = getProduction(id)
      if (p) setProduction(p)
      setLoading(false)
    }

    sync()

    const handler = () => {
      const updated = getProduction(id)
      if (updated) setProduction({ ...updated })
    }
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, handler)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, handler)
  }, [params?.id])

  if (loading) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>Loading production…</p>
        </div>
      </Shell>
    )
  }

  if (!production) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
          <div className="text-center">
            <p className="font-serif text-2xl mb-2" style={{ color: COLORS.textDark }}>Production not found</p>
            <Link href="/productions" className="text-sm" style={{ color: COLORS.blue }}>
              ← Back to Productions
            </Link>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
        {/* ═══ TOP BAR ═══ */}
        <TopBar production={production} />

        {/* ═══ TAB BAR ═══ */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} production={production} />

        {/* ═══ CONTENT ═══ */}
        <div className="max-w-[1400px] mx-auto px-6 pb-20">
          {activeTab === "concept" && <ConceptTab production={production} />}
          {activeTab === "post" && (
            <PlaceholderTab
              title="Post"
              subtitle="The source post and its argument spine."
              icon={FileText}
            />
          )}
          {activeTab === "script" && (
            <PlaceholderTab
              title="Script"
              subtitle="Treatment, shot list, and narration."
              icon={PenLine}
            />
          )}
          {activeTab === "frames" && (
            <PlaceholderTab
              title="Frames"
              subtitle="Keyframe planning and reference locking."
              icon={Clapperboard}
            />
          )}
          {activeTab === "scenes" && (
            <PlaceholderTab
              title="Scenes"
              subtitle="Scene conductor and shot orchestration."
              icon={FilmIcon}
            />
          )}
          {activeTab === "edit" && (
            <PlaceholderTab
              title="Edit"
              subtitle="Timeline, transitions, and final assembly."
              icon={Scissors}
            />
          )}
          {activeTab === "package" && (
            <PlaceholderTab
              title="Package"
              subtitle="Publish-ready output: post, caption, video."
              icon={Package}
            />
          )}
          {activeTab === "memory" && (
            <PlaceholderTab
              title="Memory"
              subtitle="What the Studio learned from this production."
              icon={Brain}
            />
          )}
        </div>
      </div>
    </Shell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════════════════════════════════════════

function TopBar({ production }: { production: Production }) {
  const stageLabels: Record<string, string> = {
    truth: "Truth Review",
    post: "Post Review",
    concept: "Concept Stage",
    keyframes: "Keyframe Planning",
    film: "Film Review",
  }

  const currentGate = GATE_ORDER.find((g) => production.gates[g]?.status !== "approved")
  const stageLabel = currentGate ? stageLabels[currentGate] : "Package Ready"

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
      style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: COLORS.border }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:underline"
          style={{ color: COLORS.textMuted }}
        >
          <ArrowLeft className="w-3 h-3" />
          Productions
        </button>
        <ChevronRight className="w-3 h-3" style={{ color: COLORS.border }} />
        <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>
          {production.title}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.gold }} />
          <span className="text-[10px] font-medium" style={{ color: COLORS.textMid }}>
            In Progress — {stageLabel}
          </span>
        </div>
        <span className="w-px h-3" style={{ backgroundColor: COLORS.border }} />
        <span className="flex items-center gap-1 text-[10px]" style={{ color: COLORS.textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.green }} />
          Studio activity
        </span>
        <button
          className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
        >
          Preview package
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB BAR
// ═══════════════════════════════════════════════════════════════════════════════

function TabBar({
  activeTab,
  onTabChange,
  production,
}: {
  activeTab: TabKey
  onTabChange: (t: TabKey) => void
  production: Production
}) {
  const gateStatus = (tab: TabKey): "done" | "active" | "locked" | "open" => {
    const gateMap: Partial<Record<TabKey, keyof typeof production.gates>> = {
      post: "post",
      concept: "concept",
      frames: "keyframes",
    }
    const gate = gateMap[tab]
    if (!gate) return "open"
    if (production.gates[gate]?.status === "approved") return "done"
    const order: TabKey[] = ["post", "concept", "script", "frames", "scenes", "edit", "package", "memory"]
    const currentIdx = order.indexOf(activeTab)
    const tabIdx = order.indexOf(tab)
    if (tabIdx === currentIdx) return "active"
    if (tabIdx < currentIdx) return "done"
    return "locked"
  }

  return (
    <div
      className="sticky top-[41px] z-20 flex items-center gap-1 px-6 border-b overflow-x-auto"
      style={{ backgroundColor: "rgba(244,241,234,0.95)", borderColor: COLORS.border }}
    >
      {TABS.map((tab) => {
        const status = gateStatus(tab.key)
        const isActive = activeTab === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors relative"
            style={{
              color: isActive ? COLORS.navy : status === "done" ? COLORS.blue : COLORS.textMuted,
            }}
          >
            <Icon className="w-3 h-3" />
            {tab.label}
            {status === "done" && (
              <Check className="w-2.5 h-2.5" style={{ color: COLORS.green }} />
            )}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: COLORS.navy }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONCEPT TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ConceptTab({ production }: { production: Production }) {
  const [selectedKey, setSelectedKey] = useState<ConceptKey | null>(
    production.film.selectedConcept
  )

  function chooseDirection(key: ConceptKey) {
    setSelectedKey(key)
    updateProduction(production.id, (p) => ({
      ...p,
      film: { ...p.film, selectedConcept: key },
    }))
  }

  const concepts = production.film.concepts
  const postSummary = production.sourceThought.slice(0, 180) + (production.sourceThought.length > 180 ? "…" : "")
  const filmFeeling = production.shift?.end || "The physical weight of carrying a system that should have learned to stand."

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pt-6">
      {/* ═══ MAIN CONTENT ═══ */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(194,154,91,0.1)", color: COLORS.gold }}
            >
              Concept Review
            </span>
          </div>
          <h1 className="font-serif mb-1" style={{ fontSize: "36px", color: COLORS.textDark, fontWeight: 400 }}>
            Concept
          </h1>
          <p className="text-[13px]" style={{ color: COLORS.textMid }}>
            Find the film inside the post.
          </p>
        </div>

        {/* Horizontal Stepper */}
        <div className="flex items-center gap-1">
          {STEPPER.map((s, i) => {
            const isDone = i < 1 // Post is done
            const isActive = i === 1 // Concept is active
            return (
              <div key={s.label} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-colors"
                    style={{
                      backgroundColor: isDone ? COLORS.blue : isActive ? COLORS.navy : "#FFFFFF",
                      color: isDone || isActive ? "#FFFFFF" : COLORS.textMuted,
                      border: isDone || isActive ? "none" : `1px solid ${COLORS.border}`,
                    }}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wide"
                    style={{ color: isActive ? COLORS.navy : COLORS.textMuted }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPPER.length - 1 && (
                  <div className="flex-1 h-px mx-1" style={{ backgroundColor: isDone ? COLORS.blue : COLORS.border }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Contrast Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ContrastPanel
            icon={Megaphone}
            label="What the post says"
            text={postSummary}
            color={COLORS.blue}
          />
          <ContrastPanel
            icon={Heart}
            label="What the film lets the audience feel"
            text={filmFeeling}
            color={COLORS.gold}
          />
        </div>

        {/* Concept Directions */}
        <div>
          <div className="mb-1">
            <h2 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
              Concept directions
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
              Three cinematic approaches. Choose the direction that best brings the truth to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {concepts.map((concept, idx) => (
              <ConceptCard
                key={concept.key}
                concept={concept}
                isRecommended={idx === 0}
                isSelected={selectedKey === concept.key}
                onSelect={() => chooseDirection(concept.key)}
              />
            ))}
          </div>
        </div>

        {/* Studio Recommendation Banner */}
        <RecommendationBanner
          production={production}
          selectedKey={selectedKey}
          onApprove={() => {
            if (selectedKey) {
              updateProduction(production.id, (p) => ({
                ...p,
                film: { ...p.film, selectedConcept: selectedKey },
                gates: {
                  ...p.gates,
                  concept: { key: "concept", status: "approved" as const },
                },
              }))
            }
          }}
        />
      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className="space-y-4">
        <ProductionSummaryCard production={production} />
        <ConceptInsightPanel production={production} />
        <ConceptDetailPanel production={production} />
        <ConceptActionsPanel />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ContrastPanel({
  icon: Icon,
  label,
  text,
  color,
}: {
  icon: React.ElementType
  label: string
  text: string
  color: string
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="rounded-md flex items-center justify-center"
          style={{ width: 28, height: 28, backgroundColor: `${color}12` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>
          {label}
        </p>
      </div>
      <p className="text-[13px] leading-relaxed font-serif italic" style={{ color: COLORS.textDark }}>
        {text}
      </p>
    </div>
  )
}

function ConceptCard({
  concept,
  isRecommended,
  isSelected,
  onSelect,
}: {
  concept: ConceptDirection
  isRecommended: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: COLORS.white,
        borderColor: isSelected ? COLORS.navy : COLORS.borderLight,
        borderWidth: isSelected ? 1.5 : 1,
        boxShadow: isSelected ? "0 2px 12px rgba(26,35,50,0.08)" : "none",
      }}
    >
      {/* Image area */}
      <div
        className="relative h-32 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy}15, ${COLORS.gold}15)`,
        }}
      >
        <FilmIcon className="w-10 h-10" style={{ color: `${COLORS.navy}30` }} />
        {isRecommended && (
          <div
            className="absolute top-2 right-2 text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
            style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
          >
            Recommended
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-serif text-base leading-tight" style={{ color: COLORS.textDark }}>
            {concept.name}
          </h3>
          <p className="text-[11px] mt-1 leading-snug" style={{ color: COLORS.textMid }}>
            {concept.premise}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-1">
          <MetaRow label="Metaphor" value={`${concept.represents.split("—")[0]?.trim() || concept.represents.slice(0, 40)}`} />
          <MetaRow label="Tone" value={concept.whyItEarnsAttention.slice(0, 40)} />
          <MetaRow label="Duration" value={`${concept.shotCount * 8} sec`} />
        </div>

        {/* Why now */}
        <div
          className="rounded-md p-2"
          style={{ backgroundColor: "rgba(194,154,91,0.05)" }}
        >
          <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-0.5" style={{ color: COLORS.gold }}>
            Why now
          </p>
          <p className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>
            {concept.connection}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onSelect}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{
              backgroundColor: isSelected ? COLORS.navy : COLORS.gold,
              color: "#FFFFFF",
            }}
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3" />
                Selected
              </>
            ) : (
              <>
                Choose direction
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
          <button
            className="text-[10px] font-medium px-2 py-1.5 rounded border transition-colors hover:bg-black/5"
            style={{ borderColor: COLORS.border, color: COLORS.textMid }}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
        {label}
      </span>
      <span className="text-[10px]" style={{ color: COLORS.textDark }}>
        {value}
      </span>
    </div>
  )
}

function RecommendationBanner({
  production,
  selectedKey,
  onApprove,
}: {
  production: Production
  selectedKey: ConceptKey | null
  onApprove: () => void
}) {
  const conceptApproved = production.gates.concept?.status === "approved"

  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3"
      style={{
        backgroundColor: "rgba(47,98,216,0.03)",
        borderColor: "rgba(47,98,216,0.15)",
      }}
    >
      <div
        className="rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ width: 32, height: 32, backgroundColor: "rgba(47,98,216,0.08)" }}
      >
        <Scale className="w-4 h-4" style={{ color: COLORS.blue }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-snug mb-3" style={{ color: COLORS.textDark }}>
          {conceptApproved ? (
            <>Concept approved. The Studio is ready to build the script.</>
          ) : selectedKey ? (
            <>
              The Studio recommends approving <strong>{production.film.concepts.find((c) => c.key === selectedKey)?.name}</strong>. This direction has the strongest metaphor-to-truth alignment.
            </>
          ) : (
            <>
              The Studio found <strong>3 strong concept directions</strong>. Choose the one that best carries the post&apos;s central truth into film.
            </>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onApprove}
            disabled={!selectedKey || conceptApproved}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
          >
            {conceptApproved ? (
              <>
                <Check className="w-3 h-3" />
                Concept approved
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Approve concept
              </>
            )}
          </button>
          <button
            className="text-[11px] font-medium px-3 py-1.5 rounded border transition-colors hover:bg-black/5"
            style={{ borderColor: COLORS.border, color: COLORS.textMid }}
          >
            <RefreshCw className="w-3 h-3 inline mr-1" />
            Request new directions
          </button>
          <button
            className="text-[11px] font-medium transition-colors hover:underline"
            style={{ color: COLORS.textMuted }}
          >
            Hold production
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Right Sidebar Cards ──────────────────────────────────────────────────────

function ProductionSummaryCard({ production }: { production: Production }) {
  const [expanded, setExpanded] = useState(true)
  const postApproved = production.gates.post?.status === "approved"

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <div
          className="rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            width: 44, height: 44,
            background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.gold})`,
          }}
        >
          <FilmIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm leading-tight" style={{ color: COLORS.textDark }}>
            {production.title}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
            LinkedIn post + {production.film.concepts[0]?.shotCount ?? 6 * 8}s visual parable
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: postApproved ? "rgba(34,160,107,0.1)" : "rgba(194,154,91,0.1)",
                color: postApproved ? COLORS.green : COLORS.gold,
              }}
            >
              {postApproved ? "Post Approved" : "Post Draft"}
            </span>
          </div>
        </div>
        <ChevronRight
          className="w-3 h-3 flex-shrink-0 mt-1 transition-transform"
          style={{ color: COLORS.textMuted, transform: expanded ? "rotate(90deg)" : "none" }}
        />
      </button>
    </div>
  )
}

function ConceptInsightPanel({ production }: { production: Production }) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.gold }}>
          Concept Insight
        </p>
      </div>
      <Link
        href={`/thinking-room/${production.id}`}
        className="text-[10px] font-medium transition-colors hover:underline block mb-2"
        style={{ color: COLORS.blue }}
      >
        View post →
      </Link>
      <p className="text-[11px] leading-relaxed mb-2" style={{ color: COLORS.textMid }}>
        The Studio found <strong>3 strong concept directions</strong> for this production.
      </p>
      <ul className="space-y-1.5">
        {[
          "Uses existing founder character from Canon Scene 003",
          "Builds on \"The Work Must Learn\" story thread",
          "Resonates with leadership and freedom themes",
        ].map((finding, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: COLORS.green }} />
            <span className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>
              {finding}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConceptDetailPanel({ }: { production: Production }) {
  const [expanded, setExpanded] = useState(true)

  const rows = [
    { icon: Compass, label: "Narrative structure", value: "Hero's burden → Turning point → New reality" },
    { icon: Eye, label: "Visual style", value: "Cinematic, warm neutrals, dramatic light" },
    { icon: Target, label: "Character continuity", value: "Uses established founder character" },
    { icon: FilmIcon, label: "World compatibility", value: "Aligned with Trust Tai visual language" },
    { icon: Clock, label: "Complexity", value: "Medium (6 key scenes)" },
    { icon: Sparkles, label: "Originality check", value: "High — builds on brand themes without overlap" },
  ]

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" style={{ color: COLORS.textMuted }} />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>
            Concept Detail
          </span>
        </div>
        <ChevronRight
          className="w-3 h-3 transition-transform"
          style={{ color: COLORS.textMuted, transform: expanded ? "rotate(90deg)" : "none" }}
        />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {rows.map((row, i) => {
            const Icon = row.icon
            return (
              <div key={i} className="flex items-start gap-2">
                <Icon className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: COLORS.textMuted }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
                    {row.label}
                  </p>
                  <p className="text-[10px] leading-snug" style={{ color: COLORS.textDark }}>
                    {row.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConceptActionsPanel() {
  const actions = [
    { icon: Check, label: "Approve concept and build script", color: COLORS.green },
    { icon: RefreshCw, label: "Request new directions", color: COLORS.blue },
    { icon: Bookmark, label: "Save for later", color: COLORS.gold },
    { icon: X, label: "Reject with reason", color: "#E53E3E" },
  ]

  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.gold }}>
          Concept Actions
        </p>
      </div>
      <div className="space-y-1">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <button
              key={i}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors hover:bg-black/5"
            >
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: action.color }} />
              <span className="text-[10px]" style={{ color: COLORS.textMid }}>
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PlaceholderTab({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string
  subtitle: string
  icon: React.ElementType
}) {
  return (
    <div className="pt-6">
      <div
        className="rounded-xl border p-12 text-center"
        style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
      >
        <div
          className="rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ width: 56, height: 56, backgroundColor: `${COLORS.gold}10` }}
        >
          <Icon className="w-7 h-7" style={{ color: COLORS.gold }} />
        </div>
        <h2 className="font-serif text-2xl mb-1" style={{ color: COLORS.textDark }}>
          {title}
        </h2>
        <p className="text-[12px]" style={{ color: COLORS.textMid }}>
          {subtitle}
        </p>
        <p className="text-[10px] mt-3 italic" style={{ color: COLORS.textMuted }}>
          This tab will be built next.
        </p>
      </div>
    </div>
  )
}
