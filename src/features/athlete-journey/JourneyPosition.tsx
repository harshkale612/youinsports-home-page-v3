"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { ProgressRing } from "@/components/diagrams/ProgressRing";
import { JourneyPath } from "@/components/diagrams/JourneyPath";
import { CompetitiveLandscape } from "@/components/diagrams/CompetitiveLandscape";
import { NearbyNetwork } from "@/features/athlete-journey/NearbyNetwork";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney, Sport } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act three — the payoff.
 *
 * Everything here is a direct reflection of what the athlete just told us, laid
 * out spatially rather than as a table. The demo badge is not decoration: these
 * are illustrative readings and the section says so before it shows a number.
 */
export function JourneyPosition({
  journey,
  sport,
}: {
  journey: AthleteJourney;
  sport: Sport;
}) {
  useEffect(() => {
    trackEvent("journey_position_viewed");
  }, []);

  const { snapshot } = journey;

  const facts = [
    { label: "Sport", value: snapshot.sportLabel },
    { label: "Environment", value: snapshot.environmentLabel },
    { label: "Competition", value: snapshot.competitionLabel },
    { label: "Current level", value: snapshot.levelLabel },
    { label: "Goal", value: snapshot.goalLabel },
  ];

  return (
    <SectionFrame id="position" align="wide">
      <div className="max-w-2xl">
        <SectionLabel index="01">Where you stand</SectionLabel>
        <DisplayText as="h2" size="lg" className="mt-7">
          This is where
          <br />
          you are.
        </DisplayText>
        <BodyText className="mt-5 text-base">{journey.headline}</BodyText>
      </div>

      {/* The snapshot, as a spatial grid rather than a form summary. */}
      <motion.dl
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.7, ease }}
        className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-y border-tint/[0.08] py-8 md:grid-cols-3 lg:grid-cols-5"
      >
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
              {fact.label}
            </dt>
            <dd className="mt-2 font-display text-[1.05rem] leading-tight font-semibold tracking-tight text-fg">
              {fact.value}
            </dd>
          </div>
        ))}
      </motion.dl>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
              Your current position
            </p>
            <DemoBadge />
          </div>

          {/* Five single-measure readings. Each one is its own ring with the
              number as its direct label, so there is nothing to legend. */}
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {journey.metrics.map((metric, i) => (
              <ProgressRing
                key={metric.id}
                value={metric.value}
                label={metric.label}
                caption={metric.caption}
                delay={i * 0.09}
              />
            ))}
          </div>

          <div className="mt-12">
            <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
              Your competitive landscape
            </p>
            <CompetitiveLandscape tiers={journey.landscape} className="mt-6 max-w-xl" />
          </div>
        </div>

        <div className="lg:w-[17rem]">
          <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            The pathway
          </p>
          <JourneyPath
            current={journey.currentLevel}
            target={journey.nextLevel}
            className="mt-6"
          />

          {/* What the globe is showing, said in HTML as well. */}
          <div className="mt-12">
            <NearbyNetwork sport={sport} sportLabel={journey.snapshot.sportLabel} />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
