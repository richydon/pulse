"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { truncateHex } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";

export function TopBar() {
  const { authenticated, address, login, logout, ready } = usePulseAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Hero is white — nav always uses dark text; scrolled state adds the bg */
  const onDark = false;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[#E5E7EB]"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300"
            style={{
              background: onDark
                ? "linear-gradient(135deg, #2563EB, #7C3AED)"
                : "#111827",
            }}
          >
            <span className="text-white text-xs font-black tracking-tighter">P</span>
          </div>
          <span
            className="font-black text-lg tracking-tighter transition-colors duration-300"
            style={{ color: onDark ? "#FFFFFF" : "#111827" }}
          >
            Pulse
            <span className="text-[#3B82F6] ml-0.5">.</span>
          </span>
        </Link>
      </div>

      {/* Right nav */}
      <div className="ml-auto flex items-center gap-3">
        {ready && (
          <>
            {authenticated && address ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: onDark ? "#9CA3AF" : "#6B7280" }}
                >
                  Dashboard
                </Link>
                <Link
                  href={`/profile/${address}`}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Avatar wallet={address} size={28} />
                  <span
                    className="hidden sm:block text-xs transition-colors duration-300"
                    style={{ color: onDark ? "#9CA3AF" : "#6B7280" }}
                  >
                    {truncateHex(address)}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="transition-colors duration-300"
                  style={{ color: onDark ? "#6B7280" : "#9CA3AF" }}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="text-sm font-bold rounded-full px-4 py-1.5 transition-all duration-200"
                style={
                  onDark
                    ? {
                        color: "#FFFFFF",
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.07)",
                        backdropFilter: "blur(8px)",
                      }
                    : {
                        color: "#2563EB",
                        border: "2px solid #2563EB",
                        background: "transparent",
                      }
                }
              >
                Connect
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
