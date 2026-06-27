"use client"

import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { AlertTriangle, Bot, Layers, TrendingUp, MapPin, CheckSquare } from "lucide-react"

type CoverageStatus = "Published" | "Scheduled" | "Planned" | "Missing"

interface CoverageCell {
  status: CoverageStatus
}

interface CategoryRow {
  name: string
  weeks: [CoverageCell, CoverageCell, CoverageCell, CoverageCell]
}

const COVERAGE_MATRIX: CategoryRow[] = [
  {
    name: "Founder Insight",
    weeks: [
      { status: "Published" },
      { status: "Scheduled" },
      { status: "Planned" },
      { status: "Missing" },
    ],
  },
  {
    name: "Client Education",
    weeks: [
      { status: "Published" },
      { status: "Planned" },
      { status: "Missing" },
      { status: "Missing" },
    ],
  },
  {
    name: "Proof/Case Study",
    weeks: [
      { status: "Scheduled" },
      { status: "Planned" },
      { status: "Planned" },
      { status: "Missing" },
    ],
  },
  {
    name: "Behind the Scenes",
    weeks: [
      { status: "Published" },
      { status: "Scheduled" },
      { status: "Planned" },
      { status: "Planned" },
    ],
  },
  {
    name: "Offer/Sales",
    weeks: [
      { status: "Missing" },
      { status: "Missing" },
      { status: "Planned" },
      { status: "Planned" },
    ],
  },
  {
    name: "Thought Leadership",
    weeks: [
      { status: "Published" },
      { status: "Scheduled" },
      { status: "Scheduled" },
      { status: "Planned" },
    ],
  },
  {
    name: "Personal Story",
    weeks: [
      { status: "Published" },
      { status: "Planned" },
      { status: "Missing" },
      { status: "Missing" },
    ],
  },
  {
    name: "FAQs",
    weeks: [
      { status: "Missing" },
      { status: "Missing" },
      { status: "Missing" },
      { status: "Planned" },
    ],
  },
]

const STATUS_CELL: Record<CoverageStatus, string> = {
  Published: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Planned: "bg-amber-100 text-amber-700",
  Missing: "bg-red-100 text-red-700",
}

const STATUS_DOT: Record<CoverageStatus, string> = {
  Published: "bg-green-500",
  Scheduled: "bg-blue-500",
  Planned: "bg-amber-500",
  Missing: "bg-red-500",
}

interface ContentGap {
  category: string
  description: string
}

const CONTENT_GAPS: ContentGap[] = [
  {
    category: "Offer/Sales",
    description: "No Offer/Sales content planned for weeks 1–2. Revenue conversations need to start earlier.",
  },
  {
    category: "Client Education",
    description: "Client Education drops off after week 2 — risk of audience disengagement.",
  },
  {
    category: "FAQs",
    description: "FAQs are absent for 3 of 4 weeks. Unanswered questions kill conversion.",
  },
  {
    category: "Personal Story",
    description: "Personal Story missing weeks 3–4. Trust built through story needs continuity.",
  },
  {
    category: "Founder Insight",
    description: "Week 4 Founder Insight missing — finish strong to retain authority momentum.",
  },
]

interface PillarBar {
  name: string
  pct: number
  color: string
}

const PILLARS: PillarBar[] = [
  { name: "The Roadmap", pct: 32, color: "#2563EB" },
  { name: "Founder Bottlenecks", pct: 23, color: "#7C3AED" },
  { name: "Systems That Scale", pct: 18, color: "#16A34A" },
  { name: "Spirit First", pct: 14, color: "#F59E0B" },
  { name: "Client Transformation", pct: 11, color: "#EF4444" },
]

interface MetricCard {
  label: string
  value: string
  note: string
  iconBg: string
  icon: React.ReactNode
}

export default function ContentMapPage() {
  const metrics: MetricCard[] = [
    {
      label: "Active Categories",
      value: "8 of 10",
      note: "80% of planned mix",
      iconBg: "bg-green-600",
      icon: <Layers className="w-6 h-6 text-white" />,
    },
    {
      label: "Coverage Score",
      value: "82%",
      note: "↑7% vs last month",
      iconBg: "bg-blue-600",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      label: "Missing Content Gaps",
      value: "6",
      note: "Across 3 categories",
      iconBg: "bg-amber-500",
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
    },
    {
      label: "Planned Posts",
      value: "24",
      note: "Across 5 platforms",
      iconBg: "bg-purple-600",
      icon: <CheckSquare className="w-6 h-6 text-white" />,
    },
  ]

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Content Map</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Are we saying enough of the right things?
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-3 items-start"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}
                >
                  {m.icon}
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">{m.label}</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{m.value}</p>
                  <p className="text-xs text-[#94A3B8]">{m.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main 2-col */}
          <div className="flex gap-6">
            {/* LEFT — Category Coverage Matrix (70%) */}
            <div className="flex-[7] flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    Category Coverage Matrix
                  </h2>
                  <span className="text-xs text-[#94A3B8]">Jul 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-[#94A3B8] pb-3 pr-4 w-40">
                          Category
                        </th>
                        {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
                          <th
                            key={w}
                            className="text-center text-xs font-medium text-[#94A3B8] pb-3 px-2"
                          >
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COVERAGE_MATRIX.map((row) => (
                        <tr
                          key={row.name}
                          className="border-t border-gray-100"
                        >
                          <td className="py-2.5 pr-4 text-xs font-medium text-[#0F172A]">
                            {row.name}
                          </td>
                          {row.weeks.map((cell, i) => (
                            <td key={i} className="py-2.5 px-2 text-center">
                              <span
                                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CELL[cell.status]}`}
                              >
                                {cell.status}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 flex-wrap">
                  {(
                    [
                      "Published",
                      "Scheduled",
                      "Planned",
                      "Missing",
                    ] as CoverageStatus[]
                  ).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`}
                      />
                      <span className="text-xs text-[#64748B]">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Gaps + Pillars (30%) */}
            <div className="flex-[3] flex flex-col gap-4">
              {/* Content Gaps */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
                  Content Gaps
                </h2>
                <div className="flex flex-col gap-3">
                  {CONTENT_GAPS.map((gap) => (
                    <div key={gap.category} className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A]">
                          {gap.category}
                        </p>
                        <p className="text-xs text-[#64748B] leading-snug">
                          {gap.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
                  Pillar Distribution
                </h2>
                <div className="flex flex-col gap-3">
                  {PILLARS.map((p) => (
                    <div key={p.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#64748B]">{p.name}</span>
                        <span className="text-xs font-medium text-[#0F172A]">
                          {p.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.pct}%`, background: p.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask Agent button */}
              <button className="flex items-center justify-center gap-2 bg-[#0A0E1A] hover:bg-[#1D4ED8] text-white text-sm font-medium py-3 rounded-xl transition-colors">
                <Bot className="w-4 h-4" />
                Ask the Agent Anything
              </button>

              {/* Map icon note */}
              <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <p className="text-xs text-[#2563EB]">
                  Your map updates daily as posts are scheduled, published, or
                  moved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </>
  )
}
