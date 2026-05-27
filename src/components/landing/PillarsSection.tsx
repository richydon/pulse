"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { GraduationCap, Flame, Bitcoin, PartyPopper } from "lucide-react";
import { PILLAR_COLORS, PILLAR_SOFT_COLORS } from "@/lib/arkiv/constants";

const pillars = [
  {
    key: "learn",
    icon: GraduationCap,
    label: "Learn",
    desc: "Teach workshops, mentor founders, create content",
    examples: ["Session Taught → 80 pts", "Mentorship Given → 100 pts", "Content Created → 70 pts"],
    xpPct: 75,
  },
  {
    key: "burn",
    icon: Flame,
    label: "Burn",
    desc: "Daily workouts, streaks, fitness records",
    examples: ["Daily Workout → 20 pts", "Personal Record → 50 pts", "30-Day Streak → 120 pts"],
    xpPct: 61,
  },
  {
    key: "earn",
    icon: Bitcoin,
    label: "Earn",
    desc: "Win bounties, ship open source, raise funding",
    examples: ["Bounty Won → 100 pts", "Open Source → 80 pts", "Startup Shipped → 150 pts"],
    xpPct: 88,
  },
  {
    key: "fun",
    icon: PartyPopper,
    label: "Fun",
    desc: "Organize events, build community, shape culture",
    examples: ["Event Organized → 70 pts", "Community Built → 60 pts", "Culture Contrib → 50 pts"],
    xpPct: 55,
  },
];

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [5, -5]), {
    stiffness: 400,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 400,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PillarsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280] bg-[#F3F4F6] px-3 py-1.5 rounded-full">
            Point System
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
          className="text-4xl md:text-5xl font-black text-[#111827] tracking-tighter text-center mb-4 leading-tight"
        >
          The Four Pillars
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
          className="text-center text-[#6B7280] mb-14 text-lg"
        >
          Every action maps to a pillar. Every pillar builds your passport.
        </motion.p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const color = PILLAR_COLORS[p.key as keyof typeof PILLAR_COLORS];
            const bg = PILLAR_SOFT_COLORS[p.key as keyof typeof PILLAR_SOFT_COLORS];

            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.1 }}
              >
                <TiltCard className="card-ns p-6 cursor-default h-full">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color }} />
                  </div>

                  {/* Pillar name */}
                  <p className="text-2xl font-black text-[#111827] mb-2 tracking-tight">
                    {p.label}
                  </p>
                  <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">{p.desc}</p>

                  {/* Point chips */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.examples.map((ex) => (
                      <span
                        key={ex}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full font-mono"
                        style={{ backgroundColor: bg, color }}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  {/* XP progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
                        XP Progress
                      </span>
                      <span className="text-[9px] font-bold" style={{ color }}>{p.xpPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.xpPct}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
