"use client";

import { useEffect } from "react";
import { MotionConfig, motion, useScroll, useSpring } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { AboutHero } from "@/features/about/AboutHero";
import { SportsRibbon } from "@/features/about/SportsRibbon";
import { AboutMission } from "@/features/about/AboutMission";
import { AboutTeam } from "@/features/about/AboutTeam";
import { AboutCta } from "@/features/about/AboutCta";
import { trackEvent } from "@/lib/analytics";

/**
 * The About page: who we are, what we're for, and the team behind it.
 *
 * `reducedMotion="user"` hands every entrance on the page to the OS setting —
 * with reduced motion on, things fade in where they are instead of travelling.
 */
export function AboutExperience() {
  useEffect(() => {
    trackEvent("about_viewed");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <SiteNav />

      <main className="relative overflow-x-clip">
        <AboutHero />
        <SportsRibbon />
        <AboutMission />
        <AboutTeam />
        <AboutCta />
      </main>
    </MotionConfig>
  );
}

/** How far through the page you are: a hairline in the brand colours along the very top. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-orange via-orange-strong to-accent"
    />
  );
}
