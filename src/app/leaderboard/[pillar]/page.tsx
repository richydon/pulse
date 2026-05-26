"use client";

import { redirect } from "next/navigation";

export default async function PillarLeaderboardPage(props: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await props.params;
  const valid = ["learn", "burn", "earn", "fun"];
  if (!valid.includes(pillar)) redirect("/leaderboard");
  redirect(`/leaderboard?pillar=${pillar}`);
}
