"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductions, openDecisionCount, PRODUCTIONS_CHANGED_EVENT } from "@/lib/studio-store";
import {
  LayoutDashboard,
  Lightbulb,
  Stamp,
  Clapperboard,
  BookOpen,
  Settings,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { label: "Thinking Room", href: "/thinking-room", icon: Lightbulb },
  { label: "Approval Desk", href: "/approvals", icon: Stamp },
  { label: "Film Studio", href: "/film-studio", icon: Clapperboard },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [decisionsBadge, setDecisionsBadge] = useState(0);

  useEffect(() => {
    const loadCount = () => {
      setDecisionsBadge(openDecisionCount(getProductions()));
    };
    loadCount();
    window.addEventListener(PRODUCTIONS_CHANGED_EVENT, loadCount);
    const handleVisibility = () => {
      if (!document.hidden) loadCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener(PRODUCTIONS_CHANGED_EVENT, loadCount);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-[220px] flex flex-col z-50 transform transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0A0E1A" }}
      >
        {/* Wordmark */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">TT</span>
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-white font-semibold text-sm truncate">Trust Tai</p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider">Studio</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 text-white/60 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mx-4 border-t border-white/10 mb-3" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const badge =
              item.href === "/approvals" && decisionsBadge > 0
                ? decisionsBadge
                : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {badge !== undefined && (
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 mt-3 space-y-2">
          <div className="mx-1 border-t border-white/10 mb-3" />

          <div className="px-3 py-2.5 rounded-lg bg-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
              Production house
            </p>
            <p className="text-white text-sm font-medium truncate">Trust Tai Studio</p>
            <p className="text-white/50 text-xs">Five gates. No auto-publish.</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">Tai</p>
              <p className="text-white/40 text-xs truncate">Founder and final approver</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
