import { STREAK_MILESTONES, STREAK_MILESTONE_POINTS } from "@/lib/arkiv/constants";

export function checkMilestone(newCount: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (newCount === m) return STREAK_MILESTONE_POINTS[m];
  }
  return null;
}

export function isStreakBroken(lastCheckinAt: number): boolean {
  const lastMidnight = new Date();
  lastMidnight.setHours(0, 0, 0, 0);
  const yesterdayMidnight = lastMidnight.getTime() - 86400000;
  return lastCheckinAt < yesterdayMidnight;
}

export function hasCheckedInToday(lastCheckinAt: number): boolean {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return lastCheckinAt >= todayMidnight.getTime();
}

export function nextMilestone(currentCount: number): { milestone: number; pointsAwarded: number } | null {
  for (const m of STREAK_MILESTONES) {
    if (m > currentCount) return { milestone: m, pointsAwarded: STREAK_MILESTONE_POINTS[m] };
  }
  return null;
}
