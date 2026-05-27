"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { getLeaderboard, getAllPulseEntities } from "@/lib/arkiv/queries";
import { aggregateLeaderboard } from "@/lib/points/calculator";
import { CURRENT_COHORT, PILLAR_COLORS } from "@/lib/arkiv/constants";
import { truncateHex } from "@/lib/utils/format";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { Trophy, GraduationCap, Flame, Bitcoin, PartyPopper, Zap } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

const TIME_RANGES = [
  { label: "All Time", value: 0 },
  { label: "This Month", value: 30 },
  { label: "This Week", value: 7 },
];

const PILLARS = [
  { key: "overall", label: "Overall", icon: Trophy },
  { key: "learn",   label: "Learn",   icon: GraduationCap },
  { key: "burn",    label: "Burn",    icon: Flame },
  { key: "earn",    label: "Earn",    icon: Bitcoin },
  { key: "fun",     label: "Fun",     icon: PartyPopper },
];

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = usePulseAuth();

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePillar, setActivePillar] = useState(
    () => searchParams.get("pillar") ?? "overall"
  );
  const [timeRange, setTimeRange] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Sync pillar state when URL changes (back/forward navigation)
  useEffect(() => {
    const pillarFromUrl = searchParams.get("pillar") ?? "overall";
    if (pillarFromUrl !== activePillar) {
      setActivePillar(pillarFromUrl);
      setLoading(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const fromTs = timeRange > 0 ? Date.now() - timeRange * 86400000 : undefined;
    const pillar = activePillar !== "overall" ? activePillar : undefined;
    Promise.all([
      getLeaderboard({ cohort: CURRENT_COHORT, pillar, fromTs, limit: 200 }),
      getAllPulseEntities().catch(() => ({})),
    ])
      .then(([raw, s]) => {
        setEntries(aggregateLeaderboard((raw as any[]).map(attrs)));
        setStats(s as Record<string, number>);
      })
      .catch((err) => console.error("[Leaderboard] query failed:", err))
      .finally(() => setLoading(false));
  }, [activePillar, timeRange]);

  const totalPoints = entries.reduce((s, e) => s + e.total, 0);

  const selectPillar = (key: string) => {
    setActivePillar(key);
    setLoading(true);
    router.push(key === "overall" ? "/leaderboard" : `/leaderboard?pillar=${key}`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">
              Leaderboard
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Community rankings for {CURRENT_COHORT}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#FFFBEB] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-[#F59E0B]" />
          </div>
        </div>

        {/* Live stats — 2×2 on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Zap,          label: "Contributions",  value: stats.contribution ?? 0,        color: "#2563EB" },
            { icon: GraduationCap,label: "Members",        value: entries.length,                  color: "#3B82F6" },
            { icon: Flame,        label: "Active Streaks", value: stats.streak ?? 0,              color: "#F97316" },
            { icon: Trophy,       label: "Total Points",   value: totalPoints.toLocaleString(),   color: "#F59E0B" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card-ns text-center py-4">
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                <p className="text-lg font-bold text-[#111827]">{s.value}</p>
                <p className="text-xs text-[#9CA3AF]">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PILLARS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => selectPillar(key)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                activePillar === key
                  ? "bg-[#111827] text-white border-[#111827]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {TIME_RANGES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTimeRange(t.value); setLoading(true); }}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  timeRange === t.value ? "bg-[#F3F4F6] text-[#111827] font-medium" : "text-[#9CA3AF] hover:text-[#6B7280]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-sm text-[#9CA3AF] py-8 text-center">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-medium text-[#6B7280]">No validated contributions yet.</p>
            <p className="text-xs text-[#9CA3AF]">Contributions need 2 peer validations to appear here. Visit <a href="/contribute/validate" className="text-[#2563EB] hover:underline">Validate</a> to review pending submissions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isMe = entry.wallet?.toLowerCase() === address?.toLowerCase();
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              return (
                <Link
                  key={entry.wallet}
                  href={`/profile/${entry.wallet}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                    isMe ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="w-8 text-center text-sm">
                    {medal ?? <span className="text-[#9CA3AF] font-mono">{i + 1}</span>}
                  </div>
                  <Avatar wallet={entry.wallet} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] font-mono truncate">
                      {truncateHex(entry.wallet, 8, 6)}
                      {isMe && <span className="ml-2 text-xs text-[#2563EB]">(you)</span>}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {(["learn", "burn", "earn", "fun"] as const).map((p) =>
                        entry[p] > 0 ? (
                          <div
                            key={p}
                            className="h-1 rounded-full"
                            style={{
                              width: `${Math.max(4, (entry[p] / (entry.total || 1)) * 60)}px`,
                              backgroundColor: PILLAR_COLORS[p],
                            }}
                            title={`${p}: ${entry[p]} pts`}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-[#111827]">{entry.total.toLocaleString()}</p>
                    <p className="text-xs text-[#9CA3AF]">pts</p>
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

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-8 text-center text-sm text-[#9CA3AF]">Loading...</div>
        </AppShell>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
