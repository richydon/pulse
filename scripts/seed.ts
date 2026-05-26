/**
 * Pulse Demo Seed Script
 * Writes ~60 entities to Arkiv Braga testnet for the "Nadia Osei" demo wallet.
 *
 * Usage:
 *   npm run seed
 *
 * Required env vars (in .env.local):
 *   PULSE_SEED_PRIVATE_KEY  — private key of the DEMO wallet (seeder)
 *   PULSE_VALIDATOR_KEY_1   — private key of validator wallet 1
 *   PULSE_VALIDATOR_KEY_2   — private key of validator wallet 2
 *   NEXT_PUBLIC_ARKIV_BRAGA_RPC (optional, defaults to Braga testnet)
 */

import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk/utils";
import { eq } from "@arkiv-network/sdk/query";

const RPC = process.env.NEXT_PUBLIC_ARKIV_BRAGA_RPC ?? "https://rpc.braga.arkiv.network";
const PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" };
const CURRENT_COHORT = "ns-v3-2026";

function requireEnv(key: string): `0x${string}` {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}. Add it to .env.local`);
  return v as `0x${string}`;
}

const SEED_KEY = requireEnv("PULSE_SEED_PRIVATE_KEY");
const VAL1_KEY = requireEnv("PULSE_VALIDATOR_KEY_1");
const VAL2_KEY = requireEnv("PULSE_VALIDATOR_KEY_2");

const seedAccount = privateKeyToAccount(SEED_KEY);
const val1Account = privateKeyToAccount(VAL1_KEY);
const val2Account = privateKeyToAccount(VAL2_KEY);

const transport = http(RPC);

function walletFor(pk: `0x${string}`) {
  const account = privateKeyToAccount(pk);
  return createWalletClient({ chain: braga, transport, account });
}

const seedWallet = walletFor(SEED_KEY);
const val1Wallet = walletFor(VAL1_KEY);
const val2Wallet = walletFor(VAL2_KEY);
const publicClient = createPublicClient({ chain: braga, transport });

const DEMO_WALLET = seedAccount.address;
const VAL1_WALLET = val1Account.address;
const VAL2_WALLET = val2Account.address;

function attrs(extra: { key: string; value: string | number }[]) {
  return [{ key: PROJECT_ATTRIBUTE.key, value: PROJECT_ATTRIBUTE.value }, ...extra];
}

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Contribution definitions ────────────────────────────────────────────────

const CONTRIBUTIONS = [
  // Learn pillar
  {
    pillar: "learn",
    category: "session_taught",
    title: "Intro to Solidity: Writing Your First Smart Contract",
    description: "Led a 2-hour workshop for 18 NS members on Solidity basics, deploying a simple escrow contract on testnet.",
    points: 80,
    evidenceUrl: "https://github.com/nadia-osei/solidity-workshop-2026",
    tags: ["solidity", "smart-contracts", "workshop"],
    earnedAt: Date.now() - 28 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "learn",
    category: "content_created",
    title: "The DePIN Stack: A Builder's Guide",
    description: "Published a 3,000-word technical guide on designing DePIN systems, with NS as a case study.",
    points: 70,
    evidenceUrl: "https://mirror.xyz/nadia-osei/depin-builders-guide",
    tags: ["depin", "writing", "technical"],
    earnedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "learn",
    category: "mentorship_given",
    title: "1:1 Mentorship: Bootstrapping a Crypto Startup",
    description: "8 structured mentorship sessions with 2 NS founders. Helped them refine their go-to-market and tokenomics.",
    points: 100,
    evidenceUrl: "",
    tags: ["mentorship", "startups", "tokenomics"],
    earnedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "learn",
    category: "book_club",
    title: "Book Club: The Network State — Chapter Discussion Lead",
    description: "Facilitated the NS book club for Balaji's The Network State. 22 members attended.",
    points: 40,
    evidenceUrl: "",
    tags: ["book-club", "network-state", "governance"],
    earnedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },

  // Burn pillar
  {
    pillar: "burn",
    category: "streak_milestone",
    title: "30-Day Burn Streak Milestone",
    description: "30 consecutive days of morning gym sessions at NS Main Gym. Best streak yet.",
    points: 120,
    evidenceUrl: "",
    tags: ["streak", "gym", "consistency"],
    earnedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "burn",
    category: "sports_event",
    title: "NS Cup 2026 — 5k Race Top 3 Finish",
    description: "Placed 3rd in the NS Cup 5k. Personal best time of 22:14.",
    points: 30,
    evidenceUrl: "https://nscup2026.com/results",
    tags: ["sports", "ns-cup", "running"],
    earnedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "burn",
    category: "personal_record",
    title: "Personal Record: 100kg Deadlift",
    description: "New personal record set in the NS gym. Video evidence included.",
    points: 50,
    evidenceUrl: "https://twitter.com/nadia_osei/deadlift-pr",
    tags: ["strength", "pr", "gym"],
    earnedAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
  },

  // Earn pillar
  {
    pillar: "earn",
    category: "bounty_won",
    title: "Won NS Bounty: Pulse MVP Demo",
    description: "Won the ETHns × Arkiv Challenge bounty for building Pulse, the NS reputation system.",
    points: 100,
    evidenceUrl: "https://ethns.hackathon.xyz/submissions/pulse",
    tags: ["bounty", "hackathon", "pulse"],
    earnedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    rewardAmountUSD: 5000,
  },
  {
    pillar: "earn",
    category: "open_source",
    title: "Arkiv SDK: Added Query Chaining PR",
    description: "Open source PR merged into @arkiv-network/sdk adding support for chained where() clauses.",
    points: 80,
    evidenceUrl: "https://github.com/arkiv-network/sdk/pull/47",
    tags: ["open-source", "sdk", "arkiv"],
    earnedAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "earn",
    category: "startup_shipped",
    title: "Shipped: Pulse Reputation System (v1)",
    description: "Shipped Pulse v1 to Vercel — 6 entity types on Arkiv, AI passport, live verification panel.",
    points: 150,
    evidenceUrl: "https://pulse-ns.vercel.app",
    tags: ["startup", "shipped", "pulse"],
    earnedAt: Date.now() - 24 * 60 * 60 * 1000,
  },

  // Fun pillar
  {
    pillar: "fun",
    category: "event_organized",
    title: "NS Rooftop Hackathon Night",
    description: "Organized and MC'd an evening hackathon + demo night on the NS rooftop. 34 attendees, 7 demos.",
    points: 70,
    evidenceUrl: "",
    tags: ["event", "hackathon", "community"],
    earnedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "fun",
    category: "community_built",
    title: "Launched NS Builders Telegram Group",
    description: "Started the NS Builders channel — now 140+ active members sharing resources and collaborating on projects.",
    points: 60,
    evidenceUrl: "https://t.me/nsbuilders2026",
    tags: ["community", "telegram", "builders"],
    earnedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
];

// ─── Endorsements ─────────────────────────────────────────────────────────────

const ENDORSEMENTS = [
  { skill: "Smart Contract Development", strength: 5, testimonial: "Nadia's Solidity workshop was the most practical I've attended. She debugged live on stage.", fromNote: "val1" },
  { skill: "Mentorship", strength: 5, testimonial: "Her mentorship sessions transformed how I think about tokenomics. Invaluable.", fromNote: "val2" },
  { skill: "Content Creation", strength: 4, testimonial: "The DePIN guide is the clearest technical piece I've read this year.", fromNote: "val1" },
  { skill: "Event Organization", strength: 5, testimonial: "The Rooftop Hackathon was phenomenal. Perfect curation, great energy.", fromNote: "val2" },
  { skill: "Community Building", strength: 4, testimonial: "NS Builders Telegram is the best signal in my feed.", fromNote: "val1" },
  { skill: "AI Engineering", strength: 4, testimonial: "Pulse is a showcase of how to build AI-native apps on blockchain.", fromNote: "val2" },
  { skill: "Public Speaking", strength: 4, testimonial: "Nadia commands a room. Her workshop delivery is polished and engaging.", fromNote: "val1" },
  { skill: "Fitness Coaching", strength: 3, testimonial: "Great accountability partner in the gym. Pushed me to my new PR.", fromNote: "val2" },
];

// ─── Bounties ─────────────────────────────────────────────────────────────────

const BOUNTIES = [
  {
    pillar: "earn",
    title: "Build NS Member Analytics Dashboard",
    description: "Create a real-time analytics dashboard showing cohort health metrics from Arkiv data. Must be open source and deployed.",
    rewardUSD: 2000,
    skills: ["frontend", "data-visualization", "arkiv"],
    deadline: Date.now() + 14 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "learn",
    title: "Write: The Complete Guide to NS Cohort Governance",
    description: "3,000+ word guide on how NS cohort governance works, decision-making processes, and how to participate.",
    rewardUSD: 500,
    skills: ["writing", "research", "governance"],
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
  {
    pillar: "fun",
    title: "Organize NS Inter-Cohort Sports Tournament",
    description: "Plan and execute a multi-sport tournament between NS v2 and NS v3 cohorts. Minimum 3 sports, 20+ participants.",
    rewardUSD: 1000,
    skills: ["event-organization", "sports", "community"],
    deadline: Date.now() + 21 * 24 * 60 * 60 * 1000,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  log(`Demo wallet: ${DEMO_WALLET}`);
  log(`Validator 1: ${VAL1_WALLET}`);
  log(`Validator 2: ${VAL2_WALLET}`);
  log(`RPC: ${RPC}`);
  log("---");

  const entityKeys: string[] = [];

  // 1. Write 12 Contributions
  log(`Writing ${CONTRIBUTIONS.length} contributions...`);
  for (const c of CONTRIBUTIONS) {
    const payload: any = {
      title: c.title,
      description: c.description,
      evidenceUrl: c.evidenceUrl,
      tags: c.tags,
      validatorNotes: [],
    };
    if ((c as any).rewardAmountUSD) payload.rewardAmountUSD = (c as any).rewardAmountUSD;

    const result = await seedWallet.createEntity({
      payload: jsonToPayload(payload),
      contentType: "application/json",
      attributes: attrs([
        { key: "type", value: "contribution" },
        { key: "pillar", value: c.pillar },
        { key: "category", value: c.category },
        { key: "contributorWallet", value: DEMO_WALLET },
        { key: "cohort", value: CURRENT_COHORT },
        { key: "status", value: "validated" },
        { key: "points", value: c.points },
        { key: "validationCount", value: 2 },
        { key: "earnedAt", value: c.earnedAt },
        { key: "createdAt", value: c.earnedAt },
        ...((c as any).rewardAmountUSD ? [{ key: "rewardAmountUSD", value: (c as any).rewardAmountUSD }] : []),
      ]),
      expiresIn: 0,
    });
    log(`  ✓ Contribution: ${c.title.slice(0, 50)} → ${result.entityKey}`);
    entityKeys.push(result.entityKey);
    await sleep(300);
  }

  // 2. Write 24 ValidationRecords (2 per contribution)
  log(`Writing ${entityKeys.length * 2} validation records...`);
  for (const contributionKey of entityKeys) {
    for (const [wallet, vKey] of [[val1Wallet, VAL1_WALLET], [val2Wallet, VAL2_WALLET]] as const) {
      const vPayload = {
        note: "Evidence verified. Contribution meets quality standards.",
        evidenceChecked: true,
      };
      const vResult = await wallet.createEntity({
        payload: jsonToPayload(vPayload),
        contentType: "application/json",
        attributes: attrs([
          { key: "type", value: "validation" },
          { key: "contributionKey", value: contributionKey },
          { key: "validatorWallet", value: vKey },
          { key: "contributorWallet", value: DEMO_WALLET },
          { key: "verdict", value: "approved" },
          { key: "createdAt", value: Date.now() },
        ]),
        expiresIn: ExpirationTime.fromDays(365),
      });
      log(`  ✓ Validation: ${contributionKey.slice(0, 14)}... by ${vKey.slice(0, 10)}...`);
      await sleep(200);
    }
  }

  // 3. Write 8 Endorsements
  log("Writing 8 endorsements...");
  for (const e of ENDORSEMENTS) {
    const fromWallet = e.fromNote === "val1" ? val1Wallet : val2Wallet;
    const fromAddr = e.fromNote === "val1" ? VAL1_WALLET : VAL2_WALLET;
    const ePayload = {
      testimonial: e.testimonial,
      context: "Network School v3 2026",
      relationship: "cohort-member",
    };
    const eResult = await fromWallet.createEntity({
      payload: jsonToPayload(ePayload),
      contentType: "application/json",
      attributes: attrs([
        { key: "type", value: "endorsement" },
        { key: "fromWallet", value: fromAddr },
        { key: "toWallet", value: DEMO_WALLET },
        { key: "skill", value: e.skill },
        { key: "strength", value: e.strength },
        { key: "cohort", value: CURRENT_COHORT },
        { key: "createdAt", value: Date.now() },
      ]),
      expiresIn: ExpirationTime.fromDays(365),
    });
    log(`  ✓ Endorsement: ${e.skill} (${e.strength}★) → ${eResult.entityKey}`);
    await sleep(300);
  }

  // 4. Write 1 Streak (31 days)
  log("Writing streak entity (31 days)...");
  const streakCheckIns = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
    return {
      date: d.toISOString().split("T")[0],
      timestamp: d.getTime(),
      location: "gym-forest-city-main",
    };
  });
  const streakPayload = { streakType: "daily_burn", checkIns: streakCheckIns };
  const streakResult = await seedWallet.createEntity({
    payload: jsonToPayload(streakPayload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "streak" },
      { key: "streakType", value: "daily_burn" },
      { key: "memberWallet", value: DEMO_WALLET },
      { key: "currentCount", value: 31 },
      { key: "bestCount", value: 31 },
      { key: "lastCheckinAt", value: Date.now() },
      { key: "isActive", value: 1 },
      { key: "cohort", value: CURRENT_COHORT },
    ]),
    expiresIn: ExpirationTime.fromDays(90),
  });
  log(`  ✓ Streak: 31 days → ${streakResult.entityKey}`);

  // 5. Write ReputationPassport
  log("Writing Reputation Passport...");
  const totalPoints = CONTRIBUTIONS.reduce((s, c) => s + c.points, 0);
  const passportPayload = {
    displayName: "Nadia Osei",
    aiNarrative: `Nadia Osei is a standout contributor in the Network School v3 2026 cohort with ${totalPoints} total reputation points across all four pillars. Her strongest area is the Earn pillar, where she has shipped multiple high-impact projects including the Pulse reputation system — the winning entry in the ETHns × Arkiv Challenge — and an open source PR merged into the Arkiv SDK. She also demonstrates exceptional commitment to the Learn pillar, having taught a Solidity workshop attended by 18 members and published a widely-shared technical guide on DePIN architecture.\n\nBeyond her technical contributions, Nadia is a community catalyst in the Fun pillar: she organized the NS Rooftop Hackathon Night and founded the NS Builders Telegram group, now with 140+ active members. Her Burn pillar shows remarkable consistency — a 31-day consecutive gym streak and a top-3 finish at the NS Cup 5k. With 8 endorsements from peers rating her highly in Smart Contract Development, Mentorship, and Event Organization, Nadia represents the multi-dimensional builder that Network School is designed to produce.`,
    pillarBreakdown: {
      learn: { points: 80 + 70 + 100 + 40, contributions: 4, rank: 2 },
      burn: { points: 120 + 30 + 50, currentStreak: 31, bestStreak: 31 },
      earn: { points: 100 + 80 + 150, contributions: 3, rank: 1, totalBountyUSD: 5000 },
      fun: { points: 70 + 60, contributions: 2, rank: 3 },
    },
    topContributions: entityKeys.slice(0, 3),
    endorsementCount: 8,
    topEndorsedSkills: ["Smart Contract Development", "Mentorship", "Content Creation"],
    cohortsAttended: [CURRENT_COHORT],
    validatedByCount: 2,
  };
  const passportResult = await seedWallet.createEntity({
    payload: jsonToPayload(passportPayload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "passport" },
      { key: "memberWallet", value: DEMO_WALLET },
      { key: "totalPoints", value: totalPoints },
      { key: "topPillar", value: "earn" },
      { key: "rank", value: 1 },
      { key: "cohort", value: CURRENT_COHORT },
      { key: "generatedAt", value: Date.now() },
    ]),
    expiresIn: ExpirationTime.fromDays(30),
  });
  log(`  ✓ Passport: ${totalPoints} pts → ${passportResult.entityKey}`);

  // 6. Write 3 Bounties
  log("Writing 3 open bounties...");
  for (const b of BOUNTIES) {
    const bPayload = {
      title: b.title,
      description: b.description,
      skills: b.skills,
      submissionUrl: "",
    };
    const bResult = await seedWallet.createEntity({
      payload: jsonToPayload(bPayload),
      contentType: "application/json",
      attributes: attrs([
        { key: "type", value: "bounty" },
        { key: "pillar", value: b.pillar },
        { key: "status", value: "open" },
        { key: "rewardUSD", value: b.rewardUSD },
        { key: "postedBy", value: DEMO_WALLET },
        { key: "deadline", value: b.deadline },
        { key: "createdAt", value: Date.now() },
        { key: "cohort", value: CURRENT_COHORT },
      ]),
      expiresIn: ExpirationTime.fromDays(30),
    });
    log(`  ✓ Bounty: ${b.title.slice(0, 50)} ($${b.rewardUSD}) → ${bResult.entityKey}`);
    await sleep(300);
  }

  // Summary
  log("---");
  log("Seed complete!");
  log(`  Demo wallet: ${DEMO_WALLET}`);
  log(`  Contributions: ${CONTRIBUTIONS.length}`);
  log(`  Validation records: ${CONTRIBUTIONS.length * 2}`);
  log(`  Endorsements: ${ENDORSEMENTS.length}`);
  log(`  Streak entities: 1 (31 days)`);
  log(`  Passports: 1`);
  log(`  Bounties: ${BOUNTIES.length}`);
  log(`  Total entities: ~${CONTRIBUTIONS.length + CONTRIBUTIONS.length * 2 + ENDORSEMENTS.length + 1 + 1 + BOUNTIES.length}`);
  log(`  Demo profile: /profile/${DEMO_WALLET}`);
}

main().catch((e) => {
  console.error("[seed] FAILED:", e?.message ?? e);
  process.exit(1);
});
