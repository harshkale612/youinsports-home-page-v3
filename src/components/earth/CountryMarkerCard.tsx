"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { markerScreen } from "@/scenes/earth/marker-registry";
import { getAthlete, countryStats } from "@/data/athletes";
import {
  getCountry,
  getCountryAthleteCount,
  getCountrySportAthleteCount,
} from "@/data/countries";
import { getSportConfig } from "@/data/sports";
import { useGlobalExperience } from "@/stores/globalExperienceStore";

const CARD_WIDTH = 248;

/**
 * The information window that hangs off a marker on the globe.
 *
 * The globe reports places, not people: a marker resolves to its country and
 * the card states how many athletes the network holds there. Individual
 * athletes stay in the directory, where a name is the point.
 *
 * It follows its marker by writing a transform inside its own animation frame,
 * reading the position the scene publishes each frame. Driving it from React
 * state instead would re-render the card sixty times a second while the planet
 * turns underneath it.
 */
export function CountryMarkerCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoveredId = useGlobalExperience((s) => s.hoveredAthleteId);
  const selectedId = useGlobalExperience((s) => s.selectedAthleteId);
  const committedSport = useGlobalExperience((s) => s.selectedSport);
  const hoveredSport = useGlobalExperience((s) => s.hoveredSport);
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);

  // A click pins the card; hover only previews. Selection wins.
  const activeId = selectedId ?? hoveredId;
  const marker = getAthlete(activeId);
  const isPinned = Boolean(selectedId);

  // Match the scene: a hovered sport pill previews over the committed filter,
  // so the count has to agree with which markers are actually lit.
  const activeSport = hoveredSport ?? committedSport;

  const country = marker ? getCountry(marker.countryCode) : null;
  const stats = marker ? countryStats(marker.countryCode, activeSport) : null;
  const sportLabel = activeSport ? getSportConfig(activeSport).label : null;

  // Both figures come from the same illustrative scale, so the headline holds
  // steady while the filter only changes the line beneath it.
  const athleteCount = marker ? getCountryAthleteCount(marker.countryCode) : 0;
  const sportCount =
    marker && activeSport ? getCountrySportAthleteCount(marker.countryCode, activeSport) : 0;

  useEffect(() => {
    if (!activeId) return;
    let frame = 0;

    function follow() {
      frame = requestAnimationFrame(follow);
      const element = cardRef.current;
      const point = activeId ? markerScreen.byId.get(activeId) : undefined;
      if (!element || !point) return;

      // Flip to the other side of the marker near the right edge so the card
      // never runs off screen.
      const flip = point.x + CARD_WIDTH + 48 > window.innerWidth;
      const x = flip ? point.x - CARD_WIDTH - 22 : point.x + 22;
      const y = Math.min(Math.max(point.y - 72, 88), window.innerHeight - 220);

      element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      element.style.opacity = point.facing > 0.06 ? "1" : "0";
    }

    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [activeId]);

  return (
    <AnimatePresence>
      {country && stats && (
        <div
          ref={cardRef}
          className="pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-200 will-change-transform"
          style={{ width: CARD_WIDTH }}
        >
          <motion.div
            key={country.code}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto rounded-2xl border border-white/12 bg-[rgba(5,19,30,0.86)] p-5 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            data-globe-ignore
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-3xl leading-none" aria-hidden>
                {country.flag}
              </span>
              {isPinned && (
                <button
                  type="button"
                  onClick={() => selectAthlete(null)}
                  aria-label="Close country card"
                  className="flex size-6 items-center justify-center rounded-full border border-white/10 text-faint transition-colors hover:text-fg"
                >
                  <X className="size-3" aria-hidden />
                </button>
              )}
            </div>

            <p className="mt-4 font-display text-base leading-tight font-semibold tracking-tight text-fg">
              {country.name}
            </p>

            <div className="mt-4 flex items-end justify-between border-t border-white/[0.08] pt-3">
              <span className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
                Athletes
              </span>
              {/* The country's whole network, never the sport-filtered subset:
                  this number answers "how big is the network here", so it has
                  to read the same in every step whatever filter is applied. The
                  sport breakdown goes below, where it cannot be mistaken for it. */}
              <span className="tabular font-display text-2xl leading-none font-semibold text-fg">
                {athleteCount.toLocaleString()}
              </span>
            </div>

            <p className="mt-2.5 text-[0.78rem] text-faint">
              {sportLabel
                ? `${sportCount.toLocaleString()} play ${sportLabel.toLowerCase()}`
                : `${stats.sports} ${stats.sports === 1 ? "sport" : "sports"} represented`}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
