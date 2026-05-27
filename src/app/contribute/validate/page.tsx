"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ArkivBadge } from "@/components/ui/ArkivBadge";
import { ChainWriteProgress, type WriteStep } from "@/components/ui/ChainWriteProgress";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { getPendingValidationQueue, getValidationsForContribution } from "@/lib/arkiv/queries";
import { createValidationRecord, updateContributionStatus } from "@/lib/arkiv/entities";
import { CURRENT_COHORT } from "@/lib/arkiv/constants";
import { truncateHex, formatRelativeDate, parseEntityPayload } from "@/lib/utils/format";
import { CheckCircle, XCircle, ExternalLink, Lock, CheckSquare, Copy, Check, Link2 } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function ValidatePage() {
  const { authenticated, address, login, getWalletClient } = usePulseAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"approved" | "rejected" | null>(null);
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState(false);
  const [writeSteps, setWriteSteps] = useState<WriteStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Per-contribution validation counts loaded lazily
  const [valCounts, setValCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!address) return;
    getPendingValidationQueue(CURRENT_COHORT, 30)
      .then((q) => {
        const filtered = (q as any[]).filter(
          (c) => attrs(c).contributorWallet?.toLowerCase() !== address.toLowerCase()
        );
        setQueue(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  async function handleValidate(contribution: any) {
    if (!address || !verdict || !note.trim() || !verified) return;
    setSubmitting(true);
    const a = attrs(contribution);
    const steps: WriteStep[] = [
      { label: "Writing ValidationRecord to Arkiv", status: "active" },
      { label: "Updating contribution status", status: "pending" },
    ];
    setWriteSteps([...steps]);

    try {
      const wc = await getWalletClient();
      await createValidationRecord(wc, address as `0x${string}`, {
        contributionKey: contribution.key,
        contributorWallet: a.contributorWallet,
        verdict,
        payload: { note: note.trim(), evidenceVerified: verified },
      });
      steps[0].status = "done";
      steps[1].status = "active";
      setWriteSteps([...steps]);

      if (verdict === "approved") {
        const existingValidations = await getValidationsForContribution(contribution.key);
        const approvedCount = (existingValidations as any[]).filter(
          (v) => attrs(v).verdict === "approved"
        ).length;
        if (approvedCount >= 2) {
          await updateContributionStatus(
            contribution.key as `0x${string}`,
            wc,
            "validated",
            approvedCount,
            parseEntityPayload(contribution) as any,
            contribution.attributes ?? []
          );
        }
      }

      steps[1].status = "done";
      setWriteSteps([...steps]);
      setQueue((q) => q.filter((c) => c.key !== contribution.key));
      setTimeout(() => {
        setActiveKey(null);
        setVerdict(null);
        setNote("");
        setVerified(false);
        setWriteSteps([]);
        setSubmitting(false);
      }, 2000);
    } catch (e: any) {
      steps.forEach((s, i) => { if (s.status === "active") steps[i].status = "error"; });
      setWriteSteps([...steps]);
      setError(e?.message ?? "Transaction failed");
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Lock className="w-8 h-8 text-[#9CA3AF] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827] mb-2">Connect to validate</h1>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">
              Validation Queue
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {queue.length} contribution{queue.length !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-[#10B981]" />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[#9CA3AF]">Loading queue...</p>
        ) : queue.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="Queue is empty"
            description="All contributions have been validated. Check back later."
          />
        ) : (
          <div className="space-y-4">
            {queue.map((contribution) => {
              const a = attrs(contribution);
              const payload = parseEntityPayload(contribution);
              const isActive = activeKey === contribution.key;

              return (
                <div key={contribution.key} className="card-ns">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {a.pillar && <PillarBadge pillar={a.pillar} size="sm" />}
                        <span className="text-xs text-[#9CA3AF]">
                          from {truncateHex(a.contributorWallet ?? "", 8, 6)}
                        </span>
                        <span className="text-xs text-[#9CA3AF] ml-auto">
                          {a.createdAt ? formatRelativeDate(a.createdAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#111827]">{payload.title ?? a.category}</p>
                      {payload.description && (
                        <p className="text-xs text-[#6B7280] mt-1">{payload.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {payload.evidence && (
                          <a
                            href={payload.evidence}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline"
                          >
                            View evidence <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="text-xs text-[#9CA3AF]">{a.validationCount ?? 0}/2 validators</span>
                        <span className="text-xs font-bold text-[#111827] ml-auto">+{a.points} pts</span>
                      </div>
                    </div>
                  </div>

                  {!isActive && (
                    <div className="flex gap-2 pt-3 border-t border-[#F3F4F6]">
                      <button
                        onClick={() => { setActiveKey(contribution.key); setVerdict("approved"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Confirm
                      </button>
                      <button
                        onClick={() => { setActiveKey(contribution.key); setVerdict("rejected"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {isActive && (
                    <div className="pt-3 border-t border-[#F3F4F6]">
                      {writeSteps.length > 0 ? (
                        <ChainWriteProgress steps={writeSteps} />
                      ) : (
                        <>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-[#111827] mb-1">
                              {verdict === "approved" ? "✓ Confirming" : "✗ Rejecting"} this contribution
                            </p>
                            <textarea
                              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111827] resize-none"
                              rows={2}
                              placeholder="Describe how you know this contribution happened... (required)"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-[#6B7280] mb-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={verified}
                              onChange={(e) => setVerified(e.target.checked)}
                              className="w-4 h-4 accent-black"
                            />
                            I verified the evidence link
                          </label>
                          {error && <p className="text-xs text-[#EF4444] mb-2">{error}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setActiveKey(null); setVerdict(null); setNote(""); setVerified(false); }}
                              className="btn-ns-outline text-sm px-3 py-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleValidate(contribution)}
                              disabled={!note.trim() || !verified || submitting}
                              className="btn-ns text-sm px-4 py-2 flex-1"
                              style={(!note.trim() || !verified) ? { opacity: 0.4 } : {}}
                            >
                              {verdict === "approved" ? "Confirm on Arkiv" : "Reject on Arkiv"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {contribution.key && (
                    <div className="mt-3">
                      <ArkivBadge entityKey={contribution.key} creator={contribution.$creator} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
