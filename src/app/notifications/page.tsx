"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import {
  Bell,
  Check,
  Film,
  AlertTriangle,
  Brain,
  Package,
  TrendingUp,
  Sparkles,
  MessageSquare,
  X,
  ChevronRight,
  Filter,
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
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type NotifPriority = "decision" | "update" | "insight" | "info"
type NotifType =
  | "approval_requested" | "render_complete" | "generation_failed"
  | "continuity_conflict" | "memory_conflict" | "package_ready"
  | "performance_available" | "recommendation_created" | "collaborator_comment"

interface Notification {
  id: string
  type: NotifType
  priority: NotifPriority
  title: string
  body: string
  production?: string
  href: string
  time: string
  read: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "approval_requested", priority: "decision",
    title: "Concept approval needed",
    body: "\"The Man Who Carried a City\" has 3 concept directions ready. Your approval unlocks the script stage.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "2 minutes ago", read: false,
  },
  {
    id: "n2", type: "continuity_conflict", priority: "decision",
    title: "Continuity conflict detected",
    body: "Scene 7 character render diverges from the master appearance by 34%. Character age appears inconsistent across shots 6 and 7.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "18 minutes ago", read: false,
  },
  {
    id: "n3", type: "render_complete", priority: "update",
    title: "Scene 4 render complete",
    body: "Scene 4 (\"The weight transfers\") rendered successfully. 2 takes generated. Ready for review.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "34 minutes ago", read: false,
  },
  {
    id: "n4", type: "memory_conflict", priority: "decision",
    title: "Memory conflict — voice rule",
    body: "The Studio detected a potential contradiction: the approved script uses 'perhaps' in Scene 3 narration. Voice rule: no softening language.",
    production: "The Man Who Carried a City",
    href: "/memory",
    time: "1 hour ago", read: true,
  },
  {
    id: "n5", type: "recommendation_created", priority: "insight",
    title: "New recommendation ready",
    body: "The Studio identified a strong continuation opportunity: \"The Founder Who Became the System\" builds directly on City's save signal.",
    href: "/ideas",
    time: "2 hours ago", read: true,
  },
  {
    id: "n6", type: "package_ready", priority: "update",
    title: "Package ready for review",
    body: "All assets complete for \"The Man Who Carried a City\". Post, 9:16 film, square cut, captioned version, and thumbnail are available.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "3 hours ago", read: true,
  },
  {
    id: "n7", type: "performance_available", priority: "insight",
    title: "Performance data available",
    body: "\"The Man Who Carried a City\" LinkedIn post: 4.2% save rate, 8,240 impressions, 29 comments. 2 business inquiries tracked.",
    production: "The Man Who Carried a City",
    href: "/signals",
    time: "Yesterday", read: true,
  },
  {
    id: "n8", type: "generation_failed", priority: "update",
    title: "Scene 9 generation failed",
    body: "Video generation timed out after 3 attempts. Fal/Kling-2 returned rate limit error. Auto-retrying with fallback model in 15 minutes.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "Yesterday", read: true,
  },
  {
    id: "n9", type: "collaborator_comment", priority: "info",
    title: "Comment on script Scene 6",
    body: "Consider extending the pause beat before the child's hand appears — the emotional weight needs room to land.",
    production: "The Man Who Carried a City",
    href: "/studio/production/prod-pilot-city-001",
    time: "2 days ago", read: true,
  },
]

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  approval_requested: { icon: Check, color: C.navy, bg: `${C.navy}10` },
  render_complete: { icon: Film, color: C.green, bg: `${C.green}10` },
  generation_failed: { icon: AlertTriangle, color: C.red, bg: `${C.red}10` },
  continuity_conflict: { icon: AlertTriangle, color: C.orange, bg: `${C.orange}10` },
  memory_conflict: { icon: Brain, color: C.purple, bg: `${C.purple}10` },
  package_ready: { icon: Package, color: C.navy, bg: `${C.navy}10` },
  performance_available: { icon: TrendingUp, color: C.green, bg: `${C.green}10` },
  recommendation_created: { icon: Sparkles, color: C.gold, bg: `${C.gold}10` },
  collaborator_comment: { icon: MessageSquare, color: C.blue, bg: `${C.blue}10` },
}

const PRIORITY_LABEL: Record<NotifPriority, string> = {
  decision: "Requires decision",
  update: "Production update",
  insight: "Insight",
  info: "Informational",
}

const PRIORITY_ORDER: NotifPriority[] = ["decision", "update", "insight", "info"]

