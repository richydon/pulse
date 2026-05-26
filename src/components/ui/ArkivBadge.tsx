import { Link2, Shield, User, CheckCircle } from "lucide-react";
import { truncateHex } from "@/lib/utils/format";
import { BRAGA_EXPLORER_URL } from "@/lib/arkiv/constants";

interface ArkivBadgeProps {
  entityKey: string;
  creator?: string;
  owner?: string;
  validationCount?: number;
}

export function ArkivBadge({ entityKey, creator, owner, validationCount }: ArkivBadgeProps) {
  return (
    <div className="rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] p-3 text-xs space-y-1.5">
      <div className="flex items-center gap-2 text-[#0D9488]">
        <Link2 className="w-3.5 h-3.5 shrink-0" />
        <span className="font-mono break-all">{truncateHex(entityKey, 10, 8)}</span>
        <a
          href={`${BRAGA_EXPLORER_URL}/entity/${entityKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 underline hover:no-underline"
        >
          View ↗
        </a>
      </div>
      {creator && (
        <div className="flex items-center gap-2 text-[#6B7280]">
          <Shield className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          <span className="text-[#9CA3AF]">Written by</span>
          <span className="font-mono text-[#0D9488]">{truncateHex(creator)}</span>
          <span className="text-[#9CA3AF] ml-auto">(immutable)</span>
        </div>
      )}
      {owner && (
        <div className="flex items-center gap-2 text-[#6B7280]">
          <User className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          <span className="text-[#9CA3AF]">Owned by</span>
          <span className="font-mono text-[#0D9488]">{truncateHex(owner)}</span>
        </div>
      )}
      {validationCount !== undefined && (
        <div className="flex items-center gap-2 text-[#6B7280]">
          <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span>Confirmed by {validationCount} peer{validationCount !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}
