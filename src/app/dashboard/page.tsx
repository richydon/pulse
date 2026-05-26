"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import {
  getContributionsByWallet, getEndorsementsForWallet,
  getActiveStreak, getPassport, getPendingValidationQueue, getLeaderboard,
} from "@/lib/arkiv/queries";
import { aggregatePointsByPillar, totalPoints, aggregateLeaderboard } from "@/lib/points/calculator";
import { PILLAR_COLORS, CURRENT_COHORT } from "@/lib/arkiv/constants";
import { formatRelativeDate, formatDate, truncateHex, parseEntityPayload } from "@/lib/utils/format";
import {
  Plus, CheckSquare, QrCode, Heart, Flame, GraduationCap, Bitcoin,
  PartyPopper, Trophy, ArrowRight, Lock,
} from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function DashboardPage() {
  const { authenticated, address, login, ready } = usePulseAuth();
  const [contributions, setContributions] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      getContributionsByWallet(address).catch(() => []),
      getEndorsementsForWallet(address).catch(() => []),
      getActiveStreak(address).catch(() => null),
      getPassport(address).catch(() => null),
      getPendingValidationQueue(CURRENT_COHORT).catch(() => []),
      getLeaderboard({ cohort: CURRENT_COHORT, limit: 20 }).catch(() => []),
    ]).then(([c, e, s, p, pq, lb]) => {
      setContributions(c);
      setEndorsements(e);
      setStreak(s);
      setPassport(p);
      setPendingCount((pq as any[]).length);
      setLeaderboard(aggregateLeaderboard((lb as any[]).map(attrs)));
      setLoading(false);
    });
  }, [address]);

  if (ready && !authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <h1 className="text-xl font-bold text-[#111827] mb-2">Connect your wallet</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            Sign in to view your dashboard and log contributions.
          </p>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">
            Connect Wallet
          </button>
        </div>
      </AppShell>
    );
  }

  const contribAttrs = contributions.map(attrs);
  const pillarBreakdown = aggregatePointsByPillar(contribAttrs);
  const total = totalPoints(contribAttrs);
  const myRank = leaderboard.findIndex((l) => l.wallet?.toLowerCase() === address?.toLowerCase()) + 1;
  const streakAttrs = streak ? attrs(streak) : null;
  const currentStreak = streakAttrs?.currentCount ?? 0;
  const passportPayload = parseEntityPayload(passport);

  const recentActivity = [...contributions]
    .sort((a, b) => (attrs(b).createdAt ?? 0) - (attrs(a).createdAt ?? 0))
    .slice(0, 8);

  const weekAgo = Date.now() - 7 * 86400000;
  const endorsementsThisWeek = endorsements.filter((e) => (attrs(e).createdAt ?? 0) > weekAgo).length;

  const maxPts = Math.max(...Object.values(pillarBreakdown), 1);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Points", value: total.toLocaleString(), sub: myRank > 0 ? `#${myRank} in cohort` : "Unranked" },
            { label: "Current Streak", value: `${currentStreak}d`, sub: currentStreak > 7 ? "🔥 On fire" : currentStreak > 0 ? "Keep it up" : "Start today" },
            { label: "Pending Validation", value: pendingCount, sub: "contributions need review" },
            { label: "Endorsements", value: endorsementsThisWeek, sub: "received this week" },
          ].map((s) => (
            <div key={s.label} className="card-ns">
              <p className="text-2xl font-black text-[#111827]">{s.value}</p>
              <p className="text-xs font-medium text-[#6B7280] mt-0.5">{s.label}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* AI Prompt Card */}
        {passportPayload.aiNarrative && (
          <div className="rounded-xl bg-[#D1FAE5] border border-[#6EE7B7] p-4 mb-6">
            <p className="text-xs font-semibold text-[#059669] mb-1">Your Reputation Passport</p>
            <p className="text-sm text-[#065F46] line-clamp-3">{passportPayload.aiNarrative}</p>
            <div className="flex gap-2 mt-3">
              <Link href={`/profile/${address}`} className="text-xs text-[#059669] hover:underline font-medium">
                View full passport →
              </Link>
              <Link href="/ai" className="text-xs text-[#059669] hover:underline font-medium ml-auto">
                Chat with AI agent →
              </Link>
            </div>
          </div>
        )}

        {/* Pillar progress */}
        <div className="card-ns mb-6">
          <p className="text-sm font-semibold text-[#111827] mb-3">Pillar Progress</p>
          <div className="space-y-2.5">
            {(["learn", "burn", "earn", "fun"] as const).map((p) => {
              const pts = pillarBreakdown[p];
              const pct = (pts / maxPts) * 100;
              const icons = { learn: GraduationCap, burn: Flame, earn: Bitcoin, fun: PartyPopper };
              const Icon = icons[p];
              return (
                <div key={p} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: PILLAR_COLORS[p] }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-[#6B7280]">{p}</span>
                      <span className="font-medium text-[#111827]">{pts} pts</span>
                    </div>
                    <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: PILLAR_COLORS[p] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              href: "/contribute/new",
              icon: Plus,
              label: "Log Contribution",
              color: "#2563EB",
              bg: "#EFF6FF",
            },
            {
              href: "/contribute/validate",
              icon: CheckSquare,
              label: `Validate a Peer${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
              color: "#10B981",
              bg: "#ECFDF5",
            },
            {
              href: "/checkin",
              icon: QrCode,
              label: "Check In",
              color: "#F97316",
              bg: "#FFF7ED",
            },
            {
              href: address ? `/endorse/${address}` : "/dashboard",
              icon: Heart,
              label: "Endorse Someone",
              color: "#8B5CF6",
              bg: "#F5F3FF",
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="card-ns flex flex-col items-center py-5 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: action.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <p className="text-xs font-medium text-[#111827] text-center">{action.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity + Mini Leaderboard */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-[#111827] mb-3">Recent Activity</h2>
            {loading ? (
              <p className="text-sm text-[#9CA3AF]">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Log your first contribution to get started."
                action={
                  <Link href="/contribute/new" className="btn-ns text-xs px-4 py-2">
                    Log Contribution
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {recentActivity.map((c) => {
                  const a = attrs(c);
                  const payload = parseEntityPayload(c);
                  return (
                    <div key={c.key} className="flex items-center gap-3 py-2 border-b border-[#F3F4F6]">
                      <PillarBadge pillar={a.pillar} size="sm" showIcon={false} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111827] truncate">
                          {payload.title ?? a.category}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {a.createdAt ? formatRelativeDate(a.createdAt) : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: (PILLAR_COLORS as any)[a.pillar] ?? "#111827" }}>
                        +{a.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#111827]">Cohort Leaderboard</h2>
              <Link href="/leaderboard" className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {leaderboard.slice(0, 5).map((entry, i) => {
              const isMe = entry.wallet?.toLowerCase() === address?.toLowerCase();
              return (
                <div
                  key={entry.wallet}
                  className={`flex items-center gap-3 py-2 border-b border-[#F3F4F6] ${isMe ? "bg-[#EFF6FF] -mx-2 px-2 rounded" : ""}`}
                >
                  <div className="w-5 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                      <span className="text-xs text-[#9CA3AF]">{i + 1}</span>
                    )}
                  </div>
                  <Link href={`/profile/${entry.wallet}`} className="text-xs font-mono text-[#0D9488] hover:underline flex-1 truncate">
                    {truncateHex(entry.wallet, 6, 4)}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-[#F59E0B]" />
                    <span className="text-xs font-bold text-[#111827]">{entry.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
