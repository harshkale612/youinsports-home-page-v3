"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { MetricBar } from "@/components/diagrams/MetricBar";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act four — the distance still to travel.
 *
 * The tone here is the whole point. Every line is written as an opportunity
 * rather than a shortfall: an athlete who is told their profile is bad closes
 * the tab, and an athlete who is told their journey is hard to find keeps
 * reading. The bars compare against what the next rung typically looks like,
 * never against other athletes.
 */
export function JourneyGap({ journey }: { journey: AthleteJourney }) {
  useEffect(() => {
    trackEvent("journey_gap_viewed");
  }, []);

  // Largest room to move first — that is the one worth talking about.
  const ranked = [...journey.gaps].sort(
    (a, b) => b.target - b.current - (a.target - a.current),
  );
  const headline = ranked[0];

  return (
    <SectionFrame id="gap" align="wide">
      <div className="max-w-2xl">
        <SectionLabel index="02">The next rung</SectionLabel>
        <DisplayText as="h2" size="lg" className="mt-7">
          {journey.nextLevelLabel
            ? "What's between you and the next level?"
            : "What keeps you at this level?"}
        </DisplayText>
        <BodyText className="mt-5 text-base">{headline.note}</BodyText>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
        {/* Current → next, stated plainly before any chart. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.65, ease }}
          className="flex shrink-0 items-center gap-6 lg:flex-col lg:items-start lg:gap-8"
        >
          <div>
            <p className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
              Current
            </p>
            <p className="mt-2 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-semibold tracking-tight text-accent-strong">
              {journey.snapshot.levelLabel}
            </p>
          </div>

          <ArrowRight className="size-5 shrink-0 text-orange lg:rotate-90" aria-hidden />

          <div>
            <p className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
              Next
            </p>
            <p className="text-brand mt-2 pb-1 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-semibold tracking-tight">
              {journey.nextLevelLabel ?? "Stay there"}
            </p>
          </div>
        </motion.div>

        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
              Where the room is
            </p>
            <DemoBadge />
          </div>

          <div className="mt-8 flex flex-col gap-7">
            {ranked.map((gap, i) => (
              <div key={gap.id}>
                <MetricBar
                  label={gap.label}
                  value={gap.current}
                  target={gap.target}
                  targetLabel={
                    journey.nextLevelLabel
                      ? `Typical at ${journey.nextLevelLabel.toLowerCase()} level`
                      : "Typical at this level"
                  }
                  delay={i * 0.08}
                />
                <p className="mt-2 text-[0.78rem] leading-snug text-faint">{gap.note}</p>
              </div>
            ))}
          </div>

          <p className="mt-9 border-t border-tint/[0.08] pt-5 text-[0.75rem] leading-relaxed text-faint">
            The second figure on each bar is what this dimension typically looks like at the
            next level. Illustrative reference points for the demo — not a score, a ranking,
            or a comparison against other athletes.
          </p>
        </div>
      </div>
    </SectionFrame>
  );
}
