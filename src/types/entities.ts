import type { Pillar, Skill } from "@/lib/arkiv/constants";

export interface ContributionPayload {
  title: string;
  description: string;
  evidence: string;
  rewardAmountUSD?: number;
  rewardToken?: string;
  rewardTxHash?: string;
  location?: string;
  tags: string[];
  validatorNotes: {
    wallet: string;
    note: string;
    validatedAt: number;
  }[];
}

export interface EndorsementPayload {
  skill: string;
  testimonial: string;
  context: string;
  relationship: "peer" | "mentee" | "collaborator" | "student";
}

export interface StreakCheckIn {
  date: string;
  timestamp: number;
  location: string;
  validatorSignature?: string;
}

export interface StreakPayload {
  streakType: "daily_burn" | "daily_build" | "daily_learn";
  checkIns: StreakCheckIn[];
}

export interface ValidationRecordPayload {
  note: string;
  evidenceVerified: boolean;
}

export interface PillarStats {
  points: number;
  contributions: number;
  rank: number;
}

export interface BurnStats {
  points: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ReputationPassportPayload {
  displayName: string;
  aiNarrative: string;
  pillarBreakdown: {
    learn: PillarStats;
    burn: BurnStats;
    earn: PillarStats & { totalBountyUSD: number };
    fun: PillarStats;
  };
  topContributions: string[];
  endorsementCount: number;
  topEndorsedSkills: string[];
  cohortsAttended: string[];
  validatedByCount: number;
}

export interface BountyPayload {
  title: string;
  description: string;
  requirements: string[];
  rewardToken: string;
  rewardAmount: number;
  winnerWallet?: string;
  winnerTxHash?: string;
  submissionCount?: number;
}

/* Typed wrappers for entities returned from Arkiv */

export interface ArkivEntityBase {
  key: string;
  $creator: string;
  $owner: string;
  contentType: string;
  expiresAt?: number;
  createdAt?: number;
}

export interface ContributionEntity extends ArkivEntityBase {
  type: "contribution";
  pillar: Pillar;
  category: string;
  contributorWallet: string;
  cohort: string;
  status: "pending" | "validated" | "rejected";
  points: number;
  validationCount: number;
  earnedAt: number;
  payload: ContributionPayload;
}

export interface EndorsementEntity extends ArkivEntityBase {
  type: "endorsement";
  fromWallet: string;
  toWallet: string;
  skill: Skill;
  strength: 1 | 2 | 3 | 4 | 5;
  cohort: string;
  payload: EndorsementPayload;
}

export interface StreakEntity extends ArkivEntityBase {
  type: "streak";
  streakType: "daily_burn" | "daily_build" | "daily_learn";
  memberWallet: string;
  currentCount: number;
  bestCount: number;
  lastCheckinAt: number;
  isActive: 0 | 1;
  cohort: string;
  payload: StreakPayload;
}

export interface ValidationRecordEntity extends ArkivEntityBase {
  type: "validation";
  contributionKey: string;
  validatorWallet: string;
  contributorWallet: string;
  verdict: "approved" | "rejected";
  payload: ValidationRecordPayload;
}

export interface PassportEntity extends ArkivEntityBase {
  type: "passport";
  memberWallet: string;
  totalPoints: number;
  topPillar: Pillar;
  rank: number;
  cohort: string;
  generatedAt: number;
  payload: ReputationPassportPayload;
}

export interface BountyEntity extends ArkivEntityBase {
  type: "bounty";
  pillar: Pillar;
  status: "open" | "completed" | "cancelled";
  rewardUSD: number;
  postedBy: string;
  deadline: number;
  cohort: string;
  payload: BountyPayload;
}

export type ArkivEntity =
  | ContributionEntity
  | EndorsementEntity
  | StreakEntity
  | ValidationRecordEntity
  | PassportEntity
  | BountyEntity;
