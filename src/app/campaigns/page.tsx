"use client"

import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { Plus, Globe, Target, Calendar, FileText } from "lucide-react"

type CampaignStatus = "Active" | "Planning"

type PlatformName = "LinkedIn" | "Instagram" | "X" | "All Platforms"

interface Campaign {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  platforms: PlatformName[]
  postCount: number
  status: CampaignStatus
  progress: number
  gradientFrom: string
  gradientTo: string
}

// No demo campaigns — created by user
const CAMPAIGNS: Campaign[] = []

const STATUS_BADGE: Record<CampaignStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Planning: "bg-amber-100 text-amber-700",
}

function PlatformChip({ platform }: { platform: PlatformName }) {
  const abbrs: Record<PlatformName, string> = {
    LinkedIn: "LI",
    Instagram: "IG",
    X: "X",
    "All Platforms": "",
  }
  const icons: Record<PlatformName, React.ReactNode> = {
    LinkedIn: <span className="text-[9px] font-bold">{abbrs["LinkedIn"]}</span>,
    Instagram: <span className="text-[9px] font-bold">{abbrs["Instagram"]}</span>,
    X: <span className="text-[9px] font-bold">{abbrs["X"]}</span>,
    "All Platforms": <Globe className="w-3 h-3" />,
  }

  const colors: Record<PlatformName, string> = {
    LinkedIn: "bg-blue-100 text-blue-700",
    Instagram: "bg-pink-100 text-pink-700",
    X: "bg-slate-100 text-slate-700",
    "All Platforms": "bg-purple-100 text-purple-700",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors[platform]}`}
    >
      {icons[platform]}
      {platform}
    </span>
  )
}

interface TopStatProps {
  label: string
  value: string
  iconBg: string
  icon: React.ReactNode
}

function TopStat({ label, value, iconBg, icon }: TopStatProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-3 items-center">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#64748B]">{label}</p>
        <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Banner */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${campaign.gradientFrom}, ${campaign.gradientTo})`,
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              {campaign.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Target className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-xs text-[#64748B]">{campaign.goal}</span>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_BADGE[campaign.status]}`}
          >
            {campaign.status}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs text-[#64748B]">
            {campaign.startDate} – {campaign.endDate}
          </span>
        </div>

        {/* Platforms + post count */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {campaign.platforms.map((p) => (
            <PlatformChip key={p} platform={p} />
          ))}
          <span className="inline-flex items-center gap-1 text-xs text-[#64748B] ml-auto">
            <FileText className="w-3.5 h-3.5" />
            {campaign.postCount} posts
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-[#64748B]">Progress</span>
            <span className="text-xs font-medium text-[#0F172A]">
              {campaign.progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${campaign.progress}%`,
                background: `linear-gradient(90deg, ${campaign.gradientFrom}, ${campaign.gradientTo})`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium py-2 rounded-lg transition-colors">
            View Campaign
          </button>
          <button className="flex-1 border border-gray-200 text-[#0F172A] hover:bg-gray-50 text-sm font-medium py-2 rounded-lg transition-colors">
            Add Posts
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const activeCampaigns = CAMPAIGNS.filter((c) => c.status === "Active").length
  const scheduledPosts = CAMPAIGNS.reduce((sum, c) => sum + c.postCount, 0)

  const topStats: TopStatProps[] = [
    {
      label: "Active Campaigns",
      value: String(activeCampaigns),
      iconBg: "bg-blue-600",
      icon: <Target className="w-6 h-6 text-white" />,
    },
    {
      label: "Scheduled Posts",
      value: String(scheduledPosts),
      iconBg: "bg-purple-600",
      icon: <Calendar className="w-6 h-6 text-white" />,
    },
    {
      label: "Campaign Reach",
      value: "—",
      iconBg: "bg-green-600",
      icon: <Globe className="w-6 h-6 text-white" />,
    },
    {
      label: "Leads Influenced",
      value: "—",
      iconBg: "bg-amber-500",
      icon: <FileText className="w-6 h-6 text-white" />,
    },
  ]

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Campaigns</h1>
              <p className="text-sm text-[#64748B] mt-0.5">
                Focused content pushes tied to business outcomes.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {topStats.map((s) => (
              <TopStat key={s.label} {...s} />
            ))}
          </div>

          {/* Campaign cards */}
          {CAMPAIGNS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] mb-1">No campaigns yet</h3>
              <p className="text-sm text-[#64748B] max-w-xs">
                Create your first campaign to group posts around a goal or launch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {CAMPAIGNS.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </Shell>
    </>
  )
}
