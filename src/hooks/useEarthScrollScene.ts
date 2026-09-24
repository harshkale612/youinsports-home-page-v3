"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import type { EarthSceneState } from "@/types/network";

/** Section id → the act of the globe narrative it belongs to. */
const SECTION_SCENES: { id: string; scene: EarthSceneState }[] = [
  { id: "hero", scene: "hero" },
  { id: "network", scene: "global-network" },
  { id: "sports", scene: "sport-explorer" },
  { id: "rankings", scene: "rankings" },
  { id: "athletes", scene: "athletes" },
  { id: "opportunities", scene: "opportunities" },
  { id: "ecosystem", scene: "career" },
  { id: "cta", scene: "final" },
];

/**
 * The single owner of scroll → globe choreography.
 *
 * One trigger publishes overall progress for the scene to read per frame, and
 * one trigger per section promotes the globe into that section's act. Keeping
 * it in one hook is what stops this becoming a dozen competing ScrollTriggers
 * scattered through the section components.
 */
export function useEarthScrollScene() {
  const setEarthScene = useGlobalExperience((s) => s.setEarthScene);

  useEffect(() => {
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Written straight to the motion object — never to React state, or
          // the whole tree would re-render on every scroll tick.
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

    // ScrollTrigger measures on creation; sections that reveal on scroll can
    // change height, so refresh once the first layout settles.
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refresh);
      context.revert();
    };
  }, [setEarthScene]);
}
