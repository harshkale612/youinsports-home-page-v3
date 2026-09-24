"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { LoadingTransition } from "@/components/shared/LoadingTransition";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { NameStep } from "@/features/onboarding/steps/NameStep";
import { SportStep } from "@/features/onboarding/steps/SportStep";
import { LevelStep } from "@/features/onboarding/steps/LevelStep";
import { GoalStep } from "@/features/onboarding/steps/GoalStep";
import { scrollToSection } from "@/lib/scroll";
import { trackEvent } from "@/lib/analytics";
import { ScrollTrigger } from "@/lib/gsap";
import type { Sport, Level, Goal } from "@/types/athlete";

const ADVANCE_DELAY = 550;

export function OnboardingFlow() {
  const onboarding = useAthleteJourneyStore((s) => s.onboarding);
  const currentStep = useAthleteJourneyStore((s) => s.currentStep);
  const setName = useAthleteJourneyStore((s) => s.setName);
  const setSport = useAthleteJourneyStore((s) => s.setSport);
  const setLevel = useAthleteJourneyStore((s) => s.setLevel);
  const setGoal = useAthleteJourneyStore((s) => s.setGoal);
  const nextStep = useAthleteJourneyStore((s) => s.nextStep);
  const startJourney = useAthleteJourneyStore((s) => s.startJourney);
  const journeyStarted = useAthleteJourneyStore((s) => s.journeyStarted);

  const [isGenerating, setIsGenerating] = useState(false);

  // Sport/level selection auto-advances after a short delay so a click still
  // reads as deliberate. Without tracking the pending timer, reselecting
  // before it fires (changing your mind, or a fast double-click) stacks a
  // second nextStep() on top of the first — each one silently skips a whole
  // step. Every advance goes through this so only the latest selection wins.
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleAdvance(callback: () => void, delay: number) {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null;
      callback();
    }, delay);
  }

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  function handleName(name: string) {
    startJourney();
    setName(name);
    nextStep();
    trackEvent("journey_started");
    trackEvent("name_completed", { name });
  }

  function handleSport(sport: Sport) {
    setSport(sport);
    scheduleAdvance(nextStep, ADVANCE_DELAY);
    trackEvent("sport_selected", { sport });
  }

  function handleLevel(level: Level) {
    setLevel(level);
    scheduleAdvance(nextStep, ADVANCE_DELAY);
    trackEvent("level_selected", { level });
  }

  function handleGoal(goal: Goal) {
    setGoal(goal);
    setIsGenerating(true);
    trackEvent("goal_selected", { goal });
    scheduleAdvance(() => {
      nextStep();
      setIsGenerating(false);
      scrollToSection("snapshot");
      trackEvent("snapshot_viewed");
      // This section is about to unmount and collapse ~900px of height, which
      // leaves every downstream ScrollTrigger (e.g. the journey timeline pin)
      // measuring stale positions unless we tell GSAP to re-measure.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, 900);
  }

  if (currentStep === "snapshot") return null;

  return (
    <Section
      id="onboarding"
      className="relative flex min-h-[60svh] w-full items-center overflow-hidden border-t border-border"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 15% 50%, rgb(44 143 227 / 0.06), transparent 70%)",
        }}
      />
      <Container className="relative z-10">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <LoadingTransition key="loading" label="Building your athlete profile" />
          ) : (
            <motion.div key={currentStep}>
              {currentStep === "name" && (
                <NameStep initialValue={onboarding.name} shouldFocus={journeyStarted} onSubmit={handleName} />
              )}
              {currentStep === "sport" && (
                <SportStep name={onboarding.name} selected={onboarding.sport} onSelect={handleSport} />
              )}
              {currentStep === "level" && <LevelStep selected={onboarding.level} onSelect={handleLevel} />}
              {currentStep === "goal" && <GoalStep onSelect={handleGoal} />}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Section>
  );
}