type FilterView = "all" | NotifPriority

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterView>("all")
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [readSet, setReadSet] = useState<Set<string>>(new Set(NOTIFICATIONS.filter(n => n.read).map(n => n.id)))

  const markRead = (id: string) => setReadSet(prev => new Set([...prev, id]))
  const markAllRead = () => setReadSet(new Set(NOTIFICATIONS.map(n => n.id)))
  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]))

  const visible = NOTIFICATIONS.filter(n =>
    !dismissed.has(n.id) &&
    (filter === "all" || n.priority === filter)
  )

  const unreadCount = NOTIFICATIONS.filter(n => !readSet.has(n.id) && !dismissed.has(n.id)).length

  const groups = PRIORITY_ORDER.map(p => ({
    priority: p,
    label: PRIORITY_LABEL[p],
    items: visible.filter(n => n.priority === p),
  })).filter(g => g.items.length > 0)

  const FILTERS: { key: FilterView; label: string; count: number }[] = [
    { key: "all", label: "All", count: visible.length },
    { key: "decision", label: "Decisions", count: visible.filter(n => n.priority === "decision").length },
    { key: "update", label: "Updates", count: visible.filter(n => n.priority === "update").length },
    { key: "insight", label: "Insights", count: visible.filter(n => n.priority === "insight").length },
    { key: "info", label: "Info", count: visible.filter(n => n.priority === "info").length },
  ]

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: C.textMuted }}>Notifications</p>
            {unreadCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[10px] font-medium transition-colors hover:underline"
              style={{ color: C.blue }}>
              Mark all read
            </button>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-6 py-6">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-5">
            {FILTERS.map(({ key, label, count }) => (
              <button key={key} onClick={() => setFilter(key)}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{
                  backgroundColor: filter === key ? C.white : "transparent",
                  color: filter === key ? C.textDark : C.textMuted,
                  boxShadow: filter === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  border: filter === key ? `1px solid ${C.borderLight}` : "1px solid transparent",
                }}>
                {label}
                {count > 0 && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                    style={{ backgroundColor: filter === key ? `${C.gold}18` : "rgba(138,133,120,0.1)", color: filter === key ? C.gold : C.textMuted }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {visible.length === 0 && (
            <div className="rounded-xl border p-16 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
              <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: C.textMuted }} />
              <p className="font-serif text-sm mb-1" style={{ color: C.textDark }}>All clear</p>
              <p className="text-[10px]" style={{ color: C.textMid }}>No notifications in this category.</p>
            </div>
          )}

          {/* Grouped notifications */}
          <div className="space-y-6">
            {groups.map(({ priority, label, items }) => (
              <div key={priority}>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: C.textMuted }}>{label}</p>
                <div className="space-y-2">
                  {items.map((notif) => {
                    const isUnread = !readSet.has(notif.id)
                    const cfg = TYPE_CONFIG[notif.type]
                    const Icon = cfg.icon

                    return (
                      <div
                        key={notif.id}
                        className="rounded-xl border p-4 transition-all"
                        style={{
                          backgroundColor: C.white,
                          borderColor: isUnread ? `${C.navy}20` : C.borderLight,
                          borderLeft: isUnread ? `3px solid ${C.navy}` : `3px solid transparent`,
                        }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: cfg.bg }}>
                            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-[12px] font-semibold leading-snug" style={{ color: C.textDark }}>{notif.title}</p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <p className="text-[9px]" style={{ color: C.textMuted }}>{notif.time}</p>
                                <button onClick={() => dismiss(notif.id)} className="p-0.5 rounded transition-colors hover:bg-black/5">
                                  <X className="w-3 h-3" style={{ color: C.textMuted }} />
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] leading-snug mb-2" style={{ color: C.textMid }}>{notif.body}</p>
                            {notif.production && (
                              <p className="text-[9px] mb-2" style={{ color: C.textMuted }}>
                                Production: {notif.production}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <a href={notif.href}
                                onClick={() => markRead(notif.id)}
                                className="flex items-center gap-1 text-[10px] font-semibold transition-colors hover:underline"
                                style={{ color: priority === "decision" ? C.navy : C.blue }}>
                                {priority === "decision" ? "Go to decision" : "View"} <ChevronRight className="w-3 h-3" />
                              </a>
                              {isUnread && (
                                <button onClick={() => markRead(notif.id)}
                                  className="text-[10px] font-medium transition-colors hover:underline"
                                  style={{ color: C.textMuted }}>
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}
