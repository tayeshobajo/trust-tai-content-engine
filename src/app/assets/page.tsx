"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import {
  Image,
  FileText,
  Video,
  Music,
  Folder,
  Plus,
  Upload,
  Link2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Cloud,
} from "lucide-react"

const tabs = ["All Assets", "Images", "Documents", "Videos", "Audio", "Templates", "Brand", "Voice & Copy"]

const folders = [
  { name: "Brand Assets", count: 120, color: "bg-blue-600", textColor: "text-blue-600", bg: "bg-blue-50" },
  { name: "Campaigns", count: 28, color: "bg-green-600", textColor: "text-green-600", bg: "bg-green-50" },
  { name: "Content Pillars", count: 36, color: "bg-purple-600", textColor: "text-purple-600", bg: "bg-purple-50" },
  { name: "Templates", count: 64, color: "bg-amber-500", textColor: "text-amber-600", bg: "bg-amber-50" },
  { name: "Founder Voice", count: 16, color: "bg-pink-500", textColor: "text-pink-600", bg: "bg-pink-50" },
]

type AssetRow = {
  name: string
  type: string
  typeColor: string
  typeBg: string
  folder: string
  tags: string[]
  modified: string
  size: string
}

const assetRows: AssetRow[] = [
  {
    name: "Roadmap Quote.png",
    type: "Image",
    typeColor: "text-green-700",
    typeBg: "bg-green-100",
    folder: "Content Pillars",
    tags: ["roadmap", "quote"],
    modified: "Jun 27",
    size: "2.4 MB",
  },
  {
    name: "Founder Story.docx",
    type: "Document",
    typeColor: "text-purple-700",
    typeBg: "bg-purple-100",
    folder: "Founder Voice",
    tags: ["voice"],
    modified: "Jun 26",
    size: "84 KB",
  },
  {
    name: "Brand Guidelines.pdf",
    type: "Document",
    typeColor: "text-purple-700",
    typeBg: "bg-purple-100",
    folder: "Brand Assets",
    tags: ["brand"],
    modified: "Jun 15",
    size: "1.2 MB",
  },
  {
    name: "Behind the Scenes.mp4",
    type: "Video",
    typeColor: "text-amber-700",
    typeBg: "bg-amber-100",
    folder: "Campaigns",
    tags: ["btc"],
    modified: "Jun 24",
    size: "18 MB",
  },
  {
    name: "Q2 Strategy.pptx",
    type: "Document",
    typeColor: "text-purple-700",
    typeBg: "bg-purple-100",
    folder: "Brand Assets",
    tags: ["strategy"],
    modified: "Jun 10",
    size: "3.1 MB",
  },
  {
    name: "Logo.png",
    type: "Image",
    typeColor: "text-green-700",
    typeBg: "bg-green-100",
    folder: "Brand Assets",
    tags: ["brand", "logo"],
    modified: "Jun 1",
    size: "240 KB",
  },
  {
    name: "Voice & Tone Guide.pdf",
    type: "Document",
    typeColor: "text-purple-700",
    typeBg: "bg-purple-100",
    folder: "Founder Voice",
    tags: ["voice", "brand"],
    modified: "Jun 20",
    size: "512 KB",
  },
  {
    name: "Roadmap Hero.png",
    type: "Image",
    typeColor: "text-green-700",
    typeBg: "bg-green-100",
    folder: "Campaigns",
    tags: ["roadmap", "hero"],
    modified: "Jun 27",
    size: "4.1 MB",
  },
]

const metricCards = [
  { label: "Total Assets", value: "1,248", delta: "↑18 this week", iconBg: "bg-blue-600", icon: Folder },
  { label: "Images", value: "342", delta: "", iconBg: "bg-green-600", icon: Image },
  { label: "Documents", value: "189", delta: "", iconBg: "bg-purple-600", icon: FileText },
  { label: "Videos", value: "96", delta: "", iconBg: "bg-amber-500", icon: Video },
  { label: "Other Files", value: "621", delta: "", iconBg: "bg-pink-500", icon: Music },
]

