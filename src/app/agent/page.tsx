"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import {
  Calendar,
  Megaphone,
  HelpCircle,
  Lightbulb,
  Eye,
  Search,
  LayoutGrid,
  BarChart2,
  ChevronRight,
  Send,
  Sparkles,
  User,
} from "lucide-react"

const quickActions = [
  { icon: Calendar, title: "Plan next week's posts", subtitle: "Build a full content plan across platforms" },
  { icon: Megaphone, title: "Create posts for an offer", subtitle: "Turn your offer into multi-platform content" },
  { icon: HelpCircle, title: "What should I post next?", subtitle: "Get a personalized recommendation" },
  { icon: Lightbulb, title: "Turn one idea into content", subtitle: "Expand one idea into 5+ posts" },
  { icon: Eye, title: "Review my content", subtitle: "Audit current posts for voice alignment" },
  { icon: Search, title: "Find content gaps", subtitle: "Discover what's missing in your strategy" },
  { icon: LayoutGrid, title: "Create a 30-day campaign", subtitle: "Full campaign plan with hooks + assets" },
  { icon: BarChart2, title: "Analyze what's working", subtitle: "Surface top performing content patterns" },
]

const pillars = ["The Roadmap", "Founder Bottlenecks", "Systems That Scale", "Spirit First", "Client Transformation", "+3 more"]

const weekPlan = [
  { date: "Mon Jun 30", platform: "LinkedIn", category: "Roadmap", hook: "You don't have a content problem. You have a clarity problem.", status: "Draft" },
  { date: "Tue Jul 1", platform: "Instagram", category: "Founder Story", hook: "The moment I stopped doing and started designing.", status: "Draft" },
  { date: "Wed Jul 2", platform: "LinkedIn", category: "Systems", hook: "The system that runs your business shouldn't require you to run it.", status: "Draft" },
  { date: "Thu Jul 3", platform: "Instagram", category: "Mindset", hook: "Your calendar is full. Your results are empty. Here's why.", status: "Draft" },
  { date: "Fri Jul 4", platform: "LinkedIn", category: "Client Transformation", hook: "Client transformation: from chaos to a business that runs itself.", status: "Draft" },
]

const recommendations = [
  {
    icon: BarChart2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Post frequency is down 20% this week",
    desc: "You've published 3 posts vs your usual 5. Catch up with 2 today.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Roadmap pillar is your top performer",
    desc: "3× more impressions than other pillars. Post 2 more this week.",
  },
  {
    icon: Search,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "No Instagram Reels in 2 weeks",
    desc: "Short video drives 4× organic reach on Instagram. Try one this week.",
  },
  {
    icon: Eye,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Best time to post: Tue/Thu 9am",
    desc: "Your audience engagement peaks Tuesday and Thursday mornings.",
  },
]

const healthMetrics = [
  { label: "Consistency", value: 82, color: "bg-blue-500" },
  { label: "Category Balance", value: 74, color: "bg-purple-500" },
  { label: "Offer Alignment", value: 76, color: "bg-green-500" },
  { label: "Engagement Potential", value: 79, color: "bg-amber-500" },
  { label: "Platform Balance", value: 78, color: "bg-pink-500" },
]

const recentActivity = [
  { label: "Content plan created for next week", time: "2 min ago", color: "bg-blue-500" },
  { label: "5 posts added to Approval Queue", time: "2 min ago", color: "bg-green-500" },
  { label: "Voice score updated: 92/100", time: "1 hr ago", color: "bg-purple-500" },
  { label: "Content gap identified: Instagram Reels", time: "3 hrs ago", color: "bg-amber-500" },
]

const contextChips = ["My goals", "Current campaigns", "Top performing posts", "Content gaps"]

