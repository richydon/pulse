"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ArkivBadge } from "@/components/ui/ArkivBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getContributionsByWallet,
  getEndorsementsForWallet,
  getActiveStreak,
  getPassport,
} from "@/lib/arkiv/queries";
import {
  truncateHex,
  formatDate,
  formatRelativeDate,
  walletToColor,
  getInitials,
  parseEntityPayload,
} from "@/lib/utils/format";
import { aggregatePointsByPillar, totalPoints } from "@/lib/points/calculator";
import { BRAGA_EXPLORER_URL, PILLAR_COLORS, PILLAR_SOFT_COLORS, CURRENT_COHORT } from "@/lib/arkiv/constants";
import {
  Copy, ExternalLink, Flame, GraduationCap, Bitcoin, PartyPopper,
  Star, Award, Shield, CheckCircle,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ProfilePage(props: { params: Promise<{ wallet: string }> }) {
  const [wallet, setWallet] = useState<string>("");
  const [contributions, setContributions] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pillarFilter, setPillarFilter] = useState<string>("all");

  useEffect(() => {
    props.params.then(({ wallet: w }) => {
      setWallet(w);
      Promise.all([
        getContributionsByWallet(w).catch(() => []),
        getEndorsementsForWallet(w).catch(() => []),
        getActiveStreak(w).catch(() => null),
        getPassport(w).catch(() => null),
      ]).then(([c, e, s, p]) => {
        setContributions(c);
        setEndorsements(e);
        setStreak(s);
        setPassport(p);
        setLoading(false);
      });
    });
  }, []);

  const attrs = (e: any) =>
    (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});

  const contribAttrs = contributions.map(attrs);
  const pillarBreakdown = aggregatePointsByPillar(contribAttrs);
  const total = totalPoints(contribAttrs);

  const radarData = [
    { subject: "Learn", value: pillarBreakdown.learn },
    { subject: "Burn", value: pillarBreakdown.burn },
    { subject: "Earn", value: pillarBreakdown.earn },
    { subject: "Fun", value: pillarBreakdown.fun },
  ];

  const passportAttrs = passport ? attrs(passport) : {};
  const passportPayload = parseEntityPayload(passport);

  const filteredContribs = contributions.filter((c) => {
    const a = attrs(c);
    if (pillarFilter !== "all" && a.pillar !== pillarFilter) return false;
    return true;
  });

  const endorsementsBySkill: Record<string, any[]> = {};
  endorsements.forEach((e) => {
    const a = attrs(e);
    if (!endorsementsBySkill[a.skill]) endorsementsBySkill[a.skill] = [];
    endorsementsBySkill[a.skill].push(e);
  });
  const topSkills = Object.entries(endorsementsBySkill)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  const validatedContribs = contribAttrs.filter((a) => a.status === "validated");
  const totalBountyUSD = contribAttrs
    .filter((a) => a.category === "bounty_won" && a.status === "validated")
    .reduce((s: number, a: any) => s + (a.rewardAmountUSD ?? 0), 0);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="card-ns mb-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: walletToColor(wallet) }}
            >
              {wallet ? getInitials(truncateHex(wallet, 4, 0)) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#111827]">
                {passportPayload.displayName ?? truncateHex(wallet)}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded">
                  {truncateHex(wallet, 8, 6)}
                </span>
                <button onClick={() => copyText(wallet)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-[#6B7280]">
                <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full text-xs">
                  {CURRENT_COHORT}
                </span>
                {contributions.length > 0 && (
                  <span>Member since {formatDate(contribAttrs.at(-1)?.earnedAt ?? Date.now())}</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-[#111827]">{total.toLocaleString()}</p>
              <p className="text-xs text-[#9CA3AF]">total points</p>
              <a
                href={`${BRAGA_EXPLORER_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline mt-1"
              >
                Verify on Arkiv <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        {passportPayload.aiNarrative && (
          <div className="rounded-xl bg-[#D1FAE5] border border-[#6EE7B7] p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#059669]" />
              <span className="text-sm font-semibold text-[#059669]">Reputation Passport</span>
              <span className="text-xs text-[#6B7280] ml-auto">
                Generated {passportAttrs.generatedAt ? formatRelativeDate(passportAttrs.generatedAt) : ""}
              </span>
            </div>
            <p className="text-sm text-[#065F46] leading-relaxed">{passportPayload.aiNarrative}</p>
            {passport?.key && (
              <p className="mt-2 font-mono text-xs text-[#059669]">
                Source: Arkiv {truncateHex(passport.key, 10, 8)}
              </p>
            )}
          </div>
        )}

        {/* Radar + pillar breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card-ns flex flex-col items-center">
            <p className="text-sm font-semibold text-[#111827] mb-2 self-start">Reputation Shape</p>
            {total > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-[#9CA3AF] py-10">No contributions yet</div>
            )}
          </div>
          <div className="space-y-3">
            {(["learn", "burn", "earn", "fun"] as const).map((p) => {
              const pts = pillarBreakdown[p];
              const maxPts = Math.max(...Object.values(pillarBreakdown), 1);
              const pct = (pts / maxPts) * 100;
              const icons = { learn: GraduationCap, burn: Flame, earn: Bitcoin, fun: PartyPopper };
              const Icon = icons[p];
              return (
                <div key={p} className="card-ns py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: PILLAR_COLORS[p] }} />
                      <span className="text-sm font-medium text-[#111827] capitalize">{p}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: PILLAR_COLORS[p] }}>
                      {pts} pts
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: PILLAR_COLORS[p] }}
                    />
                  </div>
                  {p === "burn" && streak && (
                    <p className="text-xs text-[#6B7280] mt-1">
                      {attrs(streak).currentCount ?? 0}-day streak
                    </p>
                  )}
                  {p === "earn" && totalBountyUSD > 0 && (
                    <p className="text-xs text-[#6B7280] mt-1">
                      ${totalBountyUSD.toLocaleString()} in bounties won
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top endorsements */}
        {topSkills.length > 0 && (
          <div className="card-ns mb-6">
            <p className="text-sm font-semibold text-[#111827] mb-3">Top Endorsed Skills</p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(([skill, list]) => (
                <div key={skill} className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full px-3 py-1.5">
                  <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="text-sm text-[#111827]">{skill}</span>
                  <span className="text-xs text-[#9CA3AF]">×{list.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contribution timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#111827]">
              Contributions ({validatedContribs.length} validated)
            </h2>
            <div className="flex gap-1">
              {["all", "learn", "burn", "earn", "fun"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPillarFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    pillarFilter === f
                      ? "bg-[#111827] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-[#9CA3AF] py-8 text-center">Loading contributions...</div>
          ) : filteredContribs.length === 0 ? (
            <EmptyState title="No contributions yet" description="Contributions will appear here once logged and validated." />
          ) : (
            <div className="space-y-3">
              {filteredContribs.map((c) => {
                const a = attrs(c);
                const payload = parseEntityPayload(c);
                return (
                  <div key={c.key} className="card-ns">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <PillarBadge pillar={a.pillar} size="sm" />
                          {a.status === "validated" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-[#10B981]">
                              <CheckCircle className="w-3 h-3" /> Validated
                            </span>
                          ) : (
                            <span className="text-xs text-[#F59E0B]">Pending</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-[#111827]">{payload.title ?? a.category}</p>
                        {payload.description && (
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{payload.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#9CA3AF]">
                          <span>{a.earnedAt ? formatDate(a.earnedAt) : ""}</span>
                          {payload.evidence && (
                            <a
                              href={payload.evidence}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#0D9488] hover:underline"
                            >
                              Evidence <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" /> {a.validationCount ?? 0}/2 validators
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold" style={{ color: (PILLAR_COLORS as any)[a.pillar] ?? "#111827" }}>
                          +{a.points}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">pts</p>
                      </div>
                    </div>
                    {c.key && (
                      <div className="mt-3">
                        <ArkivBadge
                          entityKey={c.key}
                          creator={c.$creator}
                          owner={c.$owner}
                          validationCount={a.validationCount}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Endorsements */}
        {endorsements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#111827] mb-3">
              Endorsements Received ({endorsements.length})
            </h2>
            <div className="space-y-3">
              {endorsements.map((e) => {
                const a = attrs(e);
                const payload = parseEntityPayload(e);
                return (
                  <div key={e.key} className="card-ns">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: walletToColor(a.fromWallet ?? "") }}
                      >
                        {getInitials(truncateHex(a.fromWallet ?? "", 2, 0))}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#111827]">{a.skill}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: a.strength ?? 0 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                            ))}
                          </div>
                        </div>
                        {payload.testimonial && (
                          <p className="text-xs text-[#6B7280] italic">&ldquo;{payload.testimonial}&rdquo;</p>
                        )}
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          from {truncateHex(a.fromWallet ?? "", 8, 6)} · {a.createdAt ? formatRelativeDate(a.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification footer */}
        <div className="card-ns mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#0D9488]" />
            <p className="text-sm font-semibold text-[#111827]">
              Everything on this page is independently verifiable
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-[#F8F9FA] rounded-lg p-3">
              <p className="text-xs text-[#9CA3AF] mb-1">Query this member&apos;s contributions</p>
              <pre className="text-xs font-mono text-[#0D9488] overflow-x-auto whitespace-pre-wrap">
{`import { createPublicClient, http } from "@arkiv-network/sdk"
import { braga } from "@arkiv-network/sdk/chains"
import { eq } from "@arkiv-network/sdk/query"
const client = createPublicClient({ chain: braga, transport: http() })
const result = await client.buildQuery()
  .where([eq('app','pulse:v1'), eq('contributorWallet','${wallet}')])
  .withPayload(true).withAttributes(true).fetch()`}
              </pre>
            </div>
            <a
              href={`${BRAGA_EXPLORER_URL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline"
            >
              Open Braga Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
