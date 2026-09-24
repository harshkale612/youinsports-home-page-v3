"use client";

import { useEffect } from "react";
import { Container, SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { AthleteSnapshot } from "@/features/athlete-snapshot/AthleteSnapshot";
import { CurrentPosition } from "@/features/athlete-snapshot/CurrentPosition";
import { NextLevel } from "@/features/athlete-snapshot/NextLevel";
import { Engine } from "@/features/engine/Engine";
import { JourneyTimeline } from "@/features/journey/JourneyTimeline";
import { Opportunities } from "@/features/opportunities/Opportunities";
import { CareerInsight } from "@/features/career-insight/CareerInsight";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { trackEvent } from "@/lib/analytics";

/**
 * The join flow, moved off the homepage and onto its own route.
 *
 * The homepage is now the global network story; this is where "Join
 * YouInSports" actually leads, so the CTA resolves to the real product rather
 * than scrolling to a form buried in a narrative.
 */
export function JoinExperience() {
  const startJourney = useAthleteJourneyStore((s) => s.startJourney);
  const loadDemo = useAthleteJourneyStore((s) => s.loadDemo);
  const athlete = useAthleteJourneyStore((s) => s.athlete);

  useEffect(() => {
    startJourney();
    trackEvent("journey_started");
  }, [startJourney]);

  return (
    <>
      <Container className="pb-4">
        <SectionLabel>Build your athlete identity</SectionLabel>
        <DisplayText as="h1" size="md" className="mt-6">
          Four questions.
          <br />
          Then we&apos;ll show you where you stand.
        </DisplayText>
        <BodyText className="mt-5 max-w-lg text-base">
          Your sport, your level and your goal. That&apos;s enough to place you on the
          map and show what comes next.
        </BodyText>

        {!athlete && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-6 px-0 text-[0.65rem] text-faint hover:text-accent"
            onClick={() => {
              loadDemo();
              trackEvent("demo_mode_started");
            }}
          >
            Skip — show me a finished demo profile
          </Button>
        )}
      </Container>

      <OnboardingFlow />
      <AthleteSnapshot />
      <CurrentPosition />
      <NextLevel />
      <Engine />
      <JourneyTimeline />
      <Opportunities />
      <CareerInsight />
    </>
  );
}
