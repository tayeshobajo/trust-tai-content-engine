"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-h-screen md:ml-[220px] min-w-0">
        {/* Mobile top bar */}
        <header
          className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-gray-200"
          style={{ backgroundColor: "#0A0E1A" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-semibold">Trust Tai Studio</span>
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
