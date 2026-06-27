"use client"

import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Sparkles, TrendingUp, Users, Eye, MousePointer, Target } from "lucide-react"

const audienceData = [
  { month: "Jan", followers: 1200 },
  { month: "Feb", followers: 1450 },
  { month: "Mar", followers: 1780 },
  { month: "Apr", followers: 2100 },
  { month: "May", followers: 2450 },
  { month: "Jun", followers: 2847 },
]

const engagementData = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 2.8 },
  { month: "Mar", rate: 3.2 },
  { month: "Apr", rate: 3.6 },
  { month: "May", rate: 3.9 },
  { month: "Jun", rate: 4.2 },
]

const sparklineFollowers = [1200, 1450, 1780, 2100, 2450, 2847].map((v, i) => ({ v, i }))
const sparklineImpressions = [8000, 10200, 12500, 14800, 16900, 18400].map((v, i) => ({ v, i }))
const sparklineEngagement = [2.1, 2.8, 3.2, 3.6, 3.9, 4.2].map((v, i) => ({ v, i }))
const sparklineClicks = [120, 150, 180, 210, 255, 284].map((v, i) => ({ v, i }))

const platformRows = [
  { name: "LinkedIn", color: "bg-blue-600", impressions: "9,200", engRate: "5.8%", clicks: "142", leads: "8" },
  { name: "Instagram", color: "bg-pink-500", impressions: "5,100", engRate: "3.9%", clicks: "84", leads: "3" },
  { name: "X/Twitter", color: "bg-slate-800", impressions: "2,800", engRate: "2.1%", clicks: "38", leads: "1" },
  { name: "Blog", color: "bg-slate-400", impressions: "1,300", engRate: "—", clicks: "20", leads: "0" },
]

const bestPosts = [
  {
    platform: "LinkedIn",
    platformColor: "bg-blue-600",
    hook: "You don't have a content problem. You have a clarity problem.",
    impressions: "4,200",
    engagement: "7.1%",
  },
  {
    platform: "Instagram",
    platformColor: "bg-pink-500",
    hook: "The system that runs your business shouldn't require you to run it.",
    impressions: "2,800",
    engagement: "5.4%",
  },
  {
    platform: "LinkedIn",
    platformColor: "bg-blue-600",
    hook: "Hiring before you have a system is just outsourcing your chaos.",
    impressions: "2,300",
    engagement: "6.2%",
  },
]

const agentInsights = [
  {
    observation: "LinkedIn posts on Tuesday/Thursday outperform Monday by 42%.",
    why: "Your audience is most active mid-week during working hours.",
    action: "Shift your highest-value posts to Tue/Thu 9–11am.",
  },
  {
    observation: "Posts with a personal story in the hook get 2.3× more comments.",
    why: "Founder authenticity resonates with your core audience.",
    action: "Lead every post this week with a personal observation or story.",
  },
  {
    observation: "Your 'Roadmap' pillar drives 80% of leads but only 30% of posts.",
    why: "The market is responding to your system-building message.",
    action: "Increase Roadmap-pillar frequency to 50% of posts for 2 weeks.",
  },
]

const goals = [
  { label: "LinkedIn followers 3K", value: 95, color: "bg-green-500" },
  { label: "Monthly impressions 25K", value: 74, color: "bg-blue-500" },
  { label: "Leads from content", value: 40, color: "bg-amber-500" },
]

function Sparkline({ data, color }: { data: { v: number; i: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function GrowthPage() {
  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Growth Dashboard</h1>
            <p className="text-sm text-[#64748B]">What is working, what is not, and what to do next.</p>
          </div>

          {/* Top metric cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Followers",
                value: "2,847",
                delta: "↑312 this month",
                icon: Users,
                iconBg: "bg-blue-600",
                sparkData: sparklineFollowers,
                sparkColor: "#2563EB",
              },
              {
                label: "Total Impressions",
                value: "18.4K",
                delta: "↑22% this month",
                icon: Eye,
                iconBg: "bg-green-600",
                sparkData: sparklineImpressions,
                sparkColor: "#16A34A",
              },
              {
                label: "Avg Engagement Rate",
                value: "4.2%",
                delta: "↑0.8% this month",
                icon: TrendingUp,
                iconBg: "bg-purple-600",
                sparkData: sparklineEngagement,
                sparkColor: "#7C3AED",
              },
              {
                label: "Website Clicks",
                value: "284",
                delta: "↑18% this month",
                icon: MousePointer,
                iconBg: "bg-amber-500",
                sparkData: sparklineClicks,
                sparkColor: "#F59E0B",
              },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">{m.label}</p>
                    <p className="text-xl font-bold text-[#0F172A]">{m.value}</p>
                  </div>
                </div>
                <Sparkline data={m.sparkData} color={m.sparkColor} />
                <p className="text-xs text-green-600 mt-1">{m.delta}</p>
              </div>
            ))}
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-[1fr_320px] gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Audience Growth Chart */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Audience Growth</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={audienceData}>
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="followers" stroke="#2563EB" fill="url(#blueGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Trend */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Engagement Trend</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v) => [`${v}%`, "Engagement Rate"]} />
                    <Line type="monotone" dataKey="rate" stroke="#16A34A" strokeWidth={2} dot={{ fill: "#16A34A", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Platform Performance */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Platform Performance</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-xs text-[#94A3B8] font-medium">Platform</th>
                      <th className="text-right pb-2 text-xs text-[#94A3B8] font-medium">Impressions</th>
                      <th className="text-right pb-2 text-xs text-[#94A3B8] font-medium">Eng Rate</th>
                      <th className="text-right pb-2 text-xs text-[#94A3B8] font-medium">Clicks</th>
                      <th className="text-right pb-2 text-xs text-[#94A3B8] font-medium">Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformRows.map((row) => (
                      <tr key={row.name} className="border-b border-gray-50 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full ${row.color} flex items-center justify-center`}>
                              <span className="text-white text-[8px] font-bold">{row.name[0]}</span>
                            </div>
                            <span className="font-medium text-[#0F172A]">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-[#64748B]">{row.impressions}</td>
                        <td className="py-3 text-right text-[#64748B]">{row.engRate}</td>
                        <td className="py-3 text-right text-[#64748B]">{row.clicks}</td>
                        <td className="py-3 text-right text-[#64748B]">{row.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Best Posts */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Best Posts</h2>
                <div className="space-y-3">
                  {bestPosts.map((post, i) => (
                    <div key={i} className="p-3 bg-[#F8F9FB] rounded-lg">
                      <p className="text-xs font-medium text-[#0F172A] leading-snug mb-2">{post.hook}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white font-medium ${post.platformColor}`}>
                          {post.platform}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] text-[#94A3B8]">{post.impressions} views · {post.engagement} eng</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Insights */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Agent Insights</h2>
                </div>
                <div className="space-y-3">
                  {agentInsights.map((insight, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-[#0F172A] mb-1">{insight.observation}</p>
                      <p className="text-[10px] text-[#64748B] mb-1"><span className="font-medium">Why:</span> {insight.why}</p>
                      <p className="text-[10px] text-blue-700 font-medium">→ {insight.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">Goals Progress</h2>
                </div>
                <div className="space-y-4">
                  {goals.map((g) => (
                    <div key={g.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#64748B]">{g.label}</span>
                        <span className="text-xs font-semibold text-[#0F172A]">{g.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${g.color}`} style={{ width: `${g.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </>
  )
}
