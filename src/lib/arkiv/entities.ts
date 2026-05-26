import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk/utils";
import { getWalletClient, getPublicClient } from "./client";
import { PROJECT_ATTRIBUTE, CURRENT_COHORT } from "./constants";
import type {
  ContributionPayload,
  EndorsementPayload,
  StreakPayload,
  ValidationRecordPayload,
  ReputationPassportPayload,
  BountyPayload,
} from "@/types/entities";

function attrs(extra: { key: string; value: string | number }[]) {
  return [{ key: PROJECT_ATTRIBUTE.key, value: PROJECT_ATTRIBUTE.value }, ...extra];
}

export async function createContribution(
  walletAddress: `0x${string}`,
  data: {
    pillar: string;
    category: string;
    points: number;
    cohort?: string;
    earnedAt?: number;
    payload: ContributionPayload;
  }
) {
  const client = getWalletClient(walletAddress);
  const now = Date.now();
  return client.createEntity({
    payload: jsonToPayload(data.payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "contribution" },
      { key: "pillar", value: data.pillar },
      { key: "category", value: data.category },
      { key: "contributorWallet", value: walletAddress },
      { key: "cohort", value: data.cohort ?? CURRENT_COHORT },
      { key: "status", value: "pending" },
      { key: "points", value: data.points },
      { key: "validationCount", value: 0 },
      { key: "earnedAt", value: data.earnedAt ?? now },
      { key: "createdAt", value: now },
    ]),
    expiresIn: 0,
  });
}

export async function updateContributionStatus(
  entityKey: `0x${string}`,
  walletAddress: `0x${string}`,
  status: "validated" | "rejected",
  validationCount: number,
  currentPayload: ContributionPayload,
  currentAttrs: { key: string; value: string | number }[]
) {
  const client = getWalletClient(walletAddress);
  const updatedAttrs = currentAttrs.map((a) => {
    if (a.key === "status") return { ...a, value: status };
    if (a.key === "validationCount") return { ...a, value: validationCount };
    return a;
  });
  return client.updateEntity({
    entityKey,
    payload: jsonToPayload(currentPayload),
    contentType: "application/json",
    attributes: updatedAttrs,
    expiresIn: 0,
  });
}

export async function createEndorsement(
  fromWallet: `0x${string}`,
  data: {
    toWallet: string;
    skill: string;
    strength: number;
    cohort?: string;
    payload: EndorsementPayload;
  }
) {
  const client = getWalletClient(fromWallet);
  const now = Date.now();
  return client.createEntity({
    payload: jsonToPayload(data.payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "endorsement" },
      { key: "fromWallet", value: fromWallet },
      { key: "toWallet", value: data.toWallet },
      { key: "skill", value: data.skill },
      { key: "strength", value: data.strength },
      { key: "cohort", value: data.cohort ?? CURRENT_COHORT },
      { key: "createdAt", value: now },
    ]),
    expiresIn: ExpirationTime.fromDays(365),
  });
}

export async function createStreak(
  walletAddress: `0x${string}`,
  streakType: "daily_burn" | "daily_build" | "daily_learn" = "daily_burn",
  cohort: string = CURRENT_COHORT,
  location: string = "unknown"
) {
  const client = getWalletClient(walletAddress);
  const now = Date.now();
  const todayStr = new Date().toISOString().split("T")[0];
  const payload: StreakPayload = {
    streakType,
    checkIns: [{ date: todayStr, timestamp: now, location }],
  };
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "streak" },
      { key: "streakType", value: streakType },
      { key: "memberWallet", value: walletAddress },
      { key: "currentCount", value: 1 },
      { key: "bestCount", value: 1 },
      { key: "lastCheckinAt", value: now },
      { key: "isActive", value: 1 },
      { key: "cohort", value: cohort },
    ]),
    expiresIn: ExpirationTime.fromDays(90),
  });
}

