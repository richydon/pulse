"use client";

import { motion } from "framer-motion";
import { PenLine, CheckCircle2, Sparkles, Shield } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: PenLine,
    label: "Log your contribution",
    desc: "Add evidence — a GitHub link, tweet, or TX hash.",
  },
  {
    n: "02",
    icon: CheckCircle2,
    label: "Two peers validate it",
    desc: "Community members confirm it happened, on-chain.",
  },
  {
    n: "03",
    icon: Sparkles,
    label: "AI synthesizes your passport",
    desc: "Claude reads your full history and writes your reputation narrative.",
  },
  {
    n: "04",
    icon: Shield,
    label: "Anyone can verify it — forever",
    desc: "Your passport is a public URL. No login required.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-[#F8F9FA] border-y border-[#E5E7EB] py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full">
            How It Works
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
          Four steps to an
          <br />
          <span className="text-gradient-blue">on-chain reputation.</span>
        </motion.h2>

        {/* Steps — desktop horizontal, mobile vertical */}
        <div className="hidden md:flex items-start">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-start flex-1">
                {/* Step card */}
                <motion.div
                  initial={{ opacity: 0, y: 28, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 240, damping: 20, delay: i * 0.12 }}
                  className="flex-1 flex flex-col items-center text-center px-3"
                >
                  {/* Large step number */}
                  <div className="text-7xl font-black text-[#E5E7EB] leading-none mb-3 tabular-nums select-none">
                    {s.n}
                  </div>
                  {/* Icon circle */}
                  <div className="w-12 h-12 rounded-2xl bg-[#111827] flex items-center justify-center mb-4 shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-[#111827] mb-2 leading-snug">{s.label}</p>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{s.desc}</p>
                </motion.div>

                {/* Connecting line between steps */}
                {i < steps.length - 1 && (
                  <div className="flex items-start pt-[2.5rem] w-8 shrink-0">
                    <motion.div
                      className="h-0.5 w-full rounded-full"
                      style={{ backgroundColor: "#E5E7EB", transformOrigin: "left" }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.3 + i * 0.15,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile vertical layout */}
        <div className="md:hidden space-y-0">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex gap-4">
                {/* Left: number + vertical line */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
                    className="w-10 h-10 rounded-2xl bg-[#111827] flex items-center justify-center shrink-0 shadow-md"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>
                  {i < steps.length - 1 && (
                    <motion.div
                      className="w-0.5 bg-[#E5E7EB] flex-1 my-1"
                      style={{ minHeight: "2rem" }}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.1 }}
                  className="pb-8"
                >
                  <p className="text-xs font-black text-[#E5E7EB] mb-1 tabular-nums">{s.n}</p>
                  <p className="text-sm font-bold text-[#111827] mb-1 leading-snug">{s.label}</p>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{s.desc}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
