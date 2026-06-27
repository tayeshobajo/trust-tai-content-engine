"use client"

import { useState } from "react"
import { use } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { POSTS } from "@/data/posts"
import {
  Sparkles,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const PLATFORM_TABS = ["LinkedIn", "Instagram", "X"] as const
type PlatformTab = (typeof PLATFORM_TABS)[number]

interface ScoreBarProps {
  label: string
  value: number
}

function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#64748B] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2563EB] rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-[#0F172A] w-8 text-right">
        {value}
      </span>
    </div>
  )
}

function CircleScore({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke="#16A34A"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#0F172A]">{score}</span>
        <span className="text-xs text-[#94A3B8]">/100</span>
      </div>
    </div>
  )
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const post = POSTS.find((p) => p.id === id) ?? POSTS[0]

  const [activePlatformTab, setActivePlatformTab] =
    useState<PlatformTab>("LinkedIn")
  const [hook, setHook] = useState(post.hook)
  const [body, setBody] = useState(post.body)
  const [cta, setCta] = useState(post.cta)
  const [status, setStatus] = useState(post.status)

  const bodyLength = body.length

  const PTAB_COLORS: Record<PlatformTab, string> = {
    LinkedIn: "bg-blue-600",
    Instagram: "bg-pink-500",
    X: "bg-slate-800",
  }
  const PTAB_ABBR: Record<PlatformTab, string> = {
    LinkedIn: "LI",
    Instagram: "IG",
    X: "X",
  }
  function PlatformTabIcon({ p }: { p: PlatformTab }) {
    return (
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold text-white ${PTAB_COLORS[p]}`}>
        {PTAB_ABBR[p]}
      </span>
    )
  }

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Back link */}
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

          <div className="flex gap-6">
            {/* LEFT — Post Preview (45%) */}
            <div className="flex-[2.25] flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
                {/* Featured image */}
                <div
                  className="w-full rounded-xl"
                  style={{
                    paddingBottom: "56.25%",
                    background: `linear-gradient(135deg, ${post.gradientFrom}, ${post.gradientTo})`,
                    position: "relative",
                  }}
                />

                {/* Platform version tabs */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-2">
                    Platform Versions
                  </p>
                  <div className="flex gap-1">
                    {PLATFORM_TABS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivePlatformTab(p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          activePlatformTab === p
                            ? "bg-[#2563EB] text-white"
                            : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
                        }`}
                      >
                        <PlatformTabIcon p={p} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hook input */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Hook
                  </label>
                  <input
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Body textarea */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-[#64748B]">
                      Body
                    </label>
                    <span className="text-xs text-[#94A3B8]">
                      {bodyLength}/3000
                    </span>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] resize-none"
                  />
                </div>

                {/* CTA input */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    CTA
                  </label>
                  <input
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Agent Tip */}
                <div className="flex gap-3 bg-blue-50 rounded-xl px-4 py-3">
                  <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#2563EB]">
                    <span className="font-semibold">Agent Tip:</span> Strong
                    hook. Consider adding a specific number or client story to
                    strengthen credibility.
                  </p>
                </div>
              </div>
            </div>

            {/* CENTER — Status & Scheduling (35%) */}
            <div className="flex-[1.75] flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Status &amp; Scheduling
                </h2>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as typeof status
                      )
                    }
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option>Draft</option>
                    <option>Needs Review</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                    <option>Winning</option>
                  </select>
                </div>

                {/* Schedule date */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Schedule Date
                  </label>
                  <input
                    type="datetime-local"
                    defaultValue={post.scheduleDate ?? ""}
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Category
                  </label>
                  <select
                    defaultValue={post.category}
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option>Founder Insight</option>
                    <option>Client Education</option>
                    <option>Proof/Case Study</option>
                    <option>Behind the Scenes</option>
                    <option>Offer/Sales</option>
                    <option>Thought Leadership</option>
                    <option>Personal Story</option>
                    <option>FAQs</option>
                  </select>
                </div>

                {/* Content Pillar */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Content Pillar
                  </label>
                  <select
                    defaultValue={post.contentPillar ?? ""}
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option>The Roadmap</option>
                    <option>Founder Bottlenecks</option>
                    <option>Systems That Scale</option>
                    <option>Spirit First</option>
                    <option>Client Transformation</option>
                  </select>
                </div>

                {/* Campaign */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Campaign
                  </label>
                  <select
                    defaultValue={post.campaign ?? ""}
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option value="">No Campaign</option>
                    <option>Roadmap Launch</option>
                    <option>Founder Authority Series</option>
                    <option>Spirit First Awareness</option>
                  </select>
                </div>

                {/* Offer alignment */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Offer Alignment
                  </label>
                  <input
                    defaultValue="Trust Tai — Content Engine"
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Approval status */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-sm font-medium text-[#16A34A]">
                    Approved by Tai
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium py-2 rounded-lg transition-colors">
                    Save Changes
                  </button>
                  <button className="flex-1 border border-gray-200 text-[#0F172A] hover:bg-gray-50 text-sm font-medium py-2 rounded-lg transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — Agent Score (20%) */}
            <div className="flex-1 flex flex-col gap-4 min-w-[200px]">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
                {/* Score ring */}
                <div className="flex flex-col items-center gap-1">
                  <CircleScore score={post.agentScore} />
                  <span className="text-sm font-semibold text-[#16A34A]">
                    Strong
                  </span>
                </div>

                {/* Score bars */}
                <div className="flex flex-col gap-2">
                  <ScoreBar label="Clarity" value={92} />
                  <ScoreBar label="Audience Fit" value={88} />
                  <ScoreBar label="Hook Strength" value={85} />
                  <ScoreBar label="CTA Quality" value={84} />
                  <ScoreBar label="Brand Voice" value={90} />
                </div>

                {/* Performance (if published) */}
                {post.impressions && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-2">
                      Performance
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-[#64748B]">
                          Impressions
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {post.impressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#64748B]">
                          Engagement
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {post.engagement}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#64748B]">Clicks</span>
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {post.clicks}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Repurpose suggestions */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-2">
                    Repurpose Suggestions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs text-[#64748B] bg-blue-50 rounded-lg px-3 py-2">
                      Turn into Instagram carousel
                    </div>
                    <div className="text-xs text-[#64748B] bg-blue-50 rounded-lg px-3 py-2">
                      Convert to email intro
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </>
  )
}
