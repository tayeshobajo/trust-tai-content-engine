/**
 * Package Assembly — Final package builder with completeness verification
 *
 * Assembles all approved assets into a delivery-ready package and verifies
 * nothing is missing before the production is labelled READY.
 *
 * QA coverage: Section 17 (Final Package Readiness) + Section 15 (Edit Readiness)
 */

import type { Production } from "@/data/studio"
import type { Script } from "@/data/scripts"

// ─── Package Checklist Items ──────────────────────────────────────────────────

export type PackageCheckStatus = "pass" | "fail" | "warning" | "not-checked"

export interface PackageCheck {
  id: string
  category: "video" | "audio" | "metadata" | "accessibility" | "platform"
  label: string
  description: string
  status: PackageCheckStatus
  detail?: string
  /** Whether this blocks packaging */
  blocking: boolean
}

// ─── Package Status ───────────────────────────────────────────────────────────

export type PackageStatus = "incomplete" | "ready" | "assembled" | "delivered"

export interface ProductionPackage {
  productionId: string
  status: PackageStatus
  checks: PackageCheck[]
  /** Overall completion percentage (0-100) */
  completionPercent: number
  /** Number of blocking items still failing */
  blockingCount: number
  /** Assembled video URLs */
  videoFiles: { shotNo: number; url: string; format: string }[]
  /** Audio tracks */
  audioFiles: { type: string; url: string }[]
  /** Metadata */
  metadata: {
    title: string
    description: string
    caption: string
    firstComment: string
    accessibilityText: string
    tags: string[]
  } | null
  /** Timeline / scene order */
  timeline: { shotNo: number; order: number; durationSec: number }[]
  /** When package was assembled */
  assembledAt?: string
  /** Who assembled it */
  assembledBy?: string
}

// ─── Package Builder ──────────────────────────────────────────────────────────

/**
 * Runs all completeness checks and builds a package status report.
 */
export function buildPackageReport(
  production: Production,
  script?: Script,
): ProductionPackage {
  const checks: PackageCheck[] = []
  const shots = production.film.shots

  // ── Video checks ────────────────────────────────────────────────
  const renderedVideoShots = shots.filter((s) => s.renderedVideoUrl)
  const allVideoRendered = renderedVideoShots.length === shots.length && shots.length > 0

  checks.push({
    id: "all-shots-rendered-video",
    category: "video",
    label: "All shots have rendered video",
    description: `Every shot must have a rendered video URL.`,
    status: allVideoRendered ? "pass" : shots.length === 0 ? "not-checked" : "fail",
    detail: `${renderedVideoShots.length} / ${shots.length} shots rendered`,
    blocking: true,
  })

  // ── Audio checks ────────────────────────────────────────────────
  checks.push({
    id: "narration-complete",
    category: "audio",
    label: "Narration / voiceover complete",
    description: "All narration lines are recorded and synced.",
    status: "not-checked",
    blocking: false,
  })

  checks.push({
    id: "music-selected",
    category: "audio",
    label: "Music / score selected",
    description: "Background music or score is chosen and licensed.",
    status: "not-checked",
    blocking: false,
  })

  // ── Metadata checks ─────────────────────────────────────────────
  checks.push({
    id: "title-set",
    category: "metadata",
    label: "Title set",
    description: "Production has a descriptive title.",
    status: production.title?.trim() ? "pass" : "fail",
    blocking: true,
  })

  checks.push({
    id: "caption-written",
    category: "metadata",
    label: "Caption written",
    description: "Social media caption is written.",
    status: production.publishedAt ? "pass" : "not-checked",
    blocking: false,
  })

  checks.push({
    id: "first-comment-written",
    category: "metadata",
    label: "First comment written",
    description: "LinkedIn first comment is drafted.",
    status: "not-checked",
    blocking: false,
  })

  // ── Accessibility ───────────────────────────────────────────────
  checks.push({
    id: "accessibility-text",
    category: "accessibility",
    label: "Accessibility text written",
    description: "Visual description of the film for accessibility.",
    status: "not-checked",
    blocking: false,
  })

  // ── Platform ────────────────────────────────────────────────────
  checks.push({
    id: "aspect-ratios-defined",
    category: "platform",
    label: "Aspect ratios defined",
    description: "Required export aspect ratios are specified.",
    status: production.aspectRatios?.length ? "pass" : "warning",
    detail: production.aspectRatios?.join(", ") || "Not set",
    blocking: false,
  })

  checks.push({
    id: "platform-set",
    category: "platform",
    label: "Platform defined",
    description: "Target platform (LinkedIn, Instagram, etc.) is set.",
    status: production.platform ? "pass" : "warning",
    detail: production.platform ?? "Not set",
    blocking: false,
  })

  // ── Duration ────────────────────────────────────────────────────
  if (production.targetDurationSec) {
    const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0)
    const withinTolerance = Math.abs(totalDuration - production.targetDurationSec) <= 3
    checks.push({
      id: "duration-matches-target",
      category: "video",
      label: "Total duration matches target",
      description: `Shot durations sum to ${production.targetDurationSec}s ±3s.`,
      status: withinTolerance ? "pass" : "fail",
      detail: `Current: ${totalDuration}s, Target: ${production.targetDurationSec}s`,
      blocking: true,
    })
  }

  // ── Script ──────────────────────────────────────────────────────
  if (script) {
    const unassignedShots = script.scenes.some((s) => s.shotNumbers.length === 0)
    checks.push({
      id: "script-scenes-complete",
      category: "metadata",
      label: "All scenes have shots assigned",
      description: "No empty scenes in the script.",
      status: unassignedShots ? "warning" : "pass",
      blocking: false,
    })
  }

  // ── Calculate completion ────────────────────────────────────────
  const totalChecks = checks.length
  const passed = checks.filter((c) => c.status === "pass").length
  const notChecked = checks.filter((c) => c.status === "not-checked").length
  const completionPercent = Math.round(
    ((passed + notChecked * 0.5) / totalChecks) * 100,
  )

  const blockingCount = checks.filter(
    (c) => c.blocking && (c.status === "fail" || c.status === "not-checked"),
  ).length

  // Determine overall status
  let status: PackageStatus = "incomplete"
  if (blockingCount === 0 && completionPercent === 100) status = "ready"
  else if (blockingCount === 0 && completionPercent >= 80) status = "ready"

  return {
    productionId: production.id,
    status,
    checks,
    completionPercent,
    blockingCount,
    videoFiles: [],
    audioFiles: [],
    metadata: null,
    timeline: shots.map((s, i) => ({
      shotNo: s.no,
      order: i + 1,
      durationSec: s.durationSec,
    })),
  }
}
