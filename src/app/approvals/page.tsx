"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Shell from "@/components/Shell"
import { getPosts, updatePost } from "@/lib/store"
import type { Post, PostStatus } from "@/data/posts"
import { CheckCircle, Clock, Image, FileText, Calendar, ChevronRight, Check } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus = "Needs Draft" | "Needs Image" | "Needs Review" | "Approved" | "Scheduled"

interface KanbanColumn {
  id: ApprovalStatus
  label: string
  headerColor: string
  headerBg: string
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "Needs Draft",
    label: "NEEDS DRAFT",
    headerColor: "text-amber-700",
    headerBg: "bg-amber-50 border-amber-200",
  },
  {
    id: "Needs Image",
    label: "NEEDS IMAGE",
    headerColor: "text-purple-700",
    headerBg: "bg-purple-50 border-purple-200",
  },
  {
    id: "Needs Review",
    label: "NEEDS REVIEW",
    headerColor: "text-amber-700",
    headerBg: "bg-amber-50 border-amber-200",
  },
  {
    id: "Approved",
    label: "APPROVED",
    headerColor: "text-green-700",
    headerBg: "bg-green-50 border-green-200",
  },
  {
    id: "Scheduled",
    label: "SCHEDULED",
    headerColor: "text-blue-700",
    headerBg: "bg-blue-50 border-blue-200",
  },
]

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Instagram: "bg-pink-500",
  X: "bg-slate-700",
  Blog: "bg-slate-400",
  Newsletter: "bg-purple-600",
}

