"use client"

import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { CheckCircle, Clock, Image, FileText, Calendar, ChevronRight } from "lucide-react"

const statusCards = [
  { label: "Total Items", value: 14, color: "bg-blue-600", textColor: "text-blue-600", icon: FileText },
  { label: "Needs Draft", value: 3, color: "bg-amber-500", textColor: "text-amber-500", icon: FileText },
  { label: "Needs Image", value: 2, color: "bg-purple-600", textColor: "text-purple-600", icon: Image },
  { label: "Needs Review", value: 4, color: "bg-amber-500", textColor: "text-amber-500", icon: Clock },
  { label: "Approved", value: 3, color: "bg-green-600", textColor: "text-green-600", icon: CheckCircle },
  { label: "Scheduled", value: 2, color: "bg-blue-600", textColor: "text-blue-600", icon: Calendar },
]

type KanbanColumn = {
  id: string
  label: string
  headerColor: string
  headerBg: string
  cards: KanbanCard[]
}

type KanbanCard = {
  hook: string
  platform: string
  platformColor: string
  category: string
  owner: string
  date: string
  imageBg: string
}

const kanbanColumns: KanbanColumn[] = [
  {
    id: "needs-draft",
    label: "NEEDS DRAFT",
    headerColor: "text-amber-700",
    headerBg: "bg-amber-50 border-amber-200",
    cards: [
      {
        hook: "The system that runs your business shouldn't require you to run it.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Systems",
        owner: "Tai",
        date: "Jul 3",
        imageBg: "bg-blue-100",
      },
      {
        hook: "You don't have a team problem. You have a clarity problem.",
        platform: "Instagram",
        platformColor: "bg-pink-500",
        category: "Mindset",
        owner: "Tai",
        date: "Jul 5",
        imageBg: "bg-pink-100",
      },
      {
        hook: "Hiring before you have a system is outsourcing your chaos.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Roadmap",
        owner: "Tai",
        date: "Jul 7",
        imageBg: "bg-blue-100",
      },
    ],
  },
  {
    id: "needs-image",
    label: "NEEDS IMAGE",
    headerColor: "text-purple-700",
    headerBg: "bg-purple-50 border-purple-200",
    cards: [
      {
        hook: "Your calendar is full. Your results are empty. Here's why.",
        platform: "Instagram",
        platformColor: "bg-pink-500",
        category: "Productivity",
        owner: "Tai",
        date: "Jun 30",
        imageBg: "bg-slate-100",
      },
      {
        hook: "3 questions I ask every founder before we build anything.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Roadmap",
        owner: "Tai",
        date: "Jul 1",
        imageBg: "bg-slate-100",
      },
    ],
  },
  {
    id: "needs-review",
    label: "NEEDS REVIEW",
    headerColor: "text-amber-700",
    headerBg: "bg-amber-50 border-amber-200",
    cards: [
      {
        hook: "What no one tells you about building a content system.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Content",
        owner: "Tai",
        date: "Jun 29",
        imageBg: "bg-blue-200",
      },
      {
        hook: "Spirit First isn't a slogan. It's a filter for every decision.",
        platform: "Instagram",
        platformColor: "bg-pink-500",
        category: "Spirit First",
        owner: "Tai",
        date: "Jun 30",
        imageBg: "bg-pink-200",
      },
      {
        hook: "The moment I stopped doing and started designing.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Founder Story",
        owner: "Tai",
        date: "Jul 2",
        imageBg: "bg-blue-200",
      },
      {
        hook: "Every client I've lost taught me something the wins didn't.",
        platform: "X/Twitter",
        platformColor: "bg-slate-700",
        category: "Mindset",
        owner: "Tai",
        date: "Jul 3",
        imageBg: "bg-slate-200",
      },
    ],
  },
  {
    id: "approved",
    label: "APPROVED",
    headerColor: "text-green-700",
    headerBg: "bg-green-50 border-green-200",
    cards: [
      {
        hook: "Here's what a roadmap-run business actually looks like.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Roadmap",
        owner: "Tai",
        date: "Jun 28",
        imageBg: "bg-green-100",
      },
      {
        hook: "The content strategy I use to generate leads without ads.",
        platform: "Instagram",
        platformColor: "bg-pink-500",
        category: "Content",
        owner: "Tai",
        date: "Jun 29",
        imageBg: "bg-green-100",
      },
      {
        hook: "I fired myself from 3 jobs inside my own company.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Founder Story",
        owner: "Tai",
        date: "Jun 30",
        imageBg: "bg-green-100",
      },
    ],
  },
  {
    id: "scheduled",
    label: "SCHEDULED",
    headerColor: "text-blue-700",
    headerBg: "bg-blue-50 border-blue-200",
    cards: [
      {
        hook: "One decision changed everything about how I run my business.",
        platform: "LinkedIn",
        platformColor: "bg-blue-600",
        category: "Roadmap",
        owner: "Tai",
        date: "Jun 28 · 9am",
        imageBg: "bg-blue-200",
      },
      {
        hook: "Client transformation: from chaos to a business that runs itself.",
        platform: "Instagram",
        platformColor: "bg-pink-500",
        category: "Client Story",
        owner: "Tai",
        date: "Jun 29 · 11am",
        imageBg: "bg-pink-200",
      },
    ],
  },
]

export default function ApprovalsPage() {
  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Approval Queue</h1>
            <p className="text-sm text-[#64748B]">Review and approve content before it goes live.</p>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {statusCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-2`}>
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
              {kanbanColumns.map((col) => (
                <div key={col.id} className="flex-1 min-w-[200px]">
                  {/* Column header */}
                  <div className={`rounded-lg border px-3 py-2 mb-3 ${col.headerBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold tracking-wider ${col.headerColor}`}>{col.label}</span>
                      <span className={`text-xs font-bold ${col.headerColor}`}>{col.cards.length}</span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {col.cards.map((card, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                        {/* Image placeholder */}
                        <div className={`w-full h-16 rounded-lg ${card.imageBg} mb-3 flex items-center justify-center`}>
                          <span className="text-xs text-[#94A3B8]">Image</span>
                        </div>

                        {/* Hook */}
                        <p className="text-xs font-semibold text-[#0F172A] leading-snug mb-2 line-clamp-2">{card.hook}</p>

                        {/* Platform + Category */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium ${card.platformColor}`}>
                            {card.platform}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                            {card.category}
                          </span>
                        </div>

                        {/* Owner + Date */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-[#94A3B8]">@{card.owner}</span>
                          <span className="text-[10px] text-[#94A3B8]">{card.date}</span>
                        </div>

                        {/* Action buttons */}
                        {col.id === "needs-review" && (
                          <div className="flex gap-2">
                            <button className="flex-1 py-1.5 text-[10px] font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                              Approve
                            </button>
                            <button className="flex-1 py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50">
                              Request Changes
                            </button>
                          </div>
                        )}
                        {col.id === "approved" && (
                          <div className="flex gap-2">
                            <button className="flex-1 py-1.5 text-[10px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                              Schedule
                            </button>
                            <button className="flex-1 py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50">
                              View
                            </button>
                          </div>
                        )}
                        {col.id !== "needs-review" && col.id !== "approved" && (
                          <button className="w-full py-1.5 text-[10px] font-semibold text-[#64748B] border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                            Open <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </>
  )
}
