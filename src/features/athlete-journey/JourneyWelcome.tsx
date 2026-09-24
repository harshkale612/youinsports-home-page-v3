"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Container, DemoBadge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useJourney } from "@/stores/journeyStore";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  RANKED_SPORTS,
  SportChip,
  SportDetailCard,
  useSportPreview,
} from "@/features/athlete-journey/HeroSportsOrbit";
import type { Sport } from "@/types/athlete";

const reveal = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act one.
 *
 * Deliberately sparse: a greeting, one sentence of intent, and a single primary
 * action. No feature list, no statistics wall, nothing asked for. The planet is
 * meant to hold most of the attention here — on wide screens with every sport
 * orbiting it (`HeroSportsOrbit`); on phones, where the planet sits under the
 * copy, the same sports run as a strip instead.
 */
export function JourneyWelcome({ onStart }: { onStart: () => void }) {
  const started = useJourney((s) => s.started);
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);
  const earthScene = useGlobalExperience((s) => s.earthScene);

  // Phones: tapping a chip in the strip pins that sport, the same as clicking
  // one in the orbit does on wide screens.
  const [pickedTarget, setPicked] = useState<Sport | null>(null);
  const picked = earthScene === "hero" ? pickedTarget : null;
  const pickedEntry = picked
    ? RANKED_SPORTS.find((e) => e.sport === picked)
    : undefined;
  useSportPreview(picked);

  useEffect(() => {
    trackEvent("homepage_viewed");
  }, []);

  return (
    <section
      id="welcome"
      className="relative flex min-h-svh flex-col justify-end pt-28 pb-12 md:justify-center md:pb-16"
      aria-labelledby="welcome-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/88 via-void/62 to-void/92 md:bg-gradient-to-r md:from-void/94 md:via-void/45 md:to-transparent"
      />
      {/* A low warm light behind the headline, answering the orange sun on
          the planet's rim across the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.12),transparent_62%)] blur-2xl"
      />

      <Container className="relative">
        <div className="max-w-xl lg:max-w-[38rem]">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease }}
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            <span className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange" aria-hidden />
              The global athlete network
            </span>
            <DemoBadge />
          </motion.div>

          <motion.h1
            id="welcome-heading"
            {...reveal}
            transition={{ duration: 0.9, ease, delay: 0.08 }}
            className="display-xl mt-7 text-fg"
          >
            {/* The logo in miniature: the athlete in "YOU" orange, the full
                stop in "IN" blue. */}
            Hi, <span className="text-brand">athlete</span>
            <span className="text-accent">.</span>
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="mt-8 max-w-md text-pretty text-lg leading-relaxed text-muted"
          >
            Tell us a little about your sport. We&apos;ll show you where you
            are, what you&apos;re up against, and where YouInSports can help you
            go next.
          </motion.p>

          <motion.div
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.32 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <Button size="lg" magnetic showArrow onClick={onStart}>
              {started ? "Continue my journey" : "Start my journey"}
            </Button>

            {/* The secondary path: the globe is explorable without answering a
                single question, and saying so up front is what keeps the
                primary action feeling like an invitation rather than a gate. */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                trackEvent("search_opened");
              }}
              className="group inline-flex items-center gap-2 font-display text-[0.66rem] font-semibold tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-fg"
            >
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] transition-transform duration-300 group-hover:scale-125" aria-hidden />
              Explore the world
            </button>
          </motion.div>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.44 }}
            className="mt-6 max-w-sm text-[0.78rem] leading-relaxed text-faint"
          >
            Six questions. No sign-up until you&apos;ve seen what we make of
            them.
          </motion.p>
        </div>
      </Container>

      {/* Phones only: the orbit needs width the portrait layout doesn't have. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.5 }}
        className="relative mt-12 min-[860px]:hidden"
      >
        <p className="mb-3 px-6 font-display text-[0.55rem] font-semibold tracking-[0.24em] text-faint uppercase md:px-10">
          Estimated players worldwide
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div
            className={cn(
              "flex w-max animate-marquee gap-2.5 py-1 hover:[animation-play-state:paused]",
              picked && "[animation-play-state:paused]",
            )}
          >
            {[...RANKED_SPORTS, ...RANKED_SPORTS].map((entry, i) => (
              <SportChip
                key={`${entry.sport}-${i}`}
                entry={entry}
                active={entry.sport === picked}
                pressed={
                  i < RANKED_SPORTS.length ? entry.sport === picked : undefined
                }
                onPress={(sport) => {
                  setPicked((current) => (current === sport ? null : sport));
                  trackEvent("sport_explored");
                }}
                className="shrink-0"
                // The second copy only exists to make the loop seamless.
                decorative={i >= RANKED_SPORTS.length}
              />
            ))}
          </div>
        </div>
        {pickedEntry ? (
          // Portalled: `main` is its own stacking context, and the sheet has to
          // sit above the fixed controls outside it.
          createPortal(
            <motion.div
              key={pickedEntry.sport}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              // A sheet, not inline: on the welcome, scrolling down begins the
              // journey, so the card must be readable without scrolling to it.
              className="fixed inset-x-4 bottom-4 z-[45]"
            >
              <SportDetailCard
                entry={pickedEntry}
                onClose={() => setPicked(null)}
                onStart={onStart}
              />
            </motion.div>,
            document.body,
          )
        ) : (
          <p className="mt-3 px-6 text-[0.72rem] text-faint md:px-10">
            Tap a sport to see where it&apos;s played.
          </p>
        )}
      </motion.div>

      <Container className="relative mt-10 md:absolute md:inset-x-0 md:bottom-10 md:mt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.6 }}
          className="relative flex items-center justify-between gap-6 pt-6"
        >
          <span aria-hidden className="rule-brand absolute inset-x-0 top-0" />
          <p className="font-display text-[0.58rem] font-semibold tracking-[0.24em] text-faint uppercase">
            Global sports network
          </p>
          <button
            type="button"
            onClick={onStart}
            className="hidden items-center gap-2 font-display text-[0.58rem] font-semibold tracking-[0.2em] text-faint uppercase transition-colors hover:text-accent md:inline-flex"
          >
            Begin
            <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
          </button>
        </motion.div>
      </Container>
    </section>
  );
}
