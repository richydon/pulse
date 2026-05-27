export const PROJECT_ATTRIBUTE = { key: "app", value: "pulse:v1" } as const;

export const BRAGA_CHAIN_ID = 60138453102;
export const BRAGA_RPC_URL =
  process.env.NEXT_PUBLIC_ARKIV_BRAGA_RPC ?? "https://braga.hoodi.arkiv.network/rpc";
export const BRAGA_EXPLORER_URL = "https://explorer.braga.hoodi.arkiv.network";
export const ARKIV_DATA_URL = "https://data.arkiv.network";

export const CURRENT_COHORT = "ns-v3-2026";
export const COHORTS = [
  { id: "ns-v3-2026", label: "NS v3 · 2026", active: true },
  { id: "ns-v2-2025", label: "NS v2 · 2025", active: false },
];

export const NS_LOCATIONS = {
  "gym-forest-city-main": {
    name: "NS Main Gym",
    pillar: "burn" as const,
    points: 20,
  },
  "gym-forest-city-pool": {
    name: "NS Pool Deck",
    pillar: "burn" as const,
    points: 20,
  },
  "auditorium-forest-city": {
    name: "NS Auditorium",
    pillar: "learn" as const,
    points: 10,
  },
  "cowork-forest-city": {
    name: "NS Coworking Space",
    pillar: "earn" as const,
    points: 5,
  },
  "sports-ns-cup": {
    name: "NS Sports Court",
    pillar: "fun" as const,
    points: 30,
  },
} as const;

export type LocationId = keyof typeof NS_LOCATIONS;

export const PILLARS = ["learn", "burn", "earn", "fun"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<Pillar, string> = {
  learn: "Learn",
  burn: "Burn",
  earn: "Earn",
  fun: "Fun",
};

export const PILLAR_COLORS: Record<Pillar, string> = {
  learn: "#3B82F6",
  burn: "#F97316",
  earn: "#10B981",
  fun: "#8B5CF6",
};

export const PILLAR_SOFT_COLORS: Record<Pillar, string> = {
  learn: "#EFF6FF",
  burn: "#FFF7ED",
  earn: "#ECFDF5",
  fun: "#F5F3FF",
};

export const PILLAR_ICONS: Record<Pillar, string> = {
  learn: "GraduationCap",
  burn: "Flame",
  earn: "Bitcoin",
  fun: "PartyPopper",
};

export const CATEGORIES: Record<
  Pillar,
  { value: string; label: string; points: number }[]
> = {
  learn: [
    { value: "session_taught", label: "Session / Workshop Taught", points: 80 },
    { value: "bounty_learn", label: "Learning Bounty Won", points: 60 },
    { value: "book_club", label: "Book Club Session", points: 40 },
    { value: "mentorship_given", label: "Mentorship Given", points: 100 },
    { value: "content_created", label: "Content Created / Published", points: 70 },
  ],
  burn: [
    { value: "daily_workout", label: "Daily Workout / Burn Session", points: 20 },
    { value: "personal_record", label: "Personal Record Set", points: 50 },
    { value: "streak_milestone", label: "Streak Milestone", points: 75 },
    { value: "sports_event", label: "Sports Event / NS Cup", points: 30 },
  ],
  earn: [
    { value: "bounty_won", label: "Bounty Won", points: 100 },
    { value: "open_source", label: "Open Source Contribution", points: 80 },
    { value: "startup_shipped", label: "Startup / Project Shipped", points: 150 },
    { value: "fundraise", label: "Fundraising Round Closed", points: 200 },
  ],
  fun: [
    { value: "event_organized", label: "Event Organized", points: 70 },
    { value: "community_built", label: "Community Initiative Built", points: 60 },
    { value: "culture_contribution", label: "Culture Contribution", points: 50 },
  ],
};

export const ALL_SKILLS = [
  "AI Engineering",
  "Smart Contract Development",
  "Frontend Development",
  "Content Creation",
  "Community Building",
  "Mentorship",
  "Fundraising",
  "Product Design",
  "Writing",
  "Fitness Coaching",
  "Event Organization",
  "Crypto/DeFi",
  "Research",
  "Public Speaking",
  "Marketing",
] as const;

export type Skill = (typeof ALL_SKILLS)[number];

export const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;
export const STREAK_MILESTONE_POINTS: Record<number, number> = {
  7: 30,
  14: 50,
  30: 120,
  60: 200,
  100: 400,
};

export const DEMO_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
