"use client";

import Link from "next/link";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { truncateHex } from "@/lib/utils/format";
import { LogOut, User } from "lucide-react";

export function TopBar() {
  const { authenticated, address, login, logout, ready } = usePulseAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-[#111827] text-lg tracking-tight">
          <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          pulse
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {ready && (
          <>
            {authenticated && address ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/profile/${address}`}
                  className="flex items-center gap-2 text-sm text-[#111827] font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
                    <User className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <span className="hidden sm:block">{truncateHex(address)}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => login()} className="btn-ns text-sm px-4 py-2">
                Connect
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
