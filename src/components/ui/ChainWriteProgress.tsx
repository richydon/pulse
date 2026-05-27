"use client";

import { CheckCircle, Loader2, XCircle, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <AnimatePresence mode="wait">
              {step.status === "done" ? (
                <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                </motion.div>
              ) : step.status === "active" ? (
                <motion.div key="active" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
                </motion.div>
              ) : step.status === "error" ? (
                <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                </motion.div>
              ) : (
                <motion.div key="pending">
                  <Circle className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.span
              animate={{
                color: step.status === "active" ? "#111827" : step.status === "done" ? "#10B981" : step.status === "error" ? "#EF4444" : "#9CA3AF",
                fontWeight: step.status === "active" ? 600 : 400,
              }}
              transition={{ duration: 0.2 }}
              className="text-sm"
            >
              {step.label}
            </motion.span>
            {step.txHash && step.status === "done" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-auto font-mono text-xs text-[#0D9488]"
              >
                tx: {step.txHash.slice(0, 10)}...
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
