"use client"

import { useState } from "react"
import Link from "next/link"
import Shell from "@/components/Shell"
import {
  ArrowLeft,
  GitBranch,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  Users,
  Sparkles,
  Brain,
  FileText,
  Film,
  MessageSquare,
  Clock,
  TrendingUp,
  ChevronDown,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  cream: "#F4F1EA",
  white: "#FFFFFF",
  navy: "#1A2332",
  gold: "#C29A5B",
  blue: "#2F62D8",
  textDark: "#1A2332",
  textMid: "#4A5568",
  textMuted: "#8A8578",
  border: "#DDD8CE",
  borderLight: "#EAE6DF",
  green: "#22A06B",
  orange: "#E8802A",
  red: "#DC2626",
  purple: "#7C3AED",
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREAD DATA (canonical sample — in production this loads by [id])
// ═══════════════════════════════════════════════════════════════════════════════

// Threads data model is not yet persisted — empty until studio-store supports it
const THREADS: {
  id: string
  title: string
  premise: string
  openQuestion: string
  nextChapter: string
  publishedPosts: { title: string; date: string; excerpt: string; productionId: string | null }[]
  activeProductions: { title: string; stage: string; productionId: string | null }[]
  characters: string[]
  symbols: string[]
  unresolved: string[]
  signals: { type: string; note: string }[]
}[] = []

type ThreadView = "overview" | "posts" | "productions" | "characters" | "questions"

// ═══════════════════════════════════════════════════════════════════════════════
// THREADS INDEX (no [id] — list all threads)
// This page handles both /world/threads AND /world/threads/[id]
// For the index we show all; for detail we show one.
// ═══════════════════════════════════════════════════════════════════════════════

export default function StoryThreadPage() {
  const [selectedThread, setSelectedThread] = useState(THREADS[0] ?? null)
  const [activeView, setActiveView] = useState<ThreadView>("overview")

  const VIEWS: { key: ThreadView; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "posts", label: `Posts (${selectedThread.publishedPosts.length})` },
    { key: "productions", label: `Productions (${selectedThread.activeProductions.length})` },
    { key: "characters", label: `Characters (${selectedThread.characters.length})` },
    { key: "questions", label: `Open questions (${selectedThread.unresolved.length})` },
  ]

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <Link href="/world" className="flex items-center gap-1.5 text-[10px] font-medium transition-colors hover:underline"
              style={{ color: C.textMuted }}>
              <ArrowLeft className="w-3 h-3" /> World
            </Link>
            <ChevronRight className="w-3 h-3" style={{ color: C.textMuted }} />
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: C.textMuted }}>Story Threads</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
            <Plus className="w-3 h-3" /> New thread
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-[280px_1fr] gap-6">
            {/* ─── LEFT: THREAD LIST ─── */}
            <div className="space-y-2">
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: C.textMuted }}>Active threads</p>
              {THREADS.length === 0 && (
                <p className="text-[10px]" style={{ color: C.textMuted }}>No threads yet.</p>
              )}
              {THREADS.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => { setSelectedThread(thread); setActiveView("overview") }}
                  className="w-full text-left rounded-xl border p-3.5 transition-all"
                  style={{
                    backgroundColor: selectedThread.id === thread.id ? `${C.red}06` : C.white,
                    borderColor: selectedThread.id === thread.id ? `${C.red}40` : C.borderLight,
                  }}>
                  <div className="flex items-start gap-2.5">
                    <GitBranch className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-snug mb-1" style={{ color: C.textDark }}>{thread.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px]" style={{ color: C.textMuted }}>{thread.publishedPosts.length} posts</span>
                        {thread.unresolved.length > 0 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(232,128,42,0.1)", color: C.orange }}>
                            {thread.unresolved.length} open
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* ─── RIGHT: THREAD DETAIL ─── */}
            <div>
              {!selectedThread ? (
                <div className="rounded-xl border border-dashed p-12 text-center" style={{ borderColor: C.border }}>
                  <GitBranch className="w-8 h-8 mx-auto mb-3" style={{ color: C.textMuted }} />
                  <p className="text-[13px] font-medium mb-1" style={{ color: C.textMid }}>No story threads yet</p>
                  <p className="text-[11px]" style={{ color: C.textMuted }}>Threads emerge as you publish productions and the World Bible detects recurring themes.</p>
                </div>
              ) : (
              <> {/* Thread header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4" style={{ color: C.red }} />
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(220,38,38,0.08)", color: C.red }}>
                    Story Thread
                  </span>
                </div>
                <h1 className="font-serif mb-2" style={{ fontSize: 26, color: C.textDark, fontWeight: 400 }}>{selectedThread.title}</h1>
                <p className="text-[12px] leading-relaxed max-w-xl" style={{ color: C.textMid }}>{selectedThread.premise}</p>
              </div>

              {/* View tabs */}
              <div className="flex items-center gap-1 mb-5 border-b" style={{ borderColor: C.borderLight }}>
                {VIEWS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setActiveView(v.key)}
                    className="text-[11px] font-medium px-3 py-2 border-b-2 transition-all -mb-px whitespace-nowrap"
                    style={{
                      borderColor: activeView === v.key ? C.navy : "transparent",
                      color: activeView === v.key ? C.textDark : C.textMuted,
                    }}>
                    {v.label}
                  </button>
                ))}
              </div>

              {/* ─ OVERVIEW ─ */}
              {activeView === "overview" && (
                <div className="space-y-4">
                  {/* Open question */}
                  <div className="rounded-xl border p-4" style={{ backgroundColor: "rgba(232,128,42,0.04)", borderColor: "rgba(232,128,42,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-3.5 h-3.5" style={{ color: C.orange }} />
                      <p className="text-[10px] font-bold" style={{ color: C.orange }}>Open question</p>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: C.textDark }}>{selectedThread.openQuestion}</p>
                  </div>

                  {/* Next chapter */}
                  <div className="rounded-xl border p-4" style={{ backgroundColor: `${C.navy}03`, borderColor: C.borderLight }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: C.navy }} />
                      <p className="text-[10px] font-bold" style={{ color: C.textMid }}>Next chapter</p>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: C.textMid }}>{selectedThread.nextChapter}</p>
                    <button className="flex items-center gap-1.5 text-[10px] font-semibold mt-3 transition-colors hover:underline"
                      style={{ color: C.blue }}>
                      <Plus className="w-3 h-3" /> Develop this post
                    </button>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Published posts", value: selectedThread.publishedPosts.length, icon: FileText },
                      { label: "Productions", value: selectedThread.activeProductions.length, icon: Film },
                      { label: "Open questions", value: selectedThread.unresolved.length, icon: AlertCircle },
                      { label: "Signals", value: selectedThread.signals.length, icon: TrendingUp },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-xl border p-3 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                        <Icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: C.textMuted }} />
                        <p className="font-bold text-xl" style={{ color: C.textDark }}>{value}</p>
                        <p className="text-[9px]" style={{ color: C.textMuted }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Signals */}
                  {selectedThread.signals.length > 0 && (
                    <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: C.textMuted }}>Audience signals</p>
                      <div className="space-y-2">
                        {selectedThread.signals.map((sig, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {sig.type === "saves" ? <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                              : sig.type === "comments" ? <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: C.blue }} />
                              : <TrendingUp className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: C.green }} />}
                            <p className="text-[11px] leading-snug" style={{ color: C.textMid }}>{sig.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─ POSTS ─ */}
              {activeView === "posts" && (
                <div className="space-y-3">
                  {selectedThread.publishedPosts.length === 0 ? (
                    <EmptyState icon={FileText} label="No published posts in this thread yet." />
                  ) : selectedThread.publishedPosts.map((post) => (
                    <div key={post.title} className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[15px] mb-1" style={{ color: C.textDark }}>{post.title}</p>
                          <p className="text-[11px] leading-snug mb-2 line-clamp-2" style={{ color: C.textMid }}>{post.excerpt}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px]" style={{ color: C.textMuted }}>{post.date}</span>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: "rgba(34,160,107,0.08)", color: C.green }}>
                              <Check className="w-2 h-2 inline mr-0.5" />Published
                            </span>
                          </div>
                        </div>
                        {post.productionId && (
                          <Link href={`/studio/production/${post.productionId}`}
                            className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline flex-shrink-0"
                            style={{ color: C.blue }}>
                            Open production <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─ PRODUCTIONS ─ */}
              {activeView === "productions" && (
                <div className="space-y-3">
                  {selectedThread.activeProductions.length === 0 ? (
                    <EmptyState icon={Film} label="No active productions in this thread." />
                  ) : selectedThread.activeProductions.map((prod) => (
                    <div key={prod.title} className="rounded-xl border p-4 flex items-center justify-between"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <div>
                        <p className="font-serif text-[14px] mb-0.5" style={{ color: C.textDark }}>{prod.title}</p>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(47,98,216,0.08)", color: C.blue }}>{prod.stage}</span>
                      </div>
                      {prod.productionId && (
                        <Link href={`/studio/production/${prod.productionId}`}
                          className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline"
                          style={{ color: C.blue }}>
                          Open <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ─ CHARACTERS ─ */}
              {activeView === "characters" && (
                <div className="space-y-3">
                  {selectedThread.characters.length === 0 ? (
                    <EmptyState icon={Users} label="No recurring characters in this thread yet." />
                  ) : selectedThread.characters.map((char) => (
                    <div key={char} className="rounded-xl border p-3.5 flex items-center gap-3"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${C.orange}12` }}>
                        <Users className="w-4 h-4" style={{ color: C.orange }} />
                      </div>
                      <p className="flex-1 text-[12px] font-medium" style={{ color: C.textDark }}>{char}</p>
                      <Link href="/characters" className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:underline"
                        style={{ color: C.blue }}>
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* ─ OPEN QUESTIONS ─ */}
              {activeView === "questions" && (
                <div className="space-y-3">
                  {selectedThread.unresolved.length === 0 ? (
                    <EmptyState icon={AlertCircle} label="No open questions in this thread." />
                  ) : selectedThread.unresolved.map((q, i) => (
                    <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: "rgba(232,128,42,0.03)", borderColor: "rgba(232,128,42,0.2)" }}>
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.orange }} />
                        <div className="flex-1">
                          <p className="text-[12px] leading-snug mb-2" style={{ color: C.textDark }}>{q}</p>
                          <button className="flex items-center gap-1.5 text-[10px] font-semibold transition-colors hover:underline"
                            style={{ color: C.blue }}>
                            <Plus className="w-3 h-3" /> Answer with a post
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border p-3 border-dashed" style={{ borderColor: C.border }}>
                    <button className="w-full flex items-center justify-center gap-1.5 text-[10px] font-medium py-1"
                      style={{ color: C.textMuted }}>
                      <Plus className="w-3 h-3" /> Add a question to this thread
                    </button>
                  </div>
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="rounded-xl border p-10 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <Icon className="w-7 h-7 mx-auto mb-3" style={{ color: C.textMuted }} />
      <p className="text-[11px]" style={{ color: C.textMuted }}>{label}</p>
    </div>
  )
}
