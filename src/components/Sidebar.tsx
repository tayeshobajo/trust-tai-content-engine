"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductions, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store";
import { nextGate } from "@/data/studio";
import {
  Clapperboard,
  Layers,
  Lightbulb,
  Globe,
  Users,
  MapPin,
  Package,
  Brain,
  ShieldCheck,
  TrendingUp,
  Settings,
  Search,
  Bell,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: "decisions";
}

// Spec nav: Studio | Productions | Ideas | World | Signals
const navItems: NavItem[] = [
  { label: "Studio", href: "/", icon: Clapperboard },
  { label: "Productions", href: "/productions", icon: Layers, badgeKey: "decisions" },
  { label: "Ideas", href: "/ideas", icon: Lightbulb },
  { label: "World", href: "/world", icon: Globe },
  { label: "Characters", href: "/characters", icon: Users },
  { label: "Places", href: "/places", icon: MapPin },
  { label: "Props", href: "/props", icon: Package },
  { label: "Memory", href: "/memory", icon: Brain },
  { label: "QA", href: "/qa", icon: ShieldCheck },
  { label: "Signals", href: "/signals", icon: TrendingUp },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [decisionCount, setDecisionCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const p = getProductions();
      setDecisionCount(p.filter((prod) => nextGate(prod) !== null).length);
    };
    load();
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, load);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[140px] flex flex-col z-50 transform transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0D1626" }}
      >
        {/* Wordmark */}
        <div className="px-5 pt-6 pb-5">
          <p
            className="font-serif text-white leading-none"
            style={{ fontSize: "15px", letterSpacing: "-0.01em" }}
          >
            Trust Tai
          </p>
          <p
            className="text-[9px] font-bold tracking-[0.2em] uppercase mt-[3px]"
            style={{ color: "#C29A5B" }}
          >
            Studio
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden absolute top-4 right-4 p-1 text-white/50 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Primary Nav */}
        <nav className="flex-1 px-2 pt-2 space-y-[2px] overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showBadge = item.badgeKey === "decisions" && decisionCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs transition-colors relative"
                style={{
                  backgroundColor: active ? "#1A2740" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(212,208,200,0.65)",
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                    style={{ backgroundColor: "#C29A5B" }}
                  />
                )}
                <Icon
                  className="w-[14px] h-[14px] flex-shrink-0"
                  style={{ color: active ? "#FFFFFF" : "rgba(212,208,200,0.5)" }}
                />
                <span className="flex-1 truncate font-medium leading-tight">{item.label}</span>
                {showBadge && (
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#2F62D8", color: "#FFFFFF" }}
                  >
                    {decisionCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 mt-2">
          <div className="mx-3 border-t mb-2" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

          {/* Legacy nav (collapsed) — old routes still accessible */}
          <details className="mb-1">
            <summary
              className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] cursor-pointer"
              style={{ color: "rgba(212,208,200,0.3)" }}
            >
              More
            </summary>
            <div className="px-3 py-1 space-y-1">
              <Link
                href="/approvals"
                onClick={onClose}
                className="block text-[10px] py-0.5"
                style={{ color: "rgba(212,208,200,0.4)" }}
              >
                Approval Desk
              </Link>
              <Link
                href="/thinking-room"
                onClick={onClose}
                className="block text-[10px] py-0.5"
                style={{ color: "rgba(212,208,200,0.4)" }}
              >
                Thinking Room
              </Link>
              <Link
                href="/film-studio"
                onClick={onClose}
                className="block text-[10px] py-0.5"
                style={{ color: "rgba(212,208,200,0.4)" }}
              >
                Film Studio
              </Link>
              <Link
                href="/library"
                onClick={onClose}
                className="block text-[10px] py-0.5"
                style={{ color: "rgba(212,208,200,0.4)" }}
              >
                Library
              </Link>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="block text-[10px] py-0.5"
                style={{ color: "rgba(212,208,200,0.4)" }}
              >
                Old Dashboard
              </Link>
            </div>
          </details>

          {[
            { href: "/search", icon: Search, label: "Search" },
            { href: "/notifications", icon: Bell, label: "Notifications" },
            { href: "/settings", icon: Settings, label: "Settings" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs transition-colors"
              style={{
                backgroundColor: pathname === href ? "#1A2740" : "transparent",
                color: pathname === href ? "#FFFFFF" : "rgba(212,208,200,0.5)",
              }}
            >
              <Icon className="w-[14px] h-[14px] flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}

          {/* User row */}
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ border: "1.5px solid #C29A5B", color: "#C29A5B" }}
            >
              TS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">Tai Shobajo</p>
              <p className="text-[10px] truncate leading-tight" style={{ color: "rgba(212,208,200,0.4)" }}>
                Founder
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