const storageBreakdown = [
  { label: "Images", value: "8.2 GB", color: "bg-green-500", pct: 45 },
  { label: "Documents", value: "5.1 GB", color: "bg-purple-500", pct: 28 },
  { label: "Videos", value: "3.6 GB", color: "bg-amber-500", pct: 19 },
  { label: "Other", value: "1.5 GB", color: "bg-slate-400", pct: 8 },
]

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState("All Assets")

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Asset Library</h1>
            <p className="text-sm text-[#64748B]">Every image, document, and brand asset in one place.</p>
          </div>

          {/* Top metric cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {metricCards.map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0F172A]">{m.value}</p>
                    <p className="text-xs text-[#64748B]">{m.label}</p>
                  </div>
                </div>
                {m.delta && <p className="text-xs text-green-600 mt-2">{m.delta}</p>}
              </div>
            ))}
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-[1fr_280px] gap-6">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Tab row */}
              <div className="flex gap-1 overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "text-[#64748B] hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Folders row */}
              <div className="grid grid-cols-6 gap-3">
                {folders.map((folder) => (
                  <div key={folder.name} className={`${folder.bg} rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-sm transition-shadow`}>
                    <div className={`w-8 h-8 rounded-lg ${folder.color} flex items-center justify-center mb-2`}>
                      <Folder className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-[#0F172A] leading-tight">{folder.name}</p>
                    <p className={`text-[10px] ${folder.textColor} mt-0.5`}>{folder.count} files</p>
                  </div>
                ))}
                {/* New Folder */}
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-3 cursor-pointer hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-center min-h-[80px]">
                  <Plus className="w-5 h-5 text-[#94A3B8] mb-1" />
                  <p className="text-xs text-[#94A3B8]">New Folder</p>
                </div>
              </div>

              {/* Assets table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-[#0F172A]">Recent Assets</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-2.5 text-xs text-[#94A3B8] font-medium">Name</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#94A3B8] font-medium">Type</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#94A3B8] font-medium">Folder</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#94A3B8] font-medium">Tags</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#94A3B8] font-medium">Modified</th>
                      <th className="text-right px-5 py-2.5 text-xs text-[#94A3B8] font-medium">Size</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-[#F8F9FB] transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium text-[#0F172A]">{row.name}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${row.typeBg} ${row.typeColor}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-[#64748B]">{row.folder}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {row.tags.map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-[#94A3B8]">{row.modified}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-xs text-[#94A3B8]">{row.size}</span>
                        </td>
                        <td className="px-3 py-3">
                          <button className="p-1 text-[#94A3B8] hover:text-[#64748B]">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-[#94A3B8]">Showing 1 to 8 of 1,248</p>
                  <div className="flex gap-2">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div className="space-y-5">
              {/* Upload dropzone */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Upload Assets</h2>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                    <Cloud className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-[#0F172A] mb-1">Drag &amp; drop or click to browse</p>
                  <p className="text-[10px] text-[#94A3B8]">PNG, JPG, PDF, MP4, DOCX up to 100MB</p>
                </div>
              </div>

              {/* Founder Voice card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#0F172A]">Founder Voice</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 font-medium">Active</span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#64748B]">Voice Score</span>
                    <span className="text-xs font-semibold text-green-600">92/100</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 p-2.5 bg-[#F8F9FB] rounded-lg hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4 text-[#64748B]" />
                    <span className="text-xs text-[#0F172A] font-medium">Upload Document</span>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2.5 bg-[#F8F9FB] rounded-lg hover:bg-gray-100 transition-colors">
                    <Link2 className="w-4 h-4 text-[#64748B]" />
                    <span className="text-xs text-[#0F172A] font-medium">Link Google Doc</span>
                  </button>
                </div>

                <button className="w-full mt-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  View Voice Insights
                </button>
              </div>

              {/* Storage */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Storage</h2>

                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#64748B]">18.4 GB of 50 GB</span>
                    <span className="text-xs font-semibold text-[#0F172A]">36%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                    {storageBreakdown.map((s) => (
                      <div key={s.label} className={`h-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {storageBreakdown.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="text-xs text-[#64748B]">{s.label}</span>
                      </div>
                      <span className="text-xs text-[#0F172A] font-medium">{s.value}</span>
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
