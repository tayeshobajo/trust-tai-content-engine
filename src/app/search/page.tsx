"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import {
  Search,
  FileText,
  Film,
  Image,
  Package,
  Lightbulb,
  Users,
  Sparkles,
  MapPin,
  GitBranch,
  TrendingUp,
  Brain,
  Clock,
  ChevronRight,
  X,
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type SearchScope =
  | "all" | "posts" | "scripts" | "scenes" | "frames"
  | "packages" | "ideas" | "characters" | "symbols"
  | "places" | "threads" | "signals" | "memories"

interface SearchResult {
  id: string
  type: SearchScope
  title: string
  excerpt: string
  meta: string
  href: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

const SEMANTIC_EXAMPLES = [
  "Show every film where the founder character appears",
  "Find posts about being needed",
  "Memories with confidence above 90%",
  "All productions in progress",
]

// Search results are derived at query-time from real data — no static seeds
const SAMPLE_RESULTS: SearchResult[] = []

const SCOPE_CONFIG: { key: SearchScope; label: string; icon: React.ElementType; color: string }[] = [
  { key: "all", label: "All", icon: Search, color: C.textMuted },
  { key: "posts", label: "Posts", icon: FileText, color: C.blue },
  { key: "scripts", label: "Scripts", icon: FileText, color: "#7C3AED" },
  { key: "scenes", label: "Scenes", icon: Film, color: C.green },
  { key: "frames", label: "Frames", icon: Image, color: "#0891B2" },
  { key: "packages", label: "Packages", icon: Package, color: C.navy },
  { key: "ideas", label: "Ideas", icon: Lightbulb, color: C.gold },
  { key: "characters", label: "Characters", icon: Users, color: "#E8802A" },
  { key: "symbols", label: "Symbols", icon: Sparkles, color: C.gold },
  { key: "places", label: "Places", icon: MapPin, color: C.green },
  { key: "threads", label: "Threads", icon: GitBranch, color: "#DC2626" },
  { key: "signals", label: "Signals", icon: TrendingUp, color: C.green },
  { key: "memories", label: "Memories", icon: Brain, color: "#7C3AED" },
]

const TYPE_LABEL: Record<string, string> = {
  posts: "Post", scripts: "Script", scenes: "Scene", frames: "Frame",
  packages: "Package", ideas: "Idea", characters: "Character", symbols: "Symbol",
  places: "Place", threads: "Thread", signals: "Signal", memories: "Memory",
}

const TYPE_COLOR: Record<string, string> = {
  posts: C.blue, scripts: "#7C3AED", scenes: C.green, frames: "#0891B2",
  packages: C.navy, ideas: C.gold, characters: "#E8802A", symbols: C.gold,
  places: C.green, threads: "#DC2626", signals: C.green, memories: "#7C3AED",
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<SearchScope>("all")
  const [hasSearched, setHasSearched] = useState(false)

  const filteredResults = query
    ? SAMPLE_RESULTS.filter(r =>
        (scope === "all" || r.type === scope) &&
        (r.title.toLowerCase().includes(query.toLowerCase()) ||
         r.excerpt.toLowerCase().includes(query.toLowerCase()))
      )
    : []

  const handleSearch = (q: string) => {
    setQuery(q)
    setHasSearched(!!q.trim())
  }

  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.95)", borderColor: C.border }}>
          <div className="max-w-3xl mx-auto px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textMuted }} />
              <input
                autoFocus
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search the Studio — posts, scripts, characters, symbols, memories…"
                className="w-full pl-10 pr-10 py-3 rounded-xl border text-[13px] outline-none transition-colors"
                style={{
                  borderColor: query ? C.navy : C.border,
                  backgroundColor: C.white,
                  color: C.textDark,
                }}
              />
              {query && (
                <button onClick={() => handleSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-black/5">
                  <X className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                </button>
              )}
            </div>
          </div>

          {/* Scope filter */}
          <div className="max-w-3xl mx-auto px-6 pb-2 flex gap-1 overflow-x-auto">
            {SCOPE_CONFIG.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setScope(key)}
                className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all"
                style={{
                  backgroundColor: scope === key ? C.navy : "transparent",
                  color: scope === key ? "#FFFFFF" : C.textMuted,
                }}>
                <Icon className="w-3 h-3" style={{ color: scope === key ? "#FFFFFF" : color }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Empty state — no query */}
          {!query && (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: C.textMuted }}>Try a semantic search</p>
                <div className="space-y-2">
                  {SEMANTIC_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => handleSearch(ex)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors hover:bg-black/[0.02]"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.gold }} />
                      <p className="text-[12px]" style={{ color: C.textMid }}>{ex}</p>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: C.textMuted }} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: C.textMuted }}>Recent searches</p>
                <div className="space-y-1">
                  {["founder character", "systems post", "the case symbol"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSearch(r)}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-black/[0.03]">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textMuted }} />
                      <p className="text-[12px]" style={{ color: C.textMid }}>{r}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && (
            <div>
              {filteredResults.length === 0 ? (
                <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                  <Search className="w-8 h-8 mx-auto mb-3" style={{ color: C.textMuted }} />
                  <p className="font-serif text-sm mb-1" style={{ color: C.textDark }}>No results for &quot;{query}&quot;</p>
                  <p className="text-[10px]" style={{ color: C.textMid }}>Try a different term or switch scope to All.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] mb-3" style={{ color: C.textMuted }}>
                    {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                  </p>
                  {filteredResults.map((result) => (
                    <a
                      key={result.id}
                      href={result.href}
                      className="block rounded-xl border p-4 transition-all hover:shadow-sm group"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${TYPE_COLOR[result.type]}12`, color: TYPE_COLOR[result.type] }}>
                              {TYPE_LABEL[result.type]}
                            </span>
                          </div>
                          <p className="font-serif text-[15px] mb-1 leading-snug" style={{ color: C.textDark }}>{result.title}</p>
                          <p className="text-[11px] leading-snug mb-1.5 line-clamp-2" style={{ color: C.textMid }}>{result.excerpt}</p>
                          <p className="text-[9px]" style={{ color: C.textMuted }}>{result.meta}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" style={{ color: C.textMuted }} />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