export async function updateStreakCheckin(
  entityKey: `0x${string}`,
  walletAddress: `0x${string}`,
  currentCount: number,
  bestCount: number,
  currentPayload: StreakPayload,
  currentAttrs: { key: string; value: string | number }[],
  location: string = "unknown"
) {
  const client = getWalletClient(walletAddress);
  const now = Date.now();
  const todayStr = new Date().toISOString().split("T")[0];
  const newCount = currentCount + 1;
  const newBest = Math.max(bestCount, newCount);

  const updatedPayload: StreakPayload = {
    ...currentPayload,
    checkIns: [
      ...currentPayload.checkIns,
      { date: todayStr, timestamp: now, location },
    ],
  };

  const updatedAttrs = currentAttrs.map((a) => {
    if (a.key === "currentCount") return { ...a, value: newCount };
    if (a.key === "bestCount") return { ...a, value: newBest };
    if (a.key === "lastCheckinAt") return { ...a, value: now };
    if (a.key === "isActive") return { ...a, value: 1 };
    return a;
  });

  return client.updateEntity({
    entityKey,
    payload: jsonToPayload(updatedPayload),
    contentType: "application/json",
    attributes: updatedAttrs,
    expiresIn: ExpirationTime.fromDays(90),
  });
}

export async function createValidationRecord(
  validatorWallet: `0x${string}`,
  data: {
    contributionKey: string;
    contributorWallet: string;
    verdict: "approved" | "rejected";
    payload: ValidationRecordPayload;
  }
) {
  const client = getWalletClient(validatorWallet);
  const now = Date.now();
  return client.createEntity({
    payload: jsonToPayload(data.payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "validation" },
      { key: "contributionKey", value: data.contributionKey },
      { key: "validatorWallet", value: validatorWallet },
      { key: "contributorWallet", value: data.contributorWallet },
      { key: "verdict", value: data.verdict },
      { key: "createdAt", value: now },
    ]),
    expiresIn: ExpirationTime.fromDays(365),
  });
}

export async function createPassport(
  platformWallet: `0x${string}`,
  memberWallet: `0x${string}`,
  data: {
    totalPoints: number;
    topPillar: string;
    rank: number;
    cohort?: string;
    payload: ReputationPassportPayload;
  }
) {
  const client = getWalletClient(platformWallet);
  const now = Date.now();
  return client.createEntity({
    payload: jsonToPayload(data.payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "passport" },
      { key: "memberWallet", value: memberWallet },
      { key: "totalPoints", value: data.totalPoints },
      { key: "topPillar", value: data.topPillar },
      { key: "rank", value: data.rank },
      { key: "cohort", value: data.cohort ?? CURRENT_COHORT },
      { key: "generatedAt", value: now },
    ]),
    expiresIn: ExpirationTime.fromDays(30),
  });
}

export async function createBounty(
  posterWallet: `0x${string}`,
  data: {
    pillar: string;
    rewardUSD: number;
    deadline: number;
    cohort?: string;
    payload: BountyPayload;
  }
) {
  const client = getWalletClient(posterWallet);
  const now = Date.now();
  return client.createEntity({
    payload: jsonToPayload(data.payload),
    contentType: "application/json",
    attributes: attrs([
      { key: "type", value: "bounty" },
      { key: "pillar", value: data.pillar },
      { key: "status", value: "open" },
      { key: "rewardUSD", value: data.rewardUSD },
      { key: "postedBy", value: posterWallet },
      { key: "deadline", value: data.deadline },
      { key: "createdAt", value: now },
      { key: "cohort", value: data.cohort ?? CURRENT_COHORT },
    ]),
    expiresIn: ExpirationTime.fromDays(30),
  });
}

export async function markBountyWinner(
  entityKey: `0x${string}`,
  coordinatorWallet: `0x${string}`,
  winnerWallet: string,
  txHash: string,
  currentPayload: BountyPayload,
  currentAttrs: { key: string; value: string | number }[]
) {
  const client = getWalletClient(coordinatorWallet);
  const updatedPayload: BountyPayload = {
    ...currentPayload,
    winnerWallet,
    winnerTxHash: txHash,
  };
  const updatedAttrs = currentAttrs.map((a) => {
    if (a.key === "status") return { ...a, value: "completed" };
    return a;
  });
  return client.updateEntity({
    entityKey,
    payload: jsonToPayload(updatedPayload),
    contentType: "application/json",
    attributes: updatedAttrs,
    expiresIn: ExpirationTime.fromDays(30),
  });
}

export async function getEntityByKey(key: `0x${string}`) {
  return getPublicClient().getEntity(key);
}
