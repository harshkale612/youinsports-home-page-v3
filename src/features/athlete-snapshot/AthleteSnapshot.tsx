"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { getSportConfig } from "@/data/sports";
import { getLevelConfig } from "@/data/levels";
import { getGoalConfig } from "@/data/goals";

export function AthleteSnapshot() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  if (!athlete) return null;

  const sport = getSportConfig(athlete.sport);
  const level = getLevelConfig(athlete.level);
  const goal = getGoalConfig(athlete.goal);

  return (
    <Section id="snapshot" className="border-t border-border">
      <Container>
        <Eyebrow>Demo athlete snapshot</Eyebrow>
        <DisplayHeading as="h2" className="mt-4 text-[clamp(2.5rem,6vw,5.5rem)]">
          Here&rsquo;s your athlete snapshot
        </DisplayHeading>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display text-4xl font-semibold text-fg md:text-5xl">{athlete.name}</p>
            <p className="mt-3 font-display text-sm font-semibold tracking-[0.14em] text-accent uppercase">
              {sport.label} &middot; {level.label} level
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                Goal
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-fg">{goal.label}</p>
            </div>

            <p className="mt-8 max-w-sm text-sm text-muted">
              This is an estimated athlete profile built from demo data to preview how YouInSports
              will visualize your real performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col gap-6 rounded-2xl border border-border bg-surface/40 p-8"
          >
            <ProgressBar label="Performance" value={athlete.ranking.performance} />
            <ProgressBar label="Visibility" value={athlete.ranking.visibility} />
            <ProgressBar label="Competitive reach" value={athlete.ranking.competitiveReach} />
            <ProgressBar label="Career readiness" value={athlete.ranking.careerReadiness} />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
