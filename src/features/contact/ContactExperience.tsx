"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { ContactHero } from "@/features/contact/ContactHero";
import { ContactExplore } from "@/features/contact/ContactExplore";
import { trackEvent } from "@/lib/analytics";

/**
 * The Contact page: the support inbox and a form to write to it, then the
 * rest of the site for anyone not ready to write yet.
 *
 * `reducedMotion="user"` hands every entrance on the page to the OS setting —
 * with reduced motion on, things fade in where they are instead of travelling.
 */
export function ContactExperience() {
  useEffect(() => {
    trackEvent("contact_viewed");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SiteNav />

      <main className="relative overflow-x-clip">
        <ContactHero />
        <ContactExplore />
      </main>
    </MotionConfig>
  );
}
