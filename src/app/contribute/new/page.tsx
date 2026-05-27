"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ChainWriteProgress, type WriteStep } from "@/components/ui/ChainWriteProgress";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { createContribution } from "@/lib/arkiv/entities";
import { CATEGORIES, PILLAR_COLORS, PILLAR_SOFT_COLORS, CURRENT_COHORT, type Pillar } from "@/lib/arkiv/constants";
import { getBasePoints } from "@/lib/points/calculator";
import { truncateHex } from "@/lib/utils/format";
import { GraduationCap, Flame, Bitcoin, PartyPopper, CheckCircle, ExternalLink, Copy, Check, Briefcase } from "lucide-react";

const PILLAR_ICONS = { learn: GraduationCap, burn: Flame, earn: Bitcoin, fun: PartyPopper };

const PILLAR_META: Record<Pillar, { image: string; desc: string; maxPts: number }> = {
  learn: { image: "/learn.webp", desc: "Teach workshops, mentor founders, create content.", maxPts: 100 },
  burn:  { image: "/burn.webp",  desc: "Work out, set records, join NS Cup events.",         maxPts: 75  },
  earn:  { image: "/earn.webp",  desc: "Win bounties, ship startups, build in public.",      maxPts: 200 },
  fun:   { image: "/fun.webp",   desc: "Organize events, build communities, drive culture.", maxPts: 70  },
};

const TAGS_BY_CATEGORY: Record<string, string[]> = {
  bounty_won: ["bounty", "earn", "USDC"],
  open_source: ["open-source", "github", "code"],
  session_taught: ["workshop", "teach", "education"],
  mentorship_given: ["mentorship", "coaching"],
  content_created: ["content", "writing", "tutorial"],
  daily_workout: ["fitness", "gym", "burn"],
  event_organized: ["community", "event", "fun"],
  startup_shipped: ["startup", "product", "ship"],
};

