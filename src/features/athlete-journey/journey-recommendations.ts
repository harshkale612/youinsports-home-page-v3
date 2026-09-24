import type { Goal, JourneyGap, MetricId, Recommendation } from "@/types/journey";

/**
 * Demo recommendation rules.
 *
 * Deliberately deterministic and readable rather than clever: this is
 * illustrative logic for the product concept, not an assessment algorithm, and
 * keeping it isolated here is what lets a real service replace it later without
 * touching a single component.
 */

type RecommendationTemplate = {
  focus: MetricId;
  title: string;
  body: (sportLabel: string) => string;
};

/** One per dimension. Chosen by which dimension has the most room to move. */
const BY_FOCUS: Record<MetricId, RecommendationTemplate> = {
  "career-readiness": {
    focus: "career-readiness",
    title: "Build your athlete identity",
    body: (sport) =>
      `Bring your ${sport.toLowerCase()} achievements, stats and media into one profile that travels with you, instead of living across screenshots and group chats.`,
  },
  "performance-readiness": {
    focus: "performance-readiness",
    title: "Make your performance measurable",
    body: () =>
      "Track the things you already do — sessions, matches, progress — so improvement becomes something you can see rather than something you assume.",
  },
  visibility: {
    focus: "visibility",
    title: "Make your journey visible",
    body: (sport) =>
      `A profile that coaches, clubs and selectors can actually find is the difference between playing well and being known for playing well in ${sport.toLowerCase()}.`,
  },
  network: {
    focus: "network",
    title: "Connect with the right people",
    body: () =>
      "Coaches, clubs, organisers and other athletes on the same pathway. Your next opportunity is usually one connection away, not one trial away.",
  },
  "competitive-reach": {
    focus: "competitive-reach",
    title: "Find stronger competition",
    body: (sport) =>
      `Discover ${sport.toLowerCase()} competitions and trials beyond your current circuit, so the level you play at keeps moving with you.`,
  },
};

/** Always worth saying last: it ties the five together into a pathway. */
const CLOSING: RecommendationTemplate = {
  focus: "career-readiness",
  title: "Keep building toward the next level",
  body: () =>
    "Every session, result and connection compounds into one record of your progress — the thing you will want when the next opportunity asks what you have done.",
};

/**
 * Dimensions a goal cares about most, regardless of the numbers. A player
 * chasing sponsorship needs visibility surfaced even if visibility is not
 * their weakest reading.
 */
const GOAL_PRIORITIES: Record<Goal, MetricId[]> = {
  "turn-professional": ["visibility", "performance-readiness", "career-readiness"],
  "reach-national": ["competitive-reach", "performance-readiness", "visibility"],
  "get-discovered": ["visibility", "network", "career-readiness"],
  "improve-performance": ["performance-readiness", "competitive-reach", "network"],
  "find-coaches": ["network", "performance-readiness", "visibility"],
  "find-competitions": ["competitive-reach", "network", "visibility"],
  "build-profile": ["career-readiness", "visibility", "network"],
  "find-sponsorship": ["visibility", "network", "career-readiness"],
  "long-term-career": ["career-readiness", "performance-readiness", "network"],
};

/**
 * Orders the five dimensions by what this athlete should act on first, then
 * renders them as numbered recommendations.
 *
 * Ranking blends two signals: the size of the gap (biggest room to move first)
 * and what the stated goal implies. A goal-priority dimension is pulled forward
 * even when its gap is modest, which is what stops every profile producing the
 * same list.
 */
export function buildRecommendations(
  gaps: JourneyGap[],
  goal: Goal,
  sportLabel: string,
): Recommendation[] {
  const priorities = GOAL_PRIORITIES[goal];

  const ranked = [...gaps].sort((a, b) => {
    const priorityA = priorities.indexOf(a.id);
    const priorityB = priorities.indexOf(b.id);
    // Not in the goal's priority list sorts last, not first.
    const weightA = (a.target - a.current) + (priorityA === -1 ? 0 : (3 - priorityA) * 9);
    const weightB = (b.target - b.current) + (priorityB === -1 ? 0 : (3 - priorityB) * 9);
    return weightB - weightA;
  });

  const templates = [...ranked.slice(0, 4).map((gap) => BY_FOCUS[gap.id]), CLOSING];

  return templates.map((template, i) => ({
    id: `${template.focus}-${i}`,
    index: String(i + 1).padStart(2, "0"),
    title: template.title,
    body: template.body(sportLabel),
    focus: template.focus,
  }));
}
