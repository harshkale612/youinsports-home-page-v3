import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import type { Athlete } from "@/types/athlete";

export function DashboardOpportunities({ athlete }: { athlete: Athlete }) {
  return (
    <div>
      <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
        Opportunities
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {athlete.opportunities.map((opportunity) => (
          <SurfaceCard key={opportunity.id} className="flex flex-col justify-between p-6">
            <div>
              <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                {opportunity.relevance}
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-fg">{opportunity.title}</p>
              <p className="mt-1 text-sm text-muted">{opportunity.organization}</p>
            </div>
            <Button variant="secondary" className="mt-6 self-start px-5 py-2 text-xs">
              {opportunity.action}
            </Button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
