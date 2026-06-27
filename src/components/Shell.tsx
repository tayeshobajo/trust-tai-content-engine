"use client";
import Sidebar from "@/components/Sidebar";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <Sidebar />
      <main className="ml-[220px] flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
