"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { createBounty } from "@/lib/arkiv/entities";
import { CURRENT_COHORT, type Pillar } from "@/lib/arkiv/constants";
import { CheckCircle, Lock } from "lucide-react";

export default function NewBountyPage() {
  const router = useRouter();
  const { authenticated, address, login, getWalletClient } = usePulseAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardUSD, setRewardUSD] = useState("");
  const [rewardToken, setRewardToken] = useState("USDC");
  const [pillar, setPillar] = useState<Pillar>("earn");
  const [deadlineDays, setDeadlineDays] = useState("7");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!address || !title || !rewardUSD) return;
    setSubmitting(true);
    setError("");
    try {
      const deadlineTs = Math.floor((Date.now() + parseInt(deadlineDays) * 86400000) / 1000);
      const wc = await getWalletClient();
      await createBounty(wc, address as `0x${string}`, {
        pillar,
        rewardUSD: parseFloat(rewardUSD),
        deadline: deadlineTs,
        cohort: CURRENT_COHORT,
        payload: {
          title,
          description,
          requirements: [],
          rewardToken,
          rewardAmount: parseFloat(rewardUSD),
        },
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to post bounty");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Lock className="w-8 h-8 text-[#9CA3AF] mx-auto mb-4" />
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-[#111827] mb-6 tracking-tight">
          Post a Bounty
        </h1>
        {done ? (
          <div className="card-ns text-center py-12">
            <CheckCircle className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
            <p className="font-bold text-[#111827] mb-4">Bounty posted on Arkiv!</p>
            <button onClick={() => router.push("/bounties")} className="btn-ns px-6 py-2.5">
              View Bounties
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Title</label>
              <input
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                placeholder="e.g. Build an AI content creation tool"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Description</label>
              <textarea
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827] resize-none"
                rows={4}
                placeholder="Describe the task and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Reward (USD)</label>
                <input
                  type="number"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  placeholder="1000"
                  value={rewardUSD}
                  onChange={(e) => setRewardUSD(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Token</label>
                <select
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  value={rewardToken}
                  onChange={(e) => setRewardToken(e.target.value)}
                >
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>GLM</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Pillar</label>
                <select
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as Pillar)}
                >
                  {["learn", "burn", "earn", "fun"].map((p) => (
                    <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Deadline</label>
                <select
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                >
                  {[3, 5, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-[#EF4444]">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!title || !rewardUSD || submitting}
              className="btn-ns w-full py-3"
              style={(!title || !rewardUSD) ? { opacity: 0.4 } : {}}
            >
              {submitting ? "Posting..." : "Post Bounty on Arkiv"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
