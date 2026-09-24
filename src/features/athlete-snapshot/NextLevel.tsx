"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Activity, Eye, Trophy, Users2, Repeat, LineChart } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { getLevelConfig, nextLevel } from "@/data/levels";

const GROWTH_AREAS = [
  { label: "Performance", icon: Activity },
  { label: "Visibility", icon: Eye },
  { label: "Competition", icon: Trophy },
  { label: "Network", icon: Users2 },
  { label: "Consistency", icon: Repeat },
  { label: "Career development", icon: LineChart },
];

export function NextLevel() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  const prefersReducedMotion = useReducedMotion();
  if (!athlete) return null;

  const current = getLevelConfig(athlete.level);
  const target = nextLevel(athlete.level);

  return (
    <Section className="border-t border-border bg-bg-elevated">
      <Container>
        <Eyebrow>What&rsquo;s next</Eyebrow>
        <DisplayHeading as="h2" className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)]">
          What could your next level look like?
        </DisplayHeading>

        <div className="mt-14 flex flex-wrap items-center gap-6">
          <div className="rounded-2xl border border-border bg-surface/40 px-8 py-6">
            <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              Current
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-fg">{current.label}</p>
          </div>

          <motion.div
            animate={prefersReducedMotion ? undefined : { x: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="size-6 text-accent" aria-hidden />
          </motion.div>

          <div className="rounded-2xl border border-accent/50 bg-accent-soft px-8 py-6">
            <p className="font-display text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Next target
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-fg">
              {target ? target.label : "Elite tier"}
            </p>
          </div>
        </div>

        <p className="mt-14 font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          Areas required to progress
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {GROWTH_AREAS.map((area, i) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex flex-col items-start gap-3 rounded-xl border border-border p-4"
              >
                <Icon className="size-4 text-accent" aria-hidden />
                <span className="font-display text-sm font-semibold text-fg">{area.label}</span>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
