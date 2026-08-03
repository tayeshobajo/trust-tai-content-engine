"use client"

import Link from "next/link"
import Shell from "@/components/Shell"
import {
  ArrowLeft,
  Shield,
  Eye,
  Route,
  Sparkles,
  Palette,
  Users,
  Sun,
  Compass,
  Mountain,
  Scroll,
  Lock,
  Check,
  ChevronRight,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS (matched to Ideas page)
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  cream: "#F4F1EA",
  white: "#FFFFFF",
  navy: "#1A2332",
  navyDeep: "#0D1626",
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
// WORLD BIBLE DATA (canonical — sourced from WORLD_BIBLE.md / world-bible.ts)
// ═══════════════════════════════════════════════════════════════════════════════

const FOUNDATIONAL_DECLARATION = `This is Tai's world — a vast, lived-in civilization where the realities people carry internally can become physically visible. The world does not exist to make ordinary people look small. It creates awe with belonging: the environment is larger than any one person, yet every person has a meaningful place within it.`

const CENTRAL_DRAMA = [
  "Sight against limited perspective",
  "Intentional direction against endless movement",
  "Hidden systems against visible symptoms",
  "Inherited wisdom against isolated striving",
  "Human dignity against reduction",
  "Possibility against the belief that the present is all there is",
]

const PHILOSOPHICAL_SPINE = [
  {
    title: "Spirit First",
    icon: Sparkles,
    principles: [
      "People are seen before they are evaluated",
      "Every character has dignity, interiority, history, and agency",
      "Wisdom is offered through recognition, not superiority",
      "The guide does not rescue — the protagonist chooses",
      "Black characters portrayed with realism, specificity, and range",
    ],
  },
  {
    title: "Roadmap Thinking",
    icon: Compass,
    principles: [
      "The visible situation is rarely the whole situation",
      "Point A exists, whether or not the character understands it",
      "Movement and progress are different phenomena",
      "Systems and paths become visible from the right elevation",
      "A map does not walk the road. It restores choice",
    ],
  },
  {
    title: "Audience Is the Hero",
    icon: Users,
    principles: [
      "Tai's presence is felt through the world's intelligence, not centrality",
      "The central person should be someone the audience can inhabit",
      "Guides help people see — the protagonist chooses what to do",
    ],
  },
]

const WORLD_LAWS = [
  { n: 1, title: "Inner realities can acquire physical form", short: "What someone carries becomes visible in the world" },
  { n: 2, title: "Perspective changes reality", short: "Seeing from a higher vantage physically reveals what was always there" },
  { n: 3, title: "Every person carries a world", short: "Weight, love, memory — these have mass, shape, and light" },
  { n: 4, title: "Routes respond to intention", short: "Roads form or dissolve based on direction, not motion" },
  { n: 5, title: "Weight contains information", short: "Heaviness encodes what matters and what depends on you" },
  { n: 6, title: "Truth alters material conditions", short: "When someone truly sees the system, the world responds" },
  { n: 7, title: "Wisdom reveals; it does not dominate", short: "Guides offer perspective. They never take over" },
  { n: 8, title: "Old and future knowledge coexist", short: "Ancient carvings and luminous transit lines in the same frame" },
  { n: 9, title: "The world remembers", short: "Stones, roads, and instruments carry residue of every touch" },
  { n: 10, title: "Mystery remains", short: "No frame explains everything. Legible enough to trust" },
]

const CANON_SCENES = [
  {
    id: "001",
    title: "The Market of Unseen Weight",
    truth: "Competent people often normalize the scale of what depends on them",
    image: "A living organization carried as luggage",
  },
  {
    id: "002",
    title: "The Valley of Living Roads",
    truth: "The greatest inheritance is the ability to see, orient, and choose",
    image: "A father and daughter above a civilization whose roads glow like a living map",
  },
]

const VISUAL_DNA = {
  palette: [
    { name: "Deep Navy", hex: "#1A2332" },
    { name: "Slate Blue", hex: "#3B5998" },
    { name: "Charcoal", hex: "#36454F" },
    { name: "Cool Stone", hex: "#8A8D91" },
    { name: "Dusty Beige", hex: "#D4C5B0" },
    { name: "Warm Brass", hex: "#C29A5B" },
    { name: "Amber Lamp", hex: "#E8A838" },
    { name: "Transit Blue", hex: "#2F62D8" },
  ],
  materials: [
    "Worn stone", "Aged brass", "Dark iron", "Riveted steel", "Glass",
    "Canvas", "Weathered wood", "Cracked paving", "Tarnished metal", "Scuffed leather",
  ],
  light: [
    "Cinematic natural daylight, low and warm",
    "Filtered through smoke, dust, and haze",
    "Golden glows from lanterns and windows",
    "Twilight blue-hour with warm practicals",
    "Light is recognition — never decoration",
  ],
}

const ARCHETYPES = [
  { role: "The Carrier", desc: "Bears the weight others don't see. Competent, tired, purposeful.", icon: Mountain },
  { role: "The Mapmaker", desc: "Reads the system. Offers perspective without dominance.", icon: Compass },
  { role: "The Witness", desc: "Sees from altitude. Holds the broader view.", icon: Eye },
  { role: "The Child", desc: "Carries lightness not yet knowing what weight is.", icon: Sparkles },
  { role: "The Elder", desc: "Oracle, artisan, scientist. Wisdom earned, not performed.", icon: Scroll },
  { role: "The Architect", desc: "Builds instruments of seeing. Brass, lenses, chains.", icon: Shield },
]

const SYMBOLS = [
  { sym: "Eagle", meaning: "Altitude, witness, perspective from above", never: "Logo, mascot, savior" },
  { sym: "Map", meaning: "Record of relationships and possibilities", never: "Generic treasure map" },
  { sym: "Living Road", meaning: "Intention, dependency, movement made legible", never: "Random glowing line" },
  { sym: "Brass", meaning: "Deliberate human intervention, shaped knowledge", never: "Universal gold decoration" },
  { sym: "Glass", meaning: "Visibility with fragility", never: "Generic sci-fi screen" },
  { sym: "Stone", meaning: "History, burden, memory, enduring structure", never: "Meaningless debris" },
  { sym: "Water", meaning: "Another layer of truth, self-recognition", never: "Decorative puddle" },
  { sym: "Case", meaning: "World, system, or responsibility transported", never: "Steampunk luggage" },
  { sym: "Door", meaning: "Entry into a larger reality requiring consent", never: "Portal cliché" },
  { sym: "Light", meaning: "Recognition or active relationship", never: "Holiness or magic glow" },
  { sym: "Height", meaning: "Access to systemic perspective", never: "Superiority or moral rank" },
  { sym: "Market", meaning: "Exchange of knowledge, tools, and burdens", never: "Exotic clutter" },
]

const SCENE_TERRITORIES = [
  "The Painter Who Forgot Her Hands",
  "The Bridge That Built Itself",
  "The Boy Who Drew Tomorrow",
  "The Weight of Being Chosen",
  "The Cartographer's Confession",
  "The Last Lantern Keeper",
  "The Girl Who Spoke to Roads",
  "The Inheritance of Instruments",
  "The Silence After the Bell",
  "The Architect's Dream",
  "The Unfinished Map",
  "The Return of the Carrier",
]

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function WorldPage() {
  return (
    <Shell>
      <div className="min-h-screen" style={{ backgroundColor: C.cream }}>
        {/* ═══ TOP BAR ═══ */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 border-b backdrop-blur-sm"
          style={{ backgroundColor: "rgba(244,241,234,0.92)", borderColor: C.border }}
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:underline"
            style={{ color: C.textMuted }}
          >
            <ArrowLeft className="w-3 h-3" />
            Studio
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border" style={{ borderColor: C.border, color: C.textMid }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.gold }} />
              Canon v1.0
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: C.textMuted }}>
              World
            </span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {/* ═══ HEADER ROW ═══ */}
          <div className="flex items-start justify-between gap-4 pt-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif" style={{ fontSize: "36px", color: C.textDark, fontWeight: 400 }}>
                  The World of Living Roads
                </h1>
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: C.textMid }}>
                The enduring identity and continuity of every frame. Everything created pulls from here.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: C.gold }}>
                Foundational Canon
              </span>
              <span className="text-[10px]" style={{ color: C.textMuted }}>Version 1.0</span>
            </div>
          </div>

          {/* ═══ HERO BANNER ═══ */}
          <div
            className="relative rounded-xl overflow-hidden mb-8"
            style={{ height: 200, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 75% 40%, ${C.gold}15, transparent 60%)` }}
            />
            {/* Subtle road lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
              <path d="M0,160 Q400,80 800,140 T1600,100" stroke={C.gold} strokeWidth="1" fill="none" />
              <path d="M0,180 Q500,120 900,160 T1600,130" stroke={C.blue} strokeWidth="0.5" fill="none" opacity="0.6" />
            </svg>
            <div className="relative h-full flex flex-col justify-center px-8">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: C.gold }}>
                The World Asks
              </p>
              <h2 className="font-serif text-white mb-2 max-w-2xl" style={{ fontSize: "24px", fontWeight: 400, lineHeight: 1.3 }}>
                What are they carrying, what can they not yet see, and what becomes possible when the larger map is revealed?
              </h2>
            </div>
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* ═══ MAIN COLUMN ═══ */}
            <div className="space-y-6">
              {/* ═══ FOUNDATIONAL DECLARATION ═══ */}
              <SectionCard
                label="Foundational Declaration"
                icon={Shield}
              >
                <p className="font-serif text-[14px] leading-relaxed" style={{ color: C.textDark }}>
                  {FOUNDATIONAL_DECLARATION}
                </p>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.borderLight }}>
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                    The Central Drama Is Not
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CENTRAL_DRAMA.map((drama) => (
                      <div key={drama} className="flex items-start gap-2">
                        <span className="text-[10px] mt-0.5" style={{ color: C.gold }}>—</span>
                        <span className="text-[11px] leading-snug" style={{ color: C.textMid }}>{drama}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* ═══ PHILOSOPHICAL SPINE ═══ */}
              <SectionCard
                label="Philosophical Spine"
                icon={Compass}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PHILOSOPHICAL_SPINE.map((pillar) => {
                    const Icon = pillar.icon
                    return (
                      <div key={pillar.title} className="rounded-lg border p-4" style={{ borderColor: C.borderLight }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(194,154,91,0.1)" }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: C.gold }} />
                          </div>
                          <h4 className="font-serif text-[14px]" style={{ color: C.textDark }}>{pillar.title}</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {pillar.principles.map((p) => (
                            <li key={p} className="flex items-start gap-1.5">
                              <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: C.gold }}>·</span>
                              <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>

              {/* ═══ WORLD LAWS ═══ */}
              <SectionCard
                label="The World's Fundamental Laws"
                icon={Scroll}
              >
                <p className="text-[11px] mb-4" style={{ color: C.textMid }}>
                  A scene may use one or two strongly. Never all at once.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORLD_LAWS.map((law) => (
                    <div
                      key={law.n}
                      className="rounded-lg border p-3 transition-all hover:shadow-sm"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="font-serif text-[20px] leading-none flex-shrink-0 mt-0.5"
                          style={{ color: C.gold, opacity: 0.5 }}
                        >
                          {law.n}
                        </span>
                        <div>
                          <h4 className="font-serif text-[12px] leading-tight mb-1" style={{ color: C.textDark }}>
                            {law.title}
                          </h4>
                          <p className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                            {law.short}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ═══ CANON SCENES ═══ */}
              <SectionCard
                label="Canon Scenes"
                icon={Mountain}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CANON_SCENES.map((scene) => (
                    <div
                      key={scene.id}
                      className="rounded-xl border overflow-hidden"
                      style={{ borderColor: C.borderLight }}
                    >
                      <div
                        className="relative h-28 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${C.navy}10, ${C.gold}06)` }}
                      >
                        <span className="font-serif text-[48px] select-none" style={{ color: `${C.navy}08` }}>
                          {scene.id}
                        </span>
                        <div
                          className="absolute bottom-0 left-0 right-0 px-3 py-1.5"
                          style={{ backgroundColor: "rgba(26,35,50,0.9)" }}
                        >
                          <p className="font-serif text-[12px] text-white">Scene {scene.id}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-serif text-[15px] mb-2" style={{ color: C.textDark }}>
                          {scene.title}
                        </h4>
                        <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: C.gold }}>
                          Human Truth
                        </p>
                        <p className="text-[11px] leading-snug mb-3" style={{ color: C.textMid }}>
                          {scene.truth}
                        </p>
                        <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: C.blue }}>
                          Unforgettable Image
                        </p>
                        <p className="text-[11px] leading-snug italic" style={{ color: C.textMid }}>
                          {scene.image}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ═══ VISUAL DNA ═══ */}
              <SectionCard
                label="Visual DNA"
                icon={Palette}
              >
                <p className="text-[11px] mb-4" style={{ color: C.textMid }}>
                  The world&apos;s material, textural, and atmospheric grammar.
                </p>

                {/* Palette */}
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                  Colour Palette
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-5">
                  {VISUAL_DNA.palette.map((sw) => (
                    <div key={sw.name} className="text-center">
                      <div
                        className="w-full aspect-square rounded-md mb-1 border"
                        style={{ backgroundColor: sw.hex, borderColor: C.borderLight }}
                      />
                      <p className="text-[8px] font-medium leading-tight" style={{ color: C.textMid }}>{sw.name}</p>
                    </div>
                  ))}
                </div>

                {/* Materials + Light */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                      Materials
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {VISUAL_DNA.materials.map((mat) => (
                        <span
                          key={mat}
                          className="text-[9px] font-medium px-2 py-1 rounded-full border"
                          style={{ borderColor: C.border, color: C.textMid }}
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: C.textMuted }}>
                      Light
                    </p>
                    <ul className="space-y-1">
                      {VISUAL_DNA.light.map((l) => (
                        <li key={l} className="flex items-start gap-1.5">
                          <Sun className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                          <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* ═══ ARCHETYPES ═══ */}
              <SectionCard
                label="Canonical Roles & Archetypes"
                icon={Users}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ARCHETYPES.map((arch) => {
                    const Icon = arch.icon
                    return (
                      <div
                        key={arch.role}
                        className="rounded-lg border p-3 transition-all hover:shadow-sm"
                        style={{ backgroundColor: C.white, borderColor: C.borderLight }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(47,98,216,0.06)" }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: C.blue }} />
                          </div>
                          <h4 className="font-serif text-[12px]" style={{ color: C.textDark }}>{arch.role}</h4>
                        </div>
                        <p className="text-[10px] leading-snug" style={{ color: C.textMuted }}>{arch.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>

              {/* ═══ SYMBOL SYSTEM ═══ */}
              <SectionCard
                label="Symbol System"
                icon={Sparkles}
              >
                <p className="text-[11px] mb-3" style={{ color: C.textMid }}>
                  Canonical meanings. A symbol must serve its meaning or be removed.
                </p>
                <div className="overflow-hidden rounded-lg border" style={{ borderColor: C.borderLight }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "rgba(138,133,120,0.04)" }}>
                        <th className="text-left text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-2" style={{ color: C.textMuted }}>Symbol</th>
                        <th className="text-left text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-2" style={{ color: C.textMuted }}>Meaning</th>
                        <th className="text-left text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-2 hidden sm:table-cell" style={{ color: C.textMuted }}>Must Never Become</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SYMBOLS.map((sym, i) => (
                        <tr
                          key={sym.sym}
                          className="border-t"
                          style={{ borderColor: i === 0 ? "transparent" : C.borderLight }}
                        >
                          <td className="px-3 py-2">
                            <span className="font-serif text-[12px]" style={{ color: C.textDark }}>{sym.sym}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{sym.meaning}</span>
                          </td>
                          <td className="px-3 py-2 hidden sm:table-cell">
                            <span className="text-[10px] leading-snug italic" style={{ color: C.textMuted }}>{sym.never}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* ═══ SCENE TERRITORIES ═══ */}
              <SectionCard
                label="Scene Territories for Expansion"
                icon={Route}
              >
                <p className="text-[11px] mb-4" style={{ color: C.textMid }}>
                  Worlds waiting to be built. Each holds a human truth.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {SCENE_TERRITORIES.map((territory, i) => (
                    <button
                      key={territory}
                      className="flex items-center gap-2 rounded-lg border p-3 text-left transition-all hover:shadow-sm group"
                      style={{ backgroundColor: C.white, borderColor: C.borderLight }}
                    >
                      <span className="font-serif text-[16px] flex-shrink-0" style={{ color: C.gold, opacity: 0.4 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-medium leading-snug flex-1" style={{ color: C.textDark }}>
                        {territory}
                      </span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.textMuted }} />
                    </button>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* ═══ RIGHT RAIL ═══ */}
            <div className="space-y-4">
              {/* Emotional Promise */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: C.gold }} />
                    <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Emotional Promise</h3>
                  </div>
                </div>
                <p className="font-serif text-[15px] leading-relaxed mb-3" style={{ color: C.textDark }}>
                  Awe with belonging.
                </p>
                <div className="space-y-1.5">
                  {[
                    "Recognition — something understands what I carry",
                    "Curiosity — what are the rules of this place?",
                    "Awe — the world is far larger than I imagined",
                    "Belonging — there is a place for me here",
                    "Agency — there is a meaningful move I can make",
                  ].map((step, i) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="text-[9px] font-bold mt-0.5 flex-shrink-0" style={{ color: C.gold }}>{i + 1}</span>
                      <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scene Approval Test */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4" style={{ color: C.green }} />
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Scene Approval Test</h3>
                </div>
                <p className="text-[10px] leading-relaxed mb-3" style={{ color: C.textMid }}>
                  Every frame must answer YES to all:
                </p>
                <div className="space-y-2">
                  {[
                    "Is a human being seen before being evaluated?",
                    "Is their dignity intact?",
                    "Does the scene tell the truth without making them small?",
                    "Does the character retain the decisive choice?",
                    "Is the guide a revealer rather than a rescuer?",
                  ].map((q) => (
                    <div key={q} className="flex items-start gap-2">
                      <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.green }} />
                      <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Drift Rules */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4" style={{ color: C.textMuted }} />
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Anti-Drift Rules</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Beautiful but cannot state its human truth",
                    "Tai or a guide becomes the savior",
                    "Black identity feels applied, not foundational",
                    "Character exists only to demonstrate a metaphor",
                    "World is epic but emotionally empty",
                    "Every surface glows (spectacle creep)",
                    "Could be published by any consultancy",
                  ].map((rule) => (
                    <div key={rule} className="flex items-start gap-2">
                      <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: "#DC2626" }}>✕</span>
                      <span className="text-[10px] leading-snug" style={{ color: C.textMid }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restraint Directive */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(194,154,91,0.06)", borderColor: C.gold }}>
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="w-4 h-4" style={{ color: C.gold }} />
                  <h3 className="font-serif text-sm" style={{ color: C.textDark }}>Restraint</h3>
                </div>
                <p className="font-serif italic text-[12px] leading-relaxed" style={{ color: C.textMid }}>
                  Remove one-third of the magic. The world is more powerful when it is legible, textured, and lived-in than when every surface glows.
                </p>
              </div>

              {/* Quote Block */}
              <div className="rounded-xl p-4 relative overflow-hidden" style={{ backgroundColor: C.navy }}>
                <span className="font-serif absolute top-0 left-3" style={{ fontSize: "48px", color: C.gold, lineHeight: 1, opacity: 0.5 }}>
                  &ldquo;
                </span>
                <p className="font-serif italic text-[13px] leading-relaxed pl-6 pt-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Is the world larger because this scene exists — or did we merely add another beautiful image?
                </p>
                <p className="text-[9px] font-bold tracking-[0.1em] uppercase mt-3 pl-6" style={{ color: C.gold }}>
                  Final Governing Standard
                </p>
              </div>

              {/* Canonical Document Link */}
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: C.white, borderColor: C.borderLight }}
              >
                <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: C.gold }}>
                  Canonical Document
                </p>
                <p className="font-serif text-[13px] mb-1" style={{ color: C.textDark }}>
                  WORLD_BIBLE.md v1.0
                </p>
                <p className="text-[10px] leading-relaxed mb-3" style={{ color: C.textMid }}>
                  The foundational creative canon governing every frame.
                </p>
                <Link
                  href="/world-bible"
                  className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
                  style={{ color: C.blue }}
                >
                  Open full document
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionCard({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: C.white, borderColor: C.borderLight }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(194,154,91,0.08)" }}>
          <Icon className="w-4 h-4" style={{ color: C.gold }} />
        </div>
        <h3 className="font-serif text-[16px]" style={{ color: C.textDark }}>{label}</h3>
      </div>
      {children}
    </div>
  )
}
