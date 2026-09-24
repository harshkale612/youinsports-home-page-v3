import type {
  AthleteJourney,
  CompleteAnswers,
  JourneyAnswers,
  JourneyGap,
  JourneyLevel,
  JourneyMetric,
  JourneyOpportunity,
  LandscapeTier,
  MetricId,
} from "@/types/journey";
import { getSportConfig } from "@/data/sports";
import { getEnvironment } from "@/data/environments";
import { getCompetition } from "@/data/competitions";
import { JOURNEY_LEVELS, getJourneyLevelConfig, nextJourneyLevel } from "@/data/journey-levels";
import { getGoalConfig } from "@/data/goals";
import { buildRecommendations } from "@/features/athlete-journey/journey-recommendations";
import { createSeededRandom, seededJitter } from "@/lib/seed";
import { clamp } from "@/lib/utils";

/**
 * The demo personalization engine.
 *
 * ILLUSTRATIVE. Every number below is a deterministic function of what the
 * athlete told us — enough to prove the product concept and to make two
 * different answers produce two visibly different journeys. None of it is a
 * measurement, and nothing in the UI presents it as one.
 *
 * Deterministic by design: the same answers always produce the same journey, so
 * a demo can be re-run in front of an audience without the numbers moving.
 */

export function isComplete(answers: JourneyAnswers): answers is JourneyAnswers & CompleteAnswers {
  return Boolean(
    answers.sport && answers.environment && answers.competition && answers.level && answers.goal,
  );
}

const METRIC_LABELS: Record<MetricId, string> = {
  "competitive-reach": "Competitive reach",
  "performance-readiness": "Performance readiness",
  visibility: "Visibility",
  network: "Network",
  "career-readiness": "Career readiness",
};

/**
 * How each dimension typically reads at each rung of the ladder. Used as the
 * gap target — "where this sits at the next level" — rather than as a score to
 * beat. Indexed [local, state, national, international].
 */
const TYPICAL_AT_LEVEL: Record<MetricId, [number, number, number, number]> = {
  "competitive-reach": [30, 64, 79, 92],
  "performance-readiness": [38, 66, 79, 90],
  visibility: [18, 45, 63, 82],
  network: [22, 49, 66, 84],
  "career-readiness": [26, 55, 72, 88],
};

function typicalAt(id: MetricId, level: JourneyLevel): number {
  return TYPICAL_AT_LEVEL[id][getJourneyLevelConfig(level).order];
}

/** Encouraging framing per dimension. Never phrased as a deficiency. */
const GAP_NOTES: Record<MetricId, string> = {
  "competitive-reach":
    "Stepping into a stronger field is often what moves everything else forward.",
  "performance-readiness":
    "You already do the work — capturing it is what turns effort into evidence.",
  visibility: "Your biggest opportunity may be making your journey easier to find.",
  network: "Expanding who knows your game tends to open doors faster than anything else.",
  "career-readiness": "There is room to turn what you have already done into a record that travels.",
};

/**
 * The competitive landscape, centred on the athlete.
 *
 * Weights describe how large the field is at each tier — broad at the base,
 * narrow at the top — which is what makes the concentric diagram read as
 * "here is the world you are currently inside".
 */
function buildLandscape(current: JourneyLevel, target: JourneyLevel | null): LandscapeTier[] {
  const currentOrder = getJourneyLevelConfig(current).order;
  const weights = [100, 46, 21, 8];

  return JOURNEY_LEVELS.map((level) => ({
    level: level.id,
    label: level.label,
    weight: weights[level.order],
    isCurrent: level.id === current,
    isTarget: target !== null && level.id === target,
    isReached: level.order <= currentOrder,
  }));
}

/**
 * Illustrative opportunity blueprints.
 *
 * `place` is deliberately generic rather than tied to a real city or
 * country — the journey no longer asks where the athlete is based, so nothing
 * here implies a geography we were never told.
 */
const OPPORTUNITY_BLUEPRINTS: {
  kind: JourneyOpportunity["kind"];
  title: (nextLabel: string) => string;
  window: string;
  place: string;
}[] = [
  { kind: "trial", title: (next) => `${next} selection trial`, window: "Opens next season", place: "Open to your region" },
  { kind: "camp", title: () => "Performance training camp", window: "Rolling intake", place: "Multiple training centres" },
  { kind: "competition", title: (next) => `${next} open championship`, window: "Entries open soon", place: "Nationwide entries" },
  { kind: "program", title: () => "Athlete development program", window: "Applications open", place: "Open worldwide" },
  { kind: "scholarship", title: () => "Emerging athlete scholarship", window: "One intake a year", place: "Open nationally" },
];

function buildOpportunities(
  answers: CompleteAnswers,
  nextLabel: string,
  pick: (n: number) => number,
): JourneyOpportunity[] {
  const sportLabel = getSportConfig(answers.sport).label;

  // Rotate the starting point by the seed so two athletes at the same level do
  // not see an identical card set.
  const offset = pick(OPPORTUNITY_BLUEPRINTS.length);

  return Array.from({ length: 4 }, (_, i) => {
    const blueprint = OPPORTUNITY_BLUEPRINTS[(offset + i) % OPPORTUNITY_BLUEPRINTS.length];

    return {
      id: `${answers.sport}-${blueprint.kind}-${i}`,
      kind: blueprint.kind,
      title: blueprint.title(nextLabel),
      sportLabel,
      place: blueprint.place,
      window: blueprint.window,
    };
  });
}

