"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { AthleteCard } from "@/components/athlete/AthleteCard";
import { ATHLETES, athletesBySport } from "@/data/athletes";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;
/** Long enough that sweeping the cursor across the rail doesn't thrash the globe. */
const FOCUS_DELAY_MS = 160;

/**
 * Act five. Hovering a card turns the planet to that athlete's city and lights
 * their marker — the card and the globe are two views of the same record, which
 * is the clearest way to show the network is real rather than decorative.
 */
export function AthleteDiscovery() {
  const railRef = useRef<HTMLDivElement>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const selectedSport = useGlobalExperience((s) => s.selectedSport);
  const selectedAthleteId = useGlobalExperience((s) => s.selectedAthleteId);
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);
  const hoverAthlete = useGlobalExperience((s) => s.hoverAthlete);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const athletes = (selectedSport ? athletesBySport(selectedSport) : ATHLETES).slice(0, 18);

  useEffect(() => () => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
  }, []);

  function updateScrollState() {
    const rail = railRef.current;
    if (!rail) return;
    setCanScroll({
      left: rail.scrollLeft > 8,
      right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8,
    });
  }

  function scrollBy(direction: 1 | -1) {
    railRef.current?.scrollBy({ left: direction * 620, behavior: "smooth" });
  }

  function handleHoverStart(id: string, latitude: number, longitude: number) {
    hoverAthlete(id);
    if (focusTimer.current) clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => focusOn(latitude, longitude), FOCUS_DELAY_MS);
  }

  function handleHoverEnd() {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    hoverAthlete(null);
  }

  return (
    <section id="athletes" className="relative flex min-h-svh flex-col justify-end py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/55 via-void/45 to-void"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="max-w-xl">
            <SectionLabel index="05">Discover athletes</SectionLabel>
            <DisplayText as="h2" size="md" className="mt-6">
              Who are the people
              <br />
              behind the markers?
            </DisplayText>
            <BodyText className="mt-5 text-base">
              Hover any athlete and the globe turns to find them.
              {selectedSport && " Showing your selected sport."}
            </BodyText>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScroll.left}
              aria-label="Previous athletes"
              className="flex size-10 items-center justify-center rounded-full border border-white/12 text-muted transition-colors enabled:hover:border-accent/60 enabled:hover:text-fg disabled:opacity-30"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScroll.right}
              aria-label="More athletes"
              className="flex size-10 items-center justify-center rounded-full border border-white/12 text-muted transition-colors enabled:hover:border-accent/60 enabled:hover:text-fg disabled:opacity-30"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </motion.div>
      </Container>

      {/* The rail runs to the viewport edge rather than stopping at the
          container, so it reads as continuing beyond the screen. */}
      <div
        ref={railRef}
        onScroll={updateScrollState}
        className="hide-scrollbar relative mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 md:px-10 lg:px-14"
        tabIndex={0}
        role="region"
        aria-label="Athlete showcase, scrollable"
      >
        {athletes.map((athlete) => (
          <div key={athlete.id} className="snap-start">
            <AthleteCard
              athlete={athlete}
              active={selectedAthleteId === athlete.id}
              onActivate={() => {
                selectAthlete(athlete.id);
                focusOn(athlete.latitude, athlete.longitude);
                trackEvent("athlete_card_opened", { id: athlete.id });
              }}
              onHoverStart={() => handleHoverStart(athlete.id, athlete.latitude, athlete.longitude)}
              onHoverEnd={handleHoverEnd}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
