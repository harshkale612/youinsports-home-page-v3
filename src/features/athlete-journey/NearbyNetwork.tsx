"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { getCountry } from "@/data/countries";
import { athletesBySport } from "@/data/athletes";
import { getLevelConfig } from "@/data/levels";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";
import type { Sport } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The globe's content, as readable HTML.
 *
 * The markers around the planet say "you are not alone out here", and that
 * message cannot be carried by WebGL alone — a screen reader, a reduced-motion
 * user, or anyone whose device fell back to the placeholder gets the same list.
 * Selecting a name also flies the camera to them, so the two representations
 * stay tied together rather than being a visual and a transcript.
 *
 * Ranked by rating rather than proximity — the journey no longer asks the
 * athlete where they are, so there is no location to be "nearest" to.
 */
export function NearbyNetwork({
  sport,
  sportLabel,
}: {
  sport: Sport;
  sportLabel: string;
}) {
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const featured = useMemo(() => {
    return [...athletesBySport(sport)].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [sport]);

  if (featured.length === 0) return null;

  return (
    <div>
      <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
        {sportLabel} athletes in the network
      </p>

      <ul className="mt-5 flex flex-col">
        {featured.map((athlete, i) => (
          <motion.li
            key={athlete.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.45, ease, delay: i * 0.06 }}
            className="border-b border-tint/[0.06] last:border-0"
          >
            <button
              type="button"
              onClick={() => {
                selectAthlete(athlete.id);
                focusOn(athlete.latitude, athlete.longitude);
                trackEvent("athlete_card_opened", { id: athlete.id });
              }}
              className="group flex w-full items-center gap-3 py-2.5 text-left"
            >
              <span className="text-sm leading-none" aria-hidden>
                {getCountry(athlete.countryCode).flag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.88rem] text-fg transition-colors group-hover:text-accent">
                  {athlete.name}
                </span>
                <span className="block text-[0.74rem] text-faint">
                  {athlete.city} · {getLevelConfig(athlete.level).label}
                </span>
              </span>
              <span className="sr-only">Show on the globe</span>
            </button>
          </motion.li>
        ))}
      </ul>

      <p className="mt-4 text-[0.72rem] leading-relaxed text-faint">
        Illustrative athletes from the demo network. Not real people.
      </p>
    </div>
  );
}
