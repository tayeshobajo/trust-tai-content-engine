"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import MetricCard from "@/components/ui/MetricCard"
import StatusBadge from "@/components/ui/StatusBadge"
import CreatePostModal from "@/components/CreatePostModal"
import { getPosts } from "@/lib/store"
import type { Post, PostStatus } from "@/data/posts"
import {
  CalendarDays,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react"

// ─── Mock data (static sections) ─────────────────────────────────────────────

const weekPosts = [
  {
    id: 1,
    day: "MON 6/30",
    title: "The founder insight no one talks about: your biggest obstacle isn't what you think",
    platforms: ["LinkedIn"],
    category: "Founder Insight",
    status: "Scheduled" as const,
    time: "9:00 AM",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    day: "TUE 7/1",
    title: "What I learned building Trust Tai from zero — 3 things that actually moved the needle",
    platforms: ["LinkedIn"],
    category: "Behind the Scenes",
    status: "Approved" as const,
    time: "8:00 AM",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    id: 3,
    day: "WED 7/2",
    title: "Your content strategy is broken — here's the 3-step fix most agencies won't tell you",
    platforms: ["LinkedIn", "Instagram"],
    category: "Client Education",
    status: "Needs Review" as const,
    time: "9:00 AM",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: 4,
    day: "THU 7/3",
    title: "The roadmap to scaling a service business without burning out — week 1 update",
    platforms: ["LinkedIn"],
    category: "Offer Aligned",
    status: "Draft" as const,
    time: "10:00 AM",
    gradient: "from-green-400 to-emerald-600",
  },
]

const recommendations = [
  {
    id: 1,
    trigger: "LinkedIn quiet for 6 days",
    action: "Create a founder insight post",
    color: "blue" as const,
  },
  {
    id: 2,
    trigger: "Client Education category underused",
    action: "Schedule 2 educational posts this week",
    color: "amber" as const,
  },
  {
    id: 3,
    trigger: "Last 3 BTS posts above average engagement",
    action: "Create 2 more behind-the-scenes posts",
    color: "green" as const,
  },
  {
    id: 4,
    trigger: "No post supports Roadmap offer",
    action: "Add an offer-aligned post to the queue",
    color: "purple" as const,
  },
  {
    id: 5,
    trigger: "Winning post ready to repurpose",
    action: "Turn top post into an email sequence",
    color: "blue" as const,
  },
]

const colorDotMap = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  purple: "bg-purple-600",
}

const colorIconMap = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
}

