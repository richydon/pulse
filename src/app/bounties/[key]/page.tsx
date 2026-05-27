"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PillarBadge } from "@/components/ui/PillarBadge";
import { ArkivBadge } from "@/components/ui/ArkivBadge";
import { getBountyByKey } from "@/lib/arkiv/queries";
import { formatUSD, formatCountdown, truncateHex } from "@/lib/utils/format";
import { Clock, ExternalLink } from "lucide-react";

function attrs(e: any) {
  return (e.attributes ?? []).reduce((m: any, a: any) => ({ ...m, [a.key]: a.value }), {});
}

export default function BountyDetailPage(props: { params: Promise<{ key: string }> }) {
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.params.then(({ key }) => {
      getBountyByKey(key as `0x${string}`)
        .then(setBounty)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

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
  const payload = bounty?.toText ? JSON.parse(bounty.toText()) : {};

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-4">
          {a.pillar && <PillarBadge pillar={a.pillar} />}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            a.status === "open" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#F3F4F6] text-[#6B7280]"
          }`}>
            {a.status}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#111827] mb-3 tracking-tight">
          {payload.title}
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <p className="text-3xl font-black text-[#10B981]">{formatUSD(a.rewardUSD ?? 0)}</p>
            <p className="text-xs text-[#9CA3AF]">{payload.rewardToken ?? "USDC"}</p>
          </div>
          {a.deadline && (
            <div className="flex items-center gap-1.5 text-sm text-[#F59E0B]">
              <Clock className="w-4 h-4" />
              {formatCountdown(a.deadline)} remaining
            </div>
          )}
        </div>
        {payload.description && (
          <div className="card-ns mb-4">
            <p className="text-sm text-[#6B7280]">{payload.description}</p>
          </div>
        )}
        <p className="text-xs text-[#9CA3AF] mb-4">
          Posted by{" "}
          <span className="font-mono text-[#0D9488]">{truncateHex(a.postedBy ?? "", 8, 6)}</span>
        </p>
        {bounty.key && (
          <ArkivBadge entityKey={bounty.key} creator={bounty.$creator} owner={bounty.$owner} />
        )}
        {a.status === "open" && (
          <div className="mt-6 card-ns bg-[#F0FDFA] border-[#CCFBF1]">
            <p className="text-sm font-medium text-[#111827] mb-2">Claim this bounty</p>
            <p className="text-xs text-[#6B7280] mb-3">
              Complete the task, then log it as a contribution with your evidence link. Tag the bounty title to link it.
            </p>
            <a
              href="/contribute/new"
              className="btn-ns text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              Log Contribution <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
