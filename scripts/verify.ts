/**
 * Pulse Verify Script
 * Queries all Pulse entities from Arkiv Braga testnet and prints a summary.
 *
 * Usage:
 *   npm run verify
 */

import "dotenv/config";
import { createPublicClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";

const RPC = process.env.NEXT_PUBLIC_ARKIV_BRAGA_RPC ?? "https://rpc.braga.arkiv.network";
const PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" };
const DEMO_WALLET = process.env.DEMO_WALLET_ADDRESS ?? "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const client = createPublicClient({ chain: braga, transport: http(RPC) });

function base() {
  return client.buildQuery().where([eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value)]);
}

function attrs(e: any): Record<string, any> {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

function parsePayload(e: any): any {
  try {
    if (typeof e.toText === "function") return JSON.parse(e.toText());
    if (e.payload instanceof Uint8Array) return JSON.parse(new TextDecoder().decode(e.payload));
    return {};
  } catch { return {}; }
}

async function main() {
  console.log("=== Pulse Verification ===");
  console.log(`RPC: ${RPC}`);
  console.log(`PROJECT_ATTRIBUTE: { key: "${PROJECT_ATTRIBUTE.key}", value: "${PROJECT_ATTRIBUTE.value}" }`);
  console.log("");

  const types = ["contribution", "endorsement", "streak", "validation", "passport", "bounty"];

  // Count all entity types
  console.log("--- Entity Counts ---");
  let total = 0;
  for (const type of types) {
    const count = await base().where(eq("type", type)).count();
    console.log(`  ${type.padEnd(14)}: ${count}`);
    total += count;
  }
  console.log(`  ${"TOTAL".padEnd(14)}: ${total}`);
  console.log("");

  // Demo wallet contributions
  console.log(`--- Demo Wallet: ${DEMO_WALLET} ---`);
  const contribs = await base()
    .where([eq("type", "contribution"), eq("contributorWallet", DEMO_WALLET)])
    .withAttributes(true)
    .withPayload(true)
    .orderBy("earnedAt", "number", "desc")
    .limit(20)
    .fetch();

  console.log(`Contributions (${contribs.entities.length}):`);
  let totalPts = 0;
  for (const e of contribs.entities) {
    const a = attrs(e);
    const payload = parsePayload(e);
    const pts = Number(a.points ?? 0);
    totalPts += pts;
    console.log(`  [${a.pillar?.toUpperCase()}] ${payload.title?.slice(0, 55) ?? "(no title)"}`);
    console.log(`         key: ${e.key}  status: ${a.status}  pts: ${pts}`);
  }
  console.log(`  Total points: ${totalPts}`);
  console.log("");

  // Endorsements
  const endorsements = await base()
    .where([eq("type", "endorsement"), eq("toWallet", DEMO_WALLET)])
    .withAttributes(true)
    .withPayload(true)
    .limit(20)
    .fetch();

  console.log(`Endorsements (${endorsements.entities.length}):`);
  for (const e of endorsements.entities) {
    const a = attrs(e);
    console.log(`  ${a.skill} — strength: ${a.strength}★ — from: ${String(a.fromWallet).slice(0, 14)}...`);
    console.log(`    key: ${e.key}`);
  }
  console.log("");

  // Streak
  const streak = await base()
    .where([eq("type", "streak"), eq("memberWallet", DEMO_WALLET)])
    .withAttributes(true)
    .limit(5)
    .fetch();

  console.log(`Streaks (${streak.entities.length}):`);
  for (const e of streak.entities) {
    const a = attrs(e);
    console.log(`  ${a.streakType} — current: ${a.currentCount} days — best: ${a.bestCount}`);
    console.log(`    key: ${e.key}`);
  }
  console.log("");

  // Passport
  const passport = await base()
    .where([eq("type", "passport"), eq("memberWallet", DEMO_WALLET)])
    .withAttributes(true)
    .withPayload(true)
    .orderBy("generatedAt", "number", "desc")
    .limit(1)
    .fetch();

  if (passport.entities.length > 0) {
    const a = attrs(passport.entities[0]);
    const p = parsePayload(passport.entities[0]);
    console.log(`Passport:`);
    console.log(`  totalPoints: ${a.totalPoints}  topPillar: ${a.topPillar}  rank: ${a.rank}`);
    console.log(`  aiNarrative: ${p.aiNarrative?.slice(0, 100)}...`);
    console.log(`  key: ${passport.entities[0].key}`);
  } else {
    console.log("Passport: none found");
  }
  console.log("");

  // Open bounties
  const bounties = await base()
    .where([eq("type", "bounty"), eq("status", "open")])
    .withAttributes(true)
    .withPayload(true)
    .limit(10)
    .fetch();

  console.log(`Open Bounties (${bounties.entities.length}):`);
  for (const e of bounties.entities) {
    const a = attrs(e);
    const p = parsePayload(e);
    console.log(`  [$${a.rewardUSD}] ${p.title?.slice(0, 55) ?? "(no title)"}`);
    console.log(`    key: ${e.key}`);
  }
  console.log("");

  console.log("=== Verification complete ===");
  console.log(`All ${total} entities are publicly queryable on Arkiv Braga.`);
  console.log(`Demo profile: /profile/${DEMO_WALLET}`);
  console.log(`Explorer: https://explorer.braga.arkiv.network`);
}

main().catch((e) => {
  console.error("[verify] FAILED:", e?.message ?? e);
  process.exit(1);
});
