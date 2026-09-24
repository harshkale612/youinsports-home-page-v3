import type { Athlete, AthleteOnboarding, Sport, Level, Goal, TimelineEntry } from "@/types/athlete";
import { getSportConfig } from "@/data/sports";
import { LEVELS, getLevelConfig } from "@/data/levels";
import { buildOpportunities } from "@/data/opportunities";
import { createSeededRandom, seededJitter } from "@/lib/seed";
import { clamp } from "@/lib/utils";

export type GenerateAthleteInput = {
  name: string;
  sport: Sport;
  level: Level;
  goal: Goal;
};

function buildTimeline(random: () => number, levelIndex: number, sportLabel: string): TimelineEntry[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - clamp(2 + levelIndex, 2, 6);
  const entries: TimelineEntry[] = [
    { year: String(startYear), label: `Started competitive ${sportLabel.toLowerCase()}` },
  ];

  const milestones = LEVELS.slice(0, levelIndex + 1);
  milestones.forEach((lvl, i) => {
    if (i === 0) return;
    const year = startYear + Math.round((i / Math.max(milestones.length - 1, 1)) * (currentYear - startYear - 1));
    entries.push({ year: String(year), label: `${lvl.label} selection` });
  });

  entries.push({ year: String(currentYear), label: `${getLevelConfig(LEVELS[levelIndex].id).label} level`, isCurrent: true });

  const next = LEVELS[levelIndex + 1];
  if (next) {
    entries.push({ year: "NEXT", label: `${next.label} selection`, isFuture: true });
  }

  return entries;
}

export function generateDemoAthlete(input: GenerateAthleteInput): Athlete {
  const seed = `${input.name.toLowerCase().trim()}|${input.sport}|${input.level}|${input.goal}`;
  const random = createSeededRandom(seed);
  const pick = (n: number) => Math.floor(random() * n);

  const sportConfig = getSportConfig(input.sport);
  const levelConfig = getLevelConfig(input.level);
  const levelIndex = levelConfig.order;

  const base = 40 + levelIndex * 10;
  const j = () => seededJitter(random, 8);

  const performance = {
    overall: clamp(Math.round(base + j()), 20, 96),
    technique: clamp(Math.round(base + j() * 0.9), 20, 96),
    fitness: clamp(Math.round(base + j() * 1.1), 20, 97),
    consistency: clamp(Math.round(base - 4 + j()), 15, 95),
    matchPerformance: clamp(Math.round(base + j() * 0.8), 20, 96),
  };

  const ranking = {
    performance: clamp(Math.round(performance.overall + j() * 0.5), 15, 97),
    visibility: clamp(Math.round(28 + levelIndex * 7 + j()), 10, 92),
    competitiveReach: clamp(Math.round(32 + levelIndex * 11 + j()), 15, 96),
    careerReadiness: clamp(Math.round(30 + levelIndex * 9 + j()), 15, 94),
  };

  const profileStrength = clamp(Math.round(55 + seededJitter(random, 15)), 40, 92);

  const opportunities = buildOpportunities(input.sport, sportConfig.label, pick);
  const timeline = buildTimeline(random, levelIndex, sportConfig.label);

  return {
    name: input.name.trim(),
    sport: input.sport,
    level: input.level,
    goal: input.goal,
    profileStrength,
    performance,
    ranking,
    opportunities,
    timeline,
  };
}

export function isOnboardingComplete(state: AthleteOnboarding): state is Required<AthleteOnboarding> & { name: string } {
  return Boolean(state.name.trim() && state.sport && state.level && state.goal);
}

export const DEMO_PRESET: AthleteOnboarding = {
  name: "Harsh",
  sport: "cricket",
  level: "district",
  goal: "turn-professional",
};
