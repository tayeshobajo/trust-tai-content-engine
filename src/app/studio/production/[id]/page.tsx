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
  GripVertical,
  MoreHorizontal,
  Mic,
  Plus,
  GitCompare,
  History,
  ChevronDown,
  Waves,
  Palette,
  User,
  Shield,
  Camera,
  Sun,
  Layers,
  Aperture,
  Replace,
  AlertTriangle,
  List,
  LayoutGrid,
  Filter,
  Play,
  Volume2,
  Download,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Copy,
  Trash2,
  Music,
  Type as TypeIcon,
  Captions,
  Maximize as MaximizeIcon,
  Settings as SettingsIcon,
  Send,
  Scissors as ScissorsIcon,
  RotateCw,
  Split,
  ChevronLeft,
  Plus as PlusIcon,
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
          {activeTab === "script" && <ScriptTab production={production} />}
          {activeTab === "frames" && <FramesTab production={production} />}
          {activeTab === "scenes" && <ScenesTab production={production} />}
          {activeTab === "edit" && <EditTab production={production} />}
          {activeTab === "package" && <PackageTab production={production} />}
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
// SCRIPT TAB
// ═══════════════════════════════════════════════════════════════════════════════

// Scene metadata for display — mapped from shot data
const SCENE_NAMES = [
  "The Catch",
  "The Reveal",
  "The Marble",
  "The Descent",
  "The Turn",
  "The Settle",
]

const POST_CONNECTIONS = [
  "Intro – First paragraph (The visible problem everyone reacts to.)",
  "Paragraph 2 (The hidden reality behind the problem.)",
  "Paragraph 3 (The answers we reach for first.)",
  "Paragraph 4–5 (The choice to go deeper instead of reacting.)",
  "Paragraph 6 (The one thing that changes everything.)",
  "Closing – Final paragraph (The lesson and the freedom it creates.)",
]

const NARRATION_LINES = [
  "The cup slides. He catches it. Good save.",
  "Pull back. The whole office is tilted. Everyone is catching something.",
  "The first answer is the visible one.",
  "He goes beneath the surface.",
  "Find the one turn.",
  "Movement is not always progress.",
]

const CONTINUITY_ROWS = [
  "Character consistent",
  "World consistent",
  "Time & lighting consistent",
  "Symbol usage consistent",
]

const WHAT_FILM_IS_NOT = [
  "It is not about working harder.",
  "It is not a literal office story.",
  "It is not a quick tip.",
]

const QUICK_ACTIONS = [
  "Shorten narration",
  "More visual, less VO",
  "Stronger opening",
  "Change ending",
  "Add a beat of silence",
]

function ScriptTab({ production }: { production: Production }) {
  const [subTab, setSubTab] = useState<"scenes" | "narration" | "timeline" | "postmap">("scenes")
  const shots = production.film.shots
  const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0)
  const narrationWordCount = NARRATION_LINES.join(" ").split(/\s+/).filter(Boolean).length
  function approveScript() {
    updateProduction(production.id, (p) => ({
      ...p,
      gates: {
        ...p.gates,
        concept: { key: "concept", status: "approved" as const },
      },
    }))
  }

  return (
    <div className="pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ═══ MAIN COLUMN ═══ */}
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
                <span style={{ color: COLORS.textMuted }}>3.</span> Write the story the film will tell
              </h1>
              <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
                The script translates the post&apos;s argument into a cinematic experience.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <GitCompare className="w-3 h-3" />
                Compare versions
              </button>
              <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <History className="w-3 h-3" />
                Script history
              </button>
              <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border cursor-pointer" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <span>Script version</span>
                <span className="font-semibold" style={{ color: COLORS.textDark }}>V1 (Studio draft)</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-4 border-b pb-1" style={{ borderColor: COLORS.borderLight }}>
            {([
              { key: "scenes", label: "Scene by scene" },
              { key: "narration", label: "Narration only" },
              { key: "timeline", label: "Timeline" },
              { key: "postmap", label: "Post map" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setSubTab(t.key)}
                className="text-[11px] font-semibold pb-1.5 transition-colors relative"
                style={{ color: subTab === t.key ? COLORS.navy : COLORS.textMuted }}
              >
                {t.label}
                {subTab === t.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.gold }} />
                )}
              </button>
            ))}
          </div>

          {/* Scene Table */}
          {subTab === "scenes" && (
            <SceneTable shots={shots} totalDuration={totalDuration} />
          )}
          {subTab === "narration" && <NarrationOnly shots={shots} />}
          {subTab === "timeline" && <TimelineView shots={shots} totalDuration={totalDuration} />}
          {subTab === "postmap" && <PostMapView shots={shots} />}

          {/* Lower panels: Script Notes + Continuity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Script Notes */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>
                Script notes
              </p>
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: COLORS.textDark }}>
                This script stays faithful to the post&apos;s argument while making it felt, not just heard.
              </p>
              <button className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
                <PenLine className="w-3 h-3" />
                Add note
              </button>
            </div>

            {/* Continuity Check */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>
                Continuity check
              </p>
              <div className="space-y-2">
                {CONTINUITY_ROWS.map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" style={{ color: COLORS.green }} />
                      <span className="text-[11px]" style={{ color: COLORS.textDark }}>{row}</span>
                    </div>
                    <button className="text-[10px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* Script Intelligence */}
          <ScriptIntelligencePanel
            totalDuration={totalDuration}
            narrationWordCount={narrationWordCount}
            shotCount={shots.length}
          />

          {/* Ready for Frames */}
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: "rgba(194,154,91,0.05)",
              borderColor: "rgba(194,154,91,0.2)",
            }}
          >
            <p className="font-serif text-sm mb-1" style={{ color: COLORS.textDark }}>
              Ready for frames
            </p>
            <p className="text-[10px] mb-3" style={{ color: COLORS.textMid }}>
              The script is ready to be visualized.
            </p>
            <div className="space-y-2">
              <button
                onClick={approveScript}
                className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
              >
                Approve script &amp; build frames
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <RefreshCw className="w-3 h-3" />
                Request revisions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM COMMAND BAR ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 px-6 py-3 border-t md:ml-[140px]"
        style={{ backgroundColor: COLORS.navy, borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <Waves className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          <div>
            <p className="text-[10px] font-semibold text-white">Need changes?</p>
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>Tell the Studio what to adjust.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
            >
              {action}
            </button>
          ))}
          <button className="text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap transition-colors hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
            ⋯
          </button>
        </div>
        <button
          className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
        >
          <Sparkles className="w-3 h-3" />
          Ask anything
        </button>
      </div>
    </div>
  )
}

// ─── Scene Table ─────────────────────────────────────────────────────────────

