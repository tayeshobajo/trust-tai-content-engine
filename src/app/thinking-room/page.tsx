"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import {
  SOURCE_TYPES,
  SPINE_LABELS,
  type ArgumentSection,
  type AudienceShift,
  type ContentSpine,
  type Production,
  type SourceType,
  type VoiceWarning,
  assembleArgument,
} from "@/data/studio"
import {
  buildArgument,
  buildFilmPlan,
  buildShift,
  buildSpine,
  checkVoice,
  deriveTitle,
} from "@/lib/studio-engine"
import { emptyGates, saveProduction } from "@/lib/studio-store"
import { ArrowRight, Lightbulb, ShieldAlert, ShieldCheck } from "lucide-react"

interface DraftResult {
  spine: ContentSpine
  shift: AudienceShift
  sections: ArgumentSection[]
  warnings: VoiceWarning[]
}

export default function ThinkingRoomPage() {
  const router = useRouter()
  const [thought, setThought] = useState("")
  const [sourceType, setSourceType] = useState<SourceType>("Typed thought")
  const [result, setResult] = useState<DraftResult | null>(null)
  const [saved, setSaved] = useState(false)

  const canExtract = thought.trim().length >= 40

  function handleExtract() {
    const text = thought.trim()
    if (text.length < 40) return
    const spine = buildSpine(text, sourceType)
    const sections = buildArgument(text, spine)
    setResult({
      spine,
      shift: buildShift(text, spine),
      sections,
      warnings: checkVoice(text + "\n" + assembleArgument(sections)),
    })
    setSaved(false)
  }

  function handleSave() {
    if (!result) return
    const now = new Date().toISOString()
    const production: Production = {
      id: `prod-${Date.now()}`,
      title: deriveTitle(result.spine),
      sourceType,
      sourceThought: thought.trim(),
      createdAt: now,
      updatedAt: now,
      spine: result.spine,
      shift: result.shift,
      sections: result.sections,
      voiceWarnings: result.warnings,
      comments: [],
      revisions: [{ at: now, note: "Spine extracted and first draft argument scaffolded in the Thinking Room." }],
      gates: emptyGates(),
      film: buildFilmPlan(thought.trim(), result.spine),
    }
    saveProduction(production)
    setSaved(true)
    router.push("/approvals")
  }

  return (
    <Shell>
      <div className="px-4 md:px-8 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Thinking Room</h1>
          <p className="text-sm text-[#64748B] mt-1">
            One clear thought in. A content spine and a first argument out.
          </p>
        </div>

        {/* Source capture */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A]">Source capture</h2>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] w-full md:w-auto"
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={6}
            placeholder="Write the thought the way you would say it. A moment with a client, a pattern you keep seeing, a question you cannot put down."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#94A3B8]">
              {canExtract
                ? "Ready to extract"
                : "Write at least a few sentences before extracting"}
            </span>
            <button
              onClick={handleExtract}
              disabled={!canExtract}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Extract the spine
            </button>
          </div>
        </div>

        {result && (
          <>
            {/* Spine + audience shift */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Content spine</h2>
                <div className="space-y-4">
                  {SPINE_LABELS.map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                        {label}
                      </p>
                      <p className="text-sm text-[#0F172A] leading-relaxed">
                        {result.spine[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Audience shift</h2>
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                    At the beginning
                  </p>
                  <p className="text-sm text-[#0F172A] leading-relaxed mb-4">
                    {result.shift.beginning}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                    By the end
                  </p>
                  <p className="text-sm text-[#0F172A] leading-relaxed">
                    {result.shift.end}
                  </p>
                  <p className="text-xs text-[#64748B] mt-4 pt-3 border-t border-gray-100 leading-relaxed">
                    If this shift is weak, the post is not ready. If the visual does not
                    deepen it, the film should not be produced.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {result.warnings.length === 0 ? (
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    )}
                    <h2 className="text-sm font-semibold text-[#0F172A]">Voice check</h2>
                  </div>
                  {result.warnings.length === 0 ? (
                    <p className="text-sm text-[#64748B]">
                      No voice rule violations found in the source or draft.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {result.warnings.map((w, i) => (
                        <li key={i}>
                          <p className="text-xs font-semibold text-amber-700">{w.rule}</p>
                          <p className="text-xs text-[#64748B] leading-relaxed">{w.detail}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Draft argument preview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Draft argument preview
                </h2>
                <span className="text-xs text-[#94A3B8]">
                  Trust Tai post structure, eight sections
                </span>
              </div>
              <div className="space-y-5">
                {result.sections.map((s) => (
                  <div key={s.name} className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-6">
                    <div className="lg:col-span-2">
                      <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
                        {s.name}
                      </p>
                      <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                        {s.text}
                      </p>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed lg:pt-5">
                      {s.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 pb-6">
              <span className="text-xs text-[#94A3B8]">
                Saving opens the Approval Desk. Nothing advances without your decision.
              </span>
              <button
                onClick={handleSave}
                disabled={saved}
                className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Send to Approval Desk
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}
