"use client";

import { useState } from "react";
import { walletToColor, getInitials, truncateHex } from "@/lib/utils/format";

interface AvatarProps {
  wallet: string;
  size?: number;       // px, default 36
  className?: string;
}

export function Avatar({ wallet, size = 36, className = "" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
  };

  if (!wallet || imgError) {
    return (
      <div
        className={`flex items-center justify-center text-white font-bold shrink-0 ${className}`}
        style={{
          ...style,
          backgroundColor: walletToColor(wallet ?? ""),
          fontSize: Math.max(10, size * 0.3),
        }}
      >
        {wallet ? getInitials(truncateHex(wallet, 2, 0)) : "?"}
      </div>
    );
  }

  return (
    <img
      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${wallet}&size=${size}`}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full shrink-0 ${className}`}
      style={style}
      onError={() => setImgError(true)}
    />
  );
}
