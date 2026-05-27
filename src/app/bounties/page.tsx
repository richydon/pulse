"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOpenBounties } from "@/lib/arkiv/queries";
import { CURRENT_COHORT } from "@/lib/arkiv/constants";
import { formatUSD, formatCountdown, formatRelativeDate, truncateHex, parseEntityPayload } from "@/lib/utils/format";
import { Briefcase, Plus, Clock, Trophy, Users } from "lucide-react";
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
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">Bounties</h1>
            <p className="text-sm text-[#6B7280] mt-1">Open tasks with on-chain rewards</p>
          </div>
          {authenticated && (
            <Link href="/bounties/new" className="btn-ns flex items-center gap-2 text-sm px-4 py-2">
              <Plus className="w-4 h-4" /> Post Bounty
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[#F3F4F6] bg-white p-4 flex gap-4 animate-pulse">
                <div className="w-32 h-32 shrink-0 rounded-lg bg-[#F3F4F6]" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#F3F4F6] rounded w-1/2" />
                  <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
                  <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
                  <div className="h-3 bg-[#F3F4F6] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : bounties.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open bounties"
            description="Check back soon — new bounties are posted daily."
          />
        ) : (
          <div className="space-y-3">
            {bounties.map((b) => {
              const a = attrs(b);
              const payload = parseEntityPayload(b);
              const imageUrl = payload.imageUrl as string | undefined;
              const timeLeft = a.deadline ? formatCountdown(a.deadline) : null;
              const isExpiringSoon = a.deadline && (a.deadline - Date.now() / 1000) < 86400 * 2;

              return (
                <Link
                  key={b.key}
                  href={`/bounties/${b.key}`}
                  className="group flex gap-4 bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-150"
                >
                  {/* Thumbnail */}
                  <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-[#F3F4F6] flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={payload.title as string}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Briefcase className="w-9 h-9 text-[#D1D5DB]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Title */}
                    <h3 className="text-base font-bold text-[#111827] mb-1 truncate group-hover:text-[#0D9488] transition-colors">
                      {payload.title as string}
                    </h3>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mb-2">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {formatUSD(a.rewardUSD ?? 0)} reward
                      </span>
                      {a.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Posted {formatRelativeDate(a.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {payload.description && (
                      <p className="text-sm text-[#6B7280] line-clamp-2 mb-2 flex-1 leading-snug">
                        {payload.description as string}
                      </p>
                    )}

                    {/* Tag pills */}
                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      {a.pillar && <PillarBadge pillar={a.pillar} size="sm" />}
                      {payload.rewardToken && (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-[#E5E7EB] text-[#6B7280] bg-white">
                          {payload.rewardToken as string}
                        </span>
                      )}
                      {a.cohort && (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-[#E5E7EB] text-[#6B7280] bg-white">
                          {a.cohort}
                        </span>
                      )}
                    </div>

                    {/* Divider + bottom row */}
                    <div className="border-t border-[#F3F4F6] pt-2 flex items-center gap-4">
                      <span className="text-base font-black text-[#10B981]">
                        {formatUSD(a.rewardUSD ?? 0)}
                      </span>
                      {timeLeft && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isExpiringSoon ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>
                          <Clock className="w-3 h-3" />
                          {timeLeft} left
                        </span>
                      )}
                      <span className="ml-auto text-xs text-[#9CA3AF]">
                        by{" "}
                        <span className="font-mono text-[#0D9488]">
                          {truncateHex(a.postedBy ?? "", 6, 4)}
                        </span>
                      </span>
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