export default function NewContributionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, address, login, getWalletClient } = usePulseAuth();
  const [step, setStep] = useState(1);
  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [earnedDate, setEarnedDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [evidence, setEvidence] = useState("");
  const [txHash, setTxHash] = useState("");
  const [writeSteps, setWriteSteps] = useState<WriteStep[]>([]);
  const [entityKey, setEntityKey] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const bountyKey = searchParams.get("bountyKey") ?? undefined;

  const basePoints = pillar && category ? getBasePoints(pillar, category) : 0;

  function toggleTag(t: string) {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function handleSubmit() {
    if (!address || !pillar || !category) return;
    setStep(5);
    const steps: WriteStep[] = [
      { label: "Preparing contribution entity", status: "active" },
      { label: "Signing with your wallet", status: "pending" },
      { label: "Broadcasting to Arkiv Braga", status: "pending" },
      { label: "Confirmed on-chain", status: "pending" },
    ];
    setWriteSteps([...steps]);

    try {
      steps[0].status = "done";
      steps[1].status = "active";
      setWriteSteps([...steps]);

      const wc = await getWalletClient();
      const result = await createContribution(wc, {
        pillar,
        category,
        points: basePoints,
        cohort: CURRENT_COHORT,
        earnedAt: new Date(earnedDate).getTime(),
        contributorWallet: address as `0x${string}`,
        bountyKey,
        payload: {
          title,
          description,
          evidence,
          rewardTxHash: txHash || undefined,
          tags,
          validatorNotes: [],
        },
      });

      steps[1].status = "done";
      steps[2].status = "active";
      setWriteSteps([...steps]);

      steps[2].status = "done";
      steps[2].txHash = result.txHash;
      steps[3].status = "done";
      setWriteSteps([...steps]);
      setEntityKey(result.entityKey);
    } catch (e: any) {
      steps.forEach((s, i) => { if (s.status === "active") steps[i].status = "error"; });
      setWriteSteps([...steps]);
      setError(e?.message ?? "Transaction failed");
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <h1 className="text-xl font-bold text-[#111827] mb-4">Connect to log a contribution</h1>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-[#111827] mb-1 tracking-tight">
          Log a Contribution
        </h1>
        {bountyKey ? (
          <div className="flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3 py-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#F97316] shrink-0" />
            <p className="text-xs text-[#C2410C]">
              Completing bounty <span className="font-mono">{truncateHex(bountyKey, 8, 6)}</span> — this contribution will be linked to the bounty.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280] mb-6">Your contribution will need 2 peer validators before it appears on your profile.</p>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step > s ? "bg-[#10B981] text-white" : step === s ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-8 ${step > s ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Pillar + Category */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-[#111827] mb-4">What did you do?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {(["learn", "burn", "earn", "fun"] as Pillar[]).map((p) => {
                const meta = PILLAR_META[p];
                const active = pillar === p;
                return (
                  <button
                    key={p}
                    onClick={() => { setPillar(p); setCategory(""); }}
                    className={`relative rounded-2xl overflow-hidden h-60 sm:h-64 w-full text-left transition-all focus:outline-none ${
                      active ? "" : "hover:scale-[1.02]"
                    }`}
                  >
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${meta.image}')` }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-xl font-bold text-white capitalize mb-1">{p}</p>
                      <p className="text-xs text-white/80 leading-snug mb-3">{meta.desc}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${PILLAR_COLORS[p]}44`,
                            color: "#fff",
                            border: `1px solid ${PILLAR_COLORS[p]}88`,
                          }}
                        >
                          Up to {meta.maxPts} pts
                        </span>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                          style={
                            active
                              ? { backgroundColor: PILLAR_COLORS[p], color: "#fff" }
                              : { backgroundColor: "#fff", color: "#111827" }
                          }
                        >
                          {active ? "✓ Selected" : "Select"}
                        </span>
                      </div>
                    </div>
                    {/* Active border overlay */}
                    {active && (
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 0 3px ${PILLAR_COLORS[p]}` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {pillar && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#111827] mb-2">Category</label>
                <select
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES[pillar].map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} ({c.points} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {basePoints > 0 && (
              <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3 mb-4 text-sm text-[#6B7280]">
                This contribution earns <span className="font-bold text-[#111827]">{basePoints} base points</span>.
              </div>
            )}
            <button
              className="btn-ns w-full py-3"
              disabled={!pillar || !category}
              style={(!pillar || !category) ? { opacity: 0.4 } : {}}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-[#111827] mb-4">Tell us about it</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Title <span className="text-[#EF4444]">*</span></label>
                <input
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  placeholder="e.g. Won the AI Content Creation bounty"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                  maxLength={80}
                />
                <p className="text-xs text-[#9CA3AF] mt-1">{title.length}/80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Description <span className="text-[#EF4444]">*</span></label>
                <textarea
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827] resize-none"
                  rows={3}
                  placeholder="Describe what you did and why it matters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                />
                <p className="text-xs text-[#9CA3AF] mt-1">{description.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                  value={earnedDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEarnedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {(TAGS_BY_CATEGORY[category] ?? []).map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        tags.includes(t)
                          ? "bg-[#111827] text-white border-[#111827]"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-ns-outline flex-1 py-3">← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!title.trim() || description.length < 20}
                className="btn-ns flex-1 py-3"
                style={(!title.trim() || description.length < 20) ? { opacity: 0.4 } : {}}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-[#111827] mb-4">Add evidence</h2>
            <p className="text-sm text-[#6B7280] mb-4">
              A link to proof — GitHub, Twitter/X, YouTube, IPFS. Required for Learn and Earn contributions.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Evidence URL</label>
                <input
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#111827]"
                  placeholder="https://github.com/..."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
                {evidence && (
                  <a
                    href={evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline mt-1"
                  >
                    Preview link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {(category === "bounty_won" || category === "fundraise") && (
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Payout Transaction Hash (optional)</label>
                  <input
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#111827]"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-ns-outline flex-1 py-3">← Back</button>
              <button onClick={() => setStep(4)} className="btn-ns flex-1 py-3">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-[#111827] mb-4">Review & Submit</h2>
            <div className="card-ns mb-4 space-y-3">
              <div className="flex items-center gap-2">
                {pillar && <PillarBadge pillar={pillar} />}
                <span className="text-sm text-[#6B7280]">
                  {CATEGORIES[pillar!]?.find((c) => c.value === category)?.label}
                </span>
              </div>
              <p className="text-base font-semibold text-[#111827]">{title}</p>
              <p className="text-sm text-[#6B7280]">{description}</p>
              {evidence && (
                <a href={evidence} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#0D9488] hover:underline">
                  Evidence <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                <span className="text-sm text-[#6B7280]">Base points</span>
                <span className="text-lg font-black" style={{ color: pillar ? PILLAR_COLORS[pillar] : "#111827" }}>
                  +{basePoints}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-4">
              This contribution needs 2 peer validators before appearing on your profile.
            </p>
            {error && <p className="text-sm text-[#EF4444] mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-ns-outline flex-1 py-3">← Back</button>
              <button onClick={handleSubmit} className="btn-ns flex-1 py-3">
                Sign &amp; Submit to Arkiv
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Writing */}
        {step === 5 && (
          <div>
            <ChainWriteProgress steps={writeSteps} />
            {entityKey && (
              <div className="mt-6 card-ns">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Contribution recorded on Arkiv!</p>
                    <p className="text-xs text-[#6B7280]">Share the link below to collect peer validations.</p>
                  </div>
                </div>

                {/* Shareable validation link */}
                <div className="bg-[#F0FDFA] border border-[#6EE7B7] rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-[#059669] mb-1.5">Validation link — share with 2 peers</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-mono text-xs text-[#0D9488] break-all">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/contribute/validate/${entityKey}`
                        : `/contribute/validate/${entityKey}`}
                    </span>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/contribute/validate/${entityKey}`;
                        navigator.clipboard.writeText(url).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] transition-colors"
                      title="Copy link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#9CA3AF] mb-4">
                  Your contribution needs 2 peer validations before points appear on your profile and the leaderboard.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/profile/${address}`)}
                    className="btn-ns text-sm px-4 py-2 flex-1"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => { setStep(1); setPillar(null); setCategory(""); setTitle(""); setDescription(""); setEvidence(""); setEntityKey(""); setError(""); setCopied(false); }}
                    className="btn-ns-outline text-sm px-4 py-2"
                  >
                    Log Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