const platformColors: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Instagram: "bg-pink-500",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  // Live approval queue from localStorage
  const approvalStatuses: string[] = ["Needs Review", "Needs Draft", "Needs Image", "Draft"]

  const getApprovalItems = useCallback(() => {
    return getPosts()
      .filter((p) => approvalStatuses.includes(p.status as string))
      .slice(0, 4)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [approvalItems, setApprovalItems] = useState<Post[]>(() => getApprovalItems())

  const loadApprovalItems = useCallback(() => {
    setApprovalItems(getApprovalItems())
  }, [getApprovalItems])

  useEffect(() => {
    // Re-sync approval queue on visibility change (user returns to tab)
    const handleVisibility = () => {
      if (!document.hidden) loadApprovalItems()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [loadApprovalItems])

  const approvalCount = approvalItems.length

  return (
    <>
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Content Command Center
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Plan, schedule, and grow your presence without living inside the
                platforms.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Create Post
            </button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Scheduled Posts"
              value={18}
              trend="↑12% vs last month"
              icon={CalendarDays}
              iconBgColor="#2563EB"
            />
            <MetricCard
              title="Content Coverage"
              value="6 of 8 categories"
              trend="↑2 categories vs last month"
              icon={Target}
              iconBgColor="#16A34A"
            />
            <MetricCard
              title="Growth This Month"
              value="+312 followers"
              trend="↑8% vs last month"
              icon={TrendingUp}
              iconBgColor="#7C3AED"
            />
            <MetricCard
              title="Needs Attention"
              value={approvalCount}
              trend="Review pending items"
              icon={AlertCircle}
              iconBgColor="#F59E0B"
            />
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT (65%) */}
            <div className="col-span-8 space-y-6">
              {/* This Week's Content */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    This Week&apos;s Content
                  </h2>
                  <span className="text-xs text-[#64748B]">Week of Jun 30</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {weekPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 w-52 bg-[#F8F9FB] rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className={`h-24 bg-gradient-to-br ${post.gradient}`} />
                      <div className="p-3">
                        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                          {post.day}
                        </p>
                        <p className="text-xs font-semibold text-[#0F172A] line-clamp-2 mb-2 leading-snug">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          {post.platforms.map((p) => (
                            <span
                              key={p}
                              className={`text-[10px] text-white px-1.5 py-0.5 rounded font-medium ${platformColors[p] ?? "bg-gray-400"}`}
                            >
                              {p === "LinkedIn" ? "LI" : "IG"}
                            </span>
                          ))}
                          <span className="text-[10px] text-[#94A3B8] bg-slate-100 px-1.5 py-0.5 rounded">
                            {post.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={post.status} size="sm" />
                          <span className="text-[10px] text-[#94A3B8]">
                            {post.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Recommendations */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    Agent Recommendations
                  </h2>
                </div>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FB] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colorDotMap[rec.color]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#94A3B8] mb-0.5">{rec.trigger}</p>
                        <p className="text-sm font-medium text-[#0F172A]">{rec.action}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorIconMap[rec.color]}`}>
                        Act
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/agent")}
                  className="mt-4 w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask the Agent Anything
                </button>
              </div>
            </div>

            {/* RIGHT (35%) */}
            <div className="col-span-4 space-y-5">
              {/* Growth Snapshot */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
                  Growth Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Followers</p>
                    <p className="text-lg font-bold text-[#0F172A]">2,847</p>
                    <p className="text-xs text-green-600 font-medium">↑312</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Impressions</p>
                    <p className="text-lg font-bold text-[#0F172A]">18.4K</p>
                    <p className="text-xs text-green-600 font-medium">↑22%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Engagement</p>
                    <p className="text-lg font-bold text-[#0F172A]">4.2%</p>
                    <p className="text-xs text-green-600 font-medium">↑0.8%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Clicks</p>
                    <p className="text-lg font-bold text-[#0F172A]">284</p>
                    <p className="text-xs text-green-600 font-medium">↑18%</p>
                  </div>
                </div>
              </div>

              {/* Approval Queue — live from localStorage */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    Approval Queue
                  </h2>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    {approvalCount}
                  </span>
                </div>
                <div className="space-y-3">
                  {approvalItems.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] text-center py-4">
                      All clear — nothing needs review
                    </p>
                  ) : (
                    approvalItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#0F172A] line-clamp-2 leading-snug mb-1">
                            {item.hook}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] text-white px-1.5 py-0.5 rounded font-medium ${platformColors[item.platforms[0]] ?? "bg-gray-400"}`}
                            >
                              {item.platforms[0] === "LinkedIn"
                                ? "LI"
                                : item.platforms[0] === "Instagram"
                                ? "IG"
                                : item.platforms[0]}
                            </span>
                            <StatusBadge status={item.status as PostStatus} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => router.push("/approvals")}
                  className="mt-3 w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#64748B] hover:bg-gray-50 transition-colors"
                >
                  Review All
                </button>
              </div>

              {/* Monthly Goal Progress */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-[#0F172A]">Monthly Goal</h2>
                  <span className="text-sm font-bold text-blue-600">80%</span>
                </div>
                <p className="text-xs text-[#64748B] mb-3">
                  80% of monthly goal complete
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "80%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#94A3B8]">16 of 20 posts</span>
                  <span className="text-xs text-[#94A3B8]">4 remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Shell>

      <CreatePostModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={loadApprovalItems}
      />
    </>
  )
}
