"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { FaqHero } from "@/features/faq/FaqHero";
import { FaqBrowser } from "@/features/faq/FaqBrowser";
import { FaqCta } from "@/features/faq/FaqCta";
import { trackEvent } from "@/lib/analytics";

/**
 * The FAQ page: a short hero, every question grouped by category with a
 * sticky index beside it, and a way to write to the team for anything the
 * answers don't cover.
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

      {/* `clip`, not `hidden`: the category index is sticky, and a hidden
          overflow would make this the scroller it sticks to. */}
      <main className="relative overflow-x-clip">
        <FaqHero />
        <FaqBrowser />
        <FaqCta />
      </main>
    </MotionConfig>
  );
}
