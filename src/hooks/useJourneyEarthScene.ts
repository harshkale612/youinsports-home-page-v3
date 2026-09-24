"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { useJourney } from "@/stores/journeyStore";
import type { JourneyStep, MetricId } from "@/types/journey";
import type { EarthSceneState } from "@/types/network";

/**
 * The single owner of journey → globe choreography.
 *
 * The homepage drives the planet from two sources and they must not fight:
 *
 *  - while the athlete is answering questions the act is *state*-driven, because
 *    the questions all live in one pinned section and no scrolling happens;
 *  - once the analysis exists the act is *scroll*-driven, section by section.
 *
 * Keeping both here — rather than letting each section reach for the globe — is
 * what stops this becoming a dozen competing ScrollTriggers.
 */

/**
 * Which act of the globe each question belongs to.
 *
 * "journey-place" previously belonged to the location question (a camera
 * flight to the athlete's own city). With geography removed from the flow,
 * the environment question — the one actually labelled "Place" in the
 * progress indicator — takes it over instead.
 */
const STEP_SCENES: Partial<Record<JourneyStep, EarthSceneState>> = {
  welcome: "hero",
  sport: "journey-sport",
  environment: "journey-place",
  competition: "journey-competition",
  level: "journey-level",
  goal: "journey-level",
};

/** Sections below the questions, in scroll order. */
const SECTION_SCENES: { id: string; scene: EarthSceneState }[] = [
  { id: "position", scene: "position" },
  { id: "gap", scene: "gap" },
  { id: "youinsports", scene: "career" },
  { id: "next", scene: "opportunities" },
  { id: "save", scene: "final" },
];

/**
 * Selecting a dimension in the ecosystem section re-stages the planet around
 * it: the network shows arcs, visibility lights the athlete markers, reach
 * opens the opportunity routes. This is the diagram↔Earth link.
 */
const FOCUS_SCENES: Record<MetricId, EarthSceneState> = {
  network: "career",
  visibility: "athletes",
  "competitive-reach": "opportunities",
  "performance-readiness": "position",
  "career-readiness": "career",
};

export function useJourneyEarthScene() {
  const setEarthScene = useGlobalExperience((s) => s.setEarthScene);

  const step = useJourney((s) => s.step);
  // Read inside a ScrollTrigger callback that must not be rebuilt every time
  // the athlete answers a question.
  const stepRef = useRef(step);

  const sport = useJourney((s) => s.answers.sport);
  const activeFocus = useJourney((s) => s.activeFocus);
  const journeyReady = useJourney((s) => s.journey !== null);

  // --- Sport: re-tint the planet -------------------------------------------
  // `selectSport` is a toggle (re-clicking a pill clears the filter), so this
  // reads current state first rather than blindly calling it — otherwise
  // re-answering with the same sport would switch the tint off.
  useEffect(() => {
    if (!sport) return;
    const { selectedSport, selectSport } = useGlobalExperience.getState();
    if (selectedSport !== sport) selectSport(sport);
  }, [sport]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // --- Questions: the act follows the conversation --------------------------
  useEffect(() => {
    const scene = STEP_SCENES[step];
    // Steps past the questions are owned by the scroll triggers below; setting
    // a scene here too would make the two fight on every scroll tick.
    if (!scene) return;
    setEarthScene(scene);
  }, [step, setEarthScene]);

  // --- Focus selection overrides the section's act --------------------------
  useEffect(() => {
    if (!activeFocus) return;
    setEarthScene(FOCUS_SCENES[activeFocus]);
  }, [activeFocus, setEarthScene]);

  // --- The welcome: scrolling back to the top returns the hero framing ------
  // Starting the journey moves the planet on, but the welcome stays on the page;
  // without this, scrolling back up would leave the hero copy (and the sports
  // orbiting the planet) sitting against the conversation's framing. The start
  // line matches the scroll distance that begins the journey.
  useEffect(() => {
    const element = document.getElementById("welcome");
    if (!element) return;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: "top -48px",
        onLeaveBack: () => setEarthScene("hero"),
        onEnter: () => {
          // Past the questions the section triggers own the act.
          const scene = STEP_SCENES[stepRef.current];
          if (scene) setEarthScene(scene);
        },
      });
    });

    return () => context.revert();
  }, [setEarthScene]);

  // --- Analysis sections: the act follows the scroll ------------------------
  useEffect(() => {
    // Nothing below the questions is mounted yet, so there is nothing to
    // measure. Re-running once the journey exists is what wires them up.
    if (!journeyReady) return;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Straight to the motion object, never React state — this fires on
          // every scroll tick.
          earthMotion.scrollProgress = self.progress;
        },
      });

      for (const { id, scene } of SECTION_SCENES) {
        const element = document.getElementById(id);
        if (!element) continue;

        ScrollTrigger.create({
          trigger: element,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: () => setEarthScene(scene),
          onEnterBack: () => setEarthScene(scene),
        });
      }
    });

    // These sections animate in, so their heights are not final on the frame
    // they mount. Measure once the layout settles.
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refresh);
      context.revert();
    };
  }, [journeyReady, setEarthScene]);
}
