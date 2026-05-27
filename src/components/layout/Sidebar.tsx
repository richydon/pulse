"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Home, User, GraduationCap, Flame, Bitcoin, PartyPopper,
  Trophy, Briefcase, ShieldCheck, Settings, ExternalLink,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  pillar?: string;
} | null;

const nav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  null,
  { href: "/leaderboard?pillar=learn", label: "Learn", icon: GraduationCap, pillar: "learn" },
  { href: "/leaderboard?pillar=burn",  label: "Burn",  icon: Flame,          pillar: "burn"  },
  { href: "/leaderboard?pillar=earn",  label: "Earn",  icon: Bitcoin,         pillar: "earn"  },
  { href: "/leaderboard?pillar=fun",   label: "Fun",   icon: PartyPopper,     pillar: "fun"   },
  null,
  { href: "/bounties",  label: "Bounties", icon: Briefcase   },
  { href: "/verify",    label: "Verify",   icon: ShieldCheck },
  { href: "/settings",  label: "Settings", icon: Settings    },
];

function itemIsActive(
  item: NonNullable<NavItem>,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>
): boolean {
  if (item.pillar) {
    return pathname === "/leaderboard" && searchParams.get("pillar") === item.pillar;
  }
  if (item.href === "/leaderboard") {
    return pathname === "/leaderboard" && !searchParams.get("pillar");
  }
  if (item.href === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profile/");
  }
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {nav.map((item, i) => {
        if (!item) {
          return <div key={i} className="my-1.5 border-t border-[#E5E7EB]" />;
        }
        const Icon = item.icon;
        const active = itemIsActive(item, pathname, searchParams);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${active ? "text-[#2563EB]" : "text-[#9CA3AF]"}`}
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
          { label: "Arkiv Explorer", href: "https://explorer.braga.hoodi.arkiv.network" },
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
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:block w-52 shrink-0 bg-[#F8F9FA] border-l border-[#E5E7EB] h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto py-3">
      <Suspense fallback={null}>
        <SidebarNav />
      </Suspense>
    </aside>
  );
}
