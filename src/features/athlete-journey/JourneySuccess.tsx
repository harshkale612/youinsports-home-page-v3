"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney, JourneyIdentity } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The close.
 *
 * A full-screen overlay rather than another section: the athlete has finished,
 * and scrolling past the ending into more page would undercut it. The globe
 * stays visible behind, still turning.
 */
export function JourneySuccess({
  journey,
  identity,
  onReset,
}: {
  journey: AthleteJourney;
  identity: JourneyIdentity;
  onReset: () => void;
}) {
  useEffect(() => {
    trackEvent("journey_saved");
  }, []);

  // A modal that leaves the page scrolling behind it reads as a broken overlay
  // rather than an ending.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const facts = [
    { label: "Sport", value: journey.snapshot.sportLabel },
    { label: "Environment", value: journey.snapshot.environmentLabel },
    { label: "Competition", value: journey.snapshot.competitionLabel },
    { label: "Current level", value: journey.snapshot.levelLabel },
    {
      label: "Next goal",
      value: journey.nextLevelLabel ? `${journey.nextLevelLabel} level` : journey.snapshot.goalLabel,
    },
  ];

  const firstName = identity.name.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      // Above the nav (z-50): while this is open it is the only thing on screen.
      className="fixed inset-0 z-[60] flex items-center overflow-y-auto bg-void/92 bg-[radial-gradient(ellipse_at_85%_90%,rgb(240_107_40/0.16),transparent_55%),radial-gradient(ellipse_at_10%_0%,rgb(44_143_227/0.14),transparent_50%)] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-heading"
    >
      <Container className="py-24">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.12 }}
            className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase"
          >
            Welcome to YouInSports, {firstName}
          </motion.p>

          <motion.h2
            id="success-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="display-lg mt-6 text-fg"
          >
            Your journey
            <br />
            starts <span className="text-brand">here</span>
            <span className="text-accent">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.34 }}
            className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted"
          >
            We&apos;ve saved your starting point. Everything from here builds on it.
          </motion.p>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.44 }}
            className="glass-brand mt-10 grid grid-cols-2 gap-x-6 gap-y-6 rounded-2xl p-6 sm:grid-cols-3 md:p-7 lg:grid-cols-5"
          >
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-2 font-display text-[0.98rem] leading-tight font-semibold tracking-tight text-fg">
                  {fact.value}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.56 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <Button
              size="lg"
              magnetic
              showArrow
              onClick={() => trackEvent("dashboard_entered")}
            >
              Enter YouInSports
            </Button>

            <button
              type="button"
              onClick={onReset}
              className="font-display text-[0.62rem] font-semibold tracking-[0.2em] text-faint uppercase transition-colors duration-300 hover:text-fg"
            >
              Try another journey
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 max-w-md text-[0.72rem] leading-relaxed text-faint"
          >
            Demo experience — your answers stayed in this browser and no account was created.
          </motion.p>
        </div>
      </Container>
    </motion.div>
  );
}
