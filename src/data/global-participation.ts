import type { Sport } from "@/types/athlete";

/**
 * Estimated worldwide participation, per sport.
 *
 * These are REAL-WORLD estimates, not the demo network figures in
 * `sports.ts` — they describe how many people play each sport on the planet,
 * which is what the flat-earth section is reporting.
 *
 * Treat every number as an order of magnitude, not a measurement. No global
 * census of sport exists: federations count what they can reach (registered
 * players, affiliated clubs, survey panels) and each one draws the line in a
 * different place. A "player" in the FIVB's number is someone who plays once a
 * week; a "player" in the FIH's number is closer to a club member. That is why
 * every entry carries its own `basis` and `source` — the UI prints them, so a
 * 800M figure is never shown as though it were as firm as a 87M one.
 */
export type ParticipationBasis =
  /** Published or repeatedly cited by the sport's world federation. */
  | "federation"
  /** Large-sample survey or industry report, not a federation census. */
  | "survey"
  /** Synthesised from partial regional figures. Widest error bars. */
  | "estimate";

export type SportParticipation = {
  sport: Sport;
  /** People who play the sport worldwide, at any level. */
  players: number;
  basis: ParticipationBasis;
  /** What is actually being counted. Shown next to the figure. */
  counts: string;
  /** Where the figure comes from, with its year. */
  source: string;
  /** Country codes from `COUNTRIES` where the sport is deepest rooted. */
  strongholds: string[];
};

export const GLOBAL_PARTICIPATION: SportParticipation[] = [
  {
    sport: "volleyball",
    players: 800_000_000,
    basis: "federation",
    counts: "Play at least once a week",
    source: "FIVB, widely cited participation figure",
    strongholds: ["BRA", "ITA", "POL", "RUS", "USA", "JPN", "CHN", "SRB"],
  },
  {
    sport: "chess",
    players: 605_000_000,
    basis: "survey",
    counts: "Adults who play regularly",
    source: "YouGov survey for FIDE, 2012 (6 countries, extrapolated)",
    strongholds: ["IND", "RUS", "USA", "CHN", "NOR", "ARG", "DEU"],
  },
  {
    sport: "basketball",
    players: 450_000_000,
    basis: "federation",
    counts: "Play in some form",
    source: "FIBA, widely cited participation figure",
    strongholds: ["USA", "CHN", "ESP", "SRB", "ARG", "FRA", "AUS", "CAN"],
  },
  {
    sport: "football",
    players: 265_000_000,
    basis: "federation",
    counts: "Players, plus 5M referees and officials",
    source: "FIFA Big Count, 2006 — the last global census FIFA ran",
    strongholds: ["BRA", "ARG", "ESP", "DEU", "FRA", "GBR", "ITA", "NGA", "MEX", "NLD", "PRT", "JPN"],
  },
  {
    sport: "badminton",
    players: 220_000_000,
    basis: "federation",
    counts: "Play in some form",
    source: "BWF, widely cited participation figure",
    strongholds: ["CHN", "IDN", "IND", "DNK", "JPN", "KOR", "VNM"],
  },
  {
    sport: "athletics",
    players: 214_000_000,
    basis: "survey",
    counts: "Run or compete in track and field",
    source: "Running-industry participation reports, 2021–2023",
    strongholds: ["KEN", "ETH", "JAM", "USA", "UGA", "GBR", "MAR"],
  },
  {
    sport: "swimming",
    players: 120_000_000,
    basis: "estimate",
    counts: "Swim for sport or fitness",
    source: "Synthesised from national participation surveys",
    strongholds: ["USA", "AUS", "CHN", "GBR", "JPN", "ZAF", "NLD"],
  },
  {
    sport: "tennis",
    players: 87_000_000,
    basis: "federation",
    counts: "Played at least once in the year",
    source: "ITF Global Tennis Report, 2021 (195 nations surveyed)",
    strongholds: ["ESP", "USA", "FRA", "SRB", "ITA", "AUS", "CHN"],
  },
  {
    sport: "cricket",
    players: 30_000_000,
    basis: "estimate",
    counts: "Play in an organised form",
    source: "Synthesised from ICC member-board figures",
    strongholds: ["IND", "PAK", "AUS", "GBR", "ZAF", "NZL"],
  },
  {
    sport: "hockey",
    players: 30_000_000,
    basis: "federation",
    counts: "Play field hockey",
    source: "FIH, widely cited participation figure",
    strongholds: ["IND", "NLD", "DEU", "AUS", "ARG", "PAK", "GBR"],
  },
  {
    sport: "boxing",
    players: 27_000_000,
    basis: "estimate",
    counts: "Train or compete, amateur and professional",
    source: "Synthesised from national federation registrations",
    strongholds: ["CUB", "USA", "MEX", "GBR", "RUS", "TUR", "EGY"],
  },
  {
    sport: "gymnastics",
    players: 25_000_000,
    basis: "estimate",
    counts: "Train in a club or programme",
    source: "Synthesised from FIG member-federation figures",
    strongholds: ["USA", "CHN", "RUS", "JPN", "GBR", "ITA", "BRA"],
  },
];

export function getParticipation(sport: Sport): SportParticipation {
  const found = GLOBAL_PARTICIPATION.find((p) => p.sport === sport);
  if (!found) throw new Error(`No participation figure for sport: ${sport}`);
  return found;
}

/** The largest figure in the set — the scale every bar is drawn against. */
export const MAX_PLAYERS = Math.max(...GLOBAL_PARTICIPATION.map((p) => p.players));

/**
 * Formats a player count for display: "800M", "27M", "1.2B".
 * Kept deliberately coarse — the underlying figures are estimates, and extra
 * digits would imply a precision none of them have.
 */
export function formatPlayers(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  return `${Math.round(n / 1_000_000)}M`;
}

const BASIS_LABEL: Record<ParticipationBasis, string> = {
  federation: "Federation figure",
  survey: "Survey estimate",
  estimate: "Synthesised estimate",
};

export function basisLabel(basis: ParticipationBasis): string {
  return BASIS_LABEL[basis];
}
