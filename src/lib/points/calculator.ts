import { CATEGORIES, type Pillar } from "@/lib/arkiv/constants";

export function getBasePoints(pillar: Pillar, category: string): number {
  const cats = CATEGORIES[pillar];
  return cats.find((c) => c.value === category)?.points ?? 50;
}

export function aggregatePointsByPillar(
  contributions: Array<{ pillar?: string; points?: number; status?: string } | Record<string, any>>
) {
  const result = { learn: 0, burn: 0, earn: 0, fun: 0 };
  for (const c of contributions) {
    if (c.status !== "validated") continue;
    const p = c.pillar as Pillar;
    if (p in result) result[p] += c.points;
  }
  return result;
}

export function totalPoints(contributions: Array<{ points?: number; status?: string } | Record<string, any>>) {
  return contributions
    .filter((c) => c.status === "validated")
    .reduce((sum, c) => sum + c.points, 0);
}

export function aggregateLeaderboard(
  entities: Array<{
    contributorWallet?: string;
    pillar?: string;
    points?: number;
    status?: string;
  }>
): Array<{ wallet: string; total: number; learn: number; burn: number; earn: number; fun: number }> {
  const map: Record<string, { learn: number; burn: number; earn: number; fun: number }> = {};
  for (const e of entities) {
    if (!e.contributorWallet || e.status !== "validated") continue;
    const w = e.contributorWallet;
    if (!map[w]) map[w] = { learn: 0, burn: 0, earn: 0, fun: 0 };
    const p = (e.pillar ?? "earn") as Pillar;
    if (p in map[w]) map[w][p] += e.points ?? 0;
  }
  return Object.entries(map)
    .map(([wallet, breakdown]) => ({
      wallet,
      total: breakdown.learn + breakdown.burn + breakdown.earn + breakdown.fun,
      ...breakdown,
    }))
    .sort((a, b) => b.total - a.total);
}
