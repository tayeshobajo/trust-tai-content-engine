"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import {
  Calendar,
  Megaphone,
  HelpCircle,
  Eye,
  Search,
  LayoutGrid,
  BarChart2,
  ChevronRight,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Trash2,
} from "lucide-react"
import {
  Message,
  getAgentMessages,
  saveAgentMessages,
  clearAgentMessages,
} from "@/lib/store"

// ─── Quick Action definitions ─────────────────────────────────────────────────

const quickActions = [
  {
    icon: Calendar,
    title: "Plan next week's posts",
    subtitle: "Build a full content plan across platforms",
    prompt:
      "Plan my content for next week. I post Mon/Wed/Fri on LinkedIn, Tue/Thu on Instagram. Focus on The Roadmap and Founder Bottlenecks pillars.",
  },
  {
    icon: Search,
    title: "Find content gaps",
    subtitle: "Discover what's missing in your strategy",
    prompt:
      "Review my content pillars and tell me which categories are underused this month. My pillars: The Roadmap, Founder Bottlenecks, Systems That Scale, Spirit First, Client Transformation.",
  },
  {
    icon: HelpCircle,
    title: "What should I post next?",
    subtitle: "Get a personalized recommendation",
    prompt:
      "Based on my content strategy and recent performance, what's the single best post I should create today and why?",
  },
  {
    icon: Megaphone,
    title: "Create posts for an offer",
    subtitle: "Turn your offer into multi-platform content",
    prompt:
      "Create 3 LinkedIn posts promoting The Operating Map (my $10K-$25K strategic roadmap service). Use named-pain hooks. Different angles for each post.",
  },
  {
    icon: Eye,
    title: "Review my content",
    subtitle: "Audit current posts for voice alignment",
    prompt:
      "Review my recent content and tell me: what's working, what's not, and what I should do differently next week.",
  },
  {
    icon: LayoutGrid,
    title: "Create a 30-day campaign",
    subtitle: "Full campaign plan with hooks + assets",
    prompt:
      "Create a 30-day LinkedIn content campaign for The Operating Map offer. I want 3 posts per week. Mix: founder insight, client story, and direct offer posts. Give me a full plan.",
  },
  {
    icon: BarChart2,
    title: "Analyze what's working",
    subtitle: "Surface top performing content patterns",
    prompt:
      "Analyze which of my content pillars and post formats are getting the best results. Tell me: top pattern, why it works, and how to double down.",
  },
]

const pillars = [
  "The Roadmap",
  "Founder Bottlenecks",
  "Systems That Scale",
  "Spirit First",
  "Client Transformation",
  "+3 more",
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
    desc: "3x more impressions than other pillars. Post 2 more this week.",
  },
  {
    icon: Search,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "No Instagram Reels in 2 weeks",
    desc: "Short video drives 4x organic reach on Instagram. Try one this week.",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function makeId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentPage() {
  // Lazy-initialize messages from localStorage (avoids set-state-in-effect lint error)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      return getAgentMessages()
    }
    return []
  })
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [introTimestamp, setIntroTimestamp] = useState<number>(0)
  useEffect(() => {
    const t = Date.now()
    const id = setTimeout(() => setIntroTimestamp(t), 0)
    return () => clearTimeout(id)
  }, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveAgentMessages(messages)
    }
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      }

      const assistantId = makeId()
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      const newMessages = [...messages, userMsg, assistantMsg]
      setMessages(newMessages)
      setInputValue("")
      setIsStreaming(true)
      setStreamingId(assistantId)

      // Build message history for API (exclude the empty assistant placeholder)
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        })

        if (!res.ok || !res.body) {
          throw new Error(`API error: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          )
        }

        // Final save with completed content
        setMessages((prev) => {
          const final = prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
          saveAgentMessages(final)
          return final
        })
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Error: ${errorText}` }
              : m
          )
        )
      } finally {
        setIsStreaming(false)
        setStreamingId(null)
        inputRef.current?.focus()
      }
    },
    [messages, isStreaming]
  )

  const handleQuickAction = useCallback(
    (prompt: string) => {
      sendMessage(prompt)
    },
    [sendMessage]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const handleNewConversation = () => {
    clearAgentMessages()
    setMessages([])
    inputRef.current?.focus()
  }

  const isFirstMessage = messages.length === 0

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6 h-screen flex flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Content Agent</h1>
              <p className="text-sm text-[#64748B]">
                Your AI content strategist. Plan, create, review, and optimize.
              </p>
            </div>
            {!isFirstMessage && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                New conversation
              </button>
            )}
          </div>

          {/* 3-col layout */}
          <div className="grid grid-cols-[240px_1fr_240px] gap-5 flex-1 min-h-0 overflow-hidden">

            {/* LEFT */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Quick Actions
                </h2>
                <div className="space-y-1">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.prompt)}
                      disabled={isStreaming}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <action.icon className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] leading-tight">
                          {action.title}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] leading-tight truncate">
                          {action.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Strategy */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Content Strategy
                </h2>

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
                <span className="text-xs font-semibold text-[#0F172A]">
                  The Roadmap — Operating Map
                </span>
              </div>
            </div>

            {/* CENTER — Chat */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Intro / empty state */}
                {isFirstMessage && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#F8F9FB] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-[#0F172A]">
                        Hi Tai, I&apos;m your Content Agent. I know your voice, your strategy, and your audience.{" "}
                        <span className="font-semibold">What would you like to build today?</span>
                      </p>
                      {introTimestamp > 0 && (
                        <p className="text-xs text-[#94A3B8] mt-1.5">
                          {formatTime(introTimestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Conversation messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {msg.role === "assistant" ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[#64748B]" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-blue-50 rounded-tr-sm"
                          : "bg-[#F8F9FB] rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "assistant" && msg.content === "" && streamingId === msg.id ? (
                        // Typing cursor while streaming starts
                        <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse rounded-sm" />
                      ) : (
                        <div className="text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                          {/* Blinking cursor during streaming */}
                          {streamingId === msg.id && isStreaming && (
                            <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                          )}
                        </div>
                      )}
                      <p className="text-[10px] text-[#94A3B8] mt-1.5">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
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
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming}
                    placeholder={
                      isStreaming
                        ? "Agent is thinking..."
                        : "Ask me anything about your content..."
                    }
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-[#F8F9FB] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isStreaming || !inputValue.trim()}
                    className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStreaming ? (
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Agent Recommendations */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Agent Recommendations
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${rec.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <rec.icon className={`w-3.5 h-3.5 ${rec.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#0F172A] leading-tight">
                          {rec.title}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">
                          {rec.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Health Score */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Content Health Score
                </h2>

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
                        <div
                          className={`h-full rounded-full ${m.color}`}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`}
                      />
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
