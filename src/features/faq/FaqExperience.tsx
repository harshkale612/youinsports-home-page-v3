"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { FaqHero } from "@/features/faq/FaqHero";
import { FaqExplorer } from "@/features/faq/FaqExplorer";
import { FaqCta } from "@/features/faq/FaqCta";
import { trackEvent } from "@/lib/analytics";

/**
 * The FAQ page: a search over every answer, the answers themselves one topic
 * at a time, and a person to write to for the rest.
 *
 * `reducedMotion="user"` hands every entrance on the page to the OS setting —
 * with reduced motion on, things fade in where they are instead of travelling.
 */
export function FaqExperience() {
  useEffect(() => {
    trackEvent("faq_viewed");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SiteNav />

      {/* `clip`, not `hidden`: the topic column is sticky, and a hidden
          overflow would make this the scroller it sticks to. */}
      <main className="relative overflow-x-clip">
        <FaqHero />
        <FaqExplorer />
        <FaqCta />
      </main>
    </MotionConfig>
  );
}
