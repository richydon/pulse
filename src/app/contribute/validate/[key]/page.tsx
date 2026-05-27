"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ArkivBadge } from "@/components/ui/ArkivBadge";
import { ChainWriteProgress, type WriteStep } from "@/components/ui/ChainWriteProgress";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { getContributionByKey, getValidationsForContribution } from "@/lib/arkiv/queries";
import { createValidationRecord } from "@/lib/arkiv/entities";
import { truncateHex, formatRelativeDate, parseEntityPayload } from "@/lib/utils/format";
import { PILLAR_COLORS } from "@/lib/arkiv/constants";
import {
  CheckCircle, XCircle, ExternalLink, Lock, Copy, Check,
  AlertCircle, Shield, User,
} from "lucide-react";

function attrs(e: any) {
  return (e?.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function ValidateContributionPage(props: { params: Promise<{ key: string }> }) {
  const { authenticated, address, login, getWalletClient } = usePulseAuth();

  const [entityKey, setEntityKey] = useState<string>("");
  const [contribution, setContribution] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // form state
  const [verdict, setVerdict] = useState<"approved" | "rejected" | null>(null);
  const [note, setNote] = useState("");
  const [evidenceChecked, setEvidenceChecked] = useState(false);
  const [writeSteps, setWriteSteps] = useState<WriteStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Load contribution + existing validations
  useEffect(() => {
    props.params.then(({ key }) => {
      setEntityKey(key);
      Promise.all([
        getContributionByKey(key).catch(() => null),
        getValidationsForContribution(key).catch(() => []),
      ]).then(([c, vs]) => {
        if (!c || attrs(c).type !== "contribution") {
          setNotFound(true);
        } else {
          setContribution(c);
          setValidations(vs as any[]);
        }
        setLoading(false);
      });
    });
  }, []);

  const a = attrs(contribution);
  const payload = parseEntityPayload(contribution);
  const approvals = validations.filter((v) => attrs(v).verdict === "approved");
  const isValidated = a.status === "validated";
  const isOwn = !!address && a.contributorWallet === address.toLowerCase();
  const alreadyValidatedByMe = validations.some(
    (v) => attrs(v).validatorWallet === address?.toLowerCase()
  );
  const hasEvidence = !!payload.evidence;
  const canSubmit = verdict !== null && note.trim().length >= 10 && (!hasEvidence || evidenceChecked) && !submitting;

  async function handleSubmit() {
    if (!address || !verdict || !canSubmit) return;
    setSubmitting(true);
    setError("");
    const steps: WriteStep[] = [
      { label: "Writing ValidationRecord to Arkiv", status: "active" },
      { label: "Confirmed on-chain", status: "pending" },
    ];
    setWriteSteps([...steps]);

    try {
      const wc = await getWalletClient();
      await createValidationRecord(wc, address as `0x${string}`, {
        contributionKey: entityKey,
        contributorWallet: a.contributorWallet,
        verdict,
        payload: { note: note.trim(), evidenceVerified: evidenceChecked },
      });
      steps[0].status = "done";
      steps[1].status = "done";
      setWriteSteps([...steps]);

      // Refresh validation count
      const updated = await getValidationsForContribution(entityKey).catch(() => validations);
      setValidations(updated as any[]);
      setDone(true);
      setSubmitting(false);
    } catch (e: any) {
      steps.forEach((s, i) => { if (s.status === "active") steps[i].status = "error"; });
      setWriteSteps([...steps]);
      setError(e?.message ?? "Transaction failed");
      setSubmitting(false);
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/contribute/validate/${entityKey}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#111827] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#9CA3AF] mt-4">Loading contribution…</p>
        </div>
      </AppShell>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-3" />
          <h1 className="text-lg font-bold text-[#111827] mb-1">Contribution not found</h1>
          <p className="text-sm text-[#6B7280]">The link may be invalid or the entity has expired.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">Validate Contribution</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Review and confirm this peer contribution on Arkiv</p>
          </div>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] rounded-lg px-3 py-1.5 transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* Contribution card */}
        <div className="card-ns mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {a.pillar && <PillarBadge pillar={a.pillar} size="sm" />}
                <span className="text-xs text-[#9CA3AF]">
                  by{" "}
                  <Link
                    href={`/profile/${a.contributorWallet}`}
                    className="text-[#0D9488] hover:underline"
                  >
                    {truncateHex(a.contributorWallet ?? "", 8, 6)}
                  </Link>
                </span>
                {a.createdAt && (
                  <span className="text-xs text-[#9CA3AF] ml-auto">{formatRelativeDate(a.createdAt)}</span>
                )}
              </div>
              <p className="text-base font-bold text-[#111827]">{payload.title ?? a.category}</p>
              {payload.description && (
                <p className="text-sm text-[#6B7280] mt-1">{payload.description}</p>
              )}
              {payload.evidence && (
                <a
                  href={payload.evidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline mt-2"
                >
                  View evidence <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black" style={{ color: PILLAR_COLORS[a.pillar as keyof typeof PILLAR_COLORS] ?? "#111827" }}>
                +{a.points}
              </p>
              <p className="text-xs text-[#9CA3AF]">pts</p>
            </div>
          </div>

          {/* Validation progress */}
          <div className="border-t border-[#F3F4F6] pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#6B7280]">Peer validations</span>
              <span className="text-xs font-bold text-[#111827]">{approvals.length}/2</span>
            </div>
            <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((approvals.length / 2) * 100, 100)}%`,
                  backgroundColor: isValidated ? "#10B981" : approvals.length >= 1 ? "#F59E0B" : "#D1D5DB",
                }}
              />
            </div>
          </div>
        </div>

        {/* Already validated banner */}
        {isValidated && (
          <div className="flex items-center gap-3 bg-[#ECFDF5] border border-[#6EE7B7] rounded-xl p-4 mb-4">
            <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#065F46]">Validated on Arkiv</p>
              <p className="text-xs text-[#6B7280]">This contribution has been confirmed by 2 peers and points have been awarded.</p>
            </div>
          </div>
        )}

        {/* Arkiv badge */}
        {contribution?.key && (
          <div className="mb-4">
            <ArkivBadge entityKey={contribution.key} creator={contribution.creator} />
          </div>
        )}

        {/* ── Guard states ───────────────────────────────────────────── */}

        {/* Not connected */}
        {!authenticated && !isValidated && (
          <div className="card-ns text-center py-8">
            <Lock className="w-7 h-7 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827] mb-1">Connect your wallet to validate</p>
            <p className="text-xs text-[#9CA3AF] mb-4">Validation is recorded on-chain against your wallet address.</p>
            <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
          </div>
        )}

        {/* Own contribution */}
        {authenticated && isOwn && !isValidated && (
          <div className="card-ns text-center py-6">
            <User className="w-7 h-7 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827] mb-1">This is your contribution</p>
            <p className="text-xs text-[#9CA3AF] mb-4">Share this link with 2 peers to collect validations.</p>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 btn-ns text-sm px-5 py-2.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Validation Link"}
            </button>
          </div>
        )}

        {/* Already validated by me */}
        {authenticated && !isOwn && alreadyValidatedByMe && !isValidated && (
          <div className="card-ns text-center py-6">
            <Shield className="w-7 h-7 text-[#10B981] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827] mb-1">You already validated this contribution</p>
            <p className="text-xs text-[#9CA3AF]">Your validation has been recorded on Arkiv.</p>
          </div>
        )}

        {/* Success state after submitting */}
        {done && (
          <div className="card-ns text-center py-6">
            <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#111827] mb-1">
              {verdict === "approved" ? "Validation confirmed on Arkiv!" : "Rejection recorded on Arkiv."}
            </p>
            <p className="text-xs text-[#6B7280] mb-3">
              {approvals.length >= 2
                ? "This contribution now has 2 approvals. The contributor can finalise it from their profile."
                : `${approvals.length}/2 approvals — one more needed.`}
            </p>
            <Link href="/contribute/validate" className="text-xs text-[#2563EB] hover:underline">
              Back to validation queue →
            </Link>
          </div>
        )}

        {/* ── Validation form ────────────────────────────────────────── */}
        {authenticated && !isOwn && !alreadyValidatedByMe && !isValidated && !done && (
          <div className="card-ns">
            <p className="text-sm font-semibold text-[#111827] mb-4">Your validation</p>

            {writeSteps.length > 0 ? (
              <ChainWriteProgress steps={writeSteps} />
            ) : (
              <>
                {/* Approve / Reject toggle */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setVerdict("approved")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      verdict === "approved"
                        ? "border-[#10B981] bg-[#ECFDF5] text-[#059669]"
                        : "border-[#E5E7EB] text-[#6B7280] hover:border-[#10B981] hover:text-[#059669]"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setVerdict("rejected")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      verdict === "rejected"
                        ? "border-[#EF4444] bg-[#FEF2F2] text-[#DC2626]"
                        : "border-[#E5E7EB] text-[#6B7280] hover:border-[#EF4444] hover:text-[#DC2626]"
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>

                {/* Note */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[#374151] mb-1">
                    How do you know this happened? <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827] resize-none"
                    rows={3}
                    placeholder="e.g. I was there, I saw the evidence, I can confirm this contribution…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  {note.length > 0 && note.length < 10 && (
                    <p className="text-xs text-[#F59E0B] mt-1">At least 10 characters required.</p>
                  )}
                </div>

                {/* Evidence checkbox */}
                {hasEvidence && (
                  <label className="flex items-center gap-2.5 text-sm text-[#6B7280] mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evidenceChecked}
                      onChange={(e) => setEvidenceChecked(e.target.checked)}
                      className="w-4 h-4 accent-black"
                    />
                    I reviewed the evidence link
                  </label>
                )}

                {error && <p className="text-xs text-[#EF4444] mb-3">{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="btn-ns w-full py-3 text-sm"
                  style={!canSubmit ? { opacity: 0.4 } : {}}
                >
                  {verdict === "approved" ? "Confirm on Arkiv" : verdict === "rejected" ? "Reject on Arkiv" : "Select Approve or Reject"}
                </button>

                <p className="text-xs text-[#9CA3AF] text-center mt-3">
                  This action writes a permanent ValidationRecord to the Arkiv Braga chain.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
