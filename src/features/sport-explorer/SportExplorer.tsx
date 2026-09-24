"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { SPORTS, getSportStats, getSportConfig } from "@/data/sports";
import { athletesBySport } from "@/data/athletes";
import { getCountry } from "@/data/countries";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";
import type { Sport } from "@/types/network";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act three. Every pill is a live filter on the globe: hovering previews the
 * sport (markers dim, the atmosphere re-tints), clicking commits it so the
 * filter survives while the user scrolls on.
 */
export function SportExplorer() {
  const selectedSport = useGlobalExperience((s) => s.selectedSport);
  const hoveredSport = useGlobalExperience((s) => s.hoveredSport);
  const selectSport = useGlobalExperience((s) => s.selectSport);
  const hoverSport = useGlobalExperience((s) => s.hoverSport);
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const activeSport: Sport = hoveredSport ?? selectedSport ?? "football";
  const config = getSportConfig(activeSport);
  const stats = getSportStats(activeSport);
  const featured = athletesBySport(activeSport).slice(0, 3);

  function handleSelect(sport: Sport) {
    selectSport(sport);
    trackEvent("sport_filter_changed", { sport });
  }

  return (
    <SectionFrame id="sports" align="right">
      <SectionLabel index="03">Explore by sport</SectionLabel>
      <DisplayText as="h2" size="lg" className="mt-7">
        Every sport has
        <br />
        its own map.
      </DisplayText>
      <BodyText className="mt-5 text-base">
        Choose a discipline and the world redraws around it — who competes, where they
        are, and how far the pathway reaches.
      </BodyText>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter the globe by sport">
        {SPORTS.map((sport) => {
          const isActive = selectedSport === sport.id;
          const isPreview = hoveredSport === sport.id;
          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => handleSelect(sport.id)}
              onMouseEnter={() => hoverSport(sport.id)}
              onMouseLeave={() => hoverSport(null)}
              onFocus={() => hoverSport(sport.id)}
              onBlur={() => hoverSport(null)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-4 py-2 font-display text-[0.68rem] font-semibold tracking-[0.14em] uppercase transition-all duration-250",
                isActive
                  ? "border-accent bg-accent text-white"
                  : isPreview
                    ? "border-accent/60 bg-accent-soft text-fg"
                    : "border-white/12 text-muted hover:border-white/30 hover:text-fg",
              )}
            >
              {sport.label}
            </button>
          );
        })}
      </div>

      {/* Live data overlay — editorial, not a dashboard widget. */}
      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <div className="flex items-center gap-3">
          <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            Currently exploring
          </p>
          <DemoBadge />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            <p className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.9rem)] leading-none font-semibold tracking-tight text-fg">
              {config.label}
            </p>
            <p className="mt-2 text-sm text-muted">{config.tagline}</p>

            <dl className="mt-5 flex gap-10">
              <div>
                <dt className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
                  Athletes
                </dt>
                <dd className="tabular mt-1.5 font-display text-2xl leading-none font-semibold text-fg">
                  {stats.athletes.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
                  Countries
                </dt>
                <dd className="tabular mt-1.5 font-display text-2xl leading-none font-semibold text-fg">
                  {stats.countries}
                </dd>
              </div>
            </dl>

            <ul className="mt-5 flex flex-col gap-1">
              {featured.map((athlete) => (
                <li key={athlete.id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectAthlete(athlete.id);
                      focusOn(athlete.latitude, athlete.longitude);
                      trackEvent("athlete_card_opened", { id: athlete.id });
                    }}
                    className="group flex w-full items-center gap-3 rounded-lg py-1.5 text-left transition-colors hover:text-accent"
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {getCountry(athlete.countryCode).flag}
                    </span>
                    <span className="text-[0.88rem] text-fg transition-colors group-hover:text-accent">
                      {athlete.name}
                    </span>
                    <span className="text-[0.8rem] text-faint">{athlete.city}</span>
                    <span className="tabular ml-auto font-display text-[0.75rem] font-semibold text-muted">
                      {athlete.rating}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionFrame>
  );
}
