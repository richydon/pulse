"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOpenBounties } from "@/lib/arkiv/queries";
import { CURRENT_COHORT } from "@/lib/arkiv/constants";
import { formatUSD, formatCountdown, truncateHex, parseEntityPayload } from "@/lib/utils/format";
import { Briefcase, Plus, Clock } from "lucide-react";
import { usePulseAuth } from "@/hooks/usePulseAuth";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function BountiesPage() {
  const { authenticated } = usePulseAuth();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOpenBounties({ cohort: CURRENT_COHORT })
      .then((b) => setBounties(b as any[]))
      .catch((err) => console.error("[Bounties] query failed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">
              Bounties
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Open tasks with on-chain rewards</p>
          </div>
          {authenticated && (
            <Link href="/bounties/new" className="btn-ns flex items-center gap-2 text-sm px-4 py-2">
              <Plus className="w-4 h-4" /> Post Bounty
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[#9CA3AF]">Loading bounties...</p>
        ) : bounties.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open bounties"
            description="Check back soon — new bounties are posted daily."
          />
        ) : (
          <div className="space-y-4">
            {bounties.map((b) => {
              const a = attrs(b);
              const payload = parseEntityPayload(b);
              return (
                <Link
                  key={b.key}
                  href={`/bounties/${b.key}`}
                  className="card-ns block hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {a.pillar && <PillarBadge pillar={a.pillar} size="sm" />}
                        <span className="text-xs text-[#9CA3AF]">
                          by {truncateHex(a.postedBy ?? "", 6, 4)}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-[#111827]">{payload.title}</p>
                      {payload.description && (
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{payload.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                          <Clock className="w-3.5 h-3.5" />
                          {a.deadline ? formatCountdown(a.deadline) : "No deadline"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-[#10B981]">
                        {formatUSD(a.rewardUSD ?? 0)}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{payload.rewardToken ?? "USDC"}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
