"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  getProduction,
  updateProduction,
  markPublished,
  PRODUCTIONS_CHANGED_EVENT,
} from "@/lib/studio-store"
import type { Production, ConceptDirection, ConceptKey } from "@/data/studio"
import { GATE_ORDER } from "@/data/studio"
import { buildPackage } from "@/lib/studio-engine"
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
          {activeTab === "concept" && <ConceptTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "post" && <PostTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "script" && <ScriptTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "frames" && <FramesTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "scenes" && <ScenesTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "edit" && <EditTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "package" && <PackageTab production={production} onTabChange={setActiveTab} />}
          {activeTab === "memory" && <MemoryTab production={production} />}
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

function ConceptTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
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
            onTabChange("script")
          }}
        />
      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className="space-y-4">
        <ProductionSummaryCard production={production} />
        <ConceptInsightPanel production={production} />
        <ConceptDetailPanel production={production} />
        <ConceptActionsPanel
          onApprove={() => {
            if (selectedKey) {
              updateProduction(production.id, (p) => ({
                ...p,
                film: { ...p.film, selectedConcept: selectedKey },
                gates: { ...p.gates, concept: { key: "concept", status: "approved" as const } },
              }))
            }
            onTabChange("script")
          }}
        />
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
          {conceptApproved ? (
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.green, color: "#FFFFFF" }}
            >
              <Check className="w-3 h-3" />
              Continue to Script
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onApprove}
              disabled={!selectedKey}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLORS.gold, color: "#FFFFFF" }}
            >
              <Sparkles className="w-3 h-3" />
              Approve concept
            </button>
          )}
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

