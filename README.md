# Pulse — On-Chain Reputation for Network School
<img width="1830" height="824" alt="20260527-1840-04 6663261" src="https://github.com/user-attachments/assets/f25b8752-38fd-4047-968a-a810d9060ac2" />
(Dashboard)


**ETHns × Arkiv Challenge 2026 submission**

Pulse is a Web3 reputation system where every contribution a Network School member makes — a workshop taught, a gym streak, a bounty won, a peer endorsement — becomes a tamper-proof entity on the Arkiv Braga testnet, owned by the contributor's wallet. A peer validation system ensures quality, and an AI agent synthesizes everything into a portable, independently verifiable Reputation Passport.

**Live demo:** https://pulse-tau-two.vercel.app
**Demo profile:** https://pulse-tau-two.vercel.app/profile/0x742d35Cc6634C0532925a3b844Bc454e4438f44e
**Verify on-chain:** https://pulse-tau-two.vercel.app/verify

---

## The Problem

Network School members do a lot — they teach workshops, ship projects, hit gym streaks, win bounties, mentor peers — but none of it is portable. When a member leaves, their reputation lives in Notion docs, Telegram messages, and people's memories. There is no credible, verifiable record that travels with them.


<img width="1828" height="822" alt="20260527-1844-50 0236459" src="https://github.com/user-attachments/assets/cb2da7c1-24d8-4192-a4f9-d87a69e7baa8" />
(Log a contribution)



## The Solution

Pulse puts every contribution on Arkiv Braga as a cryptographically-owned entity. Members build a permanent, tamper-proof record that:

- Is owned by their wallet — not by NS or Pulse
- Is independently queryable by anyone with the SDK
- Compounds over time into a Reputation Passport with an AI-generated narrative
- Works as a verifiable credential for VCs, employers, and future communities

---

## Arkiv Integration

### PROJECT_ATTRIBUTE

Every entity created and every query executed in Pulse scopes to the project namespace:

```ts
const PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" }
```

This means all Pulse data is queryable in isolation without colliding with other apps on Arkiv Braga.

### 6 Entity Types

| Entity | Owner | Purpose |
|--------|-------|---------|
| **Contribution** | Contributor wallet | A validated activity (workshop, bounty, PR, check-in, etc.) |
| **Endorsement** | Endorser wallet | Peer skill attestation with strength rating 1–5 |
| **Streak** | Member wallet | Daily check-in tracker (DePIN layer via QR codes at NS locations) |
| **ValidationRecord** | Validator wallet | Peer approval or rejection of a contribution (2 required to finalise) |
| **ReputationPassport** | Member wallet | AI-synthesized profile aggregating all of the above |
| **Bounty** | Poster wallet | Task posted with USD reward; winner is marked on-chain |

### Entity Lifecycle: Contribution Validation

The validation flow is designed around Arkiv's ownership model — only an entity's `$owner` can call `updateEntity` on it:

```
Contributor creates Contribution entity  →  status: "pending"
         ↓
Peer A opens shareable link /contribute/validate/[key]
Peer A creates ValidationRecord entity  (Peer A is $owner of this record) ✓
         ↓
Peer B does the same
         ↓
Contributor visits their profile, sees "2/2 validators confirmed"
Contributor clicks Finalise — calls updateContributionStatus with their own wallet ✓
         ↓
Contribution entity  →  status: "validated"  →  points added to leaderboard
```

Validators never touch the Contribution entity itself. This is the correct Arkiv ownership pattern.

### Attribute Normalisation

All wallet addresses are stored lowercase using an `addr()` helper in `entities.ts`, and all query predicates lowercase the input with an `lc()` helper in `queries.ts`. Arkiv's `eq()` is strictly case-sensitive, so this prevents mismatches between EIP-55 checksum addresses returned by Privy and stored query values.

### Query example

```ts
import { createPublicClient } from "@arkiv-network/sdk";
import { eq } from "@arkiv-network/sdk/query";
import { http } from "@arkiv-network/sdk/transport";

const client = createPublicClient({
  chain: { id: 60138453102, rpcUrls: { default: { http: ["https://braga.hoodi.arkiv.network/rpc"] } } },
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
<img width="1830" height="800" alt="20260527-1848-26 9492199" src="https://github.com/user-attachments/assets/d90506f7-b4b0-42a5-be18-2e58332cacb6" />
(profile page)
## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/richydon/pulse
cd pulse
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local` — all variables required unless marked optional:

```env
# Arkiv Braga RPC (required)
NEXT_PUBLIC_ARKIV_BRAGA_RPC=https://braga.hoodi.arkiv.network/rpc

# Privy authentication (required)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Anthropic — AI passport narrative + chat agent (required)
ANTHROPIC_API_KEY=your_anthropic_key

# Cloudinary — bounty cover image uploads (optional)
# Create a free account at cloudinary.com, then Settings → Upload → Upload presets
# Set the preset signing mode to "Unsigned"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

> **Important:** `NEXT_PUBLIC_ARKIV_BRAGA_RPC` must point to `https://braga.hoodi.arkiv.network/rpc`. The older `rpc.braga.arkiv.network` hostname no longer resolves and will cause all chain reads to fail silently.

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Cloudinary Setup (for bounty cover images)

Bounty images are uploaded directly from the browser to Cloudinary — no backend or database needed. Cloudinary returns a public URL which is stored as `imageUrl` in the bounty entity's JSON payload on Arkiv.

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. In the dashboard go to **Settings → Upload → Upload presets → Add upload preset**
3. Set **Signing mode** to `Unsigned` — this allows browser-direct uploads without exposing a secret
4. Name the preset (e.g. `pulse_bounties`) and save
5. Copy your **Cloud name** from the top-left of the Cloudinary dashboard
6. Add both values to `.env.local` and to your Vercel project's environment variables

If these vars are not set, the image upload field shows a configuration error and the rest of the form continues to work normally.

---
<img width="1834" height="816" alt="20260527-1858-07 8179348" src="https://github.com/user-attachments/assets/3290cdaf-4446-4a4e-85ac-044903270a83" />
(bounty page)


## Seeding Demo Data

The seed script writes entities to Arkiv Braga for a demo wallet.

Add to `.env.local`:

```env
PULSE_SEED_PRIVATE_KEY=0x...   # private key of demo wallet
PULSE_VALIDATOR_KEY_1=0x...    # private key of validator wallet 1
PULSE_VALIDATOR_KEY_2=0x...    # private key of validator wallet 2
```

Run:

```bash
npm run seed
```

This writes:
- 12 Contributions across all 4 pillars (Learn / Burn / Earn / Fun)
- 24 ValidationRecords (2 per contribution, from separate validator wallets)
- 8 Endorsements from peer wallets
- 1 Streak entity (31-day daily burn)
- 1 ReputationPassport with AI narrative
- 3 open Bounties

Verify the seeded data:

```bash
npm run verify
```

---

## On-Chain Verification

All data is independently verifiable without using Pulse at all. Visit `/verify` in the app or query Arkiv directly:

- **RPC:** `https://braga.hoodi.arkiv.network/rpc`
- **Explorer:** `https://explorer.braga.arkiv.network`
- **Chain ID:** `60138453102`
- **SDK:** `@arkiv-network/sdk@0.6.8`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain / data layer | Arkiv Braga Testnet |
| Arkiv SDK | @arkiv-network/sdk 0.6.8 |
| Authentication | Privy (email + embedded EVM wallet) |
| AI | Claude Sonnet 4 via Vercel AI SDK (chat + passport narrative) |
| Frontend framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 |
| Charts | Recharts (radar + bar) |
| Image hosting | Cloudinary (browser-direct unsigned upload, URL stored on Arkiv) |
| Deployment | Vercel |

---

## Features

### Reputation & Profile
- **Reputation Passport** — public profile at `/profile/[wallet]` with radar chart across 4 pillars (Learn / Burn / Earn / Fun), contribution timeline, endorsements received, AI narrative, and on-chain verification snippet
- **AI Reputation Agent** — chat with Claude Sonnet about your on-chain record at `/ai`
- **Leaderboard** — real-time cohort rankings by total and per-pillar points at `/leaderboard`

