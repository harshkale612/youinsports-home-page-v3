import type { Sport, Goal } from "@/types/athlete";

export type { Sport, Goal };

/**
 * The journey's own ladder: four rungs.
 *
 * Deliberately not the shared `Level` type from `@/types/athlete` (which has
 * five, including "district") — that type backs the free-exploration demo
 * athlete network and its ladder is a separate concern. See
 * `@/data/journey-levels` for the config this type indexes into.
 */
export type JourneyLevel = "local" | "state" | "national" | "international";

/**
 * The homepage is a state machine, not a set of marketing sections.
 *
 * Steps up to and including `goal` are questions; everything from `position`
 * on is the reflection of those answers. `signup` deliberately sits second
 * from last — the value has to be visible before the ask.
 */
export type JourneyStep =
  | "welcome"
  | "sport"
  | "environment"
  | "competition"
  | "level"
  | "goal"
  | "position"
  | "gap"
  | "youinsports"
  | "next"
  | "signup"
  | "success";

/** The questions, in order. Drives the progress indicator and next/back. */
export const QUESTION_STEPS = [
  "sport",
  "environment",
  "competition",
  "level",
  "goal",
] as const satisfies readonly JourneyStep[];

export type QuestionStep = (typeof QUESTION_STEPS)[number];

/** Where the athlete currently plays — the environment, not the geography. */
export type Environment =
  | "school"
  | "college"
  | "university"
  | "club"
  | "academy"
  | "district-team"
  | "state-team"
  | "professional-club"
  | "independent";

/** What they are competing in. Separate from `JourneyLevel`: an athlete at the
 *  local level can still enter a district or even an open national tournament. */
export type CompetitionScope =
  | "school"
  | "club"
  | "local-league"
  | "district"
  | "university"
  | "state"
  | "national"
  | "open"
  | "professional"
  | "international";

/** Everything the athlete told us. The engine's only input. */
export type JourneyAnswers = {
  sport: Sport | null;
  environment: Environment | null;
  competition: CompetitionScope | null;
  /** A named event, e.g. "Maharashtra District Cricket Tournament". The flow no
   *  longer asks for one, so only demo personas set it — the engine falls back
   *  to the competition's own label when it is empty. */
  competitionName: string;
  level: JourneyLevel | null;
  goal: Goal | null;
};

export type CompleteAnswers = {
  sport: Sport;
  environment: Environment;
  competition: CompetitionScope;
  competitionName: string;
  level: JourneyLevel;
  goal: Goal;
};

/** The five illustrative dimensions the whole analysis is expressed in. */
export type MetricId =
  | "competitive-reach"
  | "performance-readiness"
  | "visibility"
  | "network"
  | "career-readiness";

export type JourneyMetric = {
  id: MetricId;
  label: string;
  /** 0-100, illustrative. Never presented as a validated score. */
  value: number;
  caption: string;
};

/**
 * A dimension where the athlete has the most room to move, framed as an
 * opportunity rather than a deficiency.
 */
export type JourneyGap = {
  id: MetricId;
  label: string;
  current: number;
  /** Where this dimension typically sits at the next level. */
  target: number;
  /** Encouraging, forward-looking. Never "you are weak at X". */
  note: string;
};

export type Recommendation = {
  id: string;
  /** "01".."05" — the section numbers them editorially. */
  index: string;
  title: string;
  body: string;
  /** Which metric this recommendation is answering. */
  focus: MetricId;
};

/** One rung of the competitive landscape, centred on the athlete. */
export type LandscapeTier = {
  level: JourneyLevel;
  label: string;
  /** Illustrative size of the field at this tier, 0-100, for the bar/rings. */
  weight: number;
  isCurrent: boolean;
  isTarget: boolean;
  isReached: boolean;
};

export type JourneyOpportunity = {
  id: string;
  kind: "trial" | "camp" | "competition" | "program" | "scholarship";
  title: string;
  sportLabel: string;
  place: string;
  window: string;
};

export type JourneySnapshot = {
  sportLabel: string;
  sportTagline: string;
  environmentLabel: string;
  competitionLabel: string;
  levelLabel: string;
  goalLabel: string;
};

/**
 * The single object the entire post-questions experience renders from.
 * Swapping the demo engine for a real API later means replacing one function.
 */
export type AthleteJourney = {
  snapshot: JourneySnapshot;
  metrics: JourneyMetric[];
  currentLevel: JourneyLevel;
  /** null once the athlete is already international. */
  nextLevel: JourneyLevel | null;
  nextLevelLabel: string | null;
  landscape: LandscapeTier[];
  gaps: JourneyGap[];
  recommendations: Recommendation[];
  opportunities: JourneyOpportunity[];
  /** One encouraging line summarising the whole read. */
  headline: string;
};

/** Who signed up, captured at the very end. */
export type JourneyIdentity = {
  name: string;
  email: string;
};
