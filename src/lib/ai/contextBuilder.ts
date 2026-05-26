import {
  getContributionsByWallet,
  getEndorsementsForWallet,
  getActiveStreak,
  getPassport,
} from "@/lib/arkiv/queries";
import { aggregatePointsByPillar, totalPoints } from "@/lib/points/calculator";
import { parseEntityPayload } from "@/lib/utils/format";

function attrs(e: any): Record<string, any> {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export async function buildMemberContext(wallet: string): Promise<string> {
  const [contributions, endorsements, streak, passport] = await Promise.all([
    getContributionsByWallet(wallet).catch(() => []),
    getEndorsementsForWallet(wallet).catch(() => []),
    getActiveStreak(wallet).catch(() => null),
    getPassport(wallet).catch(() => null),
  ]);

  const contribAttrs = (contributions as any[]).map(attrs);
  const pillarBreakdown = aggregatePointsByPillar(contribAttrs);
  const total = totalPoints(contribAttrs);
  const validated = contribAttrs.filter((a) => a.status === "validated");
  const pending = contribAttrs.filter((a) => a.status === "pending");

  const streakAttrs = streak ? attrs(streak) : null;
  const passportPayload = parseEntityPayload(passport);

  const contribLines = (contributions as any[])
    .slice(0, 20)
    .map((c) => {
      const a = attrs(c);
      const p = parseEntityPayload(c);
      return `- [${c.key ?? "unknown-key"}] ${a.pillar?.toUpperCase()} | ${a.category} | "${p.title ?? ""}" | ${a.points} pts | status:${a.status} | earned:${a.earnedAt ? new Date(a.earnedAt).toISOString().split("T")[0] : "unknown"} | evidence:${p.evidenceUrl ?? "none"}`;
    })
    .join("\n");

  const endorseLines = (endorsements as any[])
    .slice(0, 10)
    .map((e) => {
      const a = attrs(e);
      const p = parseEntityPayload(e);
      return `- [${e.key ?? "unknown-key"}] skill:${a.skill} | strength:${a.strength}/5 | from:${a.fromWallet} | "${p.testimonial ?? ""}"`;
    })
    .join("\n");

  return `
=== MEMBER CONTEXT FOR WALLET: ${wallet} ===

TOTAL POINTS: ${total}
PILLAR BREAKDOWN:
  Learn: ${pillarBreakdown.learn} pts
  Burn:  ${pillarBreakdown.burn} pts
  Earn:  ${pillarBreakdown.earn} pts
  Fun:   ${pillarBreakdown.fun} pts

STREAK:
  Current streak: ${streakAttrs?.currentCount ?? 0} days
  Best streak: ${streakAttrs?.bestCount ?? 0} days
  Active: ${streakAttrs?.isActive === 1 ? "yes" : "no"}

CONTRIBUTIONS (${validated.length} validated, ${pending.length} pending):
${contribLines || "  None yet."}

ENDORSEMENTS RECEIVED (${(endorsements as any[]).length}):
${endorseLines || "  None yet."}

EXISTING PASSPORT NARRATIVE (if any):
${passportPayload.aiNarrative ?? "Not generated yet."}
`.trim();
}