### Contributions & Validation
- **Log Contribution** — 4-step form at `/contribute/new` that writes a Contribution entity to Arkiv; success screen shows a shareable validation link
- **Shareable validation links** — every contribution gets a dedicated URL (`/contribute/validate/[key]`) that anyone can open, connect their wallet, and validate without needing to find the contribution manually
- **Validation queue** — `/contribute/validate` lists all pending contributions for the cohort; validators can approve or reject with a note and evidence checkbox; each card has a copy-link button
- **Peer-safe finalisation** — validators only write `ValidationRecord` entities (which they own); contributors finalise their own contributions from their profile page once 2 approvals are in, using their own wallet (Arkiv ownership-compliant)
- **Profile finalise button** — pending contributions with 2+ approvals show a "Finalise Validation ✓" button visible only to the contributor on their own profile

### Bounties
- **Bounty board** — `/bounties` lists open bounties in a card layout with cover image thumbnail, title, description, tag pills, reward amount, and deadline countdown
- **Cover image upload** — posters can drag-and-drop or click to upload a cover image; file uploads directly to Cloudinary, URL stored in the Arkiv entity payload; shown as a full-width hero on the detail page
- **Copy link** — each bounty card has a "Copy link" button that copies the direct URL and shows a "Copied!" confirmation
- **Submit to bounty** — the detail page CTA links to `/contribute/new?bountyKey=<key>` so the contribution is automatically tagged to the bounty
- **Submissions list** — bounty detail page queries and shows all contributions linked to that bounty
- **Mark as winner** — bounty poster can mark any submission as winner from the detail page; writes `markBountyWinner` on Arkiv and flips status to `completed`

### DePIN & Social
- **Daily Check-In** — QR codes at NS locations trigger Streak entity updates at `/checkin/[locationId]`
- **Peer Endorsements** — skill endorsements with 1–5 strength rating at `/endorse/[wallet]`
- **Cohort Dashboard** — coordinator analytics at `/cohort/ns-v3-2026`
- **Verification Panel** — judge-facing on-chain proof at `/verify`

---

## Project Structure

```
src/
├── app/
│   ├── bounties/
│   │   ├── [key]/page.tsx     # Bounty detail: hero image, submissions, mark winner
│   │   ├── new/page.tsx       # Post bounty with Cloudinary image upload
│   │   └── page.tsx           # Bounty list: HuggingFace-style cards with copy link
│   ├── contribute/
│   │   ├── new/page.tsx       # 4-step contribution form + shareable link on success
│   │   └── validate/
│   │       ├── [key]/page.tsx # Shareable validation page for a specific contribution
│   │       └── page.tsx       # Cohort-wide validation queue
│   ├── profile/[wallet]/page.tsx  # Public profile + finalise button for own pending contributions
│   ├── leaderboard/page.tsx
│   ├── dashboard/page.tsx
│   └── ...
├── components/
│   ├── layout/AppShell.tsx
│   └── ui/
│       ├── ImageUpload.tsx    # Cloudinary drag-and-drop upload widget
│       ├── ChainWriteProgress.tsx
│       ├── ArkivBadge.tsx
│       └── ...
├── lib/
│   ├── arkiv/
│   │   ├── client.ts          # createPublicClient + createWalletClient (Privy)
│   │   ├── entities.ts        # createContribution, createBounty, createValidationRecord, ...
│   │   └── queries.ts         # getContributionsByWallet, getPendingValidationQueue, ...
│   └── utils/format.ts
└── types/entities.ts
```

---

## Submission Checklist

- [x] `PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" }` on every entity and query
- [x] 6 entity types: Contribution, Endorsement, Streak, ValidationRecord, ReputationPassport, Bounty
- [x] Correct Arkiv ownership model: each entity updated only by its `$owner` wallet
- [x] Address normalisation: all wallet attributes stored lowercase; all query predicates lowercased
- [x] AI integration: Claude Sonnet 4 for chat agent + passport narrative generation
- [x] DePIN layer: QR-based daily check-ins updating Streak entities
- [x] Peer validation system: shareable links, ValidationRecord entities, contributor-finalised status
- [x] Bounty lifecycle: post → image upload → submit → mark winner (fully on-chain)
- [x] Public repo: github.com/richydon/pulse
- [x] Working demo: pulse-ns.vercel.app
- [x] Seed script: `npm run seed`
- [x] Verify script: `npm run verify`
- [x] On-chain verification page: `/verify`