const IMAGE_BG_BY_STATUS: Record<string, string> = {
  "Needs Draft": "bg-amber-100",
  "Needs Image": "bg-slate-100",
  "Needs Review": "bg-blue-100",
  Approved: "bg-green-100",
  Scheduled: "bg-blue-200",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApprovalStatus(post: Post): ApprovalStatus | null {
  const s = post.status as string
  if (s === "Needs Draft" || s === "Needs Image" || s === "Needs Review" || s === "Approved" || s === "Scheduled") {
    return s as ApprovalStatus
  }
  if (s === "Draft") return "Needs Draft"
  return null
}

function filterApprovalPosts(posts: Post[]): Post[] {
  return posts.filter((p) => {
    const s = p.status as string
    return [
      "Needs Draft", "Needs Image", "Needs Review", "Approved", "Scheduled", "Draft"
    ].includes(s)
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KanbanCardProps {
  post: Post
  colId: ApprovalStatus
  onApprove: (post: Post) => void
  onRequestChanges: (post: Post, feedback: string) => void
  onSchedule: (post: Post, dt: string) => void
  onView: (post: Post) => void
}

function KanbanCard({ post, colId, onApprove, onRequestChanges, onSchedule, onView }: KanbanCardProps) {
  const [changeFeedback, setChangeFeedback] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [scheduleDt, setScheduleDt] = useState("")

  const platform = post.platforms[0] ?? "LinkedIn"
  const platformColor = PLATFORM_COLORS[platform] ?? "bg-gray-400"
  const imageBg = IMAGE_BG_BY_STATUS[colId] ?? "bg-slate-100"

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      {/* Image placeholder */}
      <div
        className={`w-full h-16 rounded-lg ${imageBg} mb-3 flex items-center justify-center`}
        style={
          post.gradientFrom
            ? { background: `linear-gradient(135deg, ${post.gradientFrom}33, ${post.gradientTo}33)` }
            : {}
        }
      >
        <span className="text-xs text-[#94A3B8]">Image</span>
      </div>

      {/* Hook */}
      <p className="text-xs font-semibold text-[#0F172A] leading-snug mb-2 line-clamp-2">
        {post.hook}
      </p>

      {/* Platform + Category */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium ${platformColor}`}>
          {platform}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium truncate max-w-[80px]">
          {post.category}
        </span>
      </div>

      {/* Owner + Date */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[#94A3B8]">@{post.owner}</span>
        <span className="text-[10px] text-[#94A3B8]">{post.date}</span>
      </div>

      {/* Action buttons */}
      {colId === "Needs Review" && (
        <>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => onApprove(post)}
              className="flex-1 py-1.5 text-[10px] font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowFeedback((v) => !v)}
              className="flex-1 py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Request Changes
            </button>
          </div>
          {showFeedback && (
            <div className="mt-1 space-y-1.5">
              <input
                type="text"
                value={changeFeedback}
                onChange={(e) => setChangeFeedback(e.target.value)}
                placeholder="Add feedback…"
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#2563EB]"
              />
              <button
                onClick={() => {
                  onRequestChanges(post, changeFeedback)
                  setShowFeedback(false)
                  setChangeFeedback("")
                }}
                className="w-full py-1.5 text-[10px] font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Send Feedback
              </button>
            </div>
          )}
        </>
      )}

      {colId === "Approved" && (
        <>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="flex-1 py-1.5 text-[10px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
            <button
              onClick={() => onView(post)}
              className="flex-1 py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View
            </button>
          </div>
          {showDatePicker && (
            <div className="mt-1 space-y-1.5">
              <input
                type="datetime-local"
                value={scheduleDt}
                onChange={(e) => setScheduleDt(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#2563EB]"
              />
              <button
                onClick={() => {
                  onSchedule(post, scheduleDt)
                  setShowDatePicker(false)
                  setScheduleDt("")
                }}
                disabled={!scheduleDt}
                className="w-full py-1.5 text-[10px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Confirm Schedule
              </button>
            </div>
          )}
        </>
      )}

      {colId !== "Needs Review" && colId !== "Approved" && (
        <button
          onClick={() => onView(post)}
          className="w-full py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
        >
          Open <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') return filterApprovalPosts(getPosts())
    return []
  })
  const [toast, setToast] = useState<string | null>(null)

  const loadPosts = useCallback(() => {
    setPosts(filterApprovalPosts(getPosts()))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleApprove(post: Post) {
    updatePost(post.id, { status: "Approved" as PostStatus })
    loadPosts()
    showToast("Post approved")
  }

  function handleRequestChanges(post: Post, feedback: string) {
    updatePost(post.id, {
      status: "Draft" as PostStatus,
      // Store feedback in body prefix for now (Agent A can wire proper feedback field)
      body: feedback ? `[FEEDBACK: ${feedback}]\n\n${post.body}` : post.body,
    })
    loadPosts()
    showToast("Changes requested — post returned to Draft")
  }

  function handleSchedule(post: Post, dt: string) {
    updatePost(post.id, {
      status: "Scheduled" as PostStatus,
      scheduleDate: dt,
    })
    loadPosts()
    showToast("Post scheduled")
  }

  function handleView(post: Post) {
    router.push(`/library/${post.id}`)
  }

  // ── Build column data ──

  function postsForColumn(colId: ApprovalStatus): Post[] {
    return posts.filter((p) => {
      const approvalStatus = getApprovalStatus(p)
      return approvalStatus === colId
    })
  }

  const totalItems = posts.length
  const needsDraft = postsForColumn("Needs Draft").length
  const needsImage = postsForColumn("Needs Image").length
  const needsReview = postsForColumn("Needs Review").length
  const approved = postsForColumn("Approved").length
  const scheduled = postsForColumn("Scheduled").length

  const statusCards = [
    { label: "Total Items", value: totalItems, color: "bg-blue-600", textColor: "text-blue-600", icon: FileText },
    { label: "Needs Draft", value: needsDraft, color: "bg-amber-500", textColor: "text-amber-500", icon: FileText },
    { label: "Needs Image", value: needsImage, color: "bg-purple-600", textColor: "text-purple-600", icon: Image },
    { label: "Needs Review", value: needsReview, color: "bg-amber-500", textColor: "text-amber-500", icon: Clock },
    { label: "Approved", value: approved, color: "bg-green-600", textColor: "text-green-600", icon: CheckCircle },
    { label: "Scheduled", value: scheduled, color: "bg-blue-600", textColor: "text-blue-600", icon: Calendar },
  ]

  return (
    <>
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Approval Queue</h1>
            <p className="text-sm text-[#64748B]">
              Review and approve content before it goes live.
            </p>
          </div>

          {/* Status Summary Cards — reactive */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {statusCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-2`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1100px]">
              {KANBAN_COLUMNS.map((col) => {
                const colPosts = postsForColumn(col.id)
                return (
                  <div key={col.id} className="flex-1 min-w-[200px]">
                    {/* Column header */}
                    <div className={`rounded-lg border px-3 py-2 mb-3 ${col.headerBg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold tracking-wider ${col.headerColor}`}>
                          {col.label}
                        </span>
                        <span className={`text-xs font-bold ${col.headerColor}`}>
                          {colPosts.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards or empty state */}
                    {colPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-[#94A3B8] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                        <Check className="w-6 h-6 mb-2 text-green-400" />
                        <p className="text-xs font-medium">All clear</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {colPosts.map((post) => (
                          <KanbanCard
                            key={post.id}
                            post={post}
                            colId={col.id}
                            onApprove={handleApprove}
                            onRequestChanges={handleRequestChanges}
                            onSchedule={handleSchedule}
                            onView={handleView}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Shell>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#0F172A] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  )
}
