import { create } from "zustand";
import type { Athlete, AthleteOnboarding, Goal, Level, Sport } from "@/types/athlete";
import { DEMO_PRESET, generateDemoAthlete, isOnboardingComplete } from "@/lib/demo";

export type JourneyStep = "name" | "sport" | "level" | "goal" | "snapshot";

const STEP_ORDER: JourneyStep[] = ["name", "sport", "level", "goal", "snapshot"];

type AthleteJourneyState = {
  onboarding: AthleteOnboarding;
  currentStep: JourneyStep;
  athlete: Athlete | null;
  journeyStarted: boolean;

  startJourney: () => void;
  setName: (name: string) => void;
  setSport: (sport: Sport) => void;
  setLevel: (level: Level) => void;
  setGoal: (goal: Goal) => void;
  goToStep: (step: JourneyStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  loadDemo: () => void;
  reset: () => void;
};

const emptyOnboarding: AthleteOnboarding = {
  name: "",
  sport: null,
  level: null,
  goal: null,
};

function buildAthleteIfReady(onboarding: AthleteOnboarding): Athlete | null {
  if (!isOnboardingComplete(onboarding)) return null;
  return generateDemoAthlete({
    name: onboarding.name,
    sport: onboarding.sport!,
    level: onboarding.level!,
    goal: onboarding.goal!,
  });
}

export const useAthleteJourneyStore = create<AthleteJourneyState>((set, get) => ({
  onboarding: emptyOnboarding,
  currentStep: "name",
  athlete: null,
  journeyStarted: false,

  startJourney: () => set({ journeyStarted: true }),

  setName: (name) =>
    set((state) => ({ onboarding: { ...state.onboarding, name } })),

  setSport: (sport) =>
    set((state) => ({ onboarding: { ...state.onboarding, sport } })),

  setLevel: (level) =>
    set((state) => ({ onboarding: { ...state.onboarding, level } })),

  setGoal: (goal) => {
    const onboarding = { ...get().onboarding, goal };
    set({ onboarding, athlete: buildAthleteIfReady(onboarding) });
  },

  goToStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const idx = STEP_ORDER.indexOf(get().currentStep);
    const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
    set({ currentStep: next });
  },

  previousStep: () => {
    const idx = STEP_ORDER.indexOf(get().currentStep);
    const prev = STEP_ORDER[Math.max(idx - 1, 0)];
    set({ currentStep: prev });
  },

  loadDemo: () =>
    set({
      onboarding: DEMO_PRESET,
      athlete: buildAthleteIfReady(DEMO_PRESET),
      journeyStarted: true,
      currentStep: "snapshot",
    }),

  reset: () =>
    set({ onboarding: emptyOnboarding, athlete: null, currentStep: "name", journeyStarted: false }),
}));
