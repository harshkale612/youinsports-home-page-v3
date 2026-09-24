"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";

export function Opportunities() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  if (!athlete) return null;

  return (
    <Section id="opportunities" className="border-t border-border">
      <Container>
        <Eyebrow>Opportunities for {athlete.name}</Eyebrow>
        <DisplayHeading as="h2" className="mt-4 max-w-3xl text-[clamp(2.25rem,5vw,4rem)]">
          Matched to where you are right now
        </DisplayHeading>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {athlete.opportunities.map((opportunity, i) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface/40 p-6"
            >
              <div>
                <p className="font-display text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                  {opportunity.relevance}
                </p>
                <p className="mt-4 font-display text-xl font-semibold text-fg">{opportunity.title}</p>
                <p className="mt-2 text-sm text-muted">{opportunity.organization}</p>
              </div>
              <Button variant="secondary" className="mt-8 self-start px-5 py-2.5 text-xs">
                {opportunity.action}
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted">
          Sample opportunities shown for demo purposes — not affiliated organizations.
        </p>
      </Container>
    </Section>
  );
}
