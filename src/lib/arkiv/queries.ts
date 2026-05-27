import { eq, gte, lte, and } from "@arkiv-network/sdk/query";
import { getPublicClient } from "./client";
import { PROJECT_ATTRIBUTE, CURRENT_COHORT } from "./constants";

/** Normalise wallet address to lowercase so eq() comparisons always match. */
const lc = (a: string) => a.toLowerCase();

function base() {
  return getPublicClient().buildQuery().where([
    eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
  ]);
}

export async function getContributionsByWallet(
  wallet: string,
  opts?: {
    pillar?: string;
    status?: string;
    cohort?: string;
    fromTs?: number;
    toTs?: number;
    limit?: number;
  }
) {
  let q = base().where([
    eq("type", "contribution"),
    eq("contributorWallet", lc(wallet)),
  ]);
  if (opts?.pillar) q = q.where(eq("pillar", opts.pillar));
  if (opts?.status) q = q.where(eq("status", opts.status));
  if (opts?.cohort) q = q.where(eq("cohort", opts.cohort));
  if (opts?.fromTs) q = q.where(gte("earnedAt", opts.fromTs));
  if (opts?.toTs) q = q.where(lte("earnedAt", opts.toTs));
  q = q.orderBy("earnedAt", "number", "desc")
       .withAttributes(true)
       .withPayload(true)
       .withMetadata(true)
       .limit(opts?.limit ?? 100);
  const result = await q.fetch();
  return result.entities;
}

export async function getEndorsementsForWallet(wallet: string) {
  const result = await base()
    .where([eq("type", "endorsement"), eq("toWallet", lc(wallet))])
    .orderBy("createdAt", "number", "desc")
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(100)
    .fetch();
  return result.entities;
}

export async function getEndorsementsGivenByWallet(wallet: string) {
  const result = await base()
    .where([eq("type", "endorsement"), eq("fromWallet", lc(wallet))])
    .orderBy("createdAt", "number", "desc")
    .withAttributes(true)
    .withPayload(true)
    .limit(50)
    .fetch();
  return result.entities;
}

export async function getActiveStreak(wallet: string) {
  const result = await base()
    .where([
      eq("type", "streak"),
      eq("memberWallet", lc(wallet)),
      eq("isActive", 1),
    ])
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(1)
    .fetch();
  return result.entities[0] ?? null;
}

export async function getAllStreaksForWallet(wallet: string) {
  const result = await base()
    .where([eq("type", "streak"), eq("memberWallet", lc(wallet))])
    .withAttributes(true)
    .withPayload(true)
    .limit(10)
    .fetch();
  return result.entities;
}

export async function getPassport(wallet: string) {
  const result = await base()
    .where([eq("type", "passport"), eq("memberWallet", lc(wallet))])
    .orderBy("generatedAt", "number", "desc")
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(1)
    .fetch();
  return result.entities[0] ?? null;
}

export async function getValidationsForContribution(contributionKey: string) {
  const result = await base()
    .where([
      eq("type", "validation"),
      eq("contributionKey", contributionKey),
    ])
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(20)
    .fetch();
  return result.entities;
}

export async function getPendingValidationQueue(cohort: string = CURRENT_COHORT, limit = 20) {
  const result = await base()
    .where([
      eq("type", "contribution"),
      eq("cohort", cohort),
      eq("status", "pending"),
    ])
    .orderBy("createdAt", "number", "asc")
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();
  return result.entities;
}

export async function getLeaderboard(opts?: {
  cohort?: string;
  pillar?: string;
  fromTs?: number;
  limit?: number;
}) {
  let q = base().where([
    eq("type", "contribution"),
    eq("status", "validated"),
  ]);
  if (opts?.cohort) q = q.where(eq("cohort", opts.cohort));
  if (opts?.pillar) q = q.where(eq("pillar", opts.pillar));
  if (opts?.fromTs) q = q.where(gte("earnedAt", opts.fromTs));
  q = q.orderBy("points", "number", "desc")
       .withAttributes(true)
       .withPayload(true)
       .limit(opts?.limit ?? 200);
  const result = await q.fetch();
  return result.entities;
}

export async function getTopPassports(cohort: string = CURRENT_COHORT, limit = 20) {
  const result = await base()
    .where([eq("type", "passport"), eq("cohort", cohort)])
    .orderBy("totalPoints", "number", "desc")
    .withAttributes(true)
    .withPayload(true)
    .limit(limit)
    .fetch();
  return result.entities;
}

export async function getOpenBounties(opts?: {
  cohort?: string;
  minRewardUSD?: number;
  limit?: number;
}) {
  let q = base().where([eq("type", "bounty"), eq("status", "open")]);
  if (opts?.cohort) q = q.where(eq("cohort", opts.cohort));
  if (opts?.minRewardUSD) q = q.where(gte("rewardUSD", opts.minRewardUSD));
  q = q.orderBy("deadline", "number", "asc")
       .withAttributes(true)
       .withPayload(true)
       .withMetadata(true)
       .limit(opts?.limit ?? 50);
  const result = await q.fetch();
  return result.entities;
}

export async function getBountyByKey(key: string) {
  return getPublicClient().getEntity(key as `0x${string}`);
}

export async function getCohortStats(cohort: string = CURRENT_COHORT) {
  const [contributions, passports, streaks, bounties] = await Promise.all([
    base()
      .where([eq("type", "contribution"), eq("cohort", cohort), eq("status", "validated")])
      .withAttributes(true)
      .limit(500)
      .fetch(),
    getTopPassports(cohort, 100),
    base()
      .where([eq("type", "streak"), eq("cohort", cohort), eq("isActive", 1)])
      .withAttributes(true)
      .limit(200)
      .fetch(),
    getOpenBounties({ cohort }),
  ]);
  return {
    contributions: contributions.entities,
    passports,
    streaks: streaks.entities,
    bounties,
  };
}

export async function getAllPulseEntities() {
  const types = ["contribution", "endorsement", "streak", "validation", "passport", "bounty"];
  const counts: Record<string, number> = {};
  await Promise.all(
    types.map(async (type) => {
      counts[type] = await base().where(eq("type", type)).count();
    })
  );
  return counts;
}

export async function getRecentActivity(cohort: string = CURRENT_COHORT, limit = 10) {
  const result = await base()
    .where([eq("type", "contribution"), eq("cohort", cohort)])
    .orderBy("createdAt", "number", "desc")
    .withAttributes(true)
    .withPayload(true)
    .limit(limit)
    .fetch();
  return result.entities;
}
