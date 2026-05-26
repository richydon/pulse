"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, User, GraduationCap, Flame, Bitcoin, PartyPopper,
  Trophy, Briefcase, ShieldCheck, Settings, ExternalLink,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  null,
  { href: "/leaderboard/learn", label: "Learn", icon: GraduationCap },
  { href: "/leaderboard/burn", label: "Burn", icon: Flame },
  { href: "/leaderboard/earn", label: "Earn", icon: Bitcoin },
  { href: "/leaderboard/fun", label: "Fun", icon: PartyPopper },
  null,
  { href: "/bounties", label: "Bounties", icon: Briefcase },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-52 shrink-0 bg-[#F8F9FA] border-l border-[#E5E7EB] h-full sticky top-14 overflow-y-auto py-3">
      <nav className="flex flex-col gap-0.5 px-2">
        {nav.map((item, i) => {
          if (!item) {
            return <div key={i} className="my-1.5 border-t border-[#E5E7EB]" />;
          }
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                  : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"}`}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
          <p className="px-3 py-1 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">
            NS Links
          </p>
          {[
            { label: "ns.com", href: "https://ns.com" },
            { label: "Arkiv Explorer", href: "https://explorer.braga.arkiv.network" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF]" />
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