function ConceptActionsPanel({ onApprove }: { onApprove: () => void }) {
  const actions = [
    { icon: Check, label: "Approve concept and build script", color: COLORS.green, handler: onApprove },
    { icon: RefreshCw, label: "Request new directions", color: COLORS.blue, handler: () => {} },
    { icon: Bookmark, label: "Save for later", color: COLORS.gold, handler: () => {} },
    { icon: X, label: "Reject with reason", color: "#E53E3E", handler: () => {} },
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
              onClick={action.handler}
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
// ─── Dynamic scene data helpers ──────────────────────────────────────────────
// All scene display content is derived from production.film.shots + concept
// so every production shows its own content, not hardcoded pilot copy.

function deriveSceneName(shot: Production["film"]["shots"][number], idx: number): string {
  // Capitalise the purpose as scene name; trim to a short label
  const purpose = shot.purpose?.trim()
  if (!purpose) return `Scene ${idx + 1}`
  const words = purpose.split(/\s+/).slice(0, 4).join(" ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function deriveNarrationLine(shot: Production["film"]["shots"][number]): string {
  // Pull the first sentence of the shot description as VO
  const desc = shot.description?.trim() ?? ""
  const first = desc.split(/\.\s+/)[0]
  return first ? first.replace(/\.$/, "") + "." : ""
}

function derivePostConnection(shot: Production["film"]["shots"][number], idx: number, total: number): string {
  if (idx === 0) return "Opening — establishes the credible world before the tension surfaces."
  if (idx === total - 1) return "Closing — lands the remember sentence. The argument resolves visually."
  if (idx === 1) return "Introduces the surface behaviour the post's first insight names."
  if (idx === total - 2) return "The turn — mirrors the post's core pivot."
  return `Paragraph ${idx + 1} — ${shot.purpose?.toLowerCase() ?? "bridges the argument"}.`
}

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

function ScriptTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
  const [subTab, setSubTab] = useState<"scenes" | "narration" | "timeline" | "postmap">("scenes")
  const shots = production.film.shots
  const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0)
  const narrationWordCount = shots.slice(0, 6).map(deriveNarrationLine).join(" ").split(/\s+/).filter(Boolean).length
  function approveScript() {
    updateProduction(production.id, (p) => ({
      ...p,
      gates: {
        ...p.gates,
        keyframes: { key: "keyframes", status: "approved" as const },
      },
    }))
    onTabChange("frames")
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
          const sceneName = deriveSceneName(shot, idx)
          const narration = deriveNarrationLine(shot)
          const postConn = derivePostConnection(shot, idx, rows.length)

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
                {deriveSceneName(shot, idx)}
              </p>
              <p className="text-[12px] leading-relaxed font-serif italic" style={{ color: COLORS.textDark }}>
                {deriveNarrationLine(shot)}
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
                  {deriveSceneName(shot, idx)}
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
                {deriveSceneName(shot, idx)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMid }}>
                {derivePostConnection(shot, idx, shots.slice(0, 6).length)}
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

// Keyframe titles + descriptions are now derived per-shot (see FramesTab)

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

function FramesTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
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
    onTabChange("scenes")
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
                    title={deriveSceneName(shot, idx)}
                    description={shot.description}
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
                        <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{deriveSceneName(shot, idx)}</p>
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
          <SelectedFrameDetail idx={selectedFrame} shot={shots[selectedFrame]} />

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

function SelectedFrameDetail({ idx, shot }: { idx: number; shot?: Production["film"]["shots"][number] }) {
  const title = shot ? deriveSceneName(shot, idx) : `Scene ${idx + 1}`
  const meta = KEYFRAME_META[idx] || KEYFRAME_META[0]
  const desc = shot?.description ?? ""

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

// ─── ScenesTab helpers ───────────────────────────────────────────────────────
// Everything is derived from production.film.shots so each production is real.

type TakeStatus = "approved" | "review" | "rejected"
type SceneMotionStatus = "generated" | "generating" | "queued" | "idle"

function shotMotionStatus(shot: Production["film"]["shots"][number]): SceneMotionStatus {
  if (shot.motionStatus === "rendered") return "generated"
  if (shot.motionStatus === "queued") return "generating"
  return "queued"
}

function formatShotDuration(sec: number): string {
  return `0:${String(sec).padStart(2, "0")}`
}

function deriveCameraRows(shot: Production["film"]["shots"][number], idx: number) {
  const orch = shot.orchestration
  const shotTypes = ["Wide Shot", "Medium Shot", "Close-up", "Low Angle", "Dutch Tilt", "Wide Shot"]
  const lenses = ["24mm", "35mm", "50mm", "21mm", "28mm", "24mm"]
  const movements = ["Slow push-in", "Lateral dolly", "Handheld", "Forward track", "Static hold", "Slow pull-back"]
  return [
    { label: "Shot type", value: shotTypes[idx % shotTypes.length] },
    { label: "Lens", value: lenses[idx % lenses.length] },
    { label: "Movement", value: orch?.motionClass ? `${orch.motionClass} — ${movements[idx % movements.length]}` : movements[idx % movements.length] },
    { label: "Height", value: idx === 2 ? "Low" : "Eye level" },
  ]
}

function deriveLightingRows(shot: Production["film"]["shots"][number], idx: number) {
  const setups = ["Dawn Backlight", "Soft Window", "Low Key", "Motivated Practical", "Dawn Side", "Golden Dawn"]
  const temps = ["3200K", "4300K", "2800K", "3600K", "3200K", "3000K"]
  const dirs = ["Back-left", "Right side", "Below subject", "Front-right", "Left side", "Back-right"]
  void shot
  return [
    { label: "Setup", value: setups[idx % setups.length] },
    { label: "Temperature", value: temps[idx % temps.length] },
    { label: "Direction", value: dirs[idx % dirs.length] },
    { label: "Intensity", value: idx === 2 ? "Low" : idx === 5 ? "Warm" : "Soft" },
  ]
}

function deriveSoundRows(shot: Production["film"]["shots"][number], idx: number) {
  const purpose = shot.purpose?.toLowerCase() ?? ""
  const score = idx === 0 ? "Minimal motif" : idx === shots_count - 1 ? "Full resolve" : idx % 2 === 0 ? "Tension swell" : "Low drone"
  void purpose
  return [
    { label: "Ambience", value: idx === 0 ? "Room tone" : idx === shots_count - 1 ? "Open air · birds" : "Tonal ambience" },
    { label: "Score", value: score },
    { label: "Foley", value: shot.description?.split(". ")[0]?.slice(0, 30) ?? "—" },
    { label: "Dialog", value: "None" },
  ]
}
const shots_count = 6 // fallback used by sound derivation above

const GEN_SETTINGS = [
  { label: "Aspect", value: "9:16" },
  { label: "Duration", value: "8–12s" },
  { label: "FPS", value: "24" },
  { label: "Style", value: "Cinematic realism" },
  { label: "Motion", value: "Subtle" },
]

function ScenesTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
  const [selectedScene, setSelectedScene] = useState(0)
  const [selectedTake, setSelectedTake] = useState<string | null>(null)
  const shots = production.film.shots.slice(0, 6)
  const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0)

  // Per-shot takes: real interactive state keyed by shot index
  type Take = { id: string; duration: string; status: TakeStatus; note: string }
  const [takesMap, setTakesMap] = useState<Record<number, Take[]>>(() =>
    Object.fromEntries(shots.map((_, i) => [i, []]))
  )
  const currentTakes = takesMap[selectedScene] ?? []

  // Derive scene statuses from shot.motionStatus in the store
  const sceneStatuses = shots.map(shotMotionStatus)
  const generatedCount = sceneStatuses.filter((s) => s === "generated").length

  function approveScene(sceneIdx: number) {
    updateProduction(production.id, (p) => ({
      ...p,
      film: {
        ...p.film,
        shots: p.film.shots.map((s, i) =>
          i === sceneIdx ? { ...s, motionStatus: "rendered" as const, coherenceStatus: "pass" as const } : s
        ),
      },
    }))
  }

  function regenerateScene(sceneIdx: number) {
    // Add a new take and reset motionStatus to idle
    const shot = shots[sceneIdx]
    const dur = formatShotDuration(shot.durationSec)
    setTakesMap((prev) => {
      const existing = prev[sceneIdx] ?? []
      const nextId = String.fromCharCode(65 + existing.length) // A, B, C...
      return { ...prev, [sceneIdx]: [...existing, { id: nextId, duration: dur, status: "review" as TakeStatus, note: "New take — under review" }] }
    })
    updateProduction(production.id, (p) => ({
      ...p,
      film: {
        ...p.film,
        shots: p.film.shots.map((s, i) =>
          i === sceneIdx ? { ...s, motionStatus: "idle" as const } : s
        ),
      },
    }))
  }

  function setTakeStatus(sceneIdx: number, takeId: string, status: TakeStatus) {
    setTakesMap((prev) => ({
      ...prev,
      [sceneIdx]: (prev[sceneIdx] ?? []).map((t) => t.id === takeId ? { ...t, status } : t),
    }))
    if (status === "approved") approveScene(sceneIdx)
  }

  function approveAllScenes() {
    shots.forEach((_, i) => approveScene(i))
    updateProduction(production.id, (p) => ({
      ...p,
      gates: { ...p.gates, film: { key: "film", status: "approved" as const } },
    }))
    onTabChange("edit")
  }

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
          const takeCount = (takesMap[idx] ?? []).length
          return (
            <button
              key={shot.no}
              onClick={() => { setSelectedScene(idx); setSelectedTake(null) }}
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
                  {deriveSceneName(shot, idx)}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[7px]" style={{ color: COLORS.textMuted }}>{formatShotDuration(shot.durationSec)}</span>
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
                    {shots[selectedScene] ? deriveSceneName(shots[selectedScene], selectedScene) : `Scene ${selectedScene + 1}`}
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
                  <span className="text-[8px] font-medium text-white/60">{formatShotDuration(shots[selectedScene]?.durationSec ?? 0)}</span>
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
                  {shots[selectedScene] ? deriveNarrationLine(shots[selectedScene]) : "—"}
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
                <button
                  onClick={() => regenerateScene(selectedScene)}
                  className="flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded border transition-colors hover:bg-black/5"
                  style={{ borderColor: COLORS.border, color: COLORS.textMid }}
                >
                  <Replace className="w-2.5 h-2.5" />
                  Regenerate
                </button>
                <button
                  onClick={() => approveScene(selectedScene)}
                  className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-90"
                  style={{ backgroundColor: sceneStatuses[selectedScene] === "generated" ? COLORS.green : COLORS.gold, color: "#FFFFFF" }}
                >
                  <Check className="w-2.5 h-2.5" />
                  {sceneStatuses[selectedScene] === "generated" ? "Approved" : "Approve"}
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
              <button
                onClick={() => regenerateScene(selectedScene)}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition-colors hover:bg-black/5"
                style={{ borderColor: COLORS.border, color: COLORS.blue }}
              >
                <Plus className="w-3 h-3" />
                New take
              </button>
            </div>

            {currentTakes.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed" style={{ borderColor: COLORS.border }}>
                <FilmIcon className="w-8 h-8 mx-auto mb-2" style={{ color: COLORS.border }} />
                <p className="text-[11px] mb-1" style={{ color: COLORS.textMid }}>No takes generated yet</p>
                <button
                  onClick={() => regenerateScene(selectedScene)}
                  className="text-[10px] font-semibold transition-colors hover:underline"
                  style={{ color: COLORS.blue }}
                >
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
                      onClick={() => setSelectedTake(selectedTake === take.id ? null : take.id)}
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
                        <div className="mt-1 flex items-center gap-1">
                          <TakeStatusBadge status={take.status} />
                          {take.status !== "approved" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setTakeStatus(selectedScene, take.id, "approved") }}
                              className="text-[7px] font-semibold px-1 py-0.5 rounded transition-opacity hover:opacity-80"
                              style={{ backgroundColor: `${COLORS.green}15`, color: COLORS.green }}
                            >
                              Use
                            </button>
                          )}
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
            rows={shots[selectedScene] ? deriveCameraRows(shots[selectedScene], selectedScene) : []}
          />

          {/* Lighting Design */}
          <SceneDetailCard
            icon={Sun}
            title="Lighting design"
            rows={shots[selectedScene] ? deriveLightingRows(shots[selectedScene], selectedScene) : []}
          />

          {/* Sound Design */}
          <SceneDetailCard
            icon={Waves}
            title="Sound design"
            rows={shots[selectedScene] ? deriveSoundRows(shots[selectedScene], selectedScene) : []}
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
              width: `${(generatedCount / shots.length) * 100}%`,
              backgroundColor: COLORS.gold,
            }}
          />
        </div>

        <div className="flex items-center gap-3 px-6 py-2.5">
          {/* Sequence nodes */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {shots.map((shot, idx) => {
              const nodeStatus = sceneStatuses[idx]
              const label = String(idx + 1).padStart(2, "0")
              return (
                <div key={shot.no} className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setSelectedScene(idx); setSelectedTake(null) }}
                    className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
                    style={{ backgroundColor: selectedScene === idx ? "rgba(194,154,91,0.15)" : "transparent" }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                      style={{
                        backgroundColor: nodeStatus === "generated" ? COLORS.green : nodeStatus === "generating" ? COLORS.gold : "rgba(255,255,255,0.1)",
                        color: "#FFFFFF",
                      }}
                    >
                      {nodeStatus === "generated" ? <Check className="w-2.5 h-2.5" /> : label}
                    </div>
                    <span
                      className="text-[8px] font-medium hidden sm:inline"
                      style={{ color: nodeStatus === "queued" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}
                    >
                      {deriveSceneName(shot, idx).split(" ")[0]}
                    </span>
                  </button>
                  {idx < shots.length - 1 && (
                    <div className="w-3 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stats + actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-semibold text-white">
                {generatedCount}/{shots.length} scenes ready
              </p>
              <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {formatTimecode(totalDuration)} total
              </p>
            </div>
            <button
              onClick={approveAllScenes}
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

// EditTab scene assets + title chips are derived from production.film.shots at render time
const SFX_CHIPS = ["Room Tone", "Ambient", "Foley", "Score"]

const SPEED_OPTIONS = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"]

function EditTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
  const editShots = production.film.shots.slice(0, 6)
  const [selectedClip, setSelectedClip] = useState(0)
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
            {editShots.map((shot, i) => {
              const isSelected = selectedClip === i
              const start = formatTimecode(editShots.slice(0, i).reduce((s, x) => s + x.durationSec, 0))
              const end = formatTimecode(editShots.slice(0, i + 1).reduce((s, x) => s + x.durationSec, 0))
              return (
                <button
                  key={shot.no}
                  onClick={() => setSelectedClip(i)}
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
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold truncate" style={{ color: COLORS.textDark }}>{deriveSceneName(shot, i)}</p>
                    <p className="text-[8px]" style={{ color: COLORS.textMuted }}>{start} – {end}</p>
                  </div>
                  {shot.motionStatus === "rendered" && <Check className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.green }} />}
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
                    {editShots[selectedClip] ? deriveSceneName(editShots[selectedClip], selectedClip) : ""}
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
                {editShots.map((shot, i) => {
                  const isSelected = selectedClip === i
                  return (
                    <div key={shot.no} className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => setSelectedClip(i)}
                        className="relative w-12 h-8 rounded flex items-center justify-center text-[8px] font-bold transition-all"
                        style={{
                          backgroundColor: isSelected ? "rgba(194,154,91,0.2)" : "rgba(255,255,255,0.05)",
                          border: isSelected ? `1px solid ${COLORS.gold}` : "1px solid rgba(255,255,255,0.08)",
                          color: isSelected ? COLORS.gold : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </button>
                      {i < editShots.length - 1 && (
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
                {editShots.map((shot, i) => {
                  const totalDur = editShots.reduce((s, x) => s + x.durationSec, 0) || 1
                  const widthPct = Math.round((shot.durationSec / totalDur) * 100)
                  const isSelected = selectedClip === i
                  return (
                    <div key={shot.no} className="flex items-center gap-0.5" style={{ width: `${widthPct}%` }}>
                      <button
                        onClick={() => setSelectedClip(i)}
                        className="flex-1 h-7 rounded flex items-center justify-center text-[7px] font-bold transition-all"
                        style={{
                          backgroundColor: isSelected ? "rgba(194,154,91,0.15)" : "rgba(26,35,50,0.06)",
                          border: isSelected ? `1px solid ${COLORS.gold}` : "1px solid transparent",
                          color: isSelected ? COLORS.gold : COLORS.textMid,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </button>
                      {i < editShots.length - 1 && <ScissorsIcon className="w-2 h-2 flex-shrink-0" style={{ color: COLORS.border }} />}
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
                {editShots.map((shot, i) => (
                  <div
                    key={i}
                    className="text-[7px] font-medium px-1.5 py-0.5 rounded truncate"
                    style={{
                      backgroundColor: "rgba(138,133,120,0.06)",
                      color: COLORS.textMid,
                      maxWidth: "16%",
                    }}
                  >
                    {deriveNarrationLine(shot).split(" ").slice(0, 3).join(" ")}
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
            <div className="flex items-center gap-2 px-1.5 py-1.5 rounded mb-2" style={{ backgroundColor: "rgba(194,154,91,0.06)" }}>
              <span className="text-[9px] font-bold" style={{ color: COLORS.gold }}>V1</span>
              <div className="flex-1 min-w-0">
                <p className="text-[8px]" style={{ color: COLORS.textDark }}>
                  {production.updatedAt ? new Date(production.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "In progress"}
                </p>
                <p className="text-[7px]" style={{ color: COLORS.textMuted }}>Tai</p>
              </div>
              <MoreHorizontal className="w-2.5 h-2.5" style={{ color: COLORS.textMuted }} />
            </div>
            <p className="text-[8px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: COLORS.textMuted }}>Other versions</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-1.5 py-1 rounded transition-colors hover:bg-black/[0.02]">
                <span className="text-[9px] font-bold" style={{ color: COLORS.textMuted }}>Draft</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px]" style={{ color: COLORS.textMid }}>
                    {production.createdAt ? new Date(production.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                  </p>
                  <p className="text-[7px]" style={{ color: COLORS.textMuted }}>Original import</p>
                </div>
                <MoreHorizontal className="w-2.5 h-2.5" style={{ color: COLORS.textMuted }} />
              </div>
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
            <button
              onClick={() => onTabChange("package")}
              className="flex items-center justify-center gap-1 w-full text-[10px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90 mb-1.5"
              style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
            >
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

// Publish checklist is derived from real gate states inside PackageTab

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

// HASHTAGS derived from production topic inside PackageTab

const EXPORT_HISTORY = [
  { format: "9:16 Vertical", size: "198 MB", time: "2m 40s", date: "Today, 3:15 PM", status: "ready" as const },
  { format: "1:1 Square", size: "142 MB", time: "1m 55s", date: "Today, 3:15 PM", status: "ready" as const },
  { format: "16:9 Landscape", size: "224 MB", time: "3m 10s", date: "—", status: "pending" as const },
]

function PackageTab({ production, onTabChange: _onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
  const pkg = buildPackage(production)
  const [selectedFormat, setSelectedFormat] = useState("9:16")
  const [postEdited, setPostEdited] = useState(pkg.linkedinPost)
  const [captionEdited, setCaptionEdited] = useState(pkg.caption)

  // Derive checklist from real gate states
  const g = production.gates
  const allScenesRendered = production.film.shots.slice(0, 6).every(s => s.motionStatus === "rendered")
  const publishChecklist = [
    { label: "Concept approved", status: g.concept?.status === "approved" ? "done" as const : "pending" as const },
    { label: "Script approved", status: g.keyframes?.status === "approved" ? "done" as const : "pending" as const },
    { label: "Frames approved", status: g.keyframes?.status === "approved" ? "done" as const : "pending" as const },
    { label: "Scenes generated", status: allScenesRendered ? "done" as const : g.film?.status === "approved" ? "review" as const : "pending" as const },
    { label: "Post approved", status: g.post?.status === "approved" ? "done" as const : "review" as const },
    { label: "Caption reviewed", status: captionEdited.length > 10 ? "review" as const : "pending" as const },
    { label: "Final film approved", status: g.film?.status === "approved" ? "done" as const : "pending" as const },
  ]
  const doneCount = publishChecklist.filter(c => c.status === "done").length
  const totalCount = publishChecklist.length

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
                  {(["#TrustTai", "#Founder", `#${production.spine?.rememberSentence?.split(" ").slice(0, 2).map(w => w.replace(/[^a-zA-Z]/g, "")).join("") || "Leadership"}`]).map((tag) => (
                    <span key={tag} className="text-[8px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(47,98,216,0.06)", color: COLORS.blue }}>
                      {tag}
                    </span>
                  ))}
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
              {publishChecklist.map((item) => (
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
                onClick={() => markPublished(production.id)}
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
// POST TAB (4A)
// ═══════════════════════════════════════════════════════════════════════════════

type PostView = "original" | "studio" | "approved" | "history"

function PostTab({ production, onTabChange }: { production: Production; onTabChange: (t: TabKey) => void }) {
  // Post text seeds from the production's actual source thought / assembled argument
  const pkg = buildPackage(production)
  const sourceText = production.sourceThought?.trim() || pkg.linkedinPost

  const [view, setView] = useState<PostView>("original")
  const [editing, setEditing] = useState(false)
  const [postText, setPostText] = useState(sourceText)
  const [approved, setApproved] = useState(false)
  const [showImpact, setShowImpact] = useState(false)

  const wordCount = postText.trim().split(/\s+/).filter(Boolean).length
  const charCount = postText.length

  const viewLabels: Record<PostView, string> = {
    original: "Original",
    studio: "Studio revision",
    approved: "Approved",
    history: "History",
  }

  return (
    <div className="pt-6">
      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* ═══ LEFT: POST EDITOR ═══ */}
        <div className="space-y-4">
          {/* View switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: COLORS.cream }}>
              {(["original", "studio", "approved", "history"] as PostView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { setView(v); setEditing(false) }}
                  className="text-[10px] font-medium px-3 py-1.5 rounded-md transition-all"
                  style={{
                    backgroundColor: view === v ? COLORS.white : "transparent",
                    color: view === v ? COLORS.textDark : COLORS.textMuted,
                    boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </div>
            {!approved && view !== "history" && (
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                style={{ borderColor: COLORS.border, color: COLORS.textMid }}
              >
                <PenLine className="w-3 h-3" />
                {editing ? "Done editing" : "Edit post"}
              </button>
            )}
          </div>

          {/* Post body */}
          {view === "history" ? (
            <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Edit history</p>
              {[
                { version: "v1 — Original", date: production.createdAt ? new Date(production.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "", note: "Source post as imported" },
              ].map((h) => (
                <div key={h.version} className="flex items-start gap-3 py-3 border-t" style={{ borderColor: COLORS.borderLight }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${COLORS.navy}08` }}>
                    <History className="w-3 h-3" style={{ color: COLORS.textMid }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{h.version}</p>
                      <p className="text-[9px]" style={{ color: COLORS.textMuted }}>{h.date}</p>
                    </div>
                    <p className="text-[10px]" style={{ color: COLORS.textMid }}>{h.note}</p>
                  </div>
                  <button className="text-[9px] font-medium px-2 py-1 rounded-lg border transition-colors hover:bg-black/5 flex-shrink-0" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: approved ? "rgba(34,160,107,0.3)" : COLORS.borderLight }}>
              {approved && (
                <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ backgroundColor: "rgba(34,160,107,0.06)", borderColor: "rgba(34,160,107,0.2)" }}>
                  <Shield className="w-3 h-3" style={{ color: COLORS.green }} />
                  <p className="text-[10px] font-semibold" style={{ color: COLORS.green }}>Source of truth locked</p>
                  <p className="text-[10px] ml-auto" style={{ color: COLORS.textMuted }}>Changes will trigger downstream impact warnings</p>
                </div>
              )}
              {editing ? (
                <textarea
                  value={postText}
                  onChange={(e) => { setPostText(e.target.value); if (approved) setShowImpact(true) }}
                  className="w-full p-5 text-[13px] leading-relaxed resize-none outline-none"
                  style={{ color: COLORS.textDark, minHeight: 360, fontFamily: "inherit" }}
                />
              ) : (
                <div className="p-5">
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: COLORS.textDark }}>{postText}</p>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: COLORS.borderLight }}>
                <div className="flex items-center gap-4">
                  <span className="text-[9px]" style={{ color: COLORS.textMuted }}>{wordCount} words</span>
                  <span className="text-[9px]" style={{ color: COLORS.textMuted }}>{charCount} characters</span>
                  <span className="text-[9px]" style={{ color: wordCount > 700 ? "#D97706" : COLORS.textMuted }}>LinkedIn limit: 3000</span>
                </div>
                {!approved ? (
                  <button
                    onClick={() => {
                      setApproved(true)
                      updateProduction(production.id, (p) => ({
                        ...p,
                        gates: { ...p.gates, post: { key: "post", status: "approved" as const } },
                      }))
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-semibold px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
                  >
                    <Check className="w-3 h-3" style={{ color: COLORS.gold }} />
                    Approve post
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" style={{ color: COLORS.green }} />
                    <span className="text-[10px] font-semibold" style={{ color: COLORS.green }}>Approved</span>
                    <button onClick={() => setApproved(false)} className="text-[9px] ml-2 transition-colors hover:underline" style={{ color: COLORS.textMuted }}>Unlock</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impact warning */}
          {showImpact && approved && (
            <div className="rounded-xl border p-4" style={{ backgroundColor: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.25)" }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D97706" }} />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "#92400E" }}>Post-approval change detected</p>
                  <p className="text-[10px]" style={{ color: "#B45309" }}>Editing the approved post may affect downstream assets — Script scenes, Frames, and Concept premise. Review impact before saving.</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: "rgba(217,119,6,0.4)", color: "#92400E" }}>Review impact</button>
                    <button onClick={() => setShowImpact(false)} className="text-[10px] transition-colors hover:underline" style={{ color: COLORS.textMuted }}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT: POST INTELLIGENCE ═══ */}
        <div className="space-y-4">
          {/* Argument spine */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: COLORS.textMid }}>Post Intelligence</p>
            </div>
            <div className="space-y-3">
              {([
                { label: "Central argument", value: production.spine?.deeperTruth || production.title },
                { label: "Reader before", value: production.shift?.beginning || "Reacting to the surface" },
                { label: "Reader after", value: production.shift?.end || "Understanding the system beneath" },
                { label: "Remember sentence", value: production.spine?.rememberSentence || "" },
                { label: "Voice alignment", value: "Direct, systems-thinking, no softening." },
              ] as { label: string; value: string }[]).map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: COLORS.textMuted }}>{item.label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: COLORS.textDark }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approval status */}
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: approved ? "rgba(34,160,107,0.04)" : "rgba(26,35,50,0.03)",
              borderColor: approved ? "rgba(34,160,107,0.25)" : COLORS.borderLight,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {approved ? (
                <Shield className="w-3.5 h-3.5" style={{ color: COLORS.green }} />
              ) : (
                <Shield className="w-3.5 h-3.5" style={{ color: COLORS.textMuted }} />
              )}
              <p className="text-[10px] font-bold" style={{ color: approved ? COLORS.green : COLORS.textMid }}>
                {approved ? "Post approved" : "Post not yet approved"}
              </p>
            </div>
            <p className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>
              {approved
                ? "This post is locked as the source of truth. Every film, script, and frame must serve this argument."
                : "Approve the post to lock it as source of truth. Concept generation requires an approved post."}
            </p>
            {!approved && (
              <button
                onClick={() => setApproved(true)}
                className="w-full mt-3 text-[10px] font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
              >
                Approve post
              </button>
            )}
          </div>

          {/* Studio actions */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: COLORS.textMid }}>Studio actions</p>
            <div className="space-y-2">
              {[
                { icon: Sparkles, label: "Refine with Studio", sub: "Let Studio tighten the argument" },
                { icon: GitCompare, label: "Compare versions", sub: "Side-by-side diff" },
                { icon: Zap, label: "Extract intelligence", sub: "Re-analyze argument spine" },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left border transition-colors hover:bg-black/[0.02]"
                    style={{ borderColor: COLORS.borderLight }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${COLORS.gold}10` }}>
                      <Icon className="w-3 h-3" style={{ color: COLORS.gold }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>{action.label}</p>
                      <p className="text-[9px]" style={{ color: COLORS.textMuted }}>{action.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY TAB (4H)
// ═══════════════════════════════════════════════════════════════════════════════

type MemoryGroup = "brand_rules" | "voice" | "characters" | "places" | "symbols" | "visual_rules" | "corrections" | "related_posts" | "signals"

const MEMORY_USED: { group: MemoryGroup; label: string; items: { title: string; excerpt: string; confidence: number; source: string }[] }[] = [
  {
    group: "voice",
    label: "Voice",
    items: [
      { title: "No softening language", excerpt: "Avoid hedge words: 'perhaps', 'might', 'could potentially'. The founding sentence should land hard.", confidence: 96, source: "World Bible — Voice" },
      { title: "Systems-thinking register", excerpt: "Posts perform best when they move from observable symptom to structural diagnosis to named principle.", confidence: 88, source: "World Bible — Voice" },
    ],
  },
  {
    group: "brand_rules",
    label: "Brand Rules",
    items: [
      { title: "Spirit First — no spectacle", excerpt: "Dignity over drama. Never sensationalize founder pain or use struggle as entertainment.", confidence: 99, source: "World Bible — Constitution" },
    ],
  },
  {
    group: "characters",
    label: "Characters",
    items: [
      { title: "The Architect (visual persona)", excerpt: "Appears in structural/systems posts. Mid-40s, steady gaze, working environment. Used in 4 prior productions.", confidence: 84, source: "World Bible — Characters" },
    ],
  },
  {
    group: "symbols",
    label: "Symbols",
    items: [
      { title: "The laptop as vulnerability", excerpt: "Physical device = single point of failure. Used twice before; limit reuse.", confidence: 79, source: "World Bible — Symbols" },
    ],
  },
  {
    group: "visual_rules",
    label: "Visual Rules",
    items: [
      { title: "Architectural interiors", excerpt: "Systems posts use structured spaces: server rooms, drafting tables, clean desktops. No clutter.", confidence: 91, source: "World Bible — Visual Language" },
      { title: "Portrait-first aspect", excerpt: "Default to 9:16 portrait for character-focused shots. Landscape reserved for wide environment shots only.", confidence: 94, source: "World Bible — Visual Language" },
    ],
  },
  {
    group: "related_posts",
    label: "Related Posts",
    items: [
      { title: "The hidden cost of convenience", excerpt: "Published 2026-07-14. Same structural-dependency thesis. Check for overlap before finalizing.", confidence: 73, source: "Story Threads — Architecture" },
    ],
  },
]

const MEMORY_LEARNED: { title: string; category: string; draft: string; status: "pending" | "approved" | "rejected" }[] = [
  { title: "Laptop metaphor resonance", category: "Signals", draft: "The laptop-as-vulnerability image generated unusually high save rate (4.2%) on this production. Consider adding to Symbols with 'high-resonance' flag.", status: "pending" },
  { title: "Opening with a 'moment' construction", category: "Voice", draft: "'There is a moment in every...' opening pattern used here for the first time. If post performs, add to approved sentence patterns.", status: "pending" },
  { title: "Architectural interiors — indoor lighting rule", category: "Visual Rules", draft: "Diffused overhead light worked better than directional spots on the Architect character in this production. Worth adding as a lighting refinement.", status: "pending" },
]

const MEMORY_GROUP_COLORS: Record<MemoryGroup, string> = {
  brand_rules: "#7C3AED",
  voice: "#2563EB",
  characters: "#D97706",
  places: "#059669",
  symbols: "#DC2626",
  visual_rules: "#0891B2",
  corrections: "#B45309",
  related_posts: "#6B7280",
  signals: "#22C55E",
}

function MemoryTab({ production }: { production: Production }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<MemoryGroup>>(new Set(["voice", "visual_rules"]))
  const [pendingDecisions, setPendingDecisions] = useState<Record<string, "approved" | "rejected" | null>>(() => {
    const init: Record<string, null> = {}
    MEMORY_LEARNED.forEach((m) => { init[m.title] = null })
    return init
  })

  const toggleGroup = (g: MemoryGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  const decide = (title: string, decision: "approved" | "rejected") => {
    setPendingDecisions((prev) => ({ ...prev, [title]: decision }))
  }

  const pendingCount = Object.values(pendingDecisions).filter((v) => v === null).length
  const approvedCount = Object.values(pendingDecisions).filter((v) => v === "approved").length

  return (
    <div className="pt-6">
      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* ═══ LEFT: MEMORY USED ═══ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-base" style={{ color: COLORS.textDark }}>Memory used in this production</p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMid }}>{MEMORY_USED.reduce((acc, g) => acc + g.items.length, 0)} memories drawn from the World Bible</p>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
              <Eye className="w-3 h-3" />
              Full World Bible
            </button>
          </div>

          {MEMORY_USED.map((group) => {
            const isOpen = expandedGroups.has(group.group)
            const accentColor = MEMORY_GROUP_COLORS[group.group] || COLORS.textMid

            return (
              <div key={group.group} className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/[0.01]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                    <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{group.label}</p>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}12`, color: accentColor }}>
                      {group.items.length}
                    </span>
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ color: COLORS.textMuted, transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>

                {isOpen && (
                  <div className="border-t" style={{ borderColor: COLORS.borderLight }}>
                    {group.items.map((item, i) => (
                      <div
                        key={item.title}
                        className="px-4 py-3 flex items-start gap-3"
                        style={{ borderTop: i > 0 ? `1px solid ${COLORS.borderLight}` : "none" }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] font-semibold" style={{ color: COLORS.textDark }}>{item.title}</p>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                              <div className="h-1 w-12 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
                                <div className="h-full rounded-full" style={{ width: `${item.confidence}%`, backgroundColor: item.confidence >= 90 ? COLORS.green : item.confidence >= 75 ? COLORS.gold : "#9CA3AF" }} />
                              </div>
                              <span className="text-[8px] font-medium" style={{ color: COLORS.textMuted }}>{item.confidence}%</span>
                            </div>
                          </div>
                          <p className="text-[10px] leading-snug mb-1.5" style={{ color: COLORS.textMid }}>{item.excerpt}</p>
                          <p className="text-[9px]" style={{ color: COLORS.textMuted }}>Source: {item.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ═══ RIGHT: MEMORY LEARNED + GOVERNANCE ═══ */}
        <div className="space-y-4">
          {/* Governance header */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: "rgba(194,154,91,0.04)", borderColor: "rgba(194,154,91,0.2)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
              <p className="text-[10px] font-bold" style={{ color: COLORS.textDark }}>Memory governance</p>
            </div>
            <p className="text-[10px] leading-snug" style={{ color: COLORS.textMid }}>
              Nothing from this production becomes permanent without your approval. Studio suggests — you decide.
            </p>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.gold }} />
                <span className="text-[10px] font-semibold" style={{ color: COLORS.gold }}>{pendingCount} decision{pendingCount > 1 ? "s" : ""} pending</span>
              </div>
            )}
            {approvedCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Check className="w-3 h-3" style={{ color: COLORS.green }} />
                <span className="text-[10px] font-semibold" style={{ color: COLORS.green }}>{approvedCount} saved to World Bible</span>
              </div>
            )}
          </div>

          {/* Memory learned */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: COLORS.textMid }}>Potential new learnings</p>
            <div className="space-y-3">
              {MEMORY_LEARNED.map((item) => {
                const decision = pendingDecisions[item.title]
                return (
                  <div
                    key={item.title}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: decision === "approved" ? "rgba(34,160,107,0.3)" : decision === "rejected" ? COLORS.borderLight : "rgba(194,154,91,0.25)",
                      backgroundColor: decision === "approved" ? "rgba(34,160,107,0.03)" : decision === "rejected" ? "rgba(138,133,120,0.03)" : "rgba(194,154,91,0.03)",
                      opacity: decision === "rejected" ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10px] font-semibold" style={{ color: COLORS.textDark }}>{item.title}</p>
                        <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block" style={{ backgroundColor: "rgba(138,133,120,0.08)", color: COLORS.textMuted }}>{item.category}</span>
                      </div>
                      {decision ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {decision === "approved" ? (
                            <><Check className="w-3 h-3" style={{ color: COLORS.green }} /><span className="text-[9px] font-medium" style={{ color: COLORS.green }}>Saved</span></>
                          ) : (
                            <><X className="w-3 h-3" style={{ color: COLORS.textMuted }} /><span className="text-[9px]" style={{ color: COLORS.textMuted }}>Skipped</span></>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <p className="text-[10px] leading-snug mb-3" style={{ color: COLORS.textMid }}>{item.draft}</p>
                    {!decision && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decide(item.title, "approved")}
                          className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold px-2 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                          style={{ backgroundColor: COLORS.navy, color: "#FFFFFF" }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: COLORS.gold }} />
                          Save to World Bible
                        </button>
                        <button
                          onClick={() => decide(item.title, "rejected")}
                          className="flex items-center justify-center text-[9px] font-medium px-2 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                          style={{ borderColor: COLORS.border, color: COLORS.textMid }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Production memory summary */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: COLORS.white, borderColor: COLORS.borderLight }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: COLORS.textMid }}>Production memory summary</p>
            <div className="space-y-2">
              {[
                { label: "Memories used", value: `${MEMORY_USED.reduce((acc, g) => acc + g.items.length, 0)}`, sub: "drawn from World Bible" },
                { label: "Groups accessed", value: `${MEMORY_USED.length}`, sub: "of 9 memory categories" },
                { label: "Pending decisions", value: `${pendingCount}`, sub: "potential new learnings" },
                { label: "Saved to World", value: `${approvedCount}`, sub: "approved by Tai" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-t" style={{ borderColor: COLORS.borderLight }}>
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: COLORS.textDark }}>{stat.label}</p>
                    <p className="text-[9px]" style={{ color: COLORS.textMuted }}>{stat.sub}</p>
                  </div>
                  <p className="text-base font-bold" style={{ color: COLORS.navy }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
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
