import type { Athlete, CareerInsight } from "@/types/athlete";
import { getGoalConfig } from "@/data/goals";
import { nextLevel, getLevelConfig } from "@/data/levels";

export interface CareerInsightProvider {
  generateInsight(athlete: Athlete): Promise<CareerInsight>;
}

const METRIC_LABELS: Record<keyof Athlete["ranking"], string> = {
  performance: "performance consistency",
  visibility: "visibility",
  competitiveReach: "competitive reach",
  careerReadiness: "career readiness",
};

function weakestMetric(athlete: Athlete): keyof Athlete["ranking"] {
  const entries = Object.entries(athlete.ranking) as [keyof Athlete["ranking"], number][];
  return entries.reduce((weakest, current) => (current[1] < weakest[1] ? current : weakest))[0];
}

function strongestMetric(athlete: Athlete): keyof Athlete["ranking"] {
  const entries = Object.entries(athlete.ranking) as [keyof Athlete["ranking"], number][];
  return entries.reduce((strongest, current) => (current[1] > strongest[1] ? current : strongest))[0];
}

/**
 * Deterministic mock provider. The UI depends only on the CareerInsightProvider
 * interface, so this can be swapped for a real AI-backed implementation later
 * without touching the components that consume it.
 */
export class MockCareerInsightProvider implements CareerInsightProvider {
  async generateInsight(athlete: Athlete): Promise<CareerInsight> {
    const weak = weakestMetric(athlete);
    const strong = strongestMetric(athlete);
    const goal = getGoalConfig(athlete.goal);
    const target = nextLevel(athlete.level);
    const currentLevel = getLevelConfig(athlete.level);

    const headline = `Your biggest opportunity is ${METRIC_LABELS[weak]}`;

    const summary = `${athlete.name}'s strongest signal right now is ${METRIC_LABELS[strong]}, at the ${currentLevel.label.toLowerCase()} level. The fastest path toward "${goal.label.toLowerCase()}"${
      target ? ` and ${target.label.toLowerCase()}-level competition` : ""
    } is closing the gap in ${METRIC_LABELS[weak]} while protecting what's already working.`;

    const nextSteps = [
      "Complete your athlete profile",
      "Upload recent match highlights",
      "Track weekly performance",
      "Connect with relevant coaches",
      "Explore upcoming opportunities",
    ];

    return { headline, summary, nextSteps };
  }
}

export const careerInsightProvider: CareerInsightProvider = new MockCareerInsightProvider();
