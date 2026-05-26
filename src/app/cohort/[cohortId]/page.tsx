"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import {
  Users,
  TrendingUp,
  Flame,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getCohortStats } from "@/lib/arkiv/queries";
import { aggregateLeaderboard, aggregatePointsByPillar } from "@/lib/points/calculator";
import { COHORTS, PILLAR_COLORS, CURRENT_COHORT } from "@/lib/arkiv/constants";
import { truncateHex, formatPoints } from "@/lib/utils/format";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function attrs(e: any): Record<string, any> {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

type Stats = {
  contributions: any[];
  passports: any[];
  streaks: any[];
  bounties: any[];
};

export default function CohortPage(props: { params: Promise<{ cohortId: string }> }) {
  const { authenticated } = usePulseAuth();
  const [cohortId, setCohortId] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.params.then(({ cohortId: id }) => {
      setCohortId(id);
      getCohortStats(id)
        .then((s) => setStats(s as any))
        .catch(() => setStats({ contributions: [], passports: [], streaks: [], bounties: [] }))
        .finally(() => setLoading(false));
    });
  }, [props.params]);

  const cohortLabel = COHORTS.find((c) => c.id === cohortId)?.label ?? cohortId;

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Users className="w-10 h-10 text-[#9CA3AF] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827] mb-2">Cohort Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Connect your wallet to access cohort analytics.</p>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div className="h-8 w-64 bg-[#F3F4F6] rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#F3F4F6] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const contributions = stats?.contributions ?? [];
  const passports = stats?.passports ?? [];
  const streaks = stats?.streaks ?? [];
  const bounties = stats?.bounties ?? [];

  const contribAttrs = contributions.map(attrs);
  const leaderboard = aggregateLeaderboard(contribAttrs as any).slice(0, 10);

  // Pillar distribution
  const allPillarPoints = aggregatePointsByPillar(contribAttrs);
  const pillarData = [
    { name: "Learn", value: allPillarPoints.learn, color: PILLAR_COLORS.learn },
    { name: "Burn", value: allPillarPoints.burn, color: PILLAR_COLORS.burn },
    { name: "Earn", value: allPillarPoints.earn, color: PILLAR_COLORS.earn },
    { name: "Fun", value: allPillarPoints.fun, color: PILLAR_COLORS.fun },
  ];
  const totalPts = pillarData.reduce((s, d) => s + d.value, 0);

  // Radar data
  const radarData = pillarData.map((d) => ({
    pillar: d.name,
    points: d.value,
  }));

  // Active streaks
  const activeStreakCount = streaks.length;
  const avgStreak =
    streaks.length > 0
      ? Math.round(
          streaks.reduce((s, e) => s + (Number(attrs(e).currentCount) || 0), 0) / streaks.length
        )
      : 0;

  // Pending validations count
  const pendingCount = contributions.filter((c) => attrs(c).status === "pending").length;

  // Member wallets from passports
  const memberWallets = [...new Set(passports.map((p: any) => attrs(p as any).memberWallet as string))];

  // At-risk: members with 0 learn points in last 14 days (heuristic)
  const activeMemberCount = leaderboard.length;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Cohort Dashboard</p>
          <h1 className="text-2xl font-bold text-[#111827]">{cohortLabel}</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Real-time analytics from Arkiv Braga testnet
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Active Members",
              value: activeMemberCount,
              icon: <Users className="w-4 h-4 text-[#2563EB]" />,
              bg: "#EFF6FF",
              color: "#1D4ED8",
            },
            {
              label: "Total Points",
              value: formatPoints(totalPts),
              icon: <TrendingUp className="w-4 h-4 text-[#10B981]" />,
              bg: "#ECFDF5",
              color: "#059669",
            },
            {
              label: "Active Streaks",
              value: activeStreakCount,
              icon: <Flame className="w-4 h-4 text-[#F97316]" />,
              bg: "#FFF7ED",
              color: "#EA580C",
            },
            {
              label: "Open Bounties",
              value: bounties.length,
              icon: <Award className="w-4 h-4 text-[#8B5CF6]" />,
              bg: "#F5F3FF",
              color: "#7C3AED",
            },
          ].map((card) => (
            <div key={card.label} className="card-ns p-4" style={{ background: card.bg }}>
              <div className="flex items-center gap-2 mb-2">{card.icon}</div>
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-[#6B7280]">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-ns p-4 text-center">
            <p className="text-2xl font-bold text-[#111827]">{contributions.length}</p>
            <p className="text-xs text-[#9CA3AF]">Total Contributions</p>
          </div>
          <div className="card-ns p-4 text-center">
            <p className="text-2xl font-bold text-[#111827]">{avgStreak}</p>
            <p className="text-xs text-[#9CA3AF]">Avg. Active Streak (days)</p>
          </div>
          <div className="card-ns p-4 text-center">
            <p className="text-2xl font-bold text-[#F59E0B]">{pendingCount}</p>
            <p className="text-xs text-[#9CA3AF]">Pending Validations</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Pillar Distribution */}
          <div className="col-span-2 card-ns p-5">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Pillar Distribution</h2>
            {totalPts === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-[#9CA3AF]">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pillarData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }: any) =>
                      (percent ?? 0) > 0.05 ? `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%` : ""
                    }
                    labelLine={false}
                    fontSize={10}
                  >
                    {pillarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [formatPoints(Number(v)) + " pts", ""]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5 mt-2">
              {pillarData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-[#6B7280]">{d.name}</span>
                  </div>
                  <span className="font-medium text-[#111827]">{formatPoints(d.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar chart */}
          <div className="col-span-3 card-ns p-5">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Cohort Radar</h2>
            {totalPts === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-[#9CA3AF]">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Radar
                    name="Points"
                    dataKey="points"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(v: any) => [formatPoints(Number(v)) + " pts", "Points"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Members leaderboard */}
        <div className="card-ns overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-semibold text-[#111827]">Top Members</h2>
            <p className="text-xs text-[#9CA3AF]">By validated contribution points</p>
          </div>
          {leaderboard.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-[#9CA3AF]">
              No validated contributions yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {leaderboard.map((entry: any, i) => (
                <div key={entry.wallet} className="px-5 py-3 flex items-center gap-4">
                  <span
                    className={`w-6 text-center text-xs font-bold ${
                      i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#9CA3AF]" : i === 2 ? "text-[#CD7C2F]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-[#111827] truncate">
                      {truncateHex(entry.wallet, 10)}
                    </p>
                    <div className="flex gap-2 mt-0.5">
                      {(["learn", "burn", "earn", "fun"] as const).map((p) => (
                        <span key={p} className="text-xs text-[#9CA3AF]">
                          {p[0].toUpperCase()}: {entry.pillars[p] ?? 0}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#111827]">{formatPoints(entry.total)}</p>
                    <p className="text-xs text-[#9CA3AF]">pts</p>
                  </div>
                  <a
                    href={`/profile/${entry.wallet}`}
                    className="text-xs text-[#2563EB] hover:underline shrink-0"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending validation alert */}
        {pendingCount > 0 && (
          <div className="card-ns p-4 bg-[#FFFBEB] border-[#FDE68A] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#92400E]">
                {pendingCount} contribution{pendingCount > 1 ? "s" : ""} awaiting peer validation
              </p>
              <p className="text-xs text-[#92400E] mt-0.5">
                Each contribution needs 2 peer approvals to become validated.
              </p>
              <a href="/contribute/validate" className="text-xs text-[#D97706] font-medium hover:underline mt-1 inline-block">
                Go to Validation Queue →
              </a>
            </div>
          </div>
        )}

        {/* Validation summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-ns p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
              <p className="text-sm font-semibold text-[#111827]">Validated</p>
            </div>
            <p className="text-2xl font-bold text-[#10B981]">
              {contribAttrs.filter((a) => a.status === "validated").length}
            </p>
            <p className="text-xs text-[#9CA3AF]">contributions with 2+ peer approvals</p>
          </div>
          <div className="card-ns p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-sm font-semibold text-[#111827]">Pending</p>
            </div>
            <p className="text-2xl font-bold text-[#F59E0B]">{pendingCount}</p>
            <p className="text-xs text-[#9CA3AF]">waiting for peer validation</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
