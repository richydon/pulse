"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const problems = [
  { from: "You teach 12 workshops at NS", to: "No permanent record exists" },
  { from: "You win 5 bounties", to: "Lives in a Discord channel" },
  { from: "You leave for Dubai", to: "Reputation stays behind" },
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Onboarding tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280] bg-[#F3F4F6] px-3 py-1.5 rounded-full">
            The Problem
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
          className="text-4xl md:text-5xl font-black text-[#111827] tracking-tighter text-center mb-16 leading-tight"
        >
          Network School has the activity.
          <br />
          <span className="text-[#6B7280]">It&apos;s missing the record.</span>
        </motion.h2>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.15 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              className="card-ns overflow-hidden cursor-default"
            >
              {/* "Before" section */}
              <div className="bg-[#F8F9FA] -mx-5 -mt-5 px-5 py-4 mb-4 border-b border-[#E5E7EB]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">
                  The situation
                </p>
                <p className="text-sm font-semibold text-[#111827] leading-snug">{p.from}</p>
              </div>

              {/* "After" / problem result */}
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-sm text-[#EF4444] font-semibold leading-snug">{p.to}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Punchline */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.4 }}
          className="text-center text-2xl font-black text-[#2563EB] mt-12 tracking-tight"
        >
          Pulse changes all of this.
        </motion.p>
      </div>
    </section>
  );
}