/**
 * Turns the athlete's answers into the object the whole experience renders
 * from. One function in, one object out — the seam a real API would replace.
 */
export function buildAthleteJourney(answers: CompleteAnswers): AthleteJourney {
  const sport = getSportConfig(answers.sport);
  const environment = getEnvironment(answers.environment);
  const competition = getCompetition(answers.competition);
  const level = getJourneyLevelConfig(answers.level);
  const goal = getGoalConfig(answers.goal);
  const target = nextJourneyLevel(answers.level);

  const seed = [answers.sport, answers.environment, answers.competition, answers.level, answers.goal].join(
    "|",
  );

  const random = createSeededRandom(seed);
  const pick = (n: number) => Math.floor(random() * n);
  // Small, consistent jitter so the readings look observed rather than computed
  // off a single formula. Never large enough to change the story.
  const jitter = () => seededJitter(random, 5);

  const levelIndex = level.order;
  const structure = environment.structure;

  // Competing above your current level is the single strongest positive signal
  // in the model — it is the thing that actually moves an athlete up.
  const stretch = clamp(competition.reach - levelIndex, -1, 1.6);

  const metricValues: Record<MetricId, number> = {
    "competitive-reach": clamp(
      Math.round(typicalAt("competitive-reach", answers.level) + stretch * 9 + jitter()),
      12,
      96,
    ),
    "performance-readiness": clamp(
      Math.round(typicalAt("performance-readiness", answers.level) + structure * 14 - 5 + jitter()),
      15,
      96,
    ),
    // Visibility runs deliberately low across the board: it is the gap the
    // product exists to close, and overstating it would make the analysis
    // meaningless.
    visibility: clamp(
      Math.round(typicalAt("visibility", answers.level) * 0.88 + structure * 8 + jitter()),
      8,
      90,
    ),
    network: clamp(
      Math.round(typicalAt("network", answers.level) * 0.9 + structure * 16 + jitter()),
      10,
      92,
    ),
    "career-readiness": 0, // derived below
  };

  // Career readiness is the composite, so it moves whenever anything else does.
  metricValues["career-readiness"] = clamp(
    Math.round(
      (metricValues["competitive-reach"] * 0.25 +
        metricValues["performance-readiness"] * 0.3 +
        metricValues.visibility * 0.2 +
        metricValues.network * 0.25) *
        0.94,
    ),
    10,
    94,
  );

  const metrics: JourneyMetric[] = (Object.keys(METRIC_LABELS) as MetricId[]).map((id) => ({
    id,
    label: METRIC_LABELS[id],
    value: metricValues[id],
    caption: captionFor(id, metricValues[id]),
  }));

  // Gaps measure against the next rung — or, at the top of the ladder, against
  // sustaining the level the athlete is already at.
  const gapReference = target?.id ?? "international";
  const gaps: JourneyGap[] = (Object.keys(METRIC_LABELS) as MetricId[]).map((id) => ({
    id,
    label: METRIC_LABELS[id],
    current: metricValues[id],
    target: clamp(Math.max(typicalAt(id, gapReference), metricValues[id] + 6), 20, 98),
    note: GAP_NOTES[id],
  }));

  const nextLabel = target?.label ?? level.label;

  return {
    snapshot: {
      sportLabel: sport.label,
      sportTagline: sport.tagline,
      environmentLabel: environment.label,
      competitionLabel: answers.competitionName.trim() || competition.label,
      levelLabel: level.label,
      goalLabel: goal.label,
    },
    metrics,
    currentLevel: answers.level,
    nextLevel: target?.id ?? null,
    nextLevelLabel: target?.label ?? null,
    landscape: buildLandscape(answers.level, target?.id ?? null),
    gaps,
    recommendations: buildRecommendations(gaps, answers.goal, sport.label),
    opportunities: buildOpportunities(answers, nextLabel, pick),
    headline: buildHeadline(sport.label, level.label, target?.label ?? null),
  };
}

/** Short, plain reading of a single number. Encouraging at every value. */
function captionFor(id: MetricId, value: number): string {
  const high = value >= 70;
  const mid = value >= 45;

  switch (id) {
    case "competitive-reach":
      return high ? "Competing in a strong field" : mid ? "Room to test yourself higher" : "A wider field is within reach";
    case "performance-readiness":
      return high ? "Well set up to perform" : mid ? "Solid base to build on" : "The foundations are there to build on";
    case "visibility":
      return high ? "Your journey is easy to find" : mid ? "Becoming easier to find" : "Plenty of room to be discovered";
    case "network":
      return high ? "Well connected in your sport" : mid ? "A network starting to build" : "A network waiting to be built";
    case "career-readiness":
      return high ? "A career taking shape" : mid ? "A journey worth building on" : "The start of something to build";
  }
}

function buildHeadline(sportLabel: string, levelLabel: string, nextLabel: string | null): string {
  if (!nextLabel) {
    return `You are competing in ${sportLabel.toLowerCase()} at the highest level on the ladder. From here it is about staying there and being seen doing it.`;
  }
  return `You are a ${levelLabel.toLowerCase()}-level ${sportLabel.toLowerCase()} athlete with a clear next rung: ${nextLabel.toLowerCase()}.`;
}
