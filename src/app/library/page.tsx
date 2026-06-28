"use client"

import { useState, useEffect, useCallback } from "react"
import Shell from "@/components/Shell"
import CreatePostModal from "@/components/CreatePostModal"
import { getPosts, updatePost, savePosts } from "@/lib/store"
import type { Post, PostStatus, Platform } from "@/data/posts"
import { Search, Plus, MoreHorizontal, Check } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_OPTIONS = [
  "All Posts",
  "Drafts",
  "Scheduled",
  "Published",
  "Winning Posts",
  "Needs Repurpose",
] as const

type TabOption = (typeof TAB_OPTIONS)[number]

const STATUS_BADGE: Partial<Record<string, string>> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Published: "bg-green-100 text-green-700",
  "Needs Review": "bg-amber-100 text-amber-700",
  Draft: "bg-slate-100 text-slate-600",
  Winning: "bg-green-100 text-green-700",
  Archived: "bg-red-100 text-red-700",
}

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Instagram: "bg-pink-500",
  X: "bg-slate-800",
  Blog: "bg-slate-400",
  Newsletter: "bg-purple-600",
}

const PLATFORM_ABBR: Record<string, string> = {
  LinkedIn: "LI",
  Instagram: "IG",
  X: "X",
  Blog: "B",
  Newsletter: "NL",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterByTab(posts: Post[], tab: TabOption): Post[] {
  if (tab === "All Posts") return posts.filter((p) => p.status !== "Archived" as PostStatus)
  if (tab === "Drafts") return posts.filter((p) => p.status === "Draft")
  if (tab === "Scheduled") return posts.filter((p) => p.status === "Scheduled")
  if (tab === "Published") return posts.filter((p) => p.status === "Published")
  if (tab === "Winning Posts") return posts.filter((p) => p.status === "Winning")
  if (tab === "Needs Repurpose") return posts.filter((p) => p.status === "Needs Review")
  return posts
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformIcon({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform] ?? "bg-gray-400"
  const abbr = PLATFORM_ABBR[platform] ?? platform[0]
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold text-white ${color}`}
    >
      {abbr}
    </span>
  )
}

interface PostCardProps {
  post: Post
  onEdit: (post: Post) => void
  onDuplicate: (post: Post) => void
  onArchive: (post: Post) => void
}

function PostCard({ post, onEdit, onDuplicate, onArchive }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const badge = STATUS_BADGE[post.status] ?? "bg-slate-100 text-slate-600"

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Image placeholder */}
      <div className="relative">
        <div
          className="w-full h-36 rounded-t-xl"
          style={{
            background: `linear-gradient(135deg, ${post.gradientFrom}, ${post.gradientTo})`,
          }}
        />
        <span className="absolute top-2 left-2 bg-white/90 text-[#0F172A] text-xs font-medium px-2 py-0.5 rounded-full">
          {post.category}
        </span>
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
          {post.status}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug">
          {post.hook}
        </p>

        <div className="flex gap-1.5 text-[#64748B]">
          {post.platforms.map((p) => (
            <PlatformIcon key={p} platform={p} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-[#94A3B8]">
            {post.date} · {post.owner}
          </span>
          <div className="relative">
            <button
              className="p-1 rounded hover:bg-gray-100 text-[#94A3B8]"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-md w-36 py-1 text-sm">
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[#0F172A]"
                  onClick={() => { setMenuOpen(false); onEdit(post) }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[#0F172A]"
                  onClick={() => { setMenuOpen(false); onDuplicate(post) }}
                >
                  Duplicate
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600"
                  onClick={() => { setMenuOpen(false); onArchive(post) }}
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [posts, setPosts] = useState<Post[]>(() => getPosts())
  const [activeTab, setActiveTab] = useState<TabOption>("All Posts")
  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("All Platforms")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined)

  // Toast state
  const [toast, setToast] = useState<string | null>(null)

  const loadPosts = useCallback(() => {
    setPosts(getPosts())
  }, [])

  useEffect(() => {
    // Re-sync when returning to the tab
    const handleVisibility = () => {
      if (!document.hidden) loadPosts()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [loadPosts])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleEdit(post: Post) {
    setEditingPost(post)
    setModalOpen(true)
  }

  function handleDuplicate(post: Post) {
    const allPosts = getPosts()
    const duplicate: Post = {
      ...post,
      id: `post-${Date.now()}`,
      hook: `Copy of ${post.hook}`,
      status: "Draft",
      date: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
    }
    savePosts([duplicate, ...allPosts])
    loadPosts()
    showToast("Post duplicated as Draft")
  }

  function handleArchive(post: Post) {
    updatePost(post.id, { status: "Archived" as PostStatus })
    loadPosts()
    showToast("Post archived")
  }

  function handleModalClose(open: boolean) {
    setModalOpen(open)
    if (!open) setEditingPost(undefined)
  }

  function handleCreateNew() {
    setEditingPost(undefined)
    setModalOpen(true)
  }

  // ── Filtering ──

  const allFiltered = filterByTab(posts, activeTab)

  const displayed = allFiltered.filter((p) => {
    const matchSearch =
      search === "" ||
      p.hook.toLowerCase().includes(search.toLowerCase()) ||
      (p.body ?? "").toLowerCase().includes(search.toLowerCase())
    const matchPlatform =
      platformFilter === "All Platforms" ||
      p.platforms.includes(platformFilter as Platform)
    const matchStatus =
      statusFilter === "All Statuses" || p.status === statusFilter
    const matchCategory =
      categoryFilter === "All Categories" || p.category === categoryFilter
    return matchSearch && matchPlatform && matchStatus && matchCategory
  })

  return (
    <>
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Content Library</h1>
              <p className="text-sm text-[#64748B] mt-0.5">
                Every post, organized. Nothing lost.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none"
            >
              <option>All Platforms</option>
              <option>LinkedIn</option>
              <option>Instagram</option>
              <option>X</option>
              <option>Blog</option>
              <option>Newsletter</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none"
            >
              <option>All Statuses</option>
              <option>Published</option>
              <option>Scheduled</option>
              <option>Draft</option>
              <option>Needs Review</option>
              <option>Winning</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#0F172A] outline-none"
            >
              <option>All Categories</option>
              <option>Founder Insight</option>
              <option>Client Education</option>
              <option>Proof/Case Study</option>
              <option>Behind the Scenes</option>
              <option>Offer/Sales</option>
              <option>Thought Leadership</option>
              <option>Personal Story</option>
              <option>FAQs</option>
              <option>Culture/Values</option>
              <option>Industry Commentary</option>
              <option>Tutorial</option>
              <option>Announcement</option>
            </select>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
                className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB]"
              />
            </div>
            <span className="ml-auto text-xs text-[#94A3B8]">
              Showing {displayed.length} of {allFiltered.length} posts
            </span>
          </div>

          {/* Grid or empty state */}
          {displayed.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A] mb-1">No posts found</p>
              <p className="text-sm text-[#94A3B8]">
                No posts match your filters. Try adjusting or create a new post.
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-4 inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </div>
      </Shell>

      <CreatePostModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSaved={loadPosts}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#0F172A] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  )
}
