"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Database,
  GitBranch,
  Shield,
  Layers,
} from "lucide-react";
import { BRAGA_EXPLORER_URL, ARKIV_DATA_URL, CURRENT_COHORT, PROJECT_ATTRIBUTE } from "@/lib/arkiv/constants";
import { getAllPulseEntities } from "@/lib/arkiv/queries";

const ENTITY_TYPES = [
  { key: "contribution", label: "Contributions", color: "#3B82F6", icon: "📝" },
  { key: "endorsement", label: "Endorsements", color: "#10B981", icon: "🤝" },
  { key: "streak", label: "Streaks", color: "#F97316", icon: "🔥" },
  { key: "validation", label: "Validations", color: "#8B5CF6", icon: "✅" },
  { key: "passport", label: "Passports", color: "#0D9488", icon: "📋" },
  { key: "bounty", label: "Bounties", color: "#F59E0B", icon: "💰" },
];

const QUERY_EXAMPLES = [
  {
    title: "All Pulse Contributions",
    description: "Query all contribution entities created by Pulse v1",
    code: `// Using @arkiv-network/sdk
import { createPublicClient } from "@arkiv-network/sdk";
import { eq } from "@arkiv-network/sdk/query";
import { http } from "@arkiv-network/sdk/transport";

const client = createPublicClient({
  chain: { id: 60138453102, rpcUrls: { default: { http: ["https://rpc.braga.arkiv.network"] } } },
  transport: http(),
});

const result = await client
  .buildQuery()
  .where([
    eq("app", "pulse:v1"),
    eq("type", "contribution"),
  ])
  .withAttributes(true)
  .withPayload(true)
  .orderBy("createdAt", "number", "desc")
  .limit(50)
  .fetch();

console.log(result.entities);`,
  },
  {
    title: "Leaderboard Query",
    description: "Get validated contributions ranked by points for a cohort",
    code: `const leaderboard = await client
  .buildQuery()
  .where([
    eq("app", "pulse:v1"),
    eq("type", "contribution"),
    eq("status", "validated"),
    eq("cohort", "${CURRENT_COHORT}"),
  ])
  .withAttributes(true)
  .orderBy("points", "number", "desc")
  .limit(100)
  .fetch();

// Group by wallet to compute total points
const scores: Record<string, number> = {};
for (const entity of leaderboard.entities) {
  const attrs = entity.attributes ?? [];
  const wallet = attrs.find(a => a.key === "contributorWallet")?.value ?? "";
  const pts = Number(attrs.find(a => a.key === "points")?.value ?? 0);
  scores[wallet] = (scores[wallet] ?? 0) + pts;
}`,
  },
  {
    title: "Reputation Passport Lookup",
    description: "Fetch a member's full Reputation Passport by wallet address",
    code: `// Replace with any member wallet
const memberWallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const passport = await client
  .buildQuery()
  .where([
    eq("app", "pulse:v1"),
    eq("type", "passport"),
    eq("memberWallet", memberWallet),
  ])
  .withAttributes(true)
  .withPayload(true)
  .orderBy("generatedAt", "number", "desc")
  .limit(1)
  .fetch();

const entity = passport.entities[0];
const payload = JSON.parse(entity.payload ?? "{}");
console.log("AI Narrative:", payload.aiNarrative);
console.log("Total Points:", entity.attributes?.find(a => a.key === "totalPoints")?.value);`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function VerifyPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  async function fetchCounts() {
    setLoading(true);
    try {
      const data = await getAllPulseEntities();
      setCounts(data);
      setLastFetched(new Date());
    } catch {
      setCounts({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();
  }, []);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-2xl font-bold text-[#111827]">
              On-Chain Verification
            </h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Every contribution, endorsement, and reputation record on Pulse is independently
            verifiable on Arkiv Braga testnet. No backend. No database. No trust required.
          </p>
        </div>

        {/* Live Entity Counts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#111827]">Live Entity Counts</h2>
              <p className="text-xs text-[#9CA3AF]">
                {lastFetched
                  ? `Fetched directly from Arkiv at ${lastFetched.toLocaleTimeString()}`
                  : "Fetching from Arkiv Braga testnet..."}
              </p>
            </div>
            <button onClick={fetchCounts} className="btn-ns-outline text-xs px-3 py-1.5">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {ENTITY_TYPES.map(({ key, label, color, icon }) => (
              <div key={key} className="card-ns p-4 flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-xs text-[#9CA3AF]">{label}</p>
                  {loading ? (
                    <div className="h-6 w-12 bg-[#F3F4F6] rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold" style={{ color }}>
                      {counts[key] ?? 0}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card-ns p-4 flex items-center justify-between bg-[#F0FDF4] border-[#86EFAC]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-semibold text-[#166534]">
                Total Pulse Entities on Arkiv Braga
              </span>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-[#DCFCE7] rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold text-[#166534]">{total}</span>
            )}
          </div>
        </section>

        {/* Entity Relationship Diagram */}
        <section>
          <h2 className="text-base font-semibold text-[#111827] mb-4">
            Entity Relationship Map
          </h2>
          <div className="card-ns p-6 bg-[#F8F9FA]">
            <div className="flex items-start justify-center gap-4 flex-wrap">
              {/* Member Wallet */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-14 rounded-lg bg-[#111827] text-white flex items-center justify-center text-xs font-mono text-center px-2">
                  Member<br />Wallet
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-4">
                <div className="text-[#9CA3AF] text-xs font-mono">owns →</div>
              </div>

              {/* Entities column */}
              <div className="flex flex-col gap-2">
                {[
                  { label: "Contribution", color: "#3B82F6" },
                  { label: "Endorsement", color: "#10B981" },
                  { label: "Streak", color: "#F97316" },
                ].map(({ label, color }) => (
                  <div
                    key={label}
                    className="w-28 h-9 rounded-lg text-white flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-4">
                <div className="text-[#9CA3AF] text-xs font-mono">→ attested by →</div>
              </div>

              {/* Secondary entities */}
              <div className="flex flex-col gap-2">
                {[
                  { label: "ValidationRecord", color: "#8B5CF6" },
                  { label: "Bounty", color: "#F59E0B" },
                ].map(({ label, color }) => (
                  <div
                    key={label}
                    className="w-32 h-9 rounded-lg text-white flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-4">
                <div className="text-[#9CA3AF] text-xs font-mono">→ synthesized into →</div>
              </div>

              {/* Passport */}
              <div className="flex items-center">
                <div className="w-28 h-14 rounded-lg text-white flex items-center justify-center text-xs font-medium text-center bg-[#0D9488]">
                  Reputation<br />Passport
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-[#9CA3AF] mt-4">
              All 6 entity types use <code className="font-mono bg-[#E5E7EB] px-1 rounded">PROJECT_ATTRIBUTE = &#123; key: "app", value: "pulse:v1" &#125;</code>
            </p>
          </div>
        </section>

        {/* Query Code Examples */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-base font-semibold text-[#111827]">Verifiable Queries</h2>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">
            Run these queries directly against Arkiv Braga to independently verify all data shown on Pulse.
          </p>
          <div className="space-y-4">
            {QUERY_EXAMPLES.map((ex) => (
              <div key={ex.title} className="card-ns overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{ex.title}</p>
                    <p className="text-xs text-[#9CA3AF]">{ex.description}</p>
                  </div>
                  <CopyButton text={ex.code} />
                </div>
                <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs p-4 overflow-x-auto leading-relaxed font-mono">
                  <code>{ex.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Direct Links */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-base font-semibold text-[#111827]">Direct Links</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                label: "Arkiv Braga Explorer",
                href: BRAGA_EXPLORER_URL,
                desc: "Browse all Pulse entities on-chain. Filter by PROJECT_ATTRIBUTE = pulse:v1",
              },
              {
                label: "Arkiv Data Portal",
                href: ARKIV_DATA_URL,
                desc: "Run raw queries against Braga testnet data",
              },
              {
                label: "Demo Member Profile",
                href: "/profile/0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                desc: "Nadia Osei's public Reputation Passport — all data from Arkiv",
                internal: true,
              },
            ].map(({ label, href, desc, internal }) => (
              <a
                key={label}
                href={href}
                target={internal ? undefined : "_blank"}
                rel={internal ? undefined : "noopener noreferrer"}
                className="card-ns p-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{label}</p>
                  <p className="text-xs text-[#9CA3AF]">{desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* Technical Stack */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-base font-semibold text-[#111827]">Technical Stack</h2>
          </div>
          <div className="card-ns p-5 space-y-3">
            {[
              { label: "Blockchain", value: "Arkiv Braga Testnet (Chain ID: 60138453102)" },
              { label: "SDK", value: "@arkiv-network/sdk@0.6.8" },
              { label: "PROJECT_ATTRIBUTE", value: `{ key: "${PROJECT_ATTRIBUTE.key}", value: "${PROJECT_ATTRIBUTE.value}" }` },
              { label: "Entity Types", value: "Contribution, Endorsement, Streak, ValidationRecord, ReputationPassport, Bounty" },
              { label: "AI Model", value: "claude-sonnet-4-20250514 (Anthropic)" },
              { label: "Auth", value: "Privy (email + embedded EVM wallet)" },
              { label: "Frontend", value: "Next.js 16 App Router + Tailwind v4" },
              { label: "RPC Endpoint", value: "https://rpc.braga.arkiv.network" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-[#F3F4F6] last:border-0">
                <span className="text-xs font-medium text-[#6B7280] shrink-0 w-40">{label}</span>
                <span className="text-xs font-mono text-[#111827] text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom attestation */}
        <div className="text-center py-6 border-t border-[#E5E7EB]">
          <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#111827]">
            Everything shown on Pulse is independently verifiable
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            No centralized database. No admin keys. Every entity lives on Arkiv Braga testnet, owned by the contributor&apos;s wallet.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
