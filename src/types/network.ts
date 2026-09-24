import type { Sport, Level } from "@/types/athlete";

export type { Sport, Level };

/** Where an athlete currently competes — mirrors `Level`, surfaced as a ladder. */
export type AthleteLevel = Level;

export type DemoAthlete = {
  id: string;
  name: string;
  sport: Sport;
  /** The specific event/position, e.g. "100m Sprint" — richer than the sport alone. */
  discipline: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  level: AthleteLevel;
  /** 0-100 headline number shown on the card. */
  rating: number;
  performance: number;
  visibility: number;
  /** Short editorial line used on the discovery cards. */
  note: string;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
  latitude: number;
  longitude: number;
  /** Approximate population in millions. Scales the network size the globe reports. */
  population: number;
};

export type OpportunityKind =
  | "trial"
  | "competition"
  | "academy"
  | "coach"
  | "sponsor"
  | "club"
  | "event";

export type DemoOpportunity = {
  id: string;
  kind: OpportunityKind;
  title: string;
  organization: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  sports: Sport[];
  window: string;
};

/**
 * The persistent Earth scene advances through these as the page scrolls.
 * Each state owns a camera framing and a marker/arc visibility budget.
 *
 * The `journey-*` states are the acts of the athlete conversation on the
 * homepage; the rest are the free-exploration acts the globe also serves.
 */
export type EarthSceneState =
  | "hero"
  | "journey-sport"
  | "journey-place"
  | "journey-competition"
  | "journey-level"
  | "position"
  | "gap"
  | "global-network"
  | "sport-explorer"
  | "rankings"
  | "athletes"
  | "opportunities"
  | "career"
  | "final";

