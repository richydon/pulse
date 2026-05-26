"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { NS_LOCATIONS, type LocationId } from "@/lib/arkiv/constants";
import { QrCode, MapPin } from "lucide-react";

export default function CheckinPage() {
  const { authenticated, login } = usePulseAuth();

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <h1 className="text-xl font-bold text-[#111827] mb-4">Connect to check in</h1>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Check In
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">Select a location or scan the QR code at the venue.</p>

        <div className="space-y-3">
          {(Object.entries(NS_LOCATIONS) as [LocationId, (typeof NS_LOCATIONS)[LocationId]][]).map(
            ([id, loc]) => (
              <Link
                key={id}
                href={`/checkin/${id}`}
                className="card-ns flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#F97316]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111827]">{loc.name}</p>
                  <p className="text-xs text-[#6B7280] capitalize">{loc.pillar} · +{loc.points} pts</p>
                </div>
                <QrCode className="w-5 h-5 text-[#9CA3AF]" />
              </Link>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
