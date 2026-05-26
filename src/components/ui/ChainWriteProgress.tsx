"use client";

import { CheckCircle, Loader2, Circle } from "lucide-react";

export type WriteStep = {
  label: string;
  status: "pending" | "active" | "done" | "error";
  txHash?: string;
};

interface ChainWriteProgressProps {
  steps: WriteStep[];
}

export function ChainWriteProgress({ steps }: ChainWriteProgressProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 space-y-3">
      <p className="text-sm font-semibold text-[#111827]">Writing to Arkiv Braga...</p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === "done" ? (
              <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : step.status === "active" ? (
              <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
            ) : step.status === "error" ? (
              <Circle className="w-4 h-4 text-[#EF4444] shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-[#D1D5DB] shrink-0" />
            )}
            <span
              className={`text-sm ${
                step.status === "active"
                  ? "text-[#111827] font-medium"
                  : step.status === "done"
                  ? "text-[#10B981]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {step.label}
            </span>
            {step.txHash && step.status === "done" && (
              <span className="ml-auto font-mono text-xs text-[#0D9488]">
                tx: {step.txHash.slice(0, 10)}...
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
