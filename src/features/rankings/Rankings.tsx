"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { RANKING_TIERS, athletesAtTier, getTierCounts } from "@/data/rankings";
import { getCountry } from "@/data/countries";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";
import type { AthleteLevel } from "@/types/network";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act four. The ladder every athlete climbs, wired to the globe: picking a tier
 * flies the camera to someone standing on it, which is what turns an abstract
 * progression into a person in a place.
 */
export function Rankings() {
  const [activeTier, setActiveTier] = useState<AthleteLevel>("state");
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const counts = getTierCounts();
  const tierAthletes = athletesAtTier(activeTier);
  const active = RANKING_TIERS.find((t) => t.id === activeTier) ?? RANKING_TIERS[2];

  function handleTier(tier: AthleteLevel) {
    setActiveTier(tier);
    trackEvent("ranking_tier_selected", { tier });

    // Turn the planet to someone actually at this level — the ladder should
    // always resolve to a real athlete on a real coastline.
    const [first] = athletesAtTier(tier);
    if (first) focusOn(first.latitude, first.longitude);
  }

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <SectionFrame id="rankings" align="left">
      <SectionLabel index="04">Where athletes stand</SectionLabel>
      <DisplayText as="h2" size="lg" className="mt-7">
        Every athlete
        <br />
        is somewhere
        <br />
        on the ladder.
      </DisplayText>
      <BodyText className="mt-6">
        Local, district, state, national, global. Knowing your rung is the difference
        between hoping to be found and knowing what comes next.
      </BodyText>

      <ol className="mt-10 flex flex-col" aria-label="Competitive levels">
        {RANKING_TIERS.map((tier) => {
          const isActive = tier.id === activeTier;
          const count = counts[tier.id];
          return (
            <li key={tier.id}>
              <button
                type="button"
                onClick={() => handleTier(tier.id)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-5 border-t border-white/[0.08] py-4 text-left transition-colors duration-300",
                  isActive ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "tabular font-display text-[0.6rem] font-semibold transition-colors",
                    isActive ? "text-accent" : "text-faint",
                  )}
                >
                  0{tier.order + 1}
                </span>

                <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {tier.label}
                </span>

                {/* Bar length is the share of the demo network at this tier. */}
                <span className="relative ml-auto hidden h-[2px] w-24 rounded-full bg-white/10 sm:block md:w-40" aria-hidden>
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    initial={false}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, ease }}
                  />
                </span>

                <span className="tabular w-10 shrink-0 text-right font-display text-[0.72rem] font-semibold text-faint">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease }}
          className="mt-8 border-t border-white/[0.08] pt-7"
        >
          <p className="text-[0.92rem] text-muted">{active.description}</p>
          <p className="mt-3 text-[0.92rem] text-fg">
            <span className="font-display text-[0.58rem] font-semibold tracking-[0.2em] text-accent uppercase">
              Unlocks
            </span>{" "}
            <span className="ml-2">{active.unlocks}</span>
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {tierAthletes.slice(0, 5).map((athlete) => (
              <li key={athlete.id}>
                <button
                  type="button"
                  onClick={() => {
                    selectAthlete(athlete.id);
                    focusOn(athlete.latitude, athlete.longitude);
                  }}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[0.78rem] text-muted transition-colors hover:border-accent/60 hover:text-fg"
                >
                  <span aria-hidden>{getCountry(athlete.countryCode).flag}</span>
                  {athlete.name}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </SectionFrame>
  );
}
