"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence } from "motion/react";

import { PersistentGlobe } from "@/components/earth/PersistentGlobe";
import { GlobeAffordance } from "@/components/earth/GlobeAffordance";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { JourneyNav } from "@/components/navigation/JourneyNav";

import { JourneyWelcome } from "@/features/athlete-journey/JourneyWelcome";
import { JourneyConversation } from "@/features/athlete-journey/JourneyConversation";
import { JourneyPosition } from "@/features/athlete-journey/JourneyPosition";
import { JourneyGap } from "@/features/athlete-journey/JourneyGap";
import { JourneyEcosystem } from "@/features/athlete-journey/JourneyEcosystem";
import { JourneyNext } from "@/features/athlete-journey/JourneyNext";
import { JourneySave } from "@/features/athlete-journey/JourneySave";
import { JourneySuccess } from "@/features/athlete-journey/JourneySuccess";
import { DemoModeBar } from "@/features/athlete-journey/DemoModeBar";
import { HeroSportsOrbit } from "@/features/athlete-journey/HeroSportsOrbit";

import { useJourney } from "@/stores/journeyStore";
import { useJourneyEarthScene } from "@/hooks/useJourneyEarthScene";
import { ScrollTrigger } from "@/lib/gsap";
import { trackEvent } from "@/lib/analytics";

/**
 * The homepage.
 *
 * One globe, mounted once, with the athlete's own journey playing over it. The
 * shape of the page is the state machine: the welcome and the conversation are
 * always here, and everything below only exists once there are answers to
 * reflect. Nothing navigates — the whole experience is one document.
 */
export function AthleteJourneyExperience() {
  useJourneyEarthScene();

  const step = useJourney((s) => s.step);
  const answers = useJourney((s) => s.answers);
  const journey = useJourney((s) => s.journey);
  const identity = useJourney((s) => s.identity);
  const start = useJourney((s) => s.start);
  const goToStep = useJourney((s) => s.goToStep);
  const saveIdentity = useJourney((s) => s.saveIdentity);
  const reset = useJourney((s) => s.reset);

  /**
   * Scrolling is itself a way to begin.
   *
   * Before the first answer, the page is only the welcome section — there is
   * nothing to scroll into, which reads as the homepage being stuck rather
   * than restrained. A small scroll past the top begins the journey exactly
   * like the button does, so the conversation section mounts below and
   * scrolling keeps working the moment the athlete tries it.
   */
  useEffect(() => {
    if (step !== "welcome") return;

    function onScroll() {
      if (window.scrollY > 48) {
        start();
        trackEvent("journey_started");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [step, start]);

  /**
   * Scrolls to a section that may have only just mounted.
   *
   * Two frames, not one: the first commits the new sections, the second lets
   * layout settle so `scrollIntoView` targets the final position instead of a
   * half-built page. ScrollTrigger is refreshed in the same pass because the
   * document just grew by several screens.
   */
  const scrollToSection = useCallback((id: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, []);

  const handleStart = useCallback(() => {
    start();
    trackEvent("journey_started");
    scrollToSection("conversation");
  }, [start, scrollToSection]);

  const handleQuestionsComplete = useCallback(() => {
    goToStep("position");
    scrollToSection("position");
  }, [goToStep, scrollToSection]);

  const handleDemoLoad = useCallback(() => {
    scrollToSection("position");
  }, [scrollToSection]);

  const handleGoToSave = useCallback(() => {
    scrollToSection("save");
  }, [scrollToSection]);

  return (
    <>
      <PersistentGlobe />
      <HeroSportsOrbit onStart={handleStart} />
      <GlobeAffordance />
      <GlobalSearch />
      <JourneyNav onSave={handleGoToSave} />

      <main className="relative z-10">
        <JourneyWelcome onStart={handleStart} />

        <JourneyConversation onComplete={handleQuestionsComplete} />

        {/* Everything below is the reflection of the answers. It does not exist
            until there are answers to reflect — which is what stops the page
            being a marketing site with a quiz bolted on the front. */}
        {journey && answers.sport && (
          <>
            <JourneyPosition journey={journey} sport={answers.sport} />
            <JourneyGap journey={journey} />
            <JourneyEcosystem journey={journey} />
            <JourneyNext journey={journey} />
            <JourneySave journey={journey} onSave={saveIdentity} />
          </>
        )}
      </main>

      <DemoModeBar onLoad={handleDemoLoad} />

      <AnimatePresence>
        {step === "success" && journey && identity && (
          <JourneySuccess
            key="success"
            journey={journey}
            identity={identity}
            onReset={() => {
              reset();
              trackEvent("journey_reset");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
