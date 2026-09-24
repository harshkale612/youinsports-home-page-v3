import type { JourneyLevel } from "@/types/journey";

/**
 * The athlete journey's own ladder: four rungs, not five.
 *
 * Deliberately separate from `@/data/levels` (which still has five, including
 * "district") — that file backs the free-exploration demo athlete network
 * (rankings, the athlete directory, the global map), and collapsing its ladder
 * would silently reclassify every demo athlete on the globe. The interactive
 * journey's own ladder is scoped to this file so the two can move independently.
 */
export type JourneyLevelConfig = {
  id: JourneyLevel;
  label: string;
  description: string;
  order: number;
};

export const JOURNEY_LEVELS: JourneyLevelConfig[] = [
  { id: "local", label: "Local", description: "Playing in your city or community", order: 0 },
  { id: "state", label: "State", description: "Representing your state", order: 1 },
  { id: "national", label: "National", description: "Competing at the national level", order: 2 },
  { id: "international", label: "International", description: "Competing on the global stage", order: 3 },
];

export function getJourneyLevelConfig(level: JourneyLevel | null | undefined): JourneyLevelConfig {
  return JOURNEY_LEVELS.find((l) => l.id === level) ?? JOURNEY_LEVELS[0];
}

export function nextJourneyLevel(level: JourneyLevel): JourneyLevelConfig | null {
  const current = getJourneyLevelConfig(level);
  return JOURNEY_LEVELS.find((l) => l.order === current.order + 1) ?? null;
}
