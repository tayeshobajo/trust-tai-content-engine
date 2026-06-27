"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Megaphone,
  Map,
  TrendingUp,
  CheckSquare,
  FolderOpen,
  Sparkles,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Content Map", href: "/content-map", icon: Map },
  { label: "Growth", href: "/growth", icon: TrendingUp },
  { label: "Approvals", href: "/approvals", icon: CheckSquare, badge: 4 },
  { label: "Assets", href: "/assets", icon: FolderOpen },
  { label: "Agent", href: "/agent", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[220px] flex flex-col z-40"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">CE</span>
        </div>
        <span className="text-white font-semibold text-sm leading-tight">
          Content Engine
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 mt-3 space-y-2">
        <div className="mx-1 border-t border-white/10 mb-3" />

        {/* Workspace card */}
        <div className="px-3 py-2.5 rounded-lg bg-white/5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
            Workspace
          </p>
          <p className="text-white text-sm font-medium truncate">Trust Tai</p>
          <p className="text-white/50 text-xs">Business</p>
        </div>

        {/* User card */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Tai</p>
            <p className="text-white/40 text-xs truncate">Founder</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
