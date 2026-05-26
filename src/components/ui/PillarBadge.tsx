import { PILLAR_COLORS, PILLAR_SOFT_COLORS, PILLAR_LABELS, type Pillar } from "@/lib/arkiv/constants";
import { GraduationCap, Flame, Bitcoin, PartyPopper } from "lucide-react";

const ICONS = {
  learn: GraduationCap,
  burn: Flame,
  earn: Bitcoin,
  fun: PartyPopper,
};

interface PillarBadgeProps {
  pillar: Pillar;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function PillarBadge({ pillar, size = "sm", showIcon = true }: PillarBadgeProps) {
  const Icon = ICONS[pillar];
  const color = PILLAR_COLORS[pillar];
  const bg = PILLAR_SOFT_COLORS[pillar];
  const label = PILLAR_LABELS[pillar];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      }`}
      style={{ backgroundColor: bg, color }}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      {label}
    </span>
  );
}
