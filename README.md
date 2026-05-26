# Pulse — On-Chain Reputation for Network School

**ETHns × Arkiv Challenge 2026 submission**

Pulse is a Web3 reputation system where every contribution Network School members make — a workshop taught, a gym streak, a bounty won, a peer endorsement — becomes a tamper-proof entity on Arkiv Braga testnet, owned by the contributor's wallet. An AI agent synthesizes it all into a portable, independently verifiable Reputation Passport.

**Live demo:** https://pulse-ns.vercel.app  
**Demo profile:** https://pulse-ns.vercel.app/profile/0x742d35Cc6634C0532925a3b844Bc454e4438f44e  
**Verify on-chain:** https://pulse-ns.vercel.app/verify

---

## The Problem

Network School members do a lot — they teach workshops, ship projects, hit gym streaks, win bounties, mentor peers — but none of it is portable. When a member leaves, their reputation lives in Notion docs, Telegram messages, and people's memories. There's no credible, verifiable record that travels with them.

## The Solution

Pulse puts every contribution on Arkiv Braga as a cryptographically-owned entity. Members build a permanent, tamper-proof record that:
- Is owned by their wallet (not by NS or Pulse)
- Is independently queryable by anyone
- Compounds over time into a Reputation Passport with an AI-generated narrative
- Works as a verifiable credential for VCs, employers, and future communities

---

## Arkiv Integration

### PROJECT_ATTRIBUTE
Every entity and every query in Pulse uses:
```ts
const PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" }
```

### 6 Entity Types

| Entity | Purpose |
|--------|---------|
| **Contribution** | A validated activity (workshop, bounty, PR, check-in) |
| **Endorsement** | Peer skill attestation with strength rating 1–5 |
| **Streak** | Daily check-in tracker (DePIN layer via QR codes at NS locations) |
| **ValidationRecord** | Peer approval/rejection of a contribution (2 required for validation) |
| **ReputationPassport** | AI-synthesized profile aggregating all the above |
| **Bounty** | Task posted with USD reward; winner auto-receives Contribution entity |

### Query example
```ts
import { createPublicClient } from "@arkiv-network/sdk";
import { eq } from "@arkiv-network/sdk/query";
import { http } from "@arkiv-network/sdk/transport";

const client = createPublicClient({
  chain: { id: 60138453102, rpcUrls: { default: { http: ["https://rpc.braga.arkiv.network"] } } },
  transport: http(),
});

const result = await client
  .buildQuery()
  .where([eq("app", "pulse:v1"), eq("type", "contribution")])
  .withAttributes(true)
  .withPayload(true)
  .orderBy("createdAt", "number", "desc")
  .limit(50)
  .fetch();
```

---

## Quick Start (under 5 minutes)

### 1. Clone and install
```bash
git clone https://github.com/Rarktech/pulse
cd pulse
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## Seeding Demo Data

The seed script writes ~60 entities to Arkiv Braga for the demo wallet "Nadia Osei".

### Setup
Add these to `.env.local`:
```
PULSE_SEED_PRIVATE_KEY=0x...   # private key of demo wallet
PULSE_VALIDATOR_KEY_1=0x...    # private key of validator wallet 1
PULSE_VALIDATOR_KEY_2=0x...    # private key of validator wallet 2
```

### Run
```bash
npm run seed
```

This writes:
- 12 Contributions (Learn/Burn/Earn/Fun)
- 24 ValidationRecords (2 per contribution)
- 8 Endorsements (from peer wallets)
- 1 Streak entity (31-day daily burn)
- 1 ReputationPassport (with AI narrative)
- 3 open Bounties

### Verify seeded data
```bash
npm run verify
```

---

## On-Chain Verification

All data is independently verifiable. Visit `/verify` in the app to see:
- Live entity counts (fetched directly from Arkiv)
- 3 copyable query code blocks
- Entity relationship diagram
- Direct links to Braga explorer

Or run your own queries against Arkiv Braga:
- **RPC:** `https://rpc.braga.arkiv.network`
- **Explorer:** `https://explorer.braga.arkiv.network`
- **Chain ID:** `60138453102`
- **SDK:** `@arkiv-network/sdk@0.6.8`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Arkiv Braga Testnet |
| SDK | @arkiv-network/sdk@0.6.8 |
| AI | Claude Sonnet 4 (Anthropic) via Vercel AI SDK |
| Auth | Privy (email + embedded EVM wallet) |
| Frontend | Next.js 16 App Router |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Charts | Recharts |

---

## Features

- **Reputation Passport** — public profile at `/profile/[wallet]` with radar chart, pillar breakdown, contribution timeline, endorsements, and AI narrative
- **AI Reputation Agent** — chat with Claude about your on-chain reputation at `/ai`
- **Log Contribution** — 4-step form that writes a Contribution entity to Arkiv
- **Peer Validation** — validate cohort members' contributions at `/contribute/validate`
- **Daily Check-In (DePIN)** — QR codes at NS locations trigger Streak entity updates at `/checkin/[locationId]`
- **Leaderboard** — real-time cohort rankings by pillar at `/leaderboard`
- **Bounty Board** — post and claim bounties at `/bounties`
- **Endorse Peers** — skill endorsements at `/endorse/[wallet]`
- **Cohort Dashboard** — coordinator analytics at `/cohort/ns-v3-2026`
- **Verification Panel** — judge-facing proof at `/verify`

---

## Submission Checklist

- [x] `PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" }` on every entity and query
- [x] 6 entity types: Contribution, Endorsement, Streak, ValidationRecord, ReputationPassport, Bounty
- [x] AI integration: Claude Sonnet 4 for chat + passport narrative generation
- [x] DePIN layer: QR-based daily check-ins updating Streak entities
- [x] Public repo: github.com/Rarktech/pulse
- [x] Working demo: pulse-ns.vercel.app
- [x] Seed script: `npm run seed`
- [x] Verify script: `npm run verify`
- [x] On-chain verification page: `/verify`
