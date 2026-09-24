"use client";

import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { ProfileHeader } from "@/features/athlete-dashboard/ProfileHeader";
import { PerformanceChart } from "@/features/athlete-dashboard/PerformanceChart";
import { DashboardOpportunities } from "@/features/athlete-dashboard/DashboardOpportunities";
import { CareerInsightCard } from "@/features/career-insight/CareerInsightCard";

export function AthleteDashboard() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  const loadDemo = useAthleteJourneyStore((s) => s.loadDemo);

  if (!athlete) {
    return (
      <Container className="flex min-h-[70svh] flex-col items-start justify-center py-32">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Athlete world
        </p>
        <h1 className="mt-4 max-w-lg text-balance font-display text-4xl font-semibold text-fg md:text-5xl">
          You haven&rsquo;t built an athlete profile yet.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          Build your athlete identity in four steps, or preview the dashboard with demo data.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/join" variant="primary" showArrow magnetic>
            Start your journey
          </ButtonLink>
          <Button variant="secondary" onClick={loadDemo}>
            Try demo data
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-16 py-32">
      <ProfileHeader athlete={athlete} />
      <PerformanceChart athlete={athlete} />
      <DashboardOpportunities athlete={athlete} />
      <div>
        <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          AI career insight
        </p>
        <div className="mt-4">
          <CareerInsightCard athlete={athlete} />
        </div>
      </div>
    </Container>
  );
}
