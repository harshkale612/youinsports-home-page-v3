import type { CompetitionScope, JourneyLevel } from "@/types/journey";

export type CompetitionConfig = {
  id: CompetitionScope;
  label: string;
  detail: string;
  /**
   * 0-4, aligned to the level ladder. How far the competition itself reaches,
   * independent of where the athlete currently sits on that ladder.
   */
  reach: number;
  /** Where this competition sits on the ladder, for the landscape diagram. */
  tier: JourneyLevel;
};

export const COMPETITIONS: CompetitionConfig[] = [
  { id: "school", label: "School competition", detail: "Inter-school and schools championships", reach: 0.3, tier: "local" },
  { id: "club", label: "Club competition", detail: "Club fixtures and club championships", reach: 0.6, tier: "local" },
  { id: "local-league", label: "Local league", detail: "Your city or community league", reach: 0.7, tier: "local" },
  { id: "district", label: "District competition", detail: "District tournaments and selection", reach: 1.3, tier: "local" },
  { id: "university", label: "University competition", detail: "Inter-university and collegiate sport", reach: 1.6, tier: "state" },
  { id: "state", label: "State championship", detail: "State-level championships and trials", reach: 2.1, tier: "state" },
  { id: "open", label: "Open tournament", detail: "Open-entry events, any level welcome", reach: 1.8, tier: "state" },
  { id: "national", label: "National championship", detail: "National championships and camps", reach: 2.7, tier: "national" },
  { id: "professional", label: "Professional league", detail: "A professional or semi-pro league", reach: 3.0, tier: "national" },
  { id: "international", label: "International competition", detail: "Competing across borders", reach: 3.6, tier: "international" },
];

const BY_ID = new Map(COMPETITIONS.map((c) => [c.id, c]));

export function getCompetition(id: CompetitionScope | null | undefined): CompetitionConfig {
  return (id && BY_ID.get(id)) || COMPETITIONS[0];
}

/**
 * The competitions worth showing first for a given level. The full list stays
 * available — a local athlete entering a national open is exactly the kind of
 * thing this should not rule out.
 */
export function suggestedCompetitions(level: JourneyLevel | null): CompetitionScope[] {
  switch (level) {
    case "state":
      return ["state", "university", "national", "open"];
    case "national":
      return ["national", "professional", "international", "state"];
    case "international":
      return ["international", "professional", "national", "open"];
    case "local":
    default:
      return ["local-league", "club", "school", "district"];
  }
}
