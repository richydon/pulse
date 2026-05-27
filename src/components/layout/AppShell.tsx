"use client";

import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 pt-14">
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {children}
        </main>
        <Sidebar />
      </div>
      <BottomNav />
    </div>
  );
}