function SceneTable({ shots, totalDuration }: { shots: Production["film"]["shots"]; totalDuration: number }) {
  // Precompute cumulative timecodes
  const rows = shots.slice(0, 6).map((shot, idx) => {
    const offset = shots.slice(0, idx).reduce((sum, s) => sum + s.durationSec, 0)
    return { shot, idx, startTime: offset, endTime: offset + shot.durationSec }
  })

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: COLORS.borderLight, backgroundColor: "rgba(138,133,120,0.03)" }}>
        <div className="w-4 flex-shrink-0" />
        <div className="w-12 flex-shrink-0" />
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase flex-1" style={{ color: COLORS.textMuted }}>Scene</p>
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase flex-[2]" style={{ color: COLORS.textMuted }}>Visual action</p>
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase flex-[2]" style={{ color: COLORS.textMuted }}>Narration (VO)</p>
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase w-12 text-center" style={{ color: COLORS.textMuted }}>Duration</p>
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase flex-[1.5]" style={{ color: COLORS.textMuted }}>Purpose</p>
        <p className="text-[8px] font-bold tracking-[0.1em] uppercase flex-[1.5]" style={{ color: COLORS.textMuted }}>Post connection</p>
        <div className="w-6 flex-shrink-0" />
      </div>

      {/* Scene rows */}
      <div className="divide-y" style={{ borderColor: COLORS.borderLight }}>
        {rows.map(({ shot, idx, startTime, endTime }) => {
          const sceneName = SCENE_NAMES[idx] || `Scene ${idx + 1}`
          const narration = NARRATION_LINES[idx] || ""
          const postConn = POST_CONNECTIONS[idx] || ""

          return (
            <div
              key={shot.no}
              className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-black/[0.015]"
              style={{ borderColor: COLORS.borderLight }}
            >
              {/* Drag handle */}
              <div className="w-4 flex-shrink-0 pt-1">
                <GripVertical className="w-3 h-3" style={{ color: COLORS.border }} />
              </div>

              {/* Thumbnail */}
              <div
                className="w-12 h-12 rounded-md flex-shrink-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${COLORS.navy}10, ${COLORS.gold}10)` }}
              >
                <FilmIcon className="w-5 h-5" style={{ color: `${COLORS.navy}25` }} />
              </div>

              {/* Scene number + name */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold" style={{ color: COLORS.textMuted }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>
                    {sceneName}
                  </p>
                </div>
                <p className="text-[9px] mt-0.5" style={{ color: COLORS.textMuted }}>
                  {formatTimecode(startTime)}–{formatTimecode(endTime)}
                </p>
              </div>

              {/* Visual action */}
              <div className="flex-[2] min-w-0 pt-0.5">
                <p className="text-[10px] leading-snug" style={{ color: COLORS.textDark }}>
                  {shot.description}
                </p>
              </div>

              {/* Narration */}
              <div className="flex-[2] min-w-0 pt-0.5">
                <p className="text-[10px] leading-snug italic" style={{ color: COLORS.textMid }}>
                  {narration || "—"}
                </p>
              </div>

              {/* Duration */}
              <div className="w-12 text-center pt-0.5">
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}
                >
                  {shot.durationSec}s
                </span>
              </div>

              {/* Purpose */}
              <div className="flex-[1.5] min-w-0 pt-0.5">
                <p className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>
                  {shot.purpose}
                </p>
              </div>

              {/* Post connection */}
              <div className="flex-[1.5] min-w-0 pt-0.5">
                <p className="text-[10px] leading-snug" style={{ color: COLORS.textMuted }}>
                  {postConn}
                </p>
              </div>

              {/* Overflow */}
              <div className="w-6 flex-shrink-0 pt-0.5">
                <MoreHorizontal className="w-3 h-3" style={{ color: COLORS.textMuted }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: COLORS.borderLight, backgroundColor: "rgba(138,133,120,0.03)" }}>
        <p className="text-[9px]" style={{ color: COLORS.textMuted }}>
          {shots.slice(0, 6).length} scenes · {totalDuration}s total
        </p>
        <button className="flex items-center gap-1 text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
          <Plus className="w-3 h-3" />
          Add scene
        </button>
      </div>
    </div>
  )
}

// ─── Narration Only View ──────────────────────────────────────────────────────

function NarrationOnly({ shots }: { shots: Production["film"]["shots"] }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="space-y-3">
        {shots.slice(0, 6).map((shot, idx) => (
          <div key={shot.no} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: COLORS.borderLight }}>
            <span className="text-[10px] font-bold pt-0.5" style={{ color: COLORS.textMuted, minWidth: 20 }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.gold }}>
                {SCENE_NAMES[idx] || `Scene ${idx + 1}`}
              </p>
              <p className="text-[12px] leading-relaxed font-serif italic" style={{ color: COLORS.textDark }}>
                {NARRATION_LINES[idx] || ""}
              </p>
            </div>
            <span className="text-[9px]" style={{ color: COLORS.textMuted }}>{shot.durationSec}s</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Timeline View ────────────────────────────────────────────────────────────

function TimelineView({ shots, totalDuration }: { shots: Production["film"]["shots"]; totalDuration: number }) {
  const rows = shots.slice(0, 6).map((shot, idx) => {
    const offset = shots.slice(0, idx).reduce((sum, s) => sum + s.durationSec, 0)
    return { shot, idx, startPct: (offset / totalDuration) * 100, widthPct: (shot.durationSec / totalDuration) * 100 }
  })

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="space-y-1">
        {rows.map(({ shot, idx, startPct, widthPct }) => {
          return (
            <div key={shot.no} className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold" style={{ color: COLORS.textMuted, minWidth: 20 }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-medium" style={{ color: COLORS.textDark }}>
                  {SCENE_NAMES[idx] || `Scene ${idx + 1}`}
                </span>
                <span className="text-[9px]" style={{ color: COLORS.textMuted }}>{shot.durationSec}s</span>
              </div>
              <div className="relative h-5 rounded" style={{ backgroundColor: COLORS.borderLight }}>
                <div
                  className="absolute h-full rounded flex items-center px-1.5"
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: idx % 2 === 0 ? COLORS.blue : COLORS.gold,
                    opacity: 0.75,
                  }}
                >
                  <span className="text-[8px] font-semibold text-white truncate">
                    {shot.purpose}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
        <p className="text-[9px]" style={{ color: COLORS.textMuted }}>0:00</p>
        <p className="text-[9px]" style={{ color: COLORS.textMuted }}>{formatTimecode(totalDuration)}</p>
      </div>
    </div>
  )
}

// ─── Post Map View ────────────────────────────────────────────────────────────

function PostMapView({ shots }: { shots: Production["film"]["shots"] }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: COLORS.textMid }}>
        How each scene maps to the post
      </p>
      <div className="space-y-2">
        {shots.slice(0, 6).map((shot, idx) => (
          <div key={shot.no} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}>
                {idx + 1}
              </div>
              {idx < 5 && <div className="w-px h-6 mt-0.5" style={{ backgroundColor: COLORS.border }} />}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>
                {SCENE_NAMES[idx] || `Scene ${idx + 1}`}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMid }}>
                {POST_CONNECTIONS[idx] || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Script Intelligence Panel ────────────────────────────────────────────────

function ScriptIntelligencePanel({
  totalDuration,
  narrationWordCount,
  shotCount,
}: {
  totalDuration: number
  narrationWordCount: number
  shotCount: number
}) {
  const visualPct = 78
  const narrationPct = 22
  const arcNodes = ["Recognition", "Discomfort", "Clarity", "Freedom"]

  const metrics = [
    { icon: Clock, label: "Total duration", value: `${totalDuration} seconds` },
    { icon: PenLine, label: "Narration word count", value: `${narrationWordCount} words` },
    { icon: Zap, label: "Pacing", value: "Balanced" },
    { icon: FilmIcon, label: "Scenes", value: `${shotCount} scenes` },
    { icon: Mic, label: "Silence moments", value: "1 intentional pause" },
    { icon: Compass, label: "Complexity", value: "Medium" },
  ]

  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.gold }}>
          Script Intelligence
        </p>
      </div>
      <p className="text-[10px] mb-3" style={{ color: COLORS.textMuted }}>How the script supports the post.</p>

      {/* Metric rows */}
      <div className="space-y-2 mb-3">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color: COLORS.textMuted }} />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>{m.label}</span>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>{m.value}</span>
            </div>
          )
        })}
      </div>

      {/* Emotional arc */}
      <div className="mb-3 pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
        <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.textMuted }}>
          Emotional arc
        </p>
        <p className="text-[10px] mb-2" style={{ color: COLORS.textDark }}>
          {arcNodes.join(" → ")}
        </p>
        <div className="flex items-center gap-1">
          {arcNodes.map((node, i) => (
            <div key={node} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: i === 0 || i === arcNodes.length - 1 ? COLORS.gold : COLORS.blue,
                  }}
                />
                <span className="text-[7px] text-center leading-tight" style={{ color: COLORS.textMuted }}>{node}</span>
              </div>
              {i < arcNodes.length - 1 && (
                <div className="flex-1 h-px" style={{ backgroundColor: COLORS.border }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual vs narration bar */}
      <div className="mb-3 pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
            Visual vs narration
          </p>
          <p className="text-[9px]" style={{ color: COLORS.textDark }}>{visualPct}% / {narrationPct}%</p>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div style={{ width: `${visualPct}%`, backgroundColor: COLORS.blue }} />
          <div style={{ width: `${narrationPct}%`, backgroundColor: COLORS.gold }} />
        </div>
      </div>

      {/* What this film is not */}
      <div className="pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
        <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.textMuted }}>
          What this film is not
        </p>
        <div className="space-y-1">
          {WHAT_FILM_IS_NOT.map((item) => (
            <div key={item} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: COLORS.green }} />
              <span className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="#"
        className="flex items-center gap-1 text-[10px] font-medium mt-3 transition-colors hover:underline"
        style={{ color: COLORS.blue }}
      >
        View post →
      </Link>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRAMES TAB
// ═══════════════════════════════════════════════════════════════════════════════

const KEYFRAME_TITLES = [
  "The Weight",
  "The Reveal",
  "Beneath the Surface",
  "The Turn",
  "The Release",
  "The Dawn",
]

const KEYFRAME_DESCRIPTIONS = [
  "A city sits on his back.",
  "The entire office is tilted.",
  "He walks beneath the building.",
  "He turns the valve under a heavy beam.",
  "He releases what was never his.",
  "The city stands. He steps back.",
]

const KEYFRAME_META = [
  { cam: "Wide Shot", lens: "24mm", light: "Dawn Backlight" },
  { cam: "Dutch Tilt", lens: "28mm", light: "Soft Window" },
  { cam: "Low Angle", lens: "21mm", light: "Low Key" },
  { cam: "Close-up", lens: "50mm", light: "Motivated" },
  { cam: "Medium Shot", lens: "35mm", light: "Dawn Side" },
  { cam: "Wide Shot", lens: "24mm", light: "Golden Dawn" },
]

const FRAME_NOTES = [
  "Avoid literal illustration of a man holding a city.",
  "Hold on the burden before the reveal.",
  "Preserve dawn warmth in opening and ending.",
  "Keep the city scale believable.",
]

const VISUAL_TREATMENT = {
  palette: [
    { color: "#8B6914", name: "Warm amber" },
    { color: "#1A2332", name: "Navy shadow" },
    { color: "#9B9B9B", name: "Stone gray" },
  ],
  lighting: "Dawn glow, soft contrast",
  camera: "Slow, composed, cinematic",
  texture: "Real, subtle grain",
  ratios: ["16:9", "9:16", "1:1"],
}

const CONTINUITY_CHECKS = [
  { label: "Character face consistent", status: "pass" as const },
  { label: "Wardrobe consistent", status: "pass" as const },
  { label: "Architecture aligned", status: "pass" as const },
  { label: "Lighting arc works", status: "pass" as const },
  { label: "Symbol usage aligned", status: "pass" as const },
  { label: "Scene 04 scale mismatch", status: "warning" as const },
]

function FramesTab({ production }: { production: Production }) {
  const [selectedFrame, setSelectedFrame] = useState(2) // Scene 03 by default
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [frameStatuses, setFrameStatuses] = useState<("approved" | "review" | "draft")[]>([
    "approved", "approved", "review", "draft", "draft", "draft",
  ])

  function cycleStatus(idx: number) {
    setFrameStatuses((prev) => {
      const next = [...prev]
      const current = next[idx]
      next[idx] = current === "draft" ? "review" : current === "review" ? "approved" : "draft"
      return next
    })
  }

  function approveAllFrames() {
    setFrameStatuses((prev) => prev.map(() => "approved"))
    updateProduction(production.id, (p) => ({
      ...p,
      gates: { ...p.gates, keyframes: { key: "keyframes", status: "approved" as const } },
    }))
  }

  const shots = production.film.shots.slice(0, 6)
  const approvedCount = frameStatuses.filter((s) => s === "approved").length
  const reviewCount = frameStatuses.filter((s) => s === "review").length

  return (
    <div className="pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ═══ MAIN COLUMN ═══ */}
        <div className="space-y-5">
          {/* Header */}
          <div>
            <h1 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
              <span style={{ color: COLORS.textMuted }}>4.</span> Design the visual blueprint
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
              Approve the key frames, visual treatment, and character continuity before we generate scenes.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Palette} title="Visual treatment" desc="Cinematic realism · warm dawn light · calm camera language" action="View" />
            <SummaryCard icon={User} title="Character casting" desc="Founder locked · wardrobe approved" action="Edit" />
            <SummaryCard icon={Shield} title="Continuity" desc={`${approvedCount} checks passing${reviewCount > 0 ? ` · ${reviewCount} needs review` : ""}`} action="View" />
          </div>

          {/* Keyframe Board */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-serif text-base" style={{ color: COLORS.textDark }}>Keyframe board</h2>
                <p className="text-[10px]" style={{ color: COLORS.textMuted }}>Scene by scene visual approvals</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("board")}
                  className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: viewMode === "board" ? COLORS.navy : "transparent",
                    color: viewMode === "board" ? "#FFFFFF" : COLORS.textMuted,
                  }}
                >
                  <LayoutGrid className="w-3 h-3" />
                  Board
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: viewMode === "list" ? COLORS.navy : "transparent",
                    color: viewMode === "list" ? "#FFFFFF" : COLORS.textMuted,
                  }}
                >
                  <List className="w-3 h-3" />
                  List
                </button>
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
              </div>
            </div>

            {/* Board View */}
            {viewMode === "board" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shots.map((shot, idx) => (
                  <KeyframeCard
                    key={shot.no}
                    idx={idx}
                    title={KEYFRAME_TITLES[idx] || `Scene ${idx + 1}`}
                    description={KEYFRAME_DESCRIPTIONS[idx] || ""}
                    meta={KEYFRAME_META[idx] || KEYFRAME_META[0]}
                    status={frameStatuses[idx]}
                    isSelected={selectedFrame === idx}
                    onSelect={() => setSelectedFrame(idx)}
                    onCycleStatus={() => cycleStatus(idx)}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
                {shots.map((shot, idx) => {
                  const status = frameStatuses[idx]
                  const meta = KEYFRAME_META[idx] || KEYFRAME_META[0]
                  return (
                    <div
                      key={shot.no}
                      onClick={() => setSelectedFrame(idx)}
                      className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0 cursor-pointer transition-colors hover:bg-black/[0.015]"
                      style={{
                        borderColor: COLORS.borderLight,
                        backgroundColor: selectedFrame === idx ? "rgba(194,154,91,0.04)" : "transparent",
                      }}
                    >
                      <span className="text-[9px] font-bold w-6" style={{ color: COLORS.textMuted }}>{String(idx + 1).padStart(2, "0")}</span>
                      <div className="w-10 h-10 rounded-md flex-shrink-0" style={{ background: `linear-gradient(135deg, ${COLORS.navy}10, ${COLORS.gold}10)` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{KEYFRAME_TITLES[idx] || `Scene ${idx + 1}`}</p>
                        <p className="text-[9px]" style={{ color: COLORS.textMuted }}>{meta.cam} · {meta.lens} · {meta.light}</p>
                      </div>
                      <StatusBadge status={status} />
                      <MoreHorizontal className="w-3 h-3" style={{ color: COLORS.textMuted }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Character Continuity + Frame Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Character Continuity */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Character continuity</p>
                <MoreHorizontal className="w-3 h-3" style={{ color: COLORS.textMuted }} />
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.gold})` }}
                >
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-semibold" style={{ color: COLORS.textDark }}>Founder (Main Character)</p>
                    <StatusBadge status="approved" />
                  </div>
                  <div className="space-y-0.5 mt-1.5">
                    <p className="text-[10px]" style={{ color: COLORS.textMid }}><strong style={{ color: COLORS.textDark }}>Wardrobe:</strong> Dark coat · layers · practical</p>
                    <p className="text-[10px]" style={{ color: COLORS.textMid }}><strong style={{ color: COLORS.textDark }}>Posture:</strong> Carries weight · grounded · restrained</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <Eye className="w-3 h-3" />
                  View character
                </button>
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <Check className="w-3 h-3" />
                  Approve variation
                </button>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
                <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.textMuted }}>Continuity across scenes</p>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: "rgba(34,160,107,0.08)", color: COLORS.green }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {i < 5 && <Check className="w-2.5 h-2.5" style={{ color: COLORS.green }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frame Notes */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: COLORS.textMid }}>Frame notes</p>
              <div className="space-y-2 mb-3">
                {FRAME_NOTES.map((note) => (
                  <div key={note} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: COLORS.gold }} />
                    <p className="text-[11px] leading-snug" style={{ color: COLORS.textDark }}>{note}</p>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
                <PenLine className="w-3 h-3" />
                Add note
              </button>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* Selected Frame Detail */}
          <SelectedFrameDetail idx={selectedFrame} />

          {/* Visual Treatment */}
          <VisualTreatmentCard />

          {/* Continuity Check */}
          <ContinuityCheckCard />

          {/* Ready for Scenes */}
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: "rgba(194,154,91,0.05)",
              borderColor: "rgba(194,154,91,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: COLORS.gold }} />
              <p className="font-serif text-sm" style={{ color: COLORS.textDark }}>Ready for scene generation</p>
            </div>
            <p className="text-[10px] mb-3" style={{ color: COLORS.textMid }}>
              Once the frames are approved, the Studio can generate motion.
            </p>
            <div className="space-y-2">
              <button
                onClick={approveAllFrames}
                className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
              >
                Approve frames &amp; generate scenes
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <RefreshCw className="w-3 h-3" />
                Request revisions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Keyframe Card ──────────────────────────────────────────────────────────

function KeyframeCard({
  idx,
  title,
  description,
  meta,
  status,
  isSelected,
  onSelect,
  onCycleStatus,
}: {
  idx: number
  title: string
  description: string
  meta: { cam: string; lens: string; light: string }
  status: "approved" | "review" | "draft"
  isSelected: boolean
  onSelect: () => void
  onCycleStatus: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="rounded-xl border overflow-hidden cursor-pointer transition-all"
      style={{
        backgroundColor: COLORS.white,
        borderColor: isSelected ? COLORS.gold : COLORS.borderLight,
        borderWidth: isSelected ? 1.5 : 1,
        boxShadow: isSelected ? "0 2px 12px rgba(194,154,91,0.12)" : "none",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative h-28 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${COLORS.navy}12, ${COLORS.gold}10)` }}
      >
        <span className="text-[28px] font-serif" style={{ color: `${COLORS.navy}20` }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div className="absolute top-2 left-2">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <MoreHorizontal className="w-3 h-3 text-white/60" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{title}</p>
          <StatusBadge status={status} />
        </div>
        <p className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>{description}</p>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[8px]" style={{ color: COLORS.textMuted }}>
          <span className="flex items-center gap-0.5">
            <Camera className="w-2.5 h-2.5" />
            {meta.cam}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Aperture className="w-2.5 h-2.5" />
            {meta.lens}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Sun className="w-2.5 h-2.5" />
            {meta.light}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1">
          <button className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors hover:bg-black/5" style={{ color: COLORS.textMuted }}>
            <GitCompare className="w-2.5 h-2.5" />
            Compare
          </button>
          <button className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors hover:bg-black/5" style={{ color: COLORS.textMuted }}>
            <RefreshCw className="w-2.5 h-2.5" />
            Regenerate
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCycleStatus() }}
            className="ml-auto flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors"
            style={{
              backgroundColor: status === "approved" ? "rgba(34,160,107,0.08)" : status === "review" ? "rgba(194,154,91,0.08)" : "rgba(138,133,120,0.06)",
              color: status === "approved" ? COLORS.green : status === "review" ? COLORS.gold : COLORS.textMuted,
            }}
          >
            {status === "approved" ? <Check className="w-2.5 h-2.5" /> : null}
            {status === "approved" ? "Approved" : status === "review" ? "Review" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "approved" | "review" | "draft" }) {
  const config = {
    approved: { label: "Approved", bg: "rgba(34,160,107,0.08)", color: COLORS.green },
    review: { label: "Needs review", bg: "rgba(194,154,91,0.1)", color: COLORS.gold },
    draft: { label: "Draft", bg: "rgba(138,133,120,0.06)", color: COLORS.textMuted },
  }
  const c = config[status]
  return (
    <span
      className="text-[8px] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

// ─── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-start gap-2 mb-1.5">
        <div className="rounded-md flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: `${COLORS.gold}10` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
        </div>
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: COLORS.textDark }}>{title}</p>
      </div>
      <p className="text-[10px] leading-snug mb-2" style={{ color: COLORS.textMid }}>{desc}</p>
      <button className="text-[10px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>{action}</button>
    </div>
  )
}

// ─── Selected Frame Detail ──────────────────────────────────────────────────

function SelectedFrameDetail({ idx }: { idx: number }) {
  const title = KEYFRAME_TITLES[idx] || `Scene ${idx + 1}`
  const meta = KEYFRAME_META[idx] || KEYFRAME_META[0]
  const desc = KEYFRAME_DESCRIPTIONS[idx] || ""

  const attributes = [
    { label: "Camera", value: `${meta.cam} tracking in` },
    { label: "Lighting", value: `${meta.light} · shafts of light` },
    { label: "Composition", value: "Leading lines · center depth" },
    { label: "Symbol usage", value: idx === 2 ? "Underground = truth" : idx === 3 ? "Valve = leverage" : idx === 5 ? "Dawn = new era" : "Metaphor locked" },
    { label: "World alignment", value: "Aligned" },
  ]

  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Selected frame detail</p>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.gold}10`, color: COLORS.gold }}>
          Scene {String(idx + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className="h-24 rounded-lg flex items-center justify-center mb-2"
        style={{ background: `linear-gradient(135deg, ${COLORS.navy}15, ${COLORS.gold}10)` }}
      >
        <span className="text-[32px] font-serif" style={{ color: `${COLORS.navy}20` }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
      </div>

      <p className="text-[12px] font-semibold mb-1" style={{ color: COLORS.textDark }}>{title}</p>
      <p className="text-[10px] leading-snug mb-2" style={{ color: COLORS.textMid }}>{desc}</p>

      {/* Attributes */}
      <div className="space-y-1 mb-3">
        {attributes.map((attr) => (
          <div key={attr.label} className="flex items-start gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-wide w-24 flex-shrink-0" style={{ color: COLORS.textMuted }}>{attr.label}</span>
            <span className="text-[10px] leading-snug" style={{ color: COLORS.textDark }}>{attr.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
          <GitCompare className="w-2.5 h-2.5" />
          Compare
        </button>
        <button className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
          <Replace className="w-2.5 h-2.5" />
          Replace
        </button>
        <button className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-1 rounded border transition-colors hover:bg-black/5 ml-auto" style={{ borderColor: COLORS.border, color: COLORS.blue }}>
          Open script
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Visual Treatment Card ──────────────────────────────────────────────────

function VisualTreatmentCard() {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Visual treatment</p>
        <button className="text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
          <PenLine className="w-2.5 h-2.5 inline" /> Edit
        </button>
      </div>

      {/* Palette */}
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: COLORS.textMuted }}>Palette</p>
        <div className="flex items-center gap-2">
          {VISUAL_TREATMENT.palette.map((sw) => (
            <div key={sw.name} className="flex items-center gap-1">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: sw.color }} />
            </div>
          ))}
        </div>
        <p className="text-[9px] mt-1" style={{ color: COLORS.textMid }}>
          {VISUAL_TREATMENT.palette.map((p) => p.name).join(", ")}
        </p>
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        <TreatmentRow icon={Sun} label="Lighting" value={VISUAL_TREATMENT.lighting} />
        <TreatmentRow icon={Camera} label="Camera" value={VISUAL_TREATMENT.camera} />
        <TreatmentRow icon={Layers} label="Texture" value={VISUAL_TREATMENT.texture} />
      </div>

      {/* Aspect ratios */}
      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>Ratios:</span>
        {VISUAL_TREATMENT.ratios.map((r) => (
          <span key={r} className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
            {r}
          </span>
        ))}
      </div>

      <button className="flex items-center justify-center gap-1 w-full text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5 mt-3" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
        <Sparkles className="w-3 h-3" style={{ color: COLORS.gold }} />
        Apply World preset
      </button>
    </div>
  )
}

function TreatmentRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.textMuted }} />
      <span className="text-[9px] font-semibold uppercase tracking-wide w-16 flex-shrink-0" style={{ color: COLORS.textMuted }}>{label}</span>
      <span className="text-[10px]" style={{ color: COLORS.textDark }}>{value}</span>
    </div>
  )
}

// ─── Continuity Check Card ──────────────────────────────────────────────────

function ContinuityCheckCard() {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>Continuity check</p>
      <div className="space-y-1.5">
        {CONTINUITY_CHECKS.map((check) => (
          <div key={check.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {check.status === "pass" ? (
                <Check className="w-3 h-3" style={{ color: COLORS.green }} />
              ) : (
                <AlertTriangle className="w-3 h-3" style={{ color: COLORS.gold }} />
              )}
              <span className="text-[10px]" style={{ color: check.status === "pass" ? COLORS.textDark : COLORS.gold }}>
                {check.label}
              </span>
            </div>
            {check.status === "warning" && (
              <button className="text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>Review</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENES TAB
// ═══════════════════════════════════════════════════════════════════════════════

const SCENE_CARD_TITLES = [
  "The Weight",
  "The Reveal",
  "Beneath the Surface",
  "The Turn",
  "The Release",
  "The Dawn",
]

const SCENE_CARD_DURATIONS = ["0:08", "0:10", "0:12", "0:08", "0:10", "0:10"]
const SCENE_TAKE_COUNTS = [3, 2, 4, 1, 2, 0]

const SCENE_CAMERA = [
  { shot: "Wide Shot", lens: "24mm", movement: "Slow push-in", height: "Eye level" },
  { shot: "Dutch Tilt", lens: "28mm", movement: "Static hold", height: "Eye level" },
  { shot: "Low Angle", lens: "21mm", movement: "Forward track", height: "Low" },
  { shot: "Close-up", lens: "50mm", movement: "Handheld", height: "Eye level" },
  { shot: "Medium Shot", lens: "35mm", movement: "Lateral dolly", height: "Eye level" },
  { shot: "Wide Shot", lens: "24mm", movement: "Slow pull-back", height: "Eye level" },
]

const SCENE_LIGHTING = [
  { setup: "Dawn Backlight", intensity: "Soft", temp: "3200K", direction: "Back-left", diffusion: "1/2 CTO" },
  { setup: "Soft Window", intensity: "Medium", temp: "4300K", direction: "Right side", diffusion: "Frost" },
  { setup: "Low Key", intensity: "Low", temp: "2800K", direction: "Below subject", diffusion: "None" },
  { setup: "Motivated Practical", intensity: "Medium", temp: "3600K", direction: "Front-right", diffusion: "1/4 CTO" },
  { setup: "Dawn Side", intensity: "Soft", temp: "3200K", direction: "Left side", diffusion: "Silk" },
  { setup: "Golden Dawn", intensity: "Warm", temp: "3000K", direction: "Back-right", diffusion: "1/2 CTO" },
]

const SCENE_SOUND = [
  { src: "Room tone · distant traffic", score: "Minimal piano motif", foley: "Cup sliding on desk", dialog: "None" },
  { src: "Tilt creak · items shifting", score: "Low string swell", foley: "Papers falling", dialog: "None" },
  { src: "Underground ambience · water drip", score: "Deep drone + single note", foley: "Footsteps on stone", dialog: "None" },
  { src: "Metal strain · valve click", score: "Tension string stab", foley: "Hands on metal", dialog: "None" },
  { src: "Exhale · fabric rustle", score: "Piano resolve", foley: "Keys dropping", dialog: "None" },
  { src: "Ambient city · birds", score: "Full melody · warm strings", foley: "None", dialog: "None" },
]

type TakeStatus = "approved" | "review" | "rejected"

const TAKES_DATA: { id: string; duration: string; status: TakeStatus; note: string }[][] = [
  [
    { id: "A", duration: "0:08", status: "approved", note: "Best motion arc — smooth settle" },
    { id: "B", duration: "0:08", status: "review", note: "Slight framing drift at 0:03" },
    { id: "C", duration: "0:08", status: "rejected", note: "Character scale breaks" },
  ],
  [
    { id: "A", duration: "0:10", status: "approved", note: "Strong tilt reveal" },
    { id: "B", duration: "0:10", status: "rejected", note: "Too fast — loses tension" },
  ],
  [
    { id: "A", duration: "0:12", status: "review", note: "Great underground mood" },
    { id: "B", duration: "0:12", status: "review", note: "Darker — more oppressive" },
    { id: "C", duration: "0:12", status: "rejected", note: "Lighting mismatch with Scene 02" },
    { id: "D", duration: "0:12", status: "rejected", note: "Camera shake" },
  ],
  [
    { id: "A", duration: "0:08", status: "approved", note: "Perfect valve interaction" },
  ],
  [
    { id: "A", duration: "0:10", status: "review", note: "Good release moment" },
    { id: "B", duration: "0:10", status: "rejected", note: "Performance feels flat" },
  ],
  [],
]

const GEN_SETTINGS = [
  { label: "Model", value: "Veo 3.1" },
  { label: "Aspect", value: "16:9" },
  { label: "Duration", value: "8–12s" },
  { label: "FPS", value: "24" },
  { label: "Style", value: "Cinematic realism" },
  { label: "Motion", value: "Subtle" },
]

const SEQUENCE_NODES = [
  { label: "01", status: "generated" as const },
  { label: "02", status: "generated" as const },
  { label: "03", status: "generating" as const },
  { label: "04", status: "generated" as const },
  { label: "05", status: "queued" as const },
  { label: "06", status: "queued" as const },
]

function ScenesTab({ production }: { production: Production }) {
  const [selectedScene, setSelectedScene] = useState(0)
  const [selectedTake, setSelectedTake] = useState<string | null>("A")
  const shots = production.film.shots.slice(0, 6)
  const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0)
  const currentTakes = TAKES_DATA[selectedScene] || []
  const generatedCount = SEQUENCE_NODES.filter((s) => s.status === "generated").length

  const sceneStatuses = ["generated", "generated", "generating", "generated", "queued", "queued"] as const

  return (
    <div className="pt-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
            <span style={{ color: COLORS.textMuted }}>5.</span> Generate and direct each scene
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
            The Studio generates motion for each approved frame. Direct each scene until it earns its place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
            <span>Render engine</span>
            <span className="font-semibold" style={{ color: COLORS.textDark }}>Veo 3.1</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <button className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}>
            <Sparkles className="w-3 h-3" style={{ color: COLORS.gold }} />
            Generate all remaining
          </button>
        </div>
      </div>

      {/* ═══ SCENE CARDS STRIP ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        {shots.map((shot, idx) => {
          const status = sceneStatuses[idx]
          const isActive = selectedScene === idx
          const takeCount = SCENE_TAKE_COUNTS[idx]
          return (
            <button
              key={shot.no}
              onClick={() => { setSelectedScene(idx); setSelectedTake("A") }}
              className="flex-shrink-0 rounded-lg border overflow-hidden transition-all"
              style={{
                backgroundColor: COLORS.white,
                borderColor: isActive ? COLORS.gold : COLORS.borderLight,
                borderWidth: isActive ? 1.5 : 1,
                boxShadow: isActive ? "0 2px 10px rgba(194,154,91,0.15)" : "none",
                width: 96,
              }}
            >
              <div
                className="relative h-14 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${COLORS.navy}${isActive ? "18" : "10"}, ${COLORS.gold}08)` }}
              >
                <span className="text-[20px] font-serif" style={{ color: `${COLORS.navy}25` }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {/* Status indicator */}
                <div className="absolute top-1 right-1">
                  {status === "generated" && <Check className="w-2.5 h-2.5" style={{ color: COLORS.green }} />}
                  {status === "generating" && <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ color: COLORS.gold }} />}
                  {status === "queued" && <Clock className="w-2.5 h-2.5" style={{ color: COLORS.textMuted }} />}
                </div>
                {/* Play indicator for generated */}
                {status === "generated" && (
                  <div className="absolute bottom-1 left-1">
                    <Play className="w-2.5 h-2.5 text-white/60" />
                  </div>
                )}
              </div>
              <div className="px-1.5 py-1.5">
                <p className="text-[8px] font-semibold truncate" style={{ color: COLORS.textDark }}>
                  {SCENE_CARD_TITLES[idx] || `Scene ${idx + 1}`}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[7px]" style={{ color: COLORS.textMuted }}>{SCENE_CARD_DURATIONS[idx]}</span>
                  {takeCount > 0 && (
                    <span className="text-[7px] font-medium px-1 rounded" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
                      {takeCount} takes
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ═══ LEFT: EXPANDED SCENE PANEL ═══ */}
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div
              className="relative flex items-center justify-center"
              style={{
                height: 240,
                background: `linear-gradient(135deg, ${COLORS.navy}12, ${COLORS.gold}08)`,
              }}
            >
              {/* Scene number watermark */}
              <span className="text-[72px] font-serif select-none" style={{ color: `${COLORS.navy}08` }}>
                {String(selectedScene + 1).padStart(2, "0")}
              </span>

              {/* Center play button */}
              <button
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div
                  className="rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    width: 56, height: 56,
                    backgroundColor: "rgba(26,35,50,0.8)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
              </button>

              {/* Top overlay bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/80">
                    Scene {String(selectedScene + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-white/50">·</span>
                  <span className="text-[9px] text-white/60">
                    {SCENE_CARD_TITLES[selectedScene] || `Scene ${selectedScene + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {sceneStatuses[selectedScene] === "generating" ? (
                    <span className="flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(194,154,91,0.2)", color: COLORS.gold }}>
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      Generating
                    </span>
                  ) : sceneStatuses[selectedScene] === "queued" ? (
                    <span className="flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(138,133,120,0.15)", color: COLORS.textMuted }}>
                      <Clock className="w-2.5 h-2.5" />
                      Queued
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,160,107,0.15)", color: COLORS.green }}>
                      <Check className="w-2.5 h-2.5" />
                      Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom overlay bar — scrubber */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-medium text-white/60">0:00</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <div className="h-full rounded-full" style={{ width: "35%", backgroundColor: COLORS.gold }} />
                  </div>
                  <span className="text-[8px] font-medium text-white/60">{SCENE_CARD_DURATIONS[selectedScene]}</span>
                  <Volume2 className="w-3 h-3 text-white/40" />
                </div>
              </div>
            </div>

            {/* Script excerpt + status row */}
            <div className="flex items-start gap-4 p-3 border-t" style={{ borderColor: COLORS.borderLight }}>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: COLORS.textMuted }}>
                  Script excerpt
                </p>
                <p className="text-[11px] leading-relaxed font-serif italic" style={{ color: COLORS.textDark }}>
                  {NARRATION_LINES[selectedScene] || "—"}
                </p>
                <p className="text-[9px] mt-1" style={{ color: COLORS.textMid }}>
                  {shots[selectedScene]?.description || ""}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <Download className="w-2.5 h-2.5" />
                  Export
                </button>
                <button className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <Replace className="w-2.5 h-2.5" />
                  Regenerate
                </button>
                <button className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}>
                  <Check className="w-2.5 h-2.5" />
                  Approve
                </button>
              </div>
            </div>
          </div>

          {/* ═══ GENERATED TAKES ═══ */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>
                  Generated takes
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: COLORS.textMuted }}>
                  {currentTakes.length} take{currentTakes.length !== 1 ? "s" : ""} · Select the best one
                </p>
              </div>
              <button className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.blue }}>
                <Plus className="w-3 h-3" />
                New take
              </button>
            </div>

            {currentTakes.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed" style={{ borderColor: COLORS.border }}>
                <FilmIcon className="w-8 h-8 mx-auto mb-2" style={{ color: COLORS.border }} />
                <p className="text-[11px] mb-1" style={{ color: COLORS.textMid }}>No takes generated yet</p>
                <button className="text-[10px] font-semibold transition-colors hover:underline" style={{ color: COLORS.blue }}>
                  Generate first take →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentTakes.map((take) => {
                  const isSelected = selectedTake === take.id
                  return (
                    <div
                      key={take.id}
                      onClick={() => setSelectedTake(take.id)}
                      className="rounded-lg border overflow-hidden cursor-pointer transition-all"
                      style={{
                        borderColor: isSelected ? COLORS.gold : COLORS.borderLight,
                        borderWidth: isSelected ? 1.5 : 1,
                        backgroundColor: "rgba(138,133,120,0.02)",
                      }}
                    >
                      <div
                        className="relative h-16 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${COLORS.navy}08, ${COLORS.gold}05)` }}
                      >
                        <span className="text-[14px] font-serif" style={{ color: `${COLORS.navy}20` }}>{take.id}</span>
                        {take.status === "approved" && (
                          <div className="absolute top-1 right-1">
                            <Check className="w-2.5 h-2.5" style={{ color: COLORS.green }} />
                          </div>
                        )}
                        {take.status === "rejected" && (
                          <div className="absolute top-1 right-1">
                            <X className="w-2.5 h-2.5" style={{ color: "#E53E3E" }} />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold" style={{ color: COLORS.textDark }}>Take {take.id}</span>
                          <span className="text-[8px]" style={{ color: COLORS.textMuted }}>{take.duration}</span>
                        </div>
                        <p className="text-[8px] leading-snug mt-0.5" style={{ color: COLORS.textMid }}>{take.note}</p>
                        <div className="mt-1">
                          <TakeStatusBadge status={take.status} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT DETAIL PANEL ═══ */}
        <div className="space-y-4">
          {/* Camera Direction */}
          <SceneDetailCard
            icon={Camera}
            title="Camera direction"
            rows={(() => {
              const cam = SCENE_CAMERA[selectedScene] || SCENE_CAMERA[0]
              return [
                { label: "Shot type", value: cam.shot },
                { label: "Lens", value: cam.lens },
                { label: "Movement", value: cam.movement },
                { label: "Height", value: cam.height },
              ]
            })()}
          />

          {/* Lighting Design */}
          <SceneDetailCard
            icon={Sun}
            title="Lighting design"
            rows={(() => {
              const light = SCENE_LIGHTING[selectedScene] || SCENE_LIGHTING[0]
              return [
                { label: "Setup", value: light.setup },
                { label: "Intensity", value: light.intensity },
                { label: "Temperature", value: light.temp },
                { label: "Direction", value: light.direction },
                { label: "Diffusion", value: light.diffusion },
              ]
            })()}
          />

          {/* Sound Design */}
          <SceneDetailCard
            icon={Waves}
            title="Sound design"
            rows={(() => {
              const sound = SCENE_SOUND[selectedScene] || SCENE_SOUND[0]
              return [
                { label: "Ambience", value: sound.src },
                { label: "Score", value: sound.score },
                { label: "Foley", value: sound.foley },
                { label: "Dialog", value: sound.dialog },
              ]
            })()}
          />

          {/* Generation Settings */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Aperture className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.gold }}>
                  Generation settings
                </p>
              </div>
              <button className="text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
                Edit
              </button>
            </div>
            <div className="space-y-1">
              {GEN_SETTINGS.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>{s.label}</span>
                  <span className="text-[10px]" style={{ color: COLORS.textDark }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM SEQUENCE OVERVIEW BAR ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t md:ml-[140px]"
        style={{ backgroundColor: COLORS.navy, borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Progress bar */}
        <div className="h-0.5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full transition-all"
            style={{
              width: `${(generatedCount / SEQUENCE_NODES.length) * 100}%`,
              backgroundColor: COLORS.gold,
            }}
          />
        </div>

        <div className="flex items-center gap-3 px-6 py-2.5">
          {/* Sequence nodes */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {SEQUENCE_NODES.map((node, idx) => (
              <div key={node.label} className="flex items-center gap-1.5">
                <button
                  onClick={() => { setSelectedScene(idx); setSelectedTake("A") }}
                  className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: selectedScene === idx ? "rgba(194,154,91,0.15)" : "transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                    style={{
                      backgroundColor: node.status === "generated" ? COLORS.green : node.status === "generating" ? COLORS.gold : "rgba(255,255,255,0.1)",
                      color: "#FFFFFF",
                    }}
                  >
                    {node.status === "generated" ? <Check className="w-2.5 h-2.5" /> : node.label}
                  </div>
                  <span
                    className="text-[8px] font-medium hidden sm:inline"
                    style={{
                      color: node.status === "queued" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {SCENE_CARD_TITLES[idx]?.split(" ")[0] || `S${node.label}`}
                  </span>
                </button>
                {idx < SEQUENCE_NODES.length - 1 && (
                  <div className="w-3 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stats + actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-semibold text-white">
                {generatedCount}/{SEQUENCE_NODES.length} scenes ready
              </p>
              <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {formatTimecode(totalDuration)} total
              </p>
            </div>
            <button
              className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
            >
              <ArrowRight className="w-3 h-3" />
              Proceed to edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Scene Detail Card ──────────────────────────────────────────────────────

function SceneDetailCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: React.ElementType
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: COLORS.textMuted }} />
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>{title}</p>
        </div>
        <button className="text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>Edit</button>
      </div>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-wide w-20 flex-shrink-0 pt-0.5" style={{ color: COLORS.textMuted }}>{row.label}</span>
            <span className="text-[10px] leading-snug" style={{ color: COLORS.textDark }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Take Status Badge ──────────────────────────────────────────────────────

function TakeStatusBadge({ status }: { status: "approved" | "review" | "rejected" }) {
  const config = {
    approved: { label: "Approved", bg: "rgba(34,160,107,0.08)", color: COLORS.green },
    review: { label: "Review", bg: "rgba(194,154,91,0.1)", color: COLORS.gold },
    rejected: { label: "Rejected", bg: "rgba(229,62,62,0.06)", color: "#E53E3E" },
  }
  const c = config[status]
  return (
    <span
      className="text-[7px] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-full inline-block"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT TAB
// ═══════════════════════════════════════════════════════════════════════════════

const EDIT_SCENE_ASSETS = [
  { idx: 1, title: "The Catch", start: "0:00", end: "0:05", status: "ready" as const },
  { idx: 2, title: "The Reveal", start: "0:05", end: "0:10", status: "ready" as const },
  { idx: 3, title: "The Marble", start: "0:10", end: "0:15", status: "ready" as const },
  { idx: 4, title: "The Descent", start: "0:15", end: "0:25", status: "ready" as const },
  { idx: 5, title: "The Turn", start: "0:25", end: "0:30", status: "ready" as const },
  { idx: 6, title: "The Settle", start: "0:30", end: "0:35", status: "ready" as const },
]

const SFX_CHIPS = ["Footsteps", "Door Creak", "Metal Turn", "Room Tone"]
const TITLE_CHIPS = [
  "The cup slides.",
  "Pull back.",
  "The first answer…",
  "Go beneath the surface.",
  "Find the one turn.",
  "Movement is not always progress.",
]

const VERSION_HISTORY = [
  { ver: "V3", date: "Today, 2:41 PM", author: "Tai", current: true },
  { ver: "V2", date: "Today, 11:32 AM", author: "Tai", current: false },
  { ver: "V1", date: "Yesterday, 9:18 PM", author: "Tai", current: false },
]

const SPEED_OPTIONS = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"]

function EditTab({ }: { production: Production }) {
  const [selectedClip, setSelectedClip] = useState(4) // Scene 04 selected by default
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [colorEnabled, setColorEnabled] = useState(true)
  const [speed, setSpeed] = useState("1x")
  const [activeAspect, setActiveAspect] = useState<"9:16" | "1:1" | "16:9">("9:16")
  const [playheadPos] = useState(45) // percent

  return (
    <div className="pt-4">
      {/* ═══ HEADER ROW ═══ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
            <span style={{ color: COLORS.textMuted }}>6.</span> Assemble the final cut
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
            Arrange, trim, and polish. The edit is where scenes become a film.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium" style={{ color: COLORS.textMuted }}>Production progress</span>
            <span className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>6 of 8</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
              <div className="h-full rounded-full" style={{ width: "75%", backgroundColor: COLORS.navy }} />
            </div>
          </div>
          <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
            <SettingsIcon className="w-3 h-3" />
            Production settings
          </button>
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_300px] gap-4">
        {/* ═══ LEFT: ASSETS PANEL ═══ */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
          <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Assets</p>
          </div>
          {/* Sub-tabs */}
          <div className="flex items-center gap-3 px-3 py-2 border-b" style={{ borderColor: COLORS.borderLight }}>
            {['Scenes', 'B-roll', 'Audio', 'Graphics'].map((tab, i) => (
              <button
                key={tab}
                className="text-[9px] font-semibold pb-0.5 transition-colors relative"
                style={{ color: i === 0 ? COLORS.navy : COLORS.textMuted }}
              >
                {tab}
                {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.gold }} />}
              </button>
            ))}
          </div>
          {/* Scene list */}
          <div className="max-h-[420px] overflow-y-auto">
            {EDIT_SCENE_ASSETS.map((asset) => {
              const isSelected = selectedClip === asset.idx
              return (
                <button
                  key={asset.idx}
                  onClick={() => setSelectedClip(asset.idx)}
                  className="w-full flex items-center gap-2 px-2 py-2 border-b last:border-0 text-left transition-colors hover:bg-black/[0.015]"
                  style={{
                    borderColor: COLORS.borderLight,
                    backgroundColor: isSelected ? "rgba(194,154,91,0.06)" : "transparent",
                  }}
                >
                  <div
                    className="w-10 h-7 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.navy}12, ${COLORS.gold}08)`,
                      color: COLORS.textMuted,
                      border: isSelected ? `1px solid ${COLORS.gold}` : "none",
                    }}
                  >
                    {String(asset.idx).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold truncate" style={{ color: COLORS.textDark }}>{asset.title}</p>
                    <p className="text-[8px]" style={{ color: COLORS.textMuted }}>{asset.start} – {asset.end}</p>
                  </div>
                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.green }} />
                </button>
              )
            })}
          </div>
          {/* Add button */}
          <div className="p-2 border-t" style={{ borderColor: COLORS.borderLight }}>
            <button className="w-full flex items-center justify-center gap-1 text-[9px] font-medium px-2 py-1.5 rounded border border-dashed transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
              <PlusIcon className="w-3 h-3" />
              Add from Scenes
            </button>
          </div>
        </div>

        {/* ═══ CENTER: PREVIEW + TIMELINE ═══ */}
        <div className="space-y-3">
          {/* ═══ VIDEO PREVIEW PLAYER ═══ */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.navy, borderColor: COLORS.borderLight }}>
            {/* Preview area */}
            <div
              className="relative flex items-center justify-center"
              style={{ height: 200, background: `linear-gradient(135deg, ${COLORS.navy}, #0D1626)` }}
            >
              {/* Scene watermark */}
              <span className="text-[60px] font-serif select-none" style={{ color: "rgba(255,255,255,0.04)" }}>
                {String(selectedClip).padStart(2, "0")}
              </span>

              {/* Center play button */}
              <button className="absolute inset-0 flex items-center justify-center group">
                <div
                  className="rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                >
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </button>

              {/* Top overlay */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-white/80">{String(selectedClip).padStart(2, "0")}</span>
                  <span className="text-[9px] text-white/50">·</span>
                  <span className="text-[9px] text-white/60">
                    {EDIT_SCENE_ASSETS[selectedClip - 1]?.title || ""}
                  </span>
                </div>
              </div>

              {/* Bottom control bar */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                {/* Scrubber */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[8px] font-medium text-white/50">00:17</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                    <div className="h-full rounded-full relative" style={{ width: "48%", backgroundColor: COLORS.gold }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.gold, transform: "translateY(-50%) translateX(50%)" }} />
                    </div>
                  </div>
                  <span className="text-[8px] font-medium text-white/50">00:35</span>
                </div>
                {/* Transport controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="text-white/60 hover:text-white transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                    <button className="text-white/80 hover:text-white transition-colors">
                      <Play className="w-4 h-4" fill="currentColor" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-white/40" />
                    <button className="text-[8px] font-medium text-white/50 hover:text-white/70 transition-colors">Fit ▾</button>
                    <span className="text-[8px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>9:16</span>
                    <MaximizeIcon className="w-3 h-3 text-white/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ FILMSTRIP ═══ */}
            <div className="flex items-center gap-1 px-2 py-2" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
              <button className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-0.5 overflow-x-auto">
                {EDIT_SCENE_ASSETS.map((asset, i) => {
                  const isSelected = selectedClip === asset.idx
                  return (
                    <div key={asset.idx} className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => setSelectedClip(asset.idx)}
                        className="relative w-12 h-8 rounded flex items-center justify-center text-[8px] font-bold transition-all"
                        style={{
                          backgroundColor: isSelected ? "rgba(194,154,91,0.2)" : "rgba(255,255,255,0.05)",
                          border: isSelected ? `1px solid ${COLORS.gold}` : "1px solid rgba(255,255,255,0.08)",
                          color: isSelected ? COLORS.gold : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {String(asset.idx).padStart(2, "0")}
                      </button>
                      {i < EDIT_SCENE_ASSETS.length - 1 && (
                        <ScissorsIcon className="w-2 h-2 text-white/15" />
                      )}
                    </div>
                  )
                })}
              </div>
              <button className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ═══ TIMELINE EDITOR ═══ */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: COLORS.borderLight }}>
              <div className="flex items-center gap-2">
                <button className="text-[10px] font-medium transition-colors hover:text-textDark" style={{ color: COLORS.textMid }}>
                  <Undo2 className="w-3 h-3 inline" /> Undo
                </button>
                <button className="text-[10px] font-medium transition-colors hover:text-textDark" style={{ color: COLORS.textMid }}>
                  <Redo2 className="w-3 h-3 inline" /> Redo
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[9px] font-medium cursor-pointer" style={{ color: COLORS.textMid }}>
                  <span>Snap</span>
                  <button
                    onClick={() => setSnapEnabled(!snapEnabled)}
                    className="relative w-7 h-3.5 rounded-full transition-colors"
                    style={{ backgroundColor: snapEnabled ? COLORS.blue : COLORS.border }}
                  >
                    <div
                      className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform"
                      style={{ transform: snapEnabled ? "translateX(14px)" : "translateX(2px)" }}
                    />
                  </button>
                </label>
                <div className="flex items-center gap-1">
                  <ZoomOut className="w-3 h-3" style={{ color: COLORS.textMuted }} />
                  <div className="w-16 h-1 rounded-full" style={{ backgroundColor: COLORS.borderLight }}>
                    <div className="h-full rounded-full" style={{ width: "50%", backgroundColor: COLORS.navy }} />
                  </div>
                  <ZoomIn className="w-3 h-3" style={{ color: COLORS.textMuted }} />
                  <button className="text-[9px] font-medium ml-1 transition-colors hover:text-textDark" style={{ color: COLORS.textMid }}>Full ▾</button>
                </div>
                <button className="text-[9px] transition-colors hover:text-textDark" style={{ color: COLORS.textMuted }}>⋯</button>
              </div>
            </div>

            {/* Time Ruler */}
            <div className="flex items-center border-b relative" style={{ borderColor: COLORS.borderLight }}>
              <div className="w-16 flex-shrink-0 px-2 py-1.5 border-r" style={{ borderColor: COLORS.borderLight }}>
                <p className="text-[7px] font-bold tracking-wide uppercase" style={{ color: COLORS.textMuted }}>Track</p>
              </div>
              <div className="flex-1 relative px-1 py-1.5">
                <div className="flex items-center justify-between">
                  {[0, 5, 10, 15, 20, 25, 30, 35].map((t) => (
                    <span key={t} className="text-[7px] font-medium" style={{ color: COLORS.textMuted }}>0:{String(t).padStart(2, "0")}</span>
                  ))}
                </div>
                {/* Playhead line */}
                <div
                  className="absolute top-0 bottom-0 w-px pointer-events-none"
                  style={{ left: `calc(${playheadPos}% + 64px)`, backgroundColor: COLORS.gold }}
                >
                  <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.gold }} />
                </div>
              </div>
            </div>

            {/* Track Rows */}
            {/* Video Track */}
            <TimelineTrack icon={FilmIcon} label="Video" color={COLORS.navy}>
              <div className="flex items-center gap-0.5 h-full px-1">
                {EDIT_SCENE_ASSETS.map((asset, i) => {
                  const widthPct = asset.idx === 4 ? 28 : (asset.idx === 3 ? 14 : 10)
                  const isSelected = selectedClip === asset.idx
                  return (
                    <div key={asset.idx} className="flex items-center gap-0.5" style={{ width: `${widthPct}%` }}>
                      <button
                        onClick={() => setSelectedClip(asset.idx)}
                        className="flex-1 h-7 rounded flex items-center justify-center text-[7px] font-bold transition-all"
                        style={{
                          backgroundColor: isSelected ? "rgba(194,154,91,0.15)" : "rgba(26,35,50,0.06)",
                          border: isSelected ? `1px solid ${COLORS.gold}` : "1px solid transparent",
                          color: isSelected ? COLORS.gold : COLORS.textMid,
                        }}
                      >
                        {String(asset.idx).padStart(2, "0")}
                      </button>
                      {i < EDIT_SCENE_ASSETS.length - 1 && <ScissorsIcon className="w-2 h-2 flex-shrink-0" style={{ color: COLORS.border }} />}
                    </div>
                  )
                })}
              </div>
            </TimelineTrack>

            {/* Narration Track */}
            <TimelineTrack icon={Waves} label="Narration" color={COLORS.blue}>
              <div className="h-full px-1 flex items-center">
                <div className="w-full h-5 rounded flex items-center gap-px overflow-hidden" style={{ backgroundColor: "rgba(47,98,216,0.08)" }}>
                  {Array.from({ length: 60 }).map((_, i) => {
                    const heights = [30, 50, 70, 45, 60, 80, 55, 35, 65, 40, 50, 75, 45, 30, 55, 70, 40, 60, 35, 50]
                    const h = heights[i % heights.length]
                    return <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: COLORS.blue, opacity: 0.6 }} />
                  })}
                </div>
              </div>
            </TimelineTrack>

            {/* Music Track */}
            <TimelineTrack icon={Music} label="Music" color={COLORS.green}>
              <div className="h-full px-1 flex items-center">
                <div className="w-full h-5 rounded flex items-center gap-px overflow-hidden" style={{ backgroundColor: "rgba(34,160,107,0.06)" }}>
                  <div className="flex items-center gap-1 px-2 h-full">
                    <Music className="w-2.5 h-2.5" style={{ color: COLORS.green, opacity: 0.6 }} />
                    <span className="text-[7px] font-medium" style={{ color: COLORS.green, opacity: 0.7 }}>TT Ambient 02</span>
                  </div>
                  {Array.from({ length: 40 }).map((_, i) => {
                    const heights = [20, 40, 30, 50, 35, 45, 25, 40, 30, 35, 20, 45, 30, 25, 40]
                    const h = heights[i % heights.length]
                    return <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: COLORS.green, opacity: 0.4 }} />
                  })}
                </div>
              </div>
            </TimelineTrack>

            {/* SFX Track */}
            <TimelineTrack icon={Volume2} label="SFX" color={COLORS.gold}>
              <div className="flex items-center gap-1 h-full px-1">
                {SFX_CHIPS.map((sfx, i) => (
                  <div
                    key={sfx}
                    className="text-[7px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{
                      backgroundColor: "rgba(194,154,91,0.1)",
                      color: COLORS.gold,
                      marginLeft: i === 1 ? "8%" : i === 2 ? "20%" : i === 3 ? "15%" : "0",
                    }}
                  >
                    {sfx}
                  </div>
                ))}
              </div>
            </TimelineTrack>

            {/* Text/Titles Track */}
            <TimelineTrack icon={TypeIcon} label="Text / Titles" color={COLORS.textMid}>
              <div className="flex items-center gap-0.5 h-full px-1">
                {TITLE_CHIPS.map((title, i) => (
                  <div
                    key={i}
                    className="text-[7px] font-medium px-1.5 py-0.5 rounded truncate"
                    style={{
                      backgroundColor: "rgba(138,133,120,0.06)",
                      color: COLORS.textMid,
                      maxWidth: i === 2 ? "16%" : i === 5 ? "18%" : "12%",
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
            </TimelineTrack>

            {/* Captions Track */}
            <TimelineTrack icon={Captions} label="Captions" color={COLORS.blue}>
              <div className="h-full px-1 flex items-center">
                <div className="text-[7px] font-medium px-2 py-0.5 rounded truncate" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
                  A cup slides across the desk…
                </div>
              </div>
            </TimelineTrack>
          </div>
        </div>

        {/* ═══ RIGHT: INSPECTOR PANEL ═══ */}
        <div className="space-y-3">
          {/* Inspector sub-tabs */}
          <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            {['Edit', 'Audio', 'Text', 'Graphics', 'Export'].map((tab, i) => (
              <button
                key={tab}
                className="flex-1 text-[8px] font-semibold px-1.5 py-1 rounded transition-colors"
                style={{
                  backgroundColor: i === 0 ? COLORS.navy : "transparent",
                  color: i === 0 ? "#FFFFFF" : COLORS.textMuted,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transform */}
          <InspectorSection title="Transform">
            <SliderRow label="Scale" value="100%" fill={100} />
            <div className="flex items-center gap-2 mt-2">
              <NumberField label="X" value="0" />
              <NumberField label="Y" value="0" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <p className="text-[8px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.textMuted }}>Rotation</p>
                <select className="w-full text-[9px] border rounded px-1 py-0.5" style={{ borderColor: COLORS.borderLight, color: COLORS.textDark, backgroundColor: COLORS.white }}>
                  <option>0°</option>
                </select>
              </div>
              <div className="w-12">
                <p className="text-[8px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.textMuted }}> </p>
                <input type="text" value="0°" readOnly className="w-full text-[9px] border rounded px-1 py-0.5 text-center" style={{ borderColor: COLORS.borderLight, color: COLORS.textDark, backgroundColor: COLORS.white }} />
              </div>
              <button className="mt-3">
                <RotateCw className="w-3 h-3" style={{ color: COLORS.textMuted }} />
              </button>
            </div>
            <div className="mt-2">
              <SliderRow label="Opacity" value="100%" fill={100} />
            </div>
          </InspectorSection>

          {/* Color */}
          <InspectorSection
            title="Color"
            toggle={{ checked: colorEnabled, onChange: () => setColorEnabled(!colorEnabled) }}
          >
            <div className="mb-2">
              <p className="text-[8px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.textMuted }}>LUT</p>
              <select className="w-full text-[9px] border rounded px-1.5 py-1" style={{ borderColor: COLORS.borderLight, color: COLORS.textDark, backgroundColor: COLORS.white }}>
                <option>TT Cinematic 01</option>
              </select>
            </div>
            <SliderRow label="Intensity" value="64%" fill={64} />
          </InspectorSection>

          {/* Speed */}
          <InspectorSection title="Speed">
            <div className="flex items-center gap-0.5">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSpeed(opt)}
                  className="flex-1 text-[8px] font-semibold px-1 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: speed === opt ? COLORS.navy : "rgba(138,133,120,0.04)",
                    color: speed === opt ? "#FFFFFF" : COLORS.textMuted,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </InspectorSection>

          {/* Clip Actions */}
          <InspectorSection title="Clip">
            <div className="grid grid-cols-5 gap-1">
              {[
                { icon: Replace, label: "Replace" },
                { icon: ScissorsIcon, label: "Trim" },
                { icon: Split, label: "Split" },
                { icon: Copy, label: "Duplicate" },
                { icon: Trash2, label: "Delete" },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button key={action.label} className="flex flex-col items-center gap-0.5 py-1.5 rounded transition-colors hover:bg-black/5">
                    <Icon className="w-3 h-3" style={{ color: COLORS.textMid }} />
                    <span className="text-[7px]" style={{ color: COLORS.textMuted }}>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </InspectorSection>

          {/* AI Tools */}
          <InspectorSection title="AI Tools" badge="BETA">
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: Sparkles, label: "Enhance" },
                { icon: Zap, label: "Stabilize" },
                { icon: Palette, label: "Match color" },
                { icon: MoreHorizontal, label: "More" },
              ].map((tool) => {
                const Icon = tool.icon
                return (
                  <button key={tool.label} className="flex items-center gap-1 px-1.5 py-1.5 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.borderLight }}>
                    <Icon className="w-2.5 h-2.5" style={{ color: COLORS.gold }} />
                    <span className="text-[8px] font-medium" style={{ color: COLORS.textMid }}>{tool.label}</span>
                  </button>
                )
              })}
            </div>
          </InspectorSection>

          {/* Versions */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>Versions</p>
            <p className="text-[8px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: COLORS.textMuted }}>Current version</p>
            {VERSION_HISTORY.filter(v => v.current).map((v) => (
              <div key={v.ver} className="flex items-center gap-2 px-1.5 py-1.5 rounded mb-2" style={{ backgroundColor: "rgba(194,154,91,0.06)" }}>
                <span className="text-[9px] font-bold" style={{ color: COLORS.gold }}>{v.ver}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px]" style={{ color: COLORS.textDark }}>{v.date}</p>
                  <p className="text-[7px]" style={{ color: COLORS.textMuted }}>{v.author}</p>
                </div>
                <MoreHorizontal className="w-2.5 h-2.5" style={{ color: COLORS.textMuted }} />
              </div>
            ))}
            <p className="text-[8px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: COLORS.textMuted }}>Other versions</p>
            <div className="space-y-1">
              {VERSION_HISTORY.filter(v => !v.current).map((v) => (
                <div key={v.ver} className="flex items-center gap-2 px-1.5 py-1 rounded transition-colors hover:bg-black/[0.02]">
                  <span className="text-[9px] font-bold" style={{ color: COLORS.textMuted }}>{v.ver}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px]" style={{ color: COLORS.textMid }}>{v.date}</p>
                    <p className="text-[7px]" style={{ color: COLORS.textMuted }}>{v.author}</p>
                  </div>
                  <MoreHorizontal className="w-2.5 h-2.5" style={{ color: COLORS.textMuted }} />
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-1 text-[9px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5 mt-2" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
              <GitCompare className="w-2.5 h-2.5" />
              Compare versions
            </button>
          </div>

          {/* Ready to Finalize */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: "rgba(194,154,91,0.05)", borderColor: "rgba(194,154,91,0.2)" }}>
            <p className="font-serif text-[12px] mb-0.5" style={{ color: COLORS.textDark }}>Ready to finalize</p>
            <p className="text-[9px] mb-2.5" style={{ color: COLORS.textMid }}>The edit is ready for review and export.</p>
            <button className="flex items-center justify-center gap-1 w-full text-[10px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90 mb-1.5" style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}>
              Preview &amp; export package
              <ArrowRight className="w-3 h-3" />
            </button>
            <button className="flex items-center justify-center gap-1 w-full text-[10px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
              Save as new version
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-4 px-6 py-2 border-t md:ml-[140px]"
        style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>Format previews</span>
        {([
          { key: "9:16", label: "9:16 Vertical" },
          { key: "1:1", label: "1:1 Square" },
          { key: "16:9", label: "16:9 Landscape" },
        ] as const).map((fmt) => (
          <button
            key={fmt.key}
            onClick={() => setActiveAspect(fmt.key)}
            className="text-[9px] font-medium px-2 py-0.5 rounded-full border transition-colors"
            style={{
              borderColor: activeAspect === fmt.key ? COLORS.gold : COLORS.border,
              color: activeAspect === fmt.key ? COLORS.gold : COLORS.textMuted,
              backgroundColor: activeAspect === fmt.key ? "rgba(194,154,91,0.06)" : "transparent",
            }}
          >
            {fmt.label}
          </button>
        ))}
        <div className="w-px h-3" style={{ backgroundColor: COLORS.border }} />
        <span className="text-[9px]" style={{ color: COLORS.textMid }}>
          <strong style={{ color: COLORS.textDark }}>00:35</strong> total
        </span>
        <span className="text-[9px]" style={{ color: COLORS.textMid }}>
          <strong style={{ color: COLORS.textDark }}>198 MB</strong> est. size
        </span>
        <span className="text-[9px]" style={{ color: COLORS.textMid }}>
          <strong style={{ color: COLORS.textDark }}>2m 40s</strong> est. render
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
        >
          <Send className="w-3 h-3" />
          Send for review
        </button>
      </div>
    </div>
  )
}

// ─── Edit Tab Sub-Components ────────────────────────────────────────────────

function TimelineTrack({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: React.ElementType
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-stretch border-b last:border-0"
      style={{ borderColor: COLORS.borderLight, backgroundColor: label === "Video" ? "rgba(138,133,120,0.015)" : "transparent" }}
    >
      <div className="w-16 flex-shrink-0 flex items-center gap-1 px-2 py-1.5 border-r" style={{ borderColor: COLORS.borderLight }}>
        <Icon className="w-2.5 h-2.5 flex-shrink-0" style={{ color }} />
        <span className="text-[7px] font-semibold uppercase truncate" style={{ color: COLORS.textMuted }}>{label}</span>
      </div>
      <div className="flex-1 relative" style={{ height: 32 }}>
        {children}
      </div>
    </div>
  )
}

function InspectorSection({
  title,
  children,
  toggle,
  badge,
}: {
  title: string
  children: React.ReactNode
  toggle?: { checked: boolean; onChange: () => void }
  badge?: string
}) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>{title}</p>
          {badge && (
            <span className="text-[6px] font-bold tracking-wide px-1 py-0.5 rounded-full" style={{ backgroundColor: "rgba(45,212,191,0.1)", color: "#0D9488" }}>{badge}</span>
          )}
        </div>
        {toggle && (
          <button
            onClick={toggle.onChange}
            className="relative w-7 h-3.5 rounded-full transition-colors"
            style={{ backgroundColor: toggle.checked ? COLORS.blue : COLORS.border }}
          >
            <div
              className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform"
              style={{ transform: toggle.checked ? "translateX(14px)" : "translateX(2px)" }}
            />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function SliderRow({ label, value, fill }: { label: string; value: string; fill: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>{label}</span>
        <span className="text-[8px] font-semibold" style={{ color: COLORS.textDark }}>{value}</span>
      </div>
      <div className="relative h-1 rounded-full" style={{ backgroundColor: COLORS.borderLight }}>
        <div className="h-full rounded-full" style={{ width: `${fill}%`, backgroundColor: COLORS.navy }} />
      </div>
    </div>
  )
}

function NumberField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-[8px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.textMuted }}>{label}</p>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full text-[9px] border rounded px-1.5 py-0.5 text-center"
        style={{ borderColor: COLORS.borderLight, color: COLORS.textDark, backgroundColor: COLORS.white }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PACKAGE TAB
// ═══════════════════════════════════════════════════════════════════════════════

const PUBLISH_CHECKLIST = [
  { label: "Concept approved", status: "done" as const },
  { label: "Script approved", status: "done" as const },
  { label: "Frames approved", status: "done" as const },
  { label: "Scenes generated", status: "done" as const },
  { label: "Edit assembled", status: "done" as const },
  { label: "Caption reviewed", status: "review" as const },
  { label: "Thumbnail selected", status: "review" as const },
  { label: "Final render exported", status: "pending" as const },
]

const FORMAT_PREVIEWS = [
  {
    key: "9:16",
    label: "9:16 Vertical",
    sub: "Reels · Shorts · TikTok",
    dims: "1080 × 1920",
    default: true,
  },
  {
    key: "1:1",
    label: "1:1 Square",
    sub: "LinkedIn feed · Instagram",
    dims: "1080 × 1080",
    default: false,
  },
  {
    key: "16:9",
    label: "16:9 Landscape",
    sub: "YouTube · LinkedIn video",
    dims: "1920 × 1080",
    default: false,
  },
]

const LINKEDIN_POST_PREVIEW = `The Man Who Carried a City

You may have started carrying everything out of love.

Love eventually builds what other people can carry too.

The weight isn't the problem. The weight was never the problem. The problem is building a city that can stand when you set it down.

Watch the film →`

const CAPTION_PREVIEW = `The weight was never the problem.

A 35-second visual parable about the systems we carry and the moment we learn to build what others can hold.

#TrustTai #Leadership #SystemsThinking #FounderLife`

const HASHTAGS = [
  "#TrustTai", "#Leadership", "#SystemsThinking", "#FounderLife",
  "#VisualParable", "#CinematicStorytelling", "#TheManWhoCarriedACity",
]

const EXPORT_HISTORY = [
  { format: "9:16 Vertical", size: "198 MB", time: "2m 40s", date: "Today, 3:15 PM", status: "ready" as const },
  { format: "1:1 Square", size: "142 MB", time: "1m 55s", date: "Today, 3:15 PM", status: "ready" as const },
  { format: "16:9 Landscape", size: "224 MB", time: "3m 10s", date: "—", status: "pending" as const },
]

function PackageTab({ production }: { production: Production }) {
  const [selectedFormat, setSelectedFormat] = useState("9:16")
  const [postEdited, setPostEdited] = useState(LINKEDIN_POST_PREVIEW)
  const [captionEdited, setCaptionEdited] = useState(CAPTION_PREVIEW)
  const doneCount = PUBLISH_CHECKLIST.filter(c => c.status === "done").length
  const totalCount = PUBLISH_CHECKLIST.length

  return (
    <div className="pt-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="font-serif text-xl" style={{ color: COLORS.textDark }}>
            <span style={{ color: COLORS.textMuted }}>7.</span> Package for publication
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMid }}>
            Review the final outputs, approve the copy, and prepare every format for delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
            <Download className="w-3 h-3" />
            Download all
          </button>
          <button className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}>
            <Send className="w-3 h-3" style={{ color: COLORS.gold }} />
            Publish to LinkedIn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ═══ MAIN COLUMN ═══ */}
        <div className="space-y-5">
          {/* ═══ FORMAT PREVIEW CARDS ═══ */}
          <div>
            <h2 className="font-serif text-base mb-2" style={{ color: COLORS.textDark }}>Format previews</h2>
            <p className="text-[10px] mb-3" style={{ color: COLORS.textMuted }}>The same film, adapted for every surface.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMAT_PREVIEWS.map((fmt) => {
                const isSelected = selectedFormat === fmt.key
                return (
                  <div
                    key={fmt.key}
                    onClick={() => setSelectedFormat(fmt.key)}
                    className="rounded-xl border overflow-hidden cursor-pointer transition-all"
                    style={{
                      backgroundColor: COLORS.white,
                      borderColor: isSelected ? COLORS.gold : COLORS.borderLight,
                      borderWidth: isSelected ? 1.5 : 1,
                      boxShadow: isSelected ? "0 2px 12px rgba(194,154,91,0.12)" : "none",
                    }}
                  >
                    {/* Preview area with aspect ratio */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        height: fmt.key === "9:16" ? 120 : fmt.key === "1:1" ? 100 : 70,
                        background: `linear-gradient(135deg, ${COLORS.navy}10, ${COLORS.gold}06)`,
                      }}
                    >
                      {/* Mock video frame */}
                      <div
                        className="rounded flex items-center justify-center"
                        style={{
                          width: fmt.key === "9:16" ? 45 : fmt.key === "1:1" ? 60 : 90,
                          height: fmt.key === "9:16" ? 80 : fmt.key === "1:1" ? 60 : 50,
                          backgroundColor: "rgba(26,35,50,0.06)",
                          border: `1px solid ${isSelected ? COLORS.gold : COLORS.border}`,
                        }}
                      >
                        <Play className="w-4 h-4" style={{ color: isSelected ? COLORS.gold : COLORS.textMuted }} fill="currentColor" />
                      </div>
                      {fmt.default && (
                        <div
                          className="absolute top-1.5 right-1.5 text-[7px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
                        >
                          Default
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] font-bold" style={{ color: COLORS.textDark }}>{fmt.label}</p>
                        {isSelected && <Check className="w-3 h-3" style={{ color: COLORS.green }} />}
                      </div>
                      <p className="text-[8px]" style={{ color: COLORS.textMuted }}>{fmt.sub}</p>
                      <p className="text-[8px] mt-0.5" style={{ color: COLORS.textMuted }}>{fmt.dims}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ═══ LINKEDIN POST COPY ═══ */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: COLORS.borderLight, backgroundColor: "rgba(138,133,120,0.02)" }}>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" style={{ color: COLORS.blue }} />
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>LinkedIn post</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <RefreshCw className="w-2.5 h-2.5 inline mr-0.5" />
                  Regenerate
                </button>
                <button className="text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                  <GitCompare className="w-2.5 h-2.5 inline mr-0.5" />
                  Compare
                </button>
                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
                  {postEdited.length} chars
                </span>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={postEdited}
                onChange={(e) => setPostEdited(e.target.value)}
                rows={8}
                className="w-full text-[11px] leading-relaxed font-serif resize-none border-0 outline-none"
                style={{ color: COLORS.textDark, backgroundColor: "transparent" }}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: COLORS.borderLight }}>
                <div className="flex items-center gap-1.5">
                  {HASHTAGS.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[8px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
                      {tag}
                    </span>
                  ))}
                  <span className="text-[8px]" style={{ color: COLORS.textMuted }}>+{HASHTAGS.length - 4} more</span>
                </div>
                <button className="flex items-center gap-1 text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>
                  <PenLine className="w-2.5 h-2.5" />
                  Edit hashtags
                </button>
              </div>
            </div>
          </div>

          {/* ═══ CAPTION COPY ═══ */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: COLORS.borderLight, backgroundColor: "rgba(138,133,120,0.02)" }}>
              <div className="flex items-center gap-2">
                <Captions className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Caption / Subtitle</p>
              </div>
              <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(194,154,91,0.1)", color: COLORS.gold }}>
                {captionEdited.length} chars
              </span>
            </div>
            <div className="p-4">
              <textarea
                value={captionEdited}
                onChange={(e) => setCaptionEdited(e.target.value)}
                rows={4}
                className="w-full text-[11px] leading-relaxed resize-none border-0 outline-none"
                style={{ color: COLORS.textDark, backgroundColor: "transparent" }}
              />
            </div>
          </div>

          {/* ═══ EXPORT HISTORY ═══ */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: COLORS.borderLight }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Export history</p>
              <button className="text-[9px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>View all</button>
            </div>
            <div className="divide-y" style={{ borderColor: COLORS.borderLight }}>
              {EXPORT_HISTORY.map((exp) => (
                <div key={exp.format} className="flex items-center gap-3 px-4 py-2.5" style={{ borderColor: COLORS.borderLight }}>
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: exp.status === "ready" ? "rgba(34,160,107,0.08)" : "rgba(138,133,120,0.06)" }}
                  >
                    {exp.status === "ready" ? (
                      <Check className="w-4 h-4" style={{ color: COLORS.green }} />
                    ) : (
                      <Clock className="w-4 h-4" style={{ color: COLORS.textMuted }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>{exp.format}</p>
                    <p className="text-[8px]" style={{ color: COLORS.textMuted }}>
                      {exp.size} · {exp.time} · {exp.date}
                    </p>
                  </div>
                  {exp.status === "ready" ? (
                    <button className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                      <Download className="w-2.5 h-2.5" />
                      Download
                    </button>
                  ) : (
                    <button className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}>
                      <Sparkles className="w-2.5 h-2.5" />
                      Render now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* Publish Checklist */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Publish checklist</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,160,107,0.08)", color: COLORS.green }}>
                {doneCount}/{totalCount}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full overflow-hidden mb-3" style={{ backgroundColor: COLORS.borderLight }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / totalCount) * 100}%`, backgroundColor: COLORS.green }} />
            </div>
            <div className="space-y-1.5">
              {PUBLISH_CHECKLIST.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === "done" ? (
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.green }}>
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    ) : item.status === "review" ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: COLORS.gold }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: COLORS.gold }} />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: COLORS.border }} />
                    )}
                    <span className="text-[10px]" style={{
                      color: item.status === "done" ? COLORS.textDark : item.status === "review" ? COLORS.gold : COLORS.textMuted,
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {item.status === "review" && (
                    <button className="text-[8px] font-medium transition-colors hover:underline" style={{ color: COLORS.blue }}>Review</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail Selector */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>Thumbnail</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  className="relative aspect-video rounded-md flex items-center justify-center text-[8px] font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.navy}10, ${COLORS.gold}06)`,
                    border: t === 1 ? `1.5px solid ${COLORS.gold}` : `1px solid ${COLORS.borderLight}`,
                  }}
                >
                  <span style={{ color: COLORS.textMuted }}>0{t}</span>
                  {t === 1 && (
                    <div className="absolute top-0.5 right-0.5">
                      <Check className="w-2.5 h-2.5" style={{ color: COLORS.green }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-1 text-[9px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5 mt-2" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
              <PlusIcon className="w-2.5 h-2.5" />
              Upload custom
            </button>
          </div>

          {/* Delivery Targets */}
          <div className="rounded-xl border p-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: COLORS.textMid }}>Delivery targets</p>
            <div className="space-y-2">
              {[
                { icon: FileText, label: "LinkedIn", sub: "Post + video", status: "ready" as const },
                { icon: FilmIcon, label: "YouTube Shorts", sub: "9:16 video", status: "ready" as const },
                { icon: Clapperboard, label: "Instagram Reels", sub: "9:16 video", status: "optional" as const },
              ].map((target) => {
                const Icon = target.icon
                return (
                  <div key={target.label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(138,133,120,0.04)" }}>
                      <Icon className="w-3 h-3" style={{ color: COLORS.textMid }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>{target.label}</p>
                      <p className="text-[8px]" style={{ color: COLORS.textMuted }}>{target.sub}</p>
                    </div>
                    {target.status === "ready" ? (
                      <Check className="w-3 h-3" style={{ color: COLORS.green }} />
                    ) : (
                      <span className="text-[7px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(138,133,120,0.06)", color: COLORS.textMuted }}>Optional</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ready to Publish */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: "rgba(194,154,91,0.05)", borderColor: "rgba(194,154,91,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: COLORS.gold }} />
              <p className="font-serif text-sm" style={{ color: COLORS.textDark }}>Ready to publish</p>
            </div>
            <p className="text-[10px] mb-3" style={{ color: COLORS.textMid }}>
              {doneCount === totalCount
                ? "All checks passed. This package is cleared for delivery."
                : `${totalCount - doneCount} items need review before publishing.`}
            </p>
            <div className="space-y-2">
              <button
                className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
              >
                <Send className="w-3 h-3" style={{ color: COLORS.gold }} />
                Publish to LinkedIn
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                <Download className="w-3 h-3" />
                Download package
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-medium transition-colors hover:underline" style={{ color: COLORS.textMuted }}>
                Save as draft
              </button>
            </div>
          </div>

          {/* Production Summary */}
          <ProductionSummaryCard production={production} />
        </div>
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
