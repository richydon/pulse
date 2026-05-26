"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ChainWriteProgress, type WriteStep } from "@/components/ui/ChainWriteProgress";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { createContribution } from "@/lib/arkiv/entities";
import { CATEGORIES, PILLAR_COLORS, PILLAR_SOFT_COLORS, CURRENT_COHORT, type Pillar } from "@/lib/arkiv/constants";
import { getBasePoints } from "@/lib/points/calculator";
import { GraduationCap, Flame, Bitcoin, PartyPopper, CheckCircle, ExternalLink } from "lucide-react";

const PILLAR_ICONS = { learn: GraduationCap, burn: Flame, earn: Bitcoin, fun: PartyPopper };

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
  const { authenticated, address, login } = usePulseAuth();
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

      const result = await createContribution(address as `0x${string}`, {
        pillar,
        category,
        points: basePoints,
        cohort: CURRENT_COHORT,
        earnedAt: new Date(earnedDate).getTime(),
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
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Log a Contribution
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">Your contribution will need 2 peer validators before it appears on your profile.</p>

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
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["learn", "burn", "earn", "fun"] as Pillar[]).map((p) => {
                const Icon = PILLAR_ICONS[p];
                const active = pillar === p;
                return (
                  <button
                    key={p}
                    onClick={() => { setPillar(p); setCategory(""); }}
                    className="card-ns flex flex-col items-center py-5 transition-all hover:shadow-sm"
                    style={active ? { borderColor: PILLAR_COLORS[p], backgroundColor: PILLAR_SOFT_COLORS[p] } : {}}
                  >
                    <Icon className="w-6 h-6 mb-2" style={{ color: PILLAR_COLORS[p] }} />
                    <span className="text-sm font-semibold capitalize" style={{ color: active ? PILLAR_COLORS[p] : "#111827" }}>
                      {p}
                    </span>
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
              <div className="mt-6 card-ns text-center">
                <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto mb-3" />
                <p className="font-semibold text-[#111827] mb-1">Contribution recorded on Arkiv!</p>
                <p className="text-sm text-[#6B7280] mb-3">Share this link to request validation from peers:</p>
                <div className="font-mono text-xs text-[#0D9488] bg-[#F0FDFA] rounded p-2 break-all mb-4">
                  {entityKey}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => router.push(`/profile/${address}`)}
                    className="btn-ns text-sm px-4 py-2"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => { setStep(1); setPillar(null); setCategory(""); setTitle(""); setDescription(""); setEvidence(""); setEntityKey(""); setError(""); }}
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
