"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { GLOBAL_OPPORTUNITIES, OPPORTUNITY_KIND_LABELS, opportunitiesForSport } from "@/data/global-opportunities";
import { getCountry } from "@/data/countries";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";
import type { OpportunityKind } from "@/types/network";

const ease = [0.16, 1, 0.3, 1] as const;

const KINDS: OpportunityKind[] = [
  "trial", "competition", "academy", "coach", "sponsor", "club", "event",
];

/**
 * Act six. The globe's arcs are already drawing athlete → opportunity routes by
 * the time this section arrives; the list gives those arcs their names, and
 * selecting one flies the camera to where it actually is.
 */
export function OpportunityDiscovery() {
  const [kind, setKind] = useState<OpportunityKind | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedSport = useGlobalExperience((s) => s.selectedSport);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const pool = selectedSport ? opportunitiesForSport(selectedSport) : GLOBAL_OPPORTUNITIES;
  const opportunities = (kind ? pool.filter((o) => o.kind === kind) : pool).slice(0, 6);

  return (
    <SectionFrame id="opportunities" align="left">
      <SectionLabel index="06">Opportunities</SectionLabel>
      <DisplayText as="h2" size="lg" className="mt-7">
        What&apos;s next
        <br />
        for them?
      </DisplayText>
      <BodyText className="mt-6">
        Knowing where athletes are is only half of it. The other half is what they can
        reach from there — trials, competitions, academies, coaches and the people who
        sign them.
      </BodyText>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter opportunities by type">
        <button
          type="button"
          onClick={() => setKind(null)}
          aria-pressed={kind === null}
          className={cn(
            "rounded-full border px-3.5 py-1.5 font-display text-[0.62rem] font-semibold tracking-[0.14em] uppercase transition-colors",
            kind === null
              ? "border-accent bg-accent text-white"
              : "border-white/12 text-muted hover:border-white/30 hover:text-fg",
          )}
        >
          All
        </button>
        {KINDS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            aria-pressed={kind === item}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-display text-[0.62rem] font-semibold tracking-[0.14em] uppercase transition-colors",
              kind === item
                ? "border-accent bg-accent text-white"
                : "border-white/12 text-muted hover:border-white/30 hover:text-fg",
            )}
          >
            {OPPORTUNITY_KIND_LABELS[item]}
          </button>
        ))}
      </div>

      <ul className="mt-9 flex flex-col">
        {opportunities.map((opportunity, i) => {
          const country = getCountry(opportunity.countryCode);
          const isActive = activeId === opportunity.id;
          return (
            <motion.li
              key={opportunity.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.5, ease, delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveId(opportunity.id);
                  focusOn(opportunity.latitude, opportunity.longitude);
                  trackEvent("opportunity_viewed", { id: opportunity.id });
                }}
                className={cn(
                  "group flex w-full items-start gap-4 border-t border-white/[0.08] py-4 text-left transition-colors",
                  isActive ? "text-fg" : "hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "mt-1 rounded-full border px-2 py-0.5 font-display text-[0.52rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                    isActive
                      ? "border-accent/60 bg-accent-soft text-accent"
                      : "border-white/10 text-faint group-hover:text-muted",
                  )}
                >
                  {OPPORTUNITY_KIND_LABELS[opportunity.kind]}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold tracking-tight text-fg">
                    {opportunity.title}
                  </span>
                  <span className="mt-0.5 block text-[0.84rem] text-muted">
                    {opportunity.organization}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[0.78rem] text-faint">
                    <MapPin className="size-3" aria-hidden />
                    {opportunity.city}, {country.name} {country.flag}
                  </span>
                </span>

                <span className="shrink-0 font-display text-[0.6rem] font-semibold tracking-[0.14em] text-faint uppercase">
                  {opportunity.window}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <DemoBadge className="mt-7" />
    </SectionFrame>
  );
}
