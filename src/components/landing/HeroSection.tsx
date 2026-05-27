"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";
import { Shield, ArrowRight, Zap } from "lucide-react";
import { DEMO_WALLET } from "@/lib/arkiv/constants";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface ParallaxPair {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rawX: MotionValue<number>;
  rawY: MotionValue<number>;
}

/* ─── Floating card data ─────────────────────────────────────────────────── */
const CARDS = [
  {
    id: "streak",
    emoji: "🔥",
    title: "47-Day Streak",
    sub: "Burn Pillar",
    accent: "#EA580C",
    cardBg: "#FFF7ED",
    cardBorder: "#FED7AA",
    pos: { top: "6%", left: "-15%" } as React.CSSProperties,
    depth: 1.2,
    delay: 0.62,
    floatAmt: 10,
    floatDur: 2.9,
  },
  {
    id: "score",
    emoji: "⚡",
    title: "+847 pts",
    sub: "Top 5% Cohort",
    accent: "#1D4ED8",
    cardBg: "#EFF6FF",
    cardBorder: "#BFDBFE",
    pos: { top: "8%", right: "-15%" } as React.CSSProperties,
    depth: 0.8,
    delay: 0.76,
    floatAmt: 8,
    floatDur: 3.4,
  },
  {
    id: "rank",
    emoji: "🏆",
    title: "Rank #3",
    sub: "Leaderboard",
    accent: "#B45309",
    cardBg: "#FFFBEB",
    cardBorder: "#FDE68A",
    pos: { top: "44%", right: "-19%" } as React.CSSProperties,
    depth: 1.0,
    delay: 0.9,
    floatAmt: 12,
    floatDur: 2.6,
  },
  {
    id: "endorsements",
    emoji: "🤝",
    title: "5 Endorsements",
    sub: "Peer Validated",
    accent: "#047857",
    cardBg: "#ECFDF5",
    cardBorder: "#A7F3D0",
    pos: { bottom: "24%", left: "-17%" } as React.CSSProperties,
    depth: 0.6,
    delay: 1.04,
    floatAmt: 9,
    floatDur: 3.1,
  },
  {
    id: "checkin",
    emoji: "📍",
    title: "NS Main Campus",
    sub: "Checked in today",
    accent: "#0F766E",
    cardBg: "#F0FDFA",
    cardBorder: "#99F6E4",
    pos: { bottom: "8%", right: "-13%" } as React.CSSProperties,
    depth: 1.1,
    delay: 1.18,
    floatAmt: 11,
    floatDur: 2.7,
  },
] as const;

/* ─── Pillar bars ────────────────────────────────────────────────────────── */
const PILLARS = [
  { key: "LRN", color: "#3B82F6", pct: 76 },
  { key: "BRN", color: "#F97316", pct: 61 },
  { key: "ERN", color: "#10B981", pct: 88 },
  { key: "FUN", color: "#8B5CF6", pct: 54 },
];

