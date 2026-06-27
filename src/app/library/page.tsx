"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { POSTS, type Post, type PostStatus, type Platform } from "@/data/posts"
import { Search, Plus, MoreHorizontal } from "lucide-react"

const TAB_OPTIONS = [
  "All Posts",
  "Drafts",
  "Scheduled",
  "Published",
  "Winning Posts",
  "Needs Repurpose",
] as const

type TabOption = (typeof TAB_OPTIONS)[number]

const STATUS_BADGE: Record<PostStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Published: "bg-green-100 text-green-700",
  "Needs Review": "bg-amber-100 text-amber-700",
  Draft: "bg-slate-100 text-slate-600",
  Winning: "bg-green-100 text-green-700",
}

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Instagram: "bg-pink-500",
  X: "bg-slate-800",
  Blog: "bg-slate-400",
}

const PLATFORM_ABBR: Record<string, string> = {
  LinkedIn: "LI",
  Instagram: "IG",
  X: "X",
  Blog: "B",
}

function PlatformIcon({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform] ?? "bg-gray-400"
  const abbr = PLATFORM_ABBR[platform] ?? platform[0]
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold text-white ${color}`}>
      {abbr}
    </span>
  )
}

function PostCard({ post }: { post: Post }) {
  const [menuOpen, setMenuOpen] = useState(false)

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
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-white/90 text-[#0F172A] text-xs font-medium px-2 py-0.5 rounded-full">
          {post.category}
        </span>
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[post.status]}`}
        >
          {post.status}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug">
          {post.hook}
        </p>

        {/* Platform icons */}
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
              <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-md w-32 py-1 text-sm">
                <button className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[#0F172A]">
                  Edit
                </button>
                <button className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[#0F172A]">
                  Duplicate
                </button>
                <button className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600">
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

function filterByTab(posts: Post[], tab: TabOption): Post[] {
  if (tab === "All Posts") return posts
  if (tab === "Drafts") return posts.filter((p) => p.status === "Draft")
  if (tab === "Scheduled") return posts.filter((p) => p.status === "Scheduled")
  if (tab === "Published") return posts.filter((p) => p.status === "Published")
  if (tab === "Winning Posts") return posts.filter((p) => p.status === "Winning")
  if (tab === "Needs Repurpose")
    return posts.filter((p) => p.status === "Needs Review")
  return posts
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("All Posts")
  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("All Platforms")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")

  const tabFiltered = filterByTab(POSTS, activeTab)
  const displayed = tabFiltered.filter((p) => {
    const matchSearch =
      search === "" ||
      p.hook.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
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
      <Sidebar />
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
            <button className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
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
          <div className="flex gap-3 mb-6 flex-wrap">
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
          </div>

          {/* Grid */}
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-[#94A3B8] text-sm">
              No posts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </Shell>
    </>
  )
}
