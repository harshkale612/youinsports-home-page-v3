"use client";

import { create } from "zustand";
import type {
  AthleteJourney,
  CompetitionScope,
  CompleteAnswers,
  Environment,
  Goal,
  JourneyAnswers,
  JourneyIdentity,
  JourneyLevel,
  JourneyStep,
  MetricId,
  QuestionStep,
  Sport,
} from "@/types/journey";
import { QUESTION_STEPS } from "@/types/journey";
import { buildAthleteJourney, isComplete } from "@/features/athlete-journey/journey-engine";
import type { DemoPersona } from "@/features/athlete-journey/journey-data";

/**
 * The homepage state machine.
 *
 * Holds the answers, the derived journey, and where in the conversation the
 * athlete currently is. The journey object is rebuilt on every answer change
 * rather than memoised in a component, so the Earth, the diagrams and the copy
 * are always reading the same snapshot.
 *
 * Note: `athleteJourneyStore` is the older, name-first onboarding store kept
 * for the (currently unrouted) dashboard screens. This is the store the
 * homepage journey runs on.
 */

const EMPTY_ANSWERS: JourneyAnswers = {
  sport: null,
  environment: null,
  competition: null,
  competitionName: "",
  level: null,
  goal: null,
};

export type JourneyState = {
  step: JourneyStep;
  answers: JourneyAnswers;
  journey: AthleteJourney | null;
  identity: JourneyIdentity | null;

  /** True once the athlete has left the welcome screen. */
  started: boolean;
  /** Set while the analysis "builds itself", so the reveal can be choreographed. */
  isAnalyzing: boolean;
  /** Which metric the ecosystem section is highlighting; the globe reads this. */
  activeFocus: MetricId | null;
  /** Marks a run loaded from a persona, so the UI can say so honestly. */
  demoPersonaId: string | null;

  start: () => void;
  setSport: (sport: Sport) => void;
  setEnvironment: (environment: Environment) => void;
  setCompetition: (competition: CompetitionScope, name?: string) => void;
  setCompetitionName: (name: string) => void;
  setLevel: (level: JourneyLevel) => void;
  setGoal: (goal: Goal) => void;

  goToStep: (step: JourneyStep) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setAnalyzing: (analyzing: boolean) => void;
  setFocus: (focus: MetricId | null) => void;

  saveIdentity: (identity: JourneyIdentity) => void;
  loadPersona: (persona: DemoPersona) => void;
  reset: () => void;
};

/**
 * Rebuilds the derived journey from the answers.
 *
 * Returns null until every question is answered — a half-built analysis would
 * invite the UI to render numbers the athlete has not yet earned the context
 * for.
 */
function derive(answers: JourneyAnswers): AthleteJourney | null {
  return isComplete(answers) ? buildAthleteJourney(answers as CompleteAnswers) : null;
}

/** Applies an answer and re-derives in one update, so the two never disagree. */
function answer(patch: Partial<JourneyAnswers>) {
  return (state: JourneyState) => {
    const answers = { ...state.answers, ...patch };
    return { answers, journey: derive(answers) };
  };
}

export const useJourney = create<JourneyState>((set, get) => ({
  step: "welcome",
  answers: EMPTY_ANSWERS,
  journey: null,
  identity: null,

  started: false,
  isAnalyzing: false,
  activeFocus: null,
  demoPersonaId: null,

  start: () => set({ started: true, step: "sport" }),

  setSport: (sport) => set(answer({ sport })),
  setEnvironment: (environment) => set(answer({ environment })),
  setCompetition: (competition, name) =>
    set(answer(name === undefined ? { competition } : { competition, competitionName: name })),
  setCompetitionName: (competitionName) => set(answer({ competitionName })),
  setLevel: (level) => set(answer({ level })),
  setGoal: (goal) => set(answer({ goal })),

  goToStep: (step) => set({ step }),

  nextQuestion: () => {
    const { step } = get();
    const index = QUESTION_STEPS.indexOf(step as QuestionStep);
    // Past the last question the conversation hands over to the analysis.
    if (index === -1 || index === QUESTION_STEPS.length - 1) {
      set({ step: "position" });
      return;
    }
    set({ step: QUESTION_STEPS[index + 1] });
  },

  previousQuestion: () => {
    const { step } = get();
    const index = QUESTION_STEPS.indexOf(step as QuestionStep);
    if (index <= 0) {
      set({ step: "welcome", started: false });
      return;
    }
    set({ step: QUESTION_STEPS[index - 1] });
  },

  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setFocus: (activeFocus) => set({ activeFocus }),

  saveIdentity: (identity) => set({ identity, step: "success" }),

  loadPersona: (persona) =>
    set({
      answers: { ...persona.answers },
      journey: buildAthleteJourney(persona.answers),
      started: true,
      step: "position",
      isAnalyzing: false,
      identity: null,
      activeFocus: null,
      demoPersonaId: persona.id,
    }),

  reset: () =>
    set({
      step: "welcome",
      answers: EMPTY_ANSWERS,
      journey: null,
      identity: null,
      started: false,
      isAnalyzing: false,
      activeFocus: null,
      demoPersonaId: null,
    }),
}));

/** True once the analysis and everything downstream of it can be shown. */
export function useJourneyComplete(): boolean {
  return useJourney((s) => s.journey !== null);
}
