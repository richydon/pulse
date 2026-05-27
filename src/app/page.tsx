"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { PillarsSection } from "@/components/landing/PillarsSection";
import { CTASection } from "@/components/landing/CTASection";
import { getAllPulseEntities } from "@/lib/arkiv/queries";

export default function LandingPage() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllPulseEntities().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <TopBar />
      <HeroSection />
      <StatsSection stats={stats} />
      <PillarsSection />
      <CTASection />

      <footer className="border-t border-[#E5E7EB] py-6 text-center text-xs text-[#9CA3AF] bg-white">
        Pulse · ETHns × Arkiv Challenge 2026 · Built on Arkiv Braga Testnet ·{" "}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#6B7280] transition-colors"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
