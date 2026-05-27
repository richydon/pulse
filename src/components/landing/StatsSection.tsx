"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Flame, Star, ShieldCheck } from "lucide-react";

interface StatsSectionProps {
  stats: Record<string, number>;
}

function useCountUp(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return count;
}

function StatCard({
  icon: Icon,
  color,
  bg,
  label,
  value,
  inView,
  delay,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  value: number;
  inView: boolean;
  delay: number;
}) {
  const count = useCountUp(value, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
      className="flex flex-col items-center text-center gap-2"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-5xl font-black text-[#111827] tabular-nums leading-none">{count}</p>
      <p className="text-sm text-[#6B7280] font-medium">{label}</p>
    </motion.div>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const items = [
    {
      icon: BookOpen,
      color: "#3B82F6",
      bg: "#EFF6FF",
      label: "Contributions recorded",
      value: stats.contribution ?? 0,
    },
    {
      icon: Star,
      color: "#F59E0B",
      bg: "#FFFBEB",
      label: "Endorsements given",
      value: stats.endorsement ?? 0,
    },
    {
      icon: Flame,
      color: "#F97316",
      bg: "#FFF7ED",
      label: "Active streaks",
      value: stats.streak ?? 0,
    },
    {
      icon: ShieldCheck,
      color: "#10B981",
      bg: "#ECFDF5",
      label: "Validations completed",
      value: stats.validation ?? 0,
    },
  ];

  return (
    <section ref={ref} className="bg-[#F8F9FA] py-14 border-y border-[#E5E7EB]">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
        {items.map((item, i) => (
          <StatCard key={item.label} {...item} inView={inView} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