export default function AgentPage() {
  const [inputValue, setInputValue] = useState("")
  const [showPlan, setShowPlan] = useState(true)

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6 h-screen flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#0F172A]">Content Agent</h1>
            <p className="text-sm text-[#64748B]">Your AI content strategist. Plan, create, review, and optimize.</p>
          </div>

          {/* 3-col layout */}
          <div className="grid grid-cols-[240px_1fr_240px] gap-5 flex-1 min-h-0 overflow-hidden">

            {/* LEFT */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Quick Actions</h2>
                <div className="space-y-1">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <action.icon className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] leading-tight">{action.title}</p>
                        <p className="text-[10px] text-[#94A3B8] leading-tight truncate">{action.subtitle}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Strategy */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Content Strategy</h2>

                <p className="text-[10px] font-semibold text-[#64748B] uppercase mb-2">Pillars</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pillars.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] font-semibold text-[#64748B] uppercase mb-2">Posting Rhythm</p>
                <div className="space-y-1 mb-4">
                  {[
                    { platform: "LinkedIn", freq: "3x/wk", color: "bg-blue-600" },
                    { platform: "Instagram", freq: "3x/wk", color: "bg-pink-500" },
                    { platform: "X", freq: "2x/wk", color: "bg-slate-700" },
                    { platform: "Newsletter", freq: "1x/wk", color: "bg-purple-600" },
                  ].map((r) => (
                    <div key={r.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className="text-[10px] text-[#64748B]">{r.platform}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#0F172A]">{r.freq}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] font-semibold text-[#64748B] uppercase mb-1">Primary Offer</p>
                <span className="text-xs font-semibold text-[#0F172A]">The Roadmap — Operating Map</span>
              </div>
            </div>

            {/* CENTER */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Agent intro */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#F8F9FB] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-[#0F172A]">
                      Hi Tai, I&apos;m your Content Agent. I know your voice, your strategy, and your audience.{" "}
                      <span className="font-semibold">What would you like to build today?</span>
                    </p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex gap-3 items-start flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#64748B]" />
                  </div>
                  <div className="bg-blue-50 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-[#0F172A]">
                      Plan my posts for next week across LinkedIn and Instagram.
                    </p>
                  </div>
                </div>

                {/* Agent response with content plan */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[90%] space-y-3">
                    <div className="bg-[#F8F9FB] rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-[#0F172A]">
                        Here&apos;s your content plan for next week. I&apos;ve balanced your key pillars and kept posts aligned with your Roadmap offer.
                      </p>
                    </div>

                    {/* Content plan card */}
                    {showPlan && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Card header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#0F172A]">Next Week&apos;s Content Plan</span>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">10 Posts</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full">2 Platforms</span>
                          </div>
                        </div>

                        {/* Table */}
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left px-4 py-2 text-[10px] text-[#94A3B8] font-medium">Date</th>
                              <th className="text-left px-3 py-2 text-[10px] text-[#94A3B8] font-medium">Platform</th>
                              <th className="text-left px-3 py-2 text-[10px] text-[#94A3B8] font-medium">Category</th>
                              <th className="text-left px-3 py-2 text-[10px] text-[#94A3B8] font-medium">Hook</th>
                              <th className="text-left px-3 py-2 text-[10px] text-[#94A3B8] font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekPlan.map((row, i) => (
                              <tr key={i} className="border-b border-gray-50 last:border-0">
                                <td className="px-4 py-2.5 text-[10px] text-[#64748B] whitespace-nowrap">{row.date}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium ${row.platform === "LinkedIn" ? "bg-blue-600" : "bg-pink-500"}`}>
                                    {row.platform}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-[10px] text-[#64748B]">{row.category}</td>
                                <td className="px-3 py-2.5 text-[10px] text-[#0F172A] max-w-[200px]">
                                  <span className="line-clamp-2 leading-snug">{row.hook}</span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                          <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
                            Add to Calendar
                          </button>
                          <button className="px-3 py-1.5 border border-gray-200 text-[#64748B] text-xs font-semibold rounded-lg hover:bg-gray-50">
                            Export Plan
                          </button>
                          <button
                            onClick={() => setShowPlan(false)}
                            className="px-3 py-1.5 border border-gray-200 text-[#64748B] text-xs font-semibold rounded-lg hover:bg-gray-50"
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input composer */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs text-[#94A3B8] self-center">Add context:</span>
                  {contextChips.map((chip) => (
                    <button
                      key={chip}
                      className="px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything about your content..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-[#F8F9FB]"
                  />
                  <button className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Agent Recommendations */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Agent Recommendations</h2>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${rec.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <rec.icon className={`w-3.5 h-3.5 ${rec.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#0F172A] leading-tight">{rec.title}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Health Score */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Content Health Score</h2>

                {/* Circular gauge */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="8"
                        strokeDasharray={`${(78 / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-[#0F172A]">78</span>
                      <span className="text-[10px] text-[#94A3B8]">/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {healthMetrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-[#64748B]">{m.label}</span>
                        <span className="text-[10px] font-semibold text-[#0F172A]">{m.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Recent Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} />
                      <div>
                        <p className="text-[11px] text-[#0F172A] leading-snug">{item.label}</p>
                        <p className="text-[10px] text-[#94A3B8]">{item.time}</p>
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
