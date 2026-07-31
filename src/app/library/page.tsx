"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  GATE_ORDER,
  approvedGateCount,
  nextGate,
  stageLabel,
  type Production,
} from "@/data/studio"
import { buildPackage } from "@/lib/studio-engine"
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store"
import { Check, Copy } from "lucide-react"

type LibraryTab = "All work" | "In production" | "Package ready"

const TABS: LibraryTab[] = ["All work", "In production", "Package ready"]

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable; nothing to do.
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-gray-100 transition-colors flex-shrink-0"
    >
      {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function PackageField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs uppercase tracking-wider text-[#94A3B8]">{label}</p>
        <CopyButton text={value} label={label} />
      </div>
      <p
        className={`text-sm text-[#0F172A] leading-relaxed whitespace-pre-line ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
  const [activeTab, setActiveTab] = useState<LibraryTab>("All work")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = () => {
      setProductions(getProductions())
      setLoaded(true)
    }
    load()
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load)
    return () => window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load)
  }, [])

  const filtered = productions.filter((p) => {
    if (activeTab === "In production") return nextGate(p) !== null
    if (activeTab === "Package ready") return nextGate(p) === null
    return true
  })

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null
  const pkg = selected ? buildPackage(selected) : null
  const selectedConcept = selected
    ? selected.film.concepts.find((c) => c.key === selected.film.selectedConcept) ?? null
    : null

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Studio Library</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Approved intellectual property, packaged for copy-paste publishing. Nothing goes out on its own.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedId(null)
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loaded && filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-[#0F172A] mb-1">
              {activeTab === "Package ready"
                ? "No packages have cleared all five gates yet."
                : "The library is empty."}
            </p>
            <p className="text-sm text-[#64748B] mb-4">
              Approved arguments and film plans collect here as they move through the gates.
            </p>
            <button
              onClick={() => router.push("/thinking-room")}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Capture a thought
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Package list */}
            <div className="lg:col-span-4 space-y-3">
              {filtered.map((p) => {
                const isActive = selected?.id === p.id
                const ready = nextGate(p) === null
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left bg-white rounded-lg border shadow-sm p-4 transition-colors ${
                      isActive ? "border-blue-400" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#0F172A] leading-snug mb-2">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          ready
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ready ? "Package ready" : stageLabel(p)}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {approvedGateCount(p)} of 5 gates
                      </span>
                    </div>
                    <div className="flex gap-1 mt-3">
                      {GATE_ORDER.map((g) => (
                        <span
                          key={g}
                          className={`h-1 flex-1 rounded-full ${
                            p.gates[g].status === "approved"
                              ? "bg-green-600"
                              : p.gates[g].status === "hold"
                              ? "bg-amber-400"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Package preview */}
            <div className="lg:col-span-8">
              {selected && pkg && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[#0F172A]">
                        Publishing package
                      </h2>
                      <span className="text-xs text-[#94A3B8]">
                        Copy each piece when you are ready to post
                      </span>
                    </div>
                    <div className="space-y-4">
                      <PackageField label="LinkedIn post" value={pkg.linkedinPost} />
                      <PackageField label="Caption" value={pkg.caption} />
                      <PackageField label="First comment" value={pkg.firstComment} />
                      <PackageField label="Accessibility text" value={pkg.accessibilityText} />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[#0F172A]">Film package</h2>
                      <button
                        onClick={() => router.push(`/film-studio?id=${selected.id}`)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Open in Film Studio
                      </button>
                    </div>
                    {selectedConcept ? (
                      <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-100">
                          <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1.5">
                            Concept direction
                          </p>
                          <p className="text-sm text-[#0F172A] leading-relaxed">
                            {selectedConcept.name}: {selectedConcept.premise}
                          </p>
                        </div>
                        <PackageField
                          label="Treatment"
                          value={selected.film.treatment
                            .map((b, i) => `${i + 1}. ${b}`)
                            .join("\n")}
                        />
                        <PackageField
                          label="Shot list"
                          value={selected.film.shots
                            .map(
                              (s) =>
                                `Shot ${s.no} (${s.durationSec}s, ${s.route}): ${s.description}`
                            )
                            .join("\n")}
                        />
                        <PackageField
                          label="Keyframe plan"
                          value={`First frame: ${selected.film.keyframes.firstFrame}\n\nLast frame: ${selected.film.keyframes.lastFrame}\n\nAnchors: ${selected.film.keyframes.anchors}`}
                        />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1.5">
                            Estimated render cost
                          </p>
                          <p className="text-sm text-[#0F172A]">{selectedConcept.costEstimate}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#64748B]">
                        No concept direction has been chosen yet. Pick one in the Film
                        Studio to complete this package.
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
                      Source and approval history
                    </h2>
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                      Original thought ({selected.sourceType})
                    </p>
                    <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line mb-4">
                      {selected.sourceThought}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-2">
                      History
                    </p>
                    <ul className="space-y-2">
                      {selected.revisions.slice(0, 6).map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-[#64748B] leading-relaxed">{r.note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
