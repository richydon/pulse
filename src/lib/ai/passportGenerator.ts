import Anthropic from "@anthropic-ai/sdk";
import { buildMemberContext } from "./contextBuilder";
import { aggregatePointsByPillar, totalPoints } from "@/lib/points/calculator";
import { getContributionsByWallet, getEndorsementsForWallet, getActiveStreak } from "@/lib/arkiv/queries";
import { parseEntityPayload } from "@/lib/utils/format";

function attrs(e: any): Record<string, any> {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export async function generatePassportNarrative(wallet: string): Promise<string> {
  const context = await buildMemberContext(wallet);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Based on this member's Arkiv contribution data, write a 2-paragraph reputation summary suitable for their public profile. Write in third person. Be specific, cite numbers, and focus on their strongest areas. Do not invent anything not in the data.\n\n${context}`,
      },
    ],
  });

  const text = response.content[0];
  if (text.type !== "text") return "";
  return text.text.trim();
}

export async function buildPassportData(wallet: string) {
  const [contributions, endorsements, streak] = await Promise.all([
    getContributionsByWallet(wallet).catch(() => []),
    getEndorsementsForWallet(wallet).catch(() => []),
    getActiveStreak(wallet).catch(() => null),
  ]);

  const contribAttrs = (contributions as any[]).map(attrs);
  const pillarBreakdown = aggregatePointsByPillar(contribAttrs);
  const total = totalPoints(contribAttrs);
  const streakAttrs = streak ? attrs(streak) : null;

  const endorsementsBySkill: Record<string, number> = {};
  (endorsements as any[]).forEach((e) => {
    const skill = attrs(e).skill ?? "Unknown";
    endorsementsBySkill[skill] = (endorsementsBySkill[skill] ?? 0) + 1;
  });
  const topSkills = Object.entries(endorsementsBySkill)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const topPillar = (Object.entries(pillarBreakdown) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "earn";

  const topContribs = contribAttrs
    .filter((a) => a.status === "validated")
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 3)
    .map((a) => a.key ?? "");

  const uniqueValidators = new Set(
    (contributions as any[]).flatMap((c) =>
      (parseEntityPayload(c).validatorNotes ?? []).map((n: any) => n.wallet)
    )
  ).size;

  const totalBountyUSD = contribAttrs
    .filter((a) => a.category === "bounty_won" && a.status === "validated")
    .reduce((s, a) => s + (a.rewardAmountUSD ?? 0), 0);

  return {
    totalPoints: total,
    topPillar,
    rank: 0,
    payload: {
      displayName: "",
      aiNarrative: "",
      pillarBreakdown: {
        learn: { points: pillarBreakdown.learn, contributions: contribAttrs.filter((a) => a.pillar === "learn").length, rank: 0 },
        burn: { points: pillarBreakdown.burn, currentStreak: streakAttrs?.currentCount ?? 0, bestStreak: streakAttrs?.bestCount ?? 0 },
        earn: { points: pillarBreakdown.earn, contributions: contribAttrs.filter((a) => a.pillar === "earn").length, rank: 0, totalBountyUSD },
        fun: { points: pillarBreakdown.fun, contributions: contribAttrs.filter((a) => a.pillar === "fun").length, rank: 0 },
      },
      topContributions: topContribs,
      endorsementCount: (endorsements as any[]).length,
      topEndorsedSkills: topSkills,
      cohortsAttended: [...new Set(contribAttrs.map((a) => a.cohort).filter(Boolean))] as string[],
      validatedByCount: uniqueValidators,
    },
  };
}
