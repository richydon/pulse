"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Trophy, Plus, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/contribute/new", label: "Log", icon: Plus, primary: true },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/settings", label: "More", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E7EB] flex items-center justify-around h-16 px-2 safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-[#111827] text-white -mt-4 shadow-md"
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 ${
              isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
