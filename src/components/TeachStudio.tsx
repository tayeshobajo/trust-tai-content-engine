"use client"

import { useMemo, useState } from "react"
import {
  CORRECTION_CATEGORIES,
  CORRECTION_LABELS,
  LEARNING_SCOPES,
  suggestInterpretation,
  type CorrectionCategory,
  type LearningScope,
  type LearningSurface,
} from "@/data/studio-memory"
import {
  confirmCorrectionAsPrinciple,
  saveCorrectionEvent,
} from "@/lib/studio-memory-store"
import { Brain, Check, X } from "lucide-react"

interface TeachStudioProps {
  productionId: string
  surface: LearningSurface
  target: string
  before?: string
  buttonLabel?: string
  compact?: boolean
}

export default function TeachStudio({
  productionId,
  surface,
  target,
  before,
  buttonLabel = "Teach Studio",
  compact = false,
}: TeachStudioProps) {
  const [open, setOpen] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [category, setCategory] = useState<CorrectionCategory>("truth")
  const [scope, setScope] = useState<LearningScope>("this_production")
  const [taiNote, setTaiNote] = useState("")
  const [keepUnchanged, setKeepUnchanged] = useState("")
  const [makePrinciple, setMakePrinciple] = useState(false)
  const [saved, setSaved] = useState(false)

  const interpretation = useMemo(
    () => suggestInterpretation(selectedLabels, category),
    [category, selectedLabels]
  )

  function toggleLabel(label: string) {
    setSelectedLabels((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    )
  }

  function handleSave() {
    const event = saveCorrectionEvent({
      productionId,
      surface,
      target,
      before,
      labels: selectedLabels.length > 0 ? selectedLabels : ["Correction noted"],
      category,
      scope,
      keepUnchanged: keepUnchanged
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      taiNote: taiNote.trim() || undefined,
      studioInterpretation: interpretation,
    })

    if (makePrinciple) confirmCorrectionAsPrinciple(event)

    setSaved(true)
    setTimeout(() => {
      setOpen(false)
      setSaved(false)
      setSelectedLabels([])
      setTaiNote("")
      setKeepUnchanged("")
      setMakePrinciple(false)
      setScope("this_production")
      setCategory("truth")
    }, 900)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ${
          compact
            ? "px-2.5 py-1 text-[11px] text-[#4A5568] border border-[#DDD8CE] bg-white hover:bg-black/5"
            : "px-3 py-2 text-xs text-[#0F172A] border border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <Brain className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8]">
                  Creative memory
                </p>
                <h2 className="text-lg font-bold text-[#0F172A] mt-0.5">Teach Studio</h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Capture the reason behind this correction. Studio will keep it local until Tai confirms a broader principle.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-gray-100"
                aria-label="Close Teach Studio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 max-h-[72vh] overflow-y-auto space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                  Target
                </p>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-[#0F172A]">{target}</p>
                  {before && (
                    <p className="text-xs text-[#64748B] leading-relaxed mt-1 line-clamp-3">
                      {before}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                  Fast labels
                </p>
                <div className="flex flex-wrap gap-2">
                  {CORRECTION_LABELS.map((label) => {
                    const active = selectedLabels.includes(label)
                    return (
                      <button
                        key={label}
                        onClick={() => toggleLabel(label)}
                        className={`text-xs font-medium rounded-lg border px-2.5 py-1 transition-colors ${
                          active
                            ? "bg-[#0F172A] border-[#0F172A] text-white"
                            : "bg-white border-gray-200 text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CorrectionCategory)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0F172A]"
                  >
                    {CORRECTION_CATEGORIES.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                    Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as LearningScope)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0F172A]"
                  >
                    {LEARNING_SCOPES.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                  What must remain unchanged?
                </label>
                <input
                  value={keepUnchanged}
                  onChange={(e) => setKeepUnchanged(e.target.value)}
                  placeholder="Truth, character, final image, audience shift"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                  Tai note
                </label>
                <textarea
                  value={taiNote}
                  onChange={(e) => setTaiNote(e.target.value)}
                  rows={3}
                  placeholder="What was wrong, what worked, or what Studio should learn."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0F172A] resize-none"
                />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700 mb-1">
                  Studio interpretation
                </p>
                <p className="text-sm leading-relaxed text-[#7A5A20]">{interpretation}</p>
              </div>

              <label className="flex items-start gap-2 text-sm text-[#64748B]">
                <input
                  type="checkbox"
                  checked={makePrinciple}
                  onChange={(e) => setMakePrinciple(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Make this a Studio principle after saving. Leave unchecked to keep it as evidence for this production.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-[#94A3B8]">
                Default scope is local so one unusual production does not become a permanent rule.
              </p>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E293B]"
              >
                {saved ? <Check className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                {saved ? "Saved" : "Save lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

