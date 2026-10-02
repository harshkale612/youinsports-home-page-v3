import {
  BadgeCheck,
  Bot,
  Cpu,
  Handshake,
  IdCard,
  Puzzle,
  ScanLine,
  Share2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Chess ID's plans and what they include, as the Products page shows them.
 *
 * Prices are in rupees and the page derives everything else from them — the
 * per-month figure for a yearly plan, and how much yearly saves over paying
 * monthly — so changing a price here is the only edit a price change needs.
 */

export type FeatureGroup = "chess" | "athlete";

export type ChessFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Chess tools come with Premium; the athlete identity comes with every plan. */
  group: FeatureGroup;
};

export const FEATURE_GROUPS: Record<FeatureGroup, { title: string; plans: string }> = {
  chess: { title: "Chess tools", plans: "Premium" },
  athlete: { title: "Athlete identity", plans: "Every plan" },
};

export const CHESS_FEATURES: ChessFeature[] = [
  {
    id: "scoresheet-pgn",
    title: "Scoresheet & Video to PGN",
    description:
      "Photograph a handwritten scoresheet or upload a video of the game, and get it back as a clean PGN.",
    icon: ScanLine,
    group: "chess",
  },
  {
    id: "share-pgn",
    title: "Download & Share PGN",
    description: "Keep every game as a PGN file, or send it straight to your coach, club or friends.",
    icon: Share2,
    group: "chess",
  },
  {
    id: "ai-review",
    title: "AI Game Review",
    description: "A move-by-move review of your game that shows where it turned, and why.",
    icon: Sparkles,
    group: "chess",
  },
  {
    id: "insights",
    title: "Insights & Training",
    description: "Patterns across all your games, turned into what to work on next.",
    icon: TrendingUp,
    group: "chess",
  },
  {
    id: "stockfish",
    title: "Stockfish Deep Analysis",
    description: "Put any position under Stockfish for its best lines and a deep evaluation.",
    icon: Cpu,
    group: "chess",
  },
  {
    id: "bots",
    title: "Play vs Bots",
    description: "Practise openings, middlegames and endings against a bot, whenever you like.",
    icon: Bot,
    group: "chess",
  },
  {
    id: "puzzles",
    title: "Puzzles",
    description: "Sharpen your tactics one pattern at a time.",
    icon: Puzzle,
    group: "chess",
  },
  {
    id: "profile",
    title: "Athlete Profile",
    description: "One profile for your games, results and progress.",
    icon: IdCard,
    group: "athlete",
  },
  {
    id: "verified",
    title: "Verified Badge",
    description: "Show organisers and sponsors that your profile is really you.",
    icon: BadgeCheck,
    group: "athlete",
  },
  {
    id: "sponsorship",
    title: "Sponsorship Program",
    description: "A way in front of the sponsors who back amateur athletes.",
    icon: Handshake,
    group: "athlete",
  },
];

export type BillingCycle = "monthly" | "yearly";

/**
 * The chess piece a plan is shown as, rendered from the board's own models
 * (images under `public/products/`). `art` is the piece for each page theme:
 * a white piece reads on the night page, a black one on paper.
 */
export type PlanPiece = {
  name: string;
  caption: string;
  art: Record<"dark" | "light", string>;
};

export type ChessPlan = {
  id: "basic" | "premium";
  name: string;
  tagline: string;
  piece: PlanPiece;
  /** Rupees per billing period: a month for `monthly`, a year for `yearly`. */
  prices: Partial<Record<BillingCycle, number>>;
  defaultCycle: BillingCycle;
  groups: FeatureGroup[];
  trialDays?: number;
  cta: string;
  /** The small print under the button. */
  note: string;
  featured?: boolean;
};

export const CHESS_PLANS: ChessPlan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Your athlete identity, verified.",
    piece: {
      name: "The Pawn",
      caption: "Where every player starts",
      art: { dark: "/products/pawn-porcelain.webp", light: "/products/pawn-midnight.webp" },
    },
    prices: { yearly: 99.99 },
    defaultCycle: "yearly",
    groups: ["athlete"],
    cta: "Subscribe now",
    note: "Cancel anytime",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Every chess tool, plus your athlete identity.",
    piece: {
      name: "The Queen",
      caption: "The most powerful piece",
      art: { dark: "/products/queen-porcelain.webp", light: "/products/queen-midnight.webp" },
    },
    prices: { monthly: 99.99, yearly: 1056 },
    defaultCycle: "yearly",
    groups: ["chess", "athlete"],
    trialDays: 7,
    cta: "Start 7-day free trial",
    note: "No payment due today · Cancel anytime",
    featured: true,
  },
];

/** What a yearly plan saves over twelve monthly payments, as a whole percentage. */
export function yearlySaving(plan: ChessPlan): number | null {
  const { monthly, yearly } = plan.prices;
  if (monthly === undefined || yearly === undefined) return null;
  const saving = Math.round((1 - yearly / (monthly * 12)) * 100);
  return saving > 0 ? saving : null;
}
