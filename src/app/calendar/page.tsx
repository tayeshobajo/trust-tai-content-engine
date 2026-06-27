"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/ui/StatusBadge";
import { ChevronLeft, ChevronRight, Plus, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: number;
  title: string;
  platform: string;
  status: "Scheduled" | "Needs Review" | "Approved" | "Draft" | "Idea" | "Published" | "Winning" | "Underperforming" | "Average" | "Planned" | "Missing";
  gradient: string;
}

interface CalendarDay {
  date: number | null;
  month: "prev" | "current" | "next";
  posts: Post[];
}

// ─── Mock post data ───────────────────────────────────────────────────────────

const calendarPosts: Record<string, Post[]> = {
  "2026-06-30": [
    {
      id: 1,
      title: "The founder insight no one talks about",
      platform: "LinkedIn",
      status: "Scheduled",
      gradient: "from-blue-400 to-blue-600",
    },
  ],
  "2026-07-02": [
    {
      id: 2,
      title: "Your content strategy is broken — here's the fix",
      platform: "LinkedIn",
      status: "Approved",
      gradient: "from-purple-400 to-purple-600",
    },
  ],
  "2026-07-03": [
    {
      id: 3,
      title: "3 things I learned building from zero",
      platform: "Instagram",
      status: "Needs Review",
      gradient: "from-pink-400 to-rose-600",
    },
  ],
  "2026-07-07": [
    {
      id: 4,
      title: "Monday founder check-in: what moved the needle",
      platform: "LinkedIn",
      status: "Scheduled",
      gradient: "from-green-400 to-emerald-600",
    },
  ],
  "2026-07-09": [
    {
      id: 5,
      title: "Client education: the funnel nobody is building",
      platform: "LinkedIn",
      status: "Approved",
      gradient: "from-amber-400 to-orange-500",
    },
  ],
  "2026-07-11": [
    {
      id: 6,
      title: "BTS: Inside a real Trust Tai content sprint",
      platform: "Instagram",
      status: "Draft",
      gradient: "from-cyan-400 to-blue-500",
    },
  ],
};

const unscheduledDrafts: Post[] = [
  {
    id: 10,
    title: "Why most founders quit content too early",
    platform: "LinkedIn",
    status: "Draft",
    gradient: "from-slate-300 to-slate-400",
  },
  {
    id: 11,
    title: "The repurposing playbook I use every week",
    platform: "LinkedIn",
    status: "Idea",
    gradient: "from-violet-300 to-purple-400",
  },
  {
    id: 12,
    title: "Real talk: months 1-3 of building in public",
    platform: "Instagram",
    status: "Draft",
    gradient: "from-rose-300 to-pink-400",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const platformColors: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Instagram: "bg-pink-500",
};

function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: CalendarDay[] = [];

  // Prev month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ date: daysInPrevMonth - i, month: "prev", posts: [] });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    grid.push({
      date: d,
      month: "current",
      posts: calendarPosts[key] ?? [],
    });
  }

  // Handle Jun 30 (prev month relative to July 2026 grid)
  // Jun 30 key lives in prev month row — attach posts there
  const jun30Key = "2026-06-30";
  const jun30Posts = calendarPosts[jun30Key] ?? [];
  if (jun30Posts.length > 0) {
    const jun30Cell = grid.find(
      (c) => c.month === "prev" && c.date === 30
    );
    if (jun30Cell) {
      jun30Cell.posts = jun30Posts;
    }
  }

  // Next month fill to complete rows
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push({ date: d, month: "next", posts: [] });
  }

  return grid;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(6); // July = index 6

  const grid = buildCalendarGrid(currentYear, currentMonth);

  return (
    <Shell>
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Content Calendar
            </h1>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Month/Week toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <button className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-[#0F172A] min-w-[90px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filter dropdowns */}
            <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Platform
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Category
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Status
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Create Post */}
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAY_LABELS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-[#94A3B8] uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar rows */}
          <div className="grid grid-cols-7">
            {grid.map((cell, idx) => {
              const isToday =
                cell.month === "current" &&
                cell.date === 27 &&
                currentMonth === 6 &&
                currentYear === 2026;

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    cell.month !== "current" ? "bg-gray-50/60" : ""
                  } ${idx % 7 === 6 ? "border-r-0" : ""}`}
                >
                  {/* Date number */}
                  <div className="mb-1.5">
                    <span
                      className={`text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : cell.month !== "current"
                          ? "text-[#CBD5E1]"
                          : "text-[#64748B]"
                      }`}
                    >
                      {cell.date}
                    </span>
                  </div>

                  {/* Posts */}
                  <div className="space-y-1.5">
                    {cell.posts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        {/* Mini image */}
                        <div
                          className={`h-7 bg-gradient-to-r ${post.gradient}`}
                        />
                        {/* Post info */}
                        <div className="p-1.5 bg-white">
                          <p className="text-[10px] font-medium text-[#0F172A] line-clamp-2 leading-snug mb-1">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] text-white px-1 py-px rounded font-medium ${platformColors[post.platform] ?? "bg-gray-400"}`}
                            >
                              {post.platform === "LinkedIn" ? "LI" : "IG"}
                            </span>
                            <StatusBadge status={post.status} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unscheduled Drafts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Unscheduled Drafts
            </h2>
            <span className="text-xs text-[#94A3B8]">
              {unscheduledDrafts.length} items
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {unscheduledDrafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className={`h-14 bg-gradient-to-br ${draft.gradient}`}
                />
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#0F172A] line-clamp-2 leading-snug mb-2">
                    {draft.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] text-white px-1.5 py-px rounded font-medium ${platformColors[draft.platform] ?? "bg-gray-400"}`}
                    >
                      {draft.platform === "LinkedIn" ? "LI" : "IG"}
                    </span>
                    <StatusBadge status={draft.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}