/* ─── FloatingCard ───────────────────────────────────────────────────────── */
function FloatingCard({
  card,
  px,
  py,
}: {
  card: (typeof CARDS)[number];
  px: MotionValue<number>;
  py: MotionValue<number>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.55 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18, delay: card.delay }}
      style={{ position: "absolute", ...card.pos, zIndex: 20, x: px, y: py }}
    >
      <motion.div
        animate={{ y: [0, -card.floatAmt, 0] }}
        transition={{ duration: card.floatDur, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        style={{
          background: card.cardBg,
          border: `1px solid ${card.cardBorder}`,
          borderRadius: 14,
          padding: "10px 14px",
          minWidth: 148,
          cursor: "default",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18, lineHeight: 1 }}>{card.emoji}</span>
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: card.accent }}>
              {card.title}
            </p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: "#9CA3AF" }}>
              {card.sub}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── HeroSection ────────────────────────────────────────────────────────── */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  /* ── 5 card parallaxes — top-level, never in a loop ── */
  const r0x = useMotionValue(0); const r0y = useMotionValue(0);
  const r1x = useMotionValue(0); const r1y = useMotionValue(0);
  const r2x = useMotionValue(0); const r2y = useMotionValue(0);
  const r3x = useMotionValue(0); const r3y = useMotionValue(0);
  const r4x = useMotionValue(0); const r4y = useMotionValue(0);
  const rpx = useMotionValue(0); const rpy = useMotionValue(0);

  const s0x = useSpring(r0x, { stiffness: 60, damping: 18 });
  const s0y = useSpring(r0y, { stiffness: 60, damping: 18 });
  const s1x = useSpring(r1x, { stiffness: 60, damping: 18 });
  const s1y = useSpring(r1y, { stiffness: 60, damping: 18 });
  const s2x = useSpring(r2x, { stiffness: 60, damping: 18 });
  const s2y = useSpring(r2y, { stiffness: 60, damping: 18 });
  const s3x = useSpring(r3x, { stiffness: 60, damping: 18 });
  const s3y = useSpring(r3y, { stiffness: 60, damping: 18 });
  const s4x = useSpring(r4x, { stiffness: 60, damping: 18 });
  const s4y = useSpring(r4y, { stiffness: 60, damping: 18 });
  const spx = useSpring(rpx, { stiffness: 50, damping: 20 });
  const spy = useSpring(rpy, { stiffness: 50, damping: 20 });

  const raws: ParallaxPair[] = [
    { rawX: r0x, rawY: r0y, x: s0x, y: s0y },
    { rawX: r1x, rawY: r1y, x: s1x, y: s1y },
    { rawX: r2x, rawY: r2y, x: s2x, y: s2y },
    { rawX: r3x, rawY: r3y, x: s3x, y: s3y },
    { rawX: r4x, rawY: r4y, x: s4x, y: s4y },
  ];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const norm = Math.max(rect.width, rect.height) / 2;
      CARDS.forEach((card, i) => {
        raws[i].rawX.set((cx / norm) * 22 * card.depth);
        raws[i].rawY.set((cy / norm) * 22 * card.depth);
      });
      rpx.set((cx / norm) * 22 * 0.2);
      rpy.set((cy / norm) * 22 * 0.2);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleMouseLeave = useCallback(() => {
    [r0x, r0y, r1x, r1y, r2x, r2y, r3x, r3y, r4x, r4y, rpx, rpy].forEach((v) => v.set(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col items-center overflow-visible bg-white"
    >
      {/* ── Subtle background accents ─────────────────────────────────────── */}
      {/* Very faint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Blue radial glow — very faint on white */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 95%, rgba(37,99,235,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Purple top-right accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 35% at 80% 5%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />

      {/* ── Text block ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-16 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="inline-flex items-center gap-1.5 bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-[#CCFBF1]"
        >
          <Shield className="w-3.5 h-3.5" />
          On-Chain Reputation · Network School 2026
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.04] mb-6 text-[#111827]"
        >
          Your reputation,
          <br />
          earned in public.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #0D9488 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Owned by you.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.2 }}
          className="text-lg text-[#6B7280] leading-relaxed max-w-xl mb-10"
        >
          Pulse turns every contribution at Network School into a tamper-proof,
          wallet-owned record on Arkiv. Your reputation travels with you — across
          every cohort, every city, every community.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <Link
              href={`/profile/${DEMO_WALLET}`}
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full text-white"
              style={{
                background: "#111827",
                boxShadow: "0 4px 14px rgba(17,24,39,0.25)",
              }}
            >
              View Demo Passport
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <Link
              href="/contribute/new"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full text-[#374151]"
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Zap className="w-4 h-4 text-[#F97316]" />
              Log a Contribution
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Phone + floating cards ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.35 }}
        style={{ x: spx, y: spy }}
        className="relative z-10 mx-auto mb-20"
      >
        {/* Phone body */}
        <div
          style={{
            width: 280,
            height: 568,
            borderRadius: "2.75rem",
            background: "#0D1117",
            border: "3px solid #1F2937",
            boxShadow:
              "0 60px 100px rgba(0,0,0,0.18), 0 20px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Scan-line shimmer */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.025) 50%, transparent 100%)",
              animation: "scanline 3s linear infinite",
            }}
          />

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-1">
            <span className="text-[#6B7280] text-[9px] font-semibold">9:41</span>
            <span className="text-[#374151] text-[9px]">●●●</span>
          </div>

          {/* App header */}
          <div className="flex items-center gap-2 px-4 pt-2 pb-3 border-b border-[#161D2B]">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <span className="text-white text-[10px] font-black">P</span>
            </div>
            <span className="text-white text-xs font-black tracking-tight">pulse</span>
            <span
              className="text-xs font-black"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .
            </span>
          </div>

          {/* Score card + animated ring */}
          <div
            className="mx-3 mt-4 rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1a1f35 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <motion.circle
                    cx="26" cy="26" r="22" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - 0.8) }}
                    transition={{ duration: 1.4, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-[11px] font-black">847</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[#9CA3AF] text-[8px] font-bold uppercase tracking-widest mb-0.5">
                  Reputation Score
                </p>
                <p className="text-white text-xl font-black tracking-tighter leading-none">Top 5%</p>
                <p className="text-[#6B7280] text-[8px] mt-0.5 font-medium">of this cohort</p>
              </div>
            </div>

            {/* Pillar bars */}
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {PILLARS.map((p, i) => (
                <div key={p.key} className="flex flex-col items-center gap-1">
                  <div className="w-full h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: 1.0 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                  <span className="text-[7px] font-bold" style={{ color: p.color }}>
                    {p.key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed label */}
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[#4B5563] text-[8px] font-bold uppercase tracking-widest">
              Recent Activity
            </p>
          </div>

          {/* Feed items */}
          {(
            [
              { color: "#3B82F6", label: "Session Taught", pts: "+80 pts", icon: "📚" },
              { color: "#F97316", label: "30-Day Streak", pts: "+120 pts", icon: "🔥" },
              { color: "#10B981", label: "Bounty Won", pts: "+100 pts", icon: "💰" },
            ] as const
          ).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
              className="mx-3 mt-1.5 rounded-xl p-2.5 flex items-center gap-2.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-[#D1D5DB] leading-none">{item.label}</p>
              </div>
              <span className="text-[8px] font-bold shrink-0" style={{ color: item.color }}>
                {item.pts}
              </span>
            </motion.div>
          ))}

          {/* Bottom label */}
          <p className="absolute bottom-3 left-0 right-0 text-center text-[7px] text-[#374151] font-medium">
            demo preview
          </p>
        </div>

        {/* Floating cards */}
        {CARDS.map((card, i) => (
          <FloatingCard key={card.id} card={card} px={raws[i].x} py={raws[i].y} />
        ))}

        {/* Subtle glow under phone */}
        <div
          className="absolute -inset-8 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />
      </motion.div>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative z-10 pb-14 flex flex-wrap justify-center items-center gap-6 px-6"
      >
        {[
          "Built on Arkiv Braga",
          "ETHns × Arkiv Challenge 2026",
          "Wallet-Owned Records",
          "AI-Synthesised Passports",
        ].map((t) => (
          <span
            key={t}
            className="text-[11px] font-semibold text-[#9CA3AF] tracking-wide uppercase"
          >
            {t}
          </span>
        ))}
      </motion.div>

      {/* Scan-line keyframe */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  );
}
