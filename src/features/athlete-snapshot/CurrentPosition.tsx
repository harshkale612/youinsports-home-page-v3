"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading, BodyText } from "@/components/ui/Typography";
import { MetricCard } from "@/components/ui/MetricCard";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { LEVELS, getLevelConfig } from "@/data/levels";
import { cn } from "@/lib/utils";

export function CurrentPosition() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  if (!athlete) return null;

  const currentLevel = getLevelConfig(athlete.level);
  const orderedLevels = [...LEVELS].reverse();

  return (
    <Section className="border-t border-border">
      <Container className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Current position</Eyebrow>
          <DisplayHeading as="h2" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
            Where you stand today
          </DisplayHeading>
          <BodyText className="mt-6 max-w-md">
            {athlete.name} is currently building from{" "}
            <span className="text-fg">{currentLevel.label.toLowerCase()} level</span>. Here&rsquo;s how that
            maps across the full competitive ladder.
          </BodyText>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <MetricCard label="Competitive reach" value={athlete.ranking.competitiveReach} suffix="%" />
            <MetricCard label="Performance" value={athlete.ranking.performance} suffix="%" />
            <MetricCard label="Visibility" value={athlete.ranking.visibility} suffix="%" />
            <MetricCard label="Career readiness" value={athlete.ranking.careerReadiness} suffix="%" />
          </div>
        </div>

        <div className="flex flex-col">
          {orderedLevels.map((level, i) => {
            const isCurrent = level.id === athlete.level;
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex items-center gap-5 py-5"
              >
                {i !== orderedLevels.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-[calc(50%+0.75rem)] left-[7px] h-[calc(100%-0.5rem)] w-px bg-border"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 size-3.5 shrink-0 rounded-full border-2",
                    isCurrent ? "border-accent bg-accent" : "border-border bg-bg",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "font-display text-lg font-semibold tracking-tight md:text-2xl",
                    isCurrent ? "text-fg" : "text-muted",
                  )}
                >
                  {level.label.toUpperCase()}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-accent px-3 py-1 font-display text-xs font-bold tracking-widest text-bg uppercase">
                    You
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
