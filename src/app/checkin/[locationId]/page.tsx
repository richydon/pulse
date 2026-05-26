"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { getActiveStreak } from "@/lib/arkiv/queries";
import { createStreak, updateStreakCheckin } from "@/lib/arkiv/entities";
import { NS_LOCATIONS, type LocationId } from "@/lib/arkiv/constants";
import { isStreakBroken, hasCheckedInToday, checkMilestone } from "@/lib/streak/milestones";
import { parseEntityPayload } from "@/lib/utils/format";
import { CheckCircle, Flame, MapPin, Lock } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function LocationCheckinPage(props: { params: Promise<{ locationId: string }> }) {
  const { authenticated, address, login } = usePulseAuth();
  const [locationId, setLocationId] = useState<LocationId | null>(null);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    props.params.then(({ locationId: id }) => {
      setLocationId(id as LocationId);
    });
  }, []);

  useEffect(() => {
    if (!address) return;
    getActiveStreak(address)
      .then(setStreak)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  const location = locationId ? NS_LOCATIONS[locationId] : null;

  async function handleCheckin() {
    if (!address || !location || !locationId) return;
    setChecking(true);
    setError("");

    try {
      const streakAttrs = streak ? attrs(streak) : null;

      if (!streak || isStreakBroken(streakAttrs?.lastCheckinAt ?? 0)) {
        const result = await createStreak(address as `0x${string}`, "daily_burn", undefined, location.name);
        const count = 1;
        setNewCount(count);
        const m = checkMilestone(count);
        setMilestone(m);
        await getActiveStreak(address).then(setStreak).catch(() => {});
      } else if (hasCheckedInToday(streakAttrs.lastCheckinAt)) {
        setError("You've already checked in today!");
        setChecking(false);
        return;
      } else {
        const currentCount = streakAttrs.currentCount ?? 0;
        const bestCount = streakAttrs.bestCount ?? 0;
        await updateStreakCheckin(
          streak.key as `0x${string}`,
          address as `0x${string}`,
          currentCount,
          bestCount,
          (parseEntityPayload(streak) as any) ?? { streakType: "daily_burn", checkIns: [] },
          streak.attributes ?? [],
          location.name
        );
        const count = currentCount + 1;
        setNewCount(count);
        const m = checkMilestone(count);
        setMilestone(m);
      }
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Check-in failed");
    } finally {
      setChecking(false);
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-sm mx-auto px-6 py-24 text-center">
          <Lock className="w-8 h-8 text-[#9CA3AF] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#111827] mb-2">
            {location?.name ?? "Location Check-in"}
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">Connect your wallet to record your check-in on Arkiv.</p>
          <button onClick={() => login()} className="btn-ns px-6 py-3 w-full">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-sm mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-[#F97316]" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {location?.name ?? "Unknown Location"}
        </h1>
        <p className="text-sm text-[#6B7280] mb-2 capitalize">{location?.pillar} · +{location?.points} pts</p>
        <p className="text-xs text-[#9CA3AF] mb-8">{new Date().toLocaleString()}</p>

        {!loading && !done && (
          <>
            {streak && !isStreakBroken(attrs(streak).lastCheckinAt ?? 0) && (
              <div className="rounded-xl bg-[#FFF7ED] border border-[#FDBA74] p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-[#F97316]" />
                  <span className="text-2xl font-black text-[#F97316]">{attrs(streak).currentCount ?? 0}</span>
                </div>
                <p className="text-sm text-[#9A3412]">day streak — keep it going!</p>
              </div>
            )}
            {error && <p className="text-sm text-[#EF4444] mb-4">{error}</p>}
            <button
              onClick={handleCheckin}
              disabled={checking}
              className="btn-ns w-full py-4 text-base"
              style={checking ? { opacity: 0.6 } : {}}
            >
              {checking ? "Recording on Arkiv..." : "Check In"}
            </button>
          </>
        )}

        {done && (
          <div className="card-ns text-center">
            <CheckCircle className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
            <p className="font-bold text-[#111827] text-lg mb-1">Checked in!</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-[#F97316]" />
              <span className="text-2xl font-black text-[#F97316]">{newCount}</span>
              <span className="text-sm text-[#6B7280]">day streak</span>
            </div>
            {milestone && (
              <div className="rounded-lg bg-[#FFFBEB] border border-[#FDE68A] p-3 mt-3">
                <p className="text-sm font-bold text-[#92400E]">🎉 Milestone reached! {newCount} days</p>
                <p className="text-xs text-[#92400E]">Bonus contribution created</p>
              </div>
            )}
            <p className="text-xs text-[#9CA3AF] mt-3">Check-in recorded on Arkiv Braga</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
