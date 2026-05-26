"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { createEndorsement } from "@/lib/arkiv/entities";
import { getEndorsementsGivenByWallet } from "@/lib/arkiv/queries";
import { ALL_SKILLS } from "@/lib/arkiv/constants";
import { truncateHex, walletToColor, getInitials } from "@/lib/utils/format";
import { Star, CheckCircle, Lock } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function EndorsePage(props: { params: Promise<{ wallet: string }> }) {
  const { authenticated, address, login } = usePulseAuth();
  const [toWallet, setToWallet] = useState("");
  const [skill, setSkill] = useState("");
  const [strength, setStrength] = useState(3);
  const [testimonial, setTestimonial] = useState("");
  const [context, setContext] = useState("");
  const [relationship, setRelationship] = useState<"peer" | "mentee" | "collaborator" | "student">("peer");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [entityKey, setEntityKey] = useState("");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    props.params.then(({ wallet: w }) => {
      setToWallet(w);
    });
  }, []);

  useEffect(() => {
    if (!address || !toWallet || !skill) return;
    getEndorsementsGivenByWallet(address)
      .then((given) => {
        const isDupe = (given as any[]).some((e) => {
          const a = attrs(e);
          return a.toWallet?.toLowerCase() === toWallet.toLowerCase() && a.skill === skill;
        });
        setDuplicate(isDupe);
      })
      .catch(() => {});
  }, [address, toWallet, skill]);

  async function handleSubmit() {
    if (!address || !skill || !testimonial.trim() || !context.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await createEndorsement(address as `0x${string}`, {
        toWallet,
        skill,
        strength,
        payload: { skill, testimonial: testimonial.trim(), context: context.trim(), relationship },
      });
      setEntityKey(result.entityKey);
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit endorsement");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Lock className="w-8 h-8 text-[#9CA3AF] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827] mb-4">Connect to endorse</h1>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  if (address?.toLowerCase() === toWallet.toLowerCase()) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <p className="text-[#6B7280]">You cannot endorse yourself.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Endorse a Peer
        </h1>
        <div className="flex items-center gap-3 mb-6 card-ns">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: walletToColor(toWallet) }}
          >
            {getInitials(truncateHex(toWallet, 2, 0))}
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">Endorsing</p>
            <p className="font-mono text-xs text-[#0D9488]">{truncateHex(toWallet, 10, 8)}</p>
          </div>
        </div>

        {done ? (
          <div className="card-ns text-center">
            <CheckCircle className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
            <p className="font-bold text-[#111827] mb-1">Endorsement recorded on Arkiv!</p>
            <p className="text-xs font-mono text-[#0D9488] break-all mt-2">{entityKey}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Skill to endorse</label>
              <select
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              >
                <option value="">Select a skill...</option>
                {ALL_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {duplicate && skill && (
                <p className="text-xs text-[#F59E0B] mt-1">You&apos;ve already endorsed this person for {skill}.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Strength</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStrength(n)}
                    className="p-1"
                  >
                    <Star
                      className="w-7 h-7"
                      style={{
                        color: n <= strength ? "#F59E0B" : "#E5E7EB",
                        fill: n <= strength ? "#F59E0B" : "transparent",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Testimonial</label>
              <textarea
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827] resize-none"
                rows={3}
                placeholder="Tell a specific story about how they demonstrated this skill..."
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Context</label>
              <input
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
                placeholder="How did you work together? e.g. NS open-source sprint, March 2026"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Your relationship</label>
              <div className="flex gap-2 flex-wrap">
                {(["peer", "mentee", "collaborator", "student"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRelationship(r)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors capitalize ${
                      relationship === r
                        ? "bg-[#111827] text-white border-[#111827]"
                        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-[#EF4444]">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!skill || !testimonial.trim() || !context.trim() || submitting || duplicate}
              className="btn-ns w-full py-3"
              style={(!skill || !testimonial.trim() || !context.trim() || duplicate) ? { opacity: 0.4 } : {}}
            >
              {submitting ? "Recording on Arkiv..." : "Sign & Submit Endorsement"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
