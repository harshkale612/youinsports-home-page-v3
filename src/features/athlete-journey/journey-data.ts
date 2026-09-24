import type { CompleteAnswers } from "@/types/journey";

/**
 * Demo personas for the investor walkthrough.
 *
 * Four different sports and four points on the ladder — enough to show that
 * the journey adapts to the answers rather than reciting one script. Not tied
 * to a city or country: the journey itself no longer asks for one.
 */
export type DemoPersona = {
  id: string;
  /** Shown on the persona switcher. */
  label: string;
  summary: string;
  answers: CompleteAnswers;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "cricket-club",
    label: "Cricket · Club",
    summary: "Club cricketer aiming to turn professional",
    answers: {
      sport: "cricket",
      environment: "club",
      competition: "district",
      competitionName: "Maharashtra District Cricket Tournament",
      level: "local",
      goal: "turn-professional",
    },
  },
  {
    id: "athletics-national",
    label: "Athletics · National",
    summary: "National-level runner looking for international races",
    answers: {
      sport: "athletics",
      environment: "club",
      competition: "national",
      competitionName: "National Athletics Championship",
      level: "national",
      goal: "find-competitions",
    },
  },
  {
    id: "football-academy",
    label: "Football · Academy",
    summary: "Academy footballer chasing a professional contract",
    answers: {
      sport: "football",
      environment: "academy",
      competition: "state",
      competitionName: "Regional Youth League",
      level: "state",
      goal: "turn-professional",
    },
  },
  {
    id: "chess-independent",
    label: "Chess · Independent",
    summary: "Independent player working toward national selection",
    answers: {
      sport: "chess",
      environment: "independent",
      competition: "open",
      competitionName: "National Open Chess Tournament",
      level: "state",
      goal: "reach-national",
    },
  },
];

/** The persona a bare "demo mode" click loads — the one from the brief. */
export const DEFAULT_PERSONA = DEMO_PERSONAS[0];
