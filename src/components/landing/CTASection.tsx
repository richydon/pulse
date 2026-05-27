"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="bg-white relative overflow-hidden py-24 text-center border-t border-[#E5E7EB]">
      {/* Animated soft gradient background */}
      <motion.div
        className="absolute inset-0 opacity-60 pointer-events-none"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280] border border-[#E5E7EB] bg-[#F8F9FA] px-3 py-1.5 rounded-full">
            Get Started
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
          className="text-4xl md:text-5xl font-black text-[#111827] tracking-tighter leading-tight mb-5"
        >
          Start building your
          <br />
          <span className="text-gradient-blue">reputation on-chain.</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.12 }}
          className="text-[#6B7280] text-lg mb-10 max-w-md mx-auto"
        >
          Every contribution you make at Network School deserves a permanent record.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/dashboard"
              className="rounded-full px-8 py-3.5 text-sm font-bold transition-colors inline-block text-white"
              style={{
                background: "#111827",
                boxShadow: "0 4px 14px rgba(17,24,39,0.18)",
              }}
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/verify"
              className="border border-[#E5E7EB] text-[#374151] bg-white rounded-full px-8 py-3.5 text-sm font-bold hover:border-[#D1D5DB] hover:bg-[#F8F9FA] transition-colors inline-block"
            >
              Verify on Arkiv
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
