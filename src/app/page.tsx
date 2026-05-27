"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { DEMO_WALLET, PILLAR_COLORS, PILLAR_SOFT_COLORS } from "@/lib/arkiv/constants";
import { getAllPulseEntities } from "@/lib/arkiv/queries";
import { GraduationCap, Flame, Bitcoin, PartyPopper, ArrowRight, Shield, ChevronRight } from "lucide-react";

const pillars = [
  {
    key: "learn",
    icon: GraduationCap,
    label: "Learn",
    desc: "Teach workshops, mentor founders, create content",
    examples: ["Session Taught → 80 pts", "Mentorship Given → 100 pts", "Content Created → 70 pts"],
  },
  {
    key: "burn",
    icon: Flame,
    label: "Burn",
    desc: "Daily workouts, streaks, fitness records",
    examples: ["Daily Workout → 20 pts", "Personal Record → 50 pts", "30-Day Streak → 120 pts"],
  },
  {
    key: "earn",
    icon: Bitcoin,
    label: "Earn",
    desc: "Win bounties, ship open source, raise funding",
    examples: ["Bounty Won → 100 pts", "Open Source → 80 pts", "Startup Shipped → 150 pts"],
  },
  {
    key: "fun",
    icon: PartyPopper,
    label: "Fun",
    desc: "Organize events, build community, shape culture",
    examples: ["Event Organized → 70 pts", "Community Built → 60 pts", "Culture Contrib → 50 pts"],
  },
];

const problems = [
  { from: "You teach 12 workshops at NS", to: "No permanent record exists" },
  { from: "You win 5 bounties", to: "Lives in a Discord channel" },
  { from: "You leave for Dubai", to: "Reputation stays behind" },
];

const steps = [
  { n: "01", label: "Log your contribution", desc: "Add evidence — a GitHub link, tweet, or TX hash." },
  { n: "02", label: "Two peers validate it", desc: "Community members confirm it happened, on-chain." },
  { n: "03", label: "AI synthesizes your passport", desc: "Claude reads your full history and writes your reputation narrative." },
  { n: "04", label: "Anyone can verify it — forever", desc: "Your passport is a public URL. No login required." },
];

export default function LandingPage() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllPulseEntities().then(setStats).catch(() => {});
  }, []);

  const totalEntities = Object.values(stats).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="inline-flex items-center gap-1.5 bg-[#F0FDFA] text-[#0D9488] text-xs font-medium px-3 py-1 rounded-full mb-6 border border-[#CCFBF1]"
        >
          <Shield className="w-3.5 h-3.5" />
          Built on Arkiv Braga Testnet
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-5xl md:text-6xl font-bold text-[#111827] tracking-tight leading-tight mb-5"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Your reputation,<br />earned in public.<br />
          <span className="text-[#2563EB]">Owned by you.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg text-[#6B7280] max-w-2xl mx-auto mb-8"
        >
          Pulse turns every contribution at Network School into a tamper-proof, wallet-owned
          record on Arkiv. Your reputation travels with you — across every cohort, every city,
          every community.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link href={`/profile/${DEMO_WALLET}`} className="btn-ns text-sm px-5 py-2.5 flex items-center gap-2">
            View Demo Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/contribute/new" className="btn-ns-outline text-sm px-5 py-2.5">
            Log a Contribution
          </Link>
        </motion.div>
      </section>

      {/* Live Stats */}
      {totalEntities > 0 && (
        <section className="bg-[#F8F9FA] border-y border-[#E5E7EB] py-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-8 justify-center">
            {[
              { label: "Contributions recorded", value: stats.contribution ?? 0 },
              { label: "Endorsements given", value: stats.endorsement ?? 0 },
              { label: "Active streaks", value: stats.streak ?? 0 },
              { label: "Validations completed", value: stats.validation ?? 0 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#111827]">{s.value}</p>
                <p className="text-sm text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The Problem */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2
          className="text-3xl font-bold text-[#111827] text-center mb-10"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Network School has the activity.<br />It&apos;s missing the record.
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {problems.map((p, i) => (
            <div key={i} className="card-ns">
              <p className="text-sm font-medium text-[#111827] mb-2">{p.from}</p>
              <div className="flex items-center gap-2 mt-3">
                <ChevronRight className="w-4 h-4 text-[#EF4444]" />
                <p className="text-sm text-[#EF4444] font-medium">{p.to}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-lg font-semibold text-[#2563EB] mt-8">
          Pulse changes all of this.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-[#F8F9FA] border-y border-[#E5E7EB] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-[#111827] text-center mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-[#E5E7EB] mb-3">{s.n}</div>
                <p className="text-sm font-semibold text-[#111827] mb-1">{s.label}</p>
                <p className="text-xs text-[#6B7280]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2
          className="text-3xl font-bold text-[#111827] text-center mb-10"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          The Four Pillars
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const color = PILLAR_COLORS[p.key as keyof typeof PILLAR_COLORS];
            const bg = PILLAR_SOFT_COLORS[p.key as keyof typeof PILLAR_SOFT_COLORS];
            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                className="card-ns cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p
                  className="font-bold text-[#111827] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {p.label}
                </p>
                <p className="text-xs text-[#6B7280] mb-3">{p.desc}</p>
                <ul className="space-y-1">
                  {p.examples.map((ex) => (
                    <li key={ex} className="text-xs font-mono" style={{ color }}>
                      {ex}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111827] py-16 text-center">
        <h2
          className="text-3xl font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Start building your reputation on-chain.
        </h2>
        <p className="text-[#9CA3AF] mb-8 max-w-md mx-auto">
          Every contribution you make at Network School deserves a permanent record.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-white text-[#111827] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#F3F4F6] transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/verify"
            className="border border-[#374151] text-white rounded-full px-6 py-3 text-sm font-semibold hover:border-[#6B7280] transition-colors"
          >
            Verify on Arkiv
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] py-6 text-center text-xs text-[#9CA3AF]">
        Pulse · ETHns × Arkiv Challenge 2026 · Built on Arkiv Braga Testnet ·{" "}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
