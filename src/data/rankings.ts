import type { AthleteLevel } from "@/types/network";
import { ATHLETES } from "@/data/athletes";

/**
 * The competitive ladder. `share` is computed from the demo athlete set so the
 * distribution on screen always matches the markers on the globe.
 */
export type RankingTier = {
  id: AthleteLevel;
  label: string;
  description: string;
  /** What changes for an athlete once they reach this tier. */
  unlocks: string;
  order: number;
};

export const RANKING_TIERS: RankingTier[] = [
  {
    id: "local",
    label: "Local",
    description: "Competing in your city, club or school.",
    unlocks: "A verified profile and your first recorded results.",
    order: 0,
  },
  {
    id: "district",
    label: "District",
    description: "Selected beyond your club, into district competition.",
    unlocks: "Visibility to regional coaches and district selectors.",
    order: 1,
  },
  {
    id: "state",
    label: "State",
    description: "Representing your state or province.",
    unlocks: "Academy pathways, trials and structured coaching.",
    order: 2,
  },
  {
    id: "national",
    label: "National",
    description: "Competing in the national system.",
    unlocks: "Federation programmes, sponsorship and national squads.",
    order: 3,
  },
  {
    id: "international",
    label: "Global",
    description: "On the international stage.",
    unlocks: "Global competition, professional contracts, a career.",
    order: 4,
  },
];

export function getTierCounts(): Record<AthleteLevel, number> {
  const counts = { local: 0, district: 0, state: 0, national: 0, international: 0 };
  for (const athlete of ATHLETES) counts[athlete.level] += 1;
  return counts;
}

export function athletesAtTier(tier: AthleteLevel) {
  return ATHLETES.filter((a) => a.level === tier);
}
