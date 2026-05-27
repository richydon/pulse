"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ArkivBadge } from "@/components/ui/ArkivBadge";
import { ChainWriteProgress, type WriteStep } from "@/components/ui/ChainWriteProgress";
import { getBountyByKey, getSubmissionsForBounty } from "@/lib/arkiv/queries";
import { markBountyWinner } from "@/lib/arkiv/entities";
import { formatUSD, formatCountdown, truncateHex, formatRelativeDate, parseEntityPayload } from "@/lib/utils/format";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { Clock, ExternalLink, Trophy, CheckCircle, Users } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function BountyDetailPage(props: { params: Promise<{ key: string }> }) {
  const { address, getWalletClient } = usePulseAuth();
  const [bounty, setBounty] = useState<any>(null);
  const [bountyKey, setBountyKey] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingWinner, setMarkingWinner] = useState<string | null>(null);
  const [winnerSteps, setWinnerSteps] = useState<WriteStep[]>([]);
  const [winnerError, setWinnerError] = useState("");

  useEffect(() => {
    props.params.then(({ key }) => {
      setBountyKey(key);
      Promise.all([
        getBountyByKey(key as `0x${string}`).catch(() => null),
        getSubmissionsForBounty(key).catch(() => []),
      ])
        .then(([b, subs]) => {
          setBounty(b);
          setSubmissions(subs as any[]);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  async function handleMarkWinner(submission: any) {
    if (!bounty || !address) return;
    setMarkingWinner(submission.key);
    setWinnerError("");
    const a = attrs(submission);
    const steps: WriteStep[] = [
      { label: "Recording winner on Arkiv", status: "active" },
      { label: "Updating bounty status", status: "pending" },
    ];
    setWinnerSteps([...steps]);
    try {
      const wc = await getWalletClient();
      const bountyA = attrs(bounty);
      const bountyPayload = parseEntityPayload(bounty);
      await markBountyWinner(
        bounty.key as `0x${string}`,
        wc,
        a.contributorWallet ?? "",
        submission.key,
        bountyPayload as any,
        bounty.attributes ?? []
      );
      steps[0].status = "done";
      steps[1].status = "done";
      setWinnerSteps([...steps]);
      // Optimistically update bounty status
      setBounty((prev: any) => ({
        ...prev,
        attributes: (prev.attributes ?? []).map((at: any) =>
          at.key === "status" ? { ...at, value: "completed" } : at
        ),
      }));
      setTimeout(() => {
        setMarkingWinner(null);
        setWinnerSteps([]);
      }, 2000);
    } catch (e: any) {
      steps.forEach((s, i) => { if (s.status === "active" || s.status === "pending") steps[i].status = "error"; });
      setWinnerSteps([...steps]);
      setWinnerError(e?.message ?? "Transaction failed");
      setMarkingWinner(null);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-6 py-16 text-center text-sm text-[#9CA3AF]">Loading...</div>
      </AppShell>
    );
  }

  if (!bounty) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-6 py-16 text-center text-sm text-[#6B7280]">Bounty not found.</div>
      </AppShell>
    );
  }

  const a = attrs(bounty);
  const payload = parseEntityPayload(bounty);
  const isPoster = !!address && a.postedBy?.toLowerCase() === address.toLowerCase();
  const isOpen = a.status === "open";
  const imageUrl = (payload as any).imageUrl as string | undefined;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        {/* Hero image */}
        {imageUrl && (
          <div className="rounded-xl overflow-hidden mb-5 bg-[#F3F4F6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={(payload as any).title ?? "Bounty"}
              className="w-full h-56 object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          {a.pillar && <PillarBadge pillar={a.pillar} />}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            a.status === "open"
              ? "bg-[#ECFDF5] text-[#10B981]"
              : a.status === "completed"
              ? "bg-[#EFF6FF] text-[#2563EB]"
              : "bg-[#F3F4F6] text-[#6B7280]"
          }`}>
            {a.status}
          </span>
          {submissions.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[#6B7280]">
              <Users className="w-3.5 h-3.5" /> {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black text-[#111827] mb-3 tracking-tight">
          {(payload as any).title}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <p className="text-3xl font-black text-[#10B981]">{formatUSD(a.rewardUSD ?? 0)}</p>
            <p className="text-xs text-[#9CA3AF]">{(payload as any).rewardToken ?? "USDC"}</p>
          </div>
          {a.deadline && (
            <div className="flex items-center gap-1.5 text-sm text-[#F59E0B]">
              <Clock className="w-4 h-4" />
              {formatCountdown(a.deadline)} remaining
            </div>
          )}
        </div>

        {(payload as any).description && (
          <div className="card-ns mb-4">
            <p className="text-sm text-[#6B7280]">{(payload as any).description}</p>
          </div>
        )}

        <p className="text-xs text-[#9CA3AF] mb-4">
          Posted by{" "}
          <a
            href={`/profile/${a.postedBy}`}
            className="font-mono text-[#0D9488] hover:underline"
          >
            {truncateHex(a.postedBy ?? "", 8, 6)}
          </a>
        </p>

        {bounty.key && (
          <div className="mb-6">
            <ArkivBadge entityKey={bounty.key} creator={bounty.$creator} owner={bounty.$owner} />
          </div>
        )}

        {/* Winner banner (completed bounty) */}
        {a.status === "completed" && (payload as any).winnerWallet && (
          <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 mb-6 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#2563EB] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1D4ED8]">Bounty Completed</p>
              <p className="text-xs text-[#3B82F6] mt-0.5">
                Winner:{" "}
                <a href={`/profile/${(payload as any).winnerWallet}`} className="underline">
                  {truncateHex((payload as any).winnerWallet, 8, 6)}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* CTA to submit */}
        {isOpen && (
          <div className="mt-2 mb-6 card-ns bg-[#F0FDFA] border-[#CCFBF1]">
            <p className="text-sm font-medium text-[#111827] mb-2">Claim this bounty</p>
            <p className="text-xs text-[#6B7280] mb-3">
              Complete the task, then log it as a contribution with your evidence link. Your submission will appear below for the poster to review.
            </p>
            <a
              href={`/contribute/new?bountyKey=${bounty.key}`}
              className="btn-ns text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              Submit Contribution <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Submissions section */}
        {submissions.length > 0 && (
          <div className="mt-2">
            <h2 className="text-base font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B7280]" />
              Submissions ({submissions.length})
            </h2>
            <div className="space-y-3">
              {submissions.map((sub) => {
                const sa = attrs(sub);
                const sp = parseEntityPayload(sub);
                const isWinner =
                  a.status === "completed" &&
                  (payload as any).winnerWallet?.toLowerCase() === sa.contributorWallet?.toLowerCase();
                const isMarkingThis = markingWinner === sub.key;

                return (
                  <div
                    key={sub.key}
                    className={`card-ns ${isWinner ? "border-[#BFDBFE] bg-[#EFF6FF]" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {sa.pillar && <PillarBadge pillar={sa.pillar} size="sm" />}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            sa.status === "validated"
                              ? "bg-[#ECFDF5] text-[#10B981]"
                              : "bg-[#FEF3C7] text-[#D97706]"
                          }`}>
                            {sa.status}
                          </span>
                          {isWinner && (
                            <span className="flex items-center gap-1 text-xs text-[#2563EB] font-medium">
                              <Trophy className="w-3 h-3" /> Winner
                            </span>
                          )}
                          <span className="text-xs text-[#9CA3AF] ml-auto">
                            {sa.createdAt ? formatRelativeDate(sa.createdAt) : ""}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#111827]">
                          {(sp as any).title ?? sa.category}
                        </p>
                        {(sp as any).description && (
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
                            {(sp as any).description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#9CA3AF]">
                          <a
                            href={`/profile/${sa.contributorWallet}`}
                            className="text-[#0D9488] hover:underline"
                          >
                            {truncateHex(sa.contributorWallet ?? "", 8, 6)}
                          </a>
                          {(sp as any).evidence && (
                            <a
                              href={(sp as any).evidence}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#0D9488] hover:underline"
                            >
                              Evidence <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <span className="font-bold text-[#111827] ml-auto">+{sa.points} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Mark winner — only poster can do this, only on open bounties */}
                    {isPoster && isOpen && !isWinner && (
                      <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                        {isMarkingThis && winnerSteps.length > 0 ? (
                          <>
                            <ChainWriteProgress steps={winnerSteps} />
                            {winnerError && (
                              <p className="text-xs text-[#EF4444] mt-2">{winnerError}</p>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleMarkWinner(sub)}
                            disabled={!!markingWinner}
                            className="btn-ns text-xs px-3 py-1.5 flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark as Winner
                          </button>
                        )}
                      </div>
                    )}

                    {sub.key && (
                      <div className="mt-3">
                        <ArkivBadge entityKey={sub.key} creator={sub.$creator} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty submissions */}
        {!loading && submissions.length === 0 && isOpen && (
          <p className="text-xs text-[#9CA3AF] text-center mt-2">
            No submissions yet. Be the first to claim this bounty!
          </p>
        )}
      </div>
    </AppShell>
  );
}
