"use client";

import { motion } from "motion/react";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { GrowthPath } from "@/components/diagrams/GrowthPath";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

const KIND_LABELS: Record<AthleteJourney["opportunities"][number]["kind"], string> = {
  trial: "Trial",
  camp: "Camp",
  competition: "Competition",
  program: "Programme",
  scholarship: "Scholarship",
};

/**
 * Act six — what the pathway could look like from here.
 *
 * The opportunity cards are illustrative examples of the kind of thing the
 * platform surfaces, built from the athlete's own sport and level. They are
 * labelled as examples throughout: implying live partnerships or open entries
 * that do not exist would be the fastest way to lose an investor's trust.
 */
export function JourneyNext({ journey }: { journey: AthleteJourney }) {
  const pathway = [
    { id: "where", label: "Where you are", detail: `${journey.snapshot.levelLabel} level` },
    { id: "for", label: "What you're competing for", detail: journey.snapshot.goalLabel },
    { id: "missing", label: "What's missing", detail: journey.gaps[0]?.label ?? "Visibility" },
    { id: "help", label: "What YouInSports does", detail: journey.recommendations[0]?.title ?? "Build your identity" },
    {
      id: "next",
      label: "Where you could go next",
      detail: journey.nextLevelLabel ? `${journey.nextLevelLabel} level` : "Staying at the top",
    },
  ];

  return (
    <SectionFrame id="next" align="wide">
      <div className="max-w-2xl">
        <SectionLabel index="04">What comes next</SectionLabel>
        <DisplayText as="h2" size="lg" className="mt-7">
          Discover
          <br />
          what&apos;s next.
        </DisplayText>
        <BodyText className="mt-5 text-base">
          The kind of opportunities a {journey.snapshot.sportLabel.toLowerCase()} athlete at{" "}
          {journey.snapshot.levelLabel.toLowerCase()} level would see once their journey is on the
          platform.
        </BodyText>
      </div>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
              Example opportunities
            </p>
            <DemoBadge />
          </div>

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {journey.opportunities.map((opportunity, i) => (
              <motion.li
                key={opportunity.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              >
                <button
                  type="button"
                  onClick={() => trackEvent("journey_opportunity_viewed", { id: opportunity.id })}
                  className="glass group relative flex h-full w-full flex-col overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-orange/45 hover:shadow-[0_20px_50px_-24px_rgb(240_107_40/0.7)]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange/80 via-orange/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-orange uppercase">
                    {KIND_LABELS[opportunity.kind]}
                  </span>
                  <span className="mt-2.5 font-display text-[1rem] leading-tight font-semibold tracking-tight text-fg">
                    {opportunity.title}
                  </span>
                  <span className="mt-1.5 text-[0.8rem] text-muted">
                    {opportunity.sportLabel} · {opportunity.place}
                  </span>
                  <span className="mt-4 font-display text-[0.58rem] font-semibold tracking-[0.16em] text-faint uppercase">
                    {opportunity.window}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>

          <p className="mt-6 text-[0.75rem] leading-relaxed text-faint">
            Illustrative examples generated from your answers. Not live listings, and not
            tied to any current partnership.
          </p>
        </div>

        <div>
          <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            Your journey, end to end
          </p>
          <GrowthPath steps={pathway} className="mt-7" />
        </div>
      </div>
    </SectionFrame>
  );
}
