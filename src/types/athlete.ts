export type Sport =
  | "cricket"
  | "football"
  | "basketball"
  | "tennis"
  | "athletics"
  | "swimming"
  | "badminton"
  | "volleyball"
  | "hockey"
  | "boxing"
  | "gymnastics"
  | "chess";

export type Level = "local" | "district" | "state" | "national" | "international";

export type Goal =
  | "turn-professional"
  | "reach-national"
  | "get-discovered"
  | "improve-performance"
  | "find-coaches"
  | "find-competitions"
  | "build-profile"
  | "find-sponsorship"
  | "long-term-career";

export type PerformanceMetrics = {
  overall: number;
  technique: number;
  fitness: number;
  consistency: number;
  matchPerformance: number;
};

export type RankingMetrics = {
  performance: number;
  visibility: number;
  competitiveReach: number;
  careerReadiness: number;
};

export type OpportunityType = "trial" | "camp" | "coaching" | "tournament" | "sponsorship";

export type Opportunity = {
  id: string;
  type: OpportunityType;
  title: string;
  relevance: "Recommended for you" | "High relevance" | "Recommended" | "New";
  organization: string;
  action: "OPEN" | "VIEW" | "EXPLORE";
};

export type Insight = {
  id: string;
  label: string;
};

export type CareerInsight = {
  headline: string;
  summary: string;
  nextSteps: string[];
};

export type TimelineEntry = {
  year: string;
  label: string;
  isCurrent?: boolean;
  isFuture?: boolean;
};

export type Athlete = {
  name: string;
  sport: Sport;
  level: Level;
  goal: Goal;

  profileStrength: number;

  performance: PerformanceMetrics;
  ranking: RankingMetrics;

  opportunities: Opportunity[];
  timeline: TimelineEntry[];
};

export type AthleteOnboarding = {
  name: string;
  sport: Sport | null;
  level: Level | null;
  goal: Goal | null;
};
