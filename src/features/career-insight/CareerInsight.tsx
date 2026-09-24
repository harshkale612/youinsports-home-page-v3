"use client";

import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { CareerInsightCard } from "@/features/career-insight/CareerInsightCard";

export function CareerInsight() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  if (!athlete) return null;

  return (
    <Section id="career-insight" className="border-t border-border bg-bg-elevated">
      <Container className="max-w-3xl">
        <Eyebrow>AI career insight</Eyebrow>
        <DisplayHeading as="h2" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
          What&rsquo;s your biggest opportunity?
        </DisplayHeading>

        <div className="mt-10">
          <CareerInsightCard athlete={athlete} />
        </div>
      </Container>
    </Section>
  );
}
