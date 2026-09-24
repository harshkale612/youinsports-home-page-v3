"use client";

import { useEffect } from "react";

import { PersistentGlobe } from "@/components/earth/PersistentGlobe";
import { CountryMarkerCard } from "@/components/earth/CountryMarkerCard";
import { GlobeAffordance } from "@/components/earth/GlobeAffordance";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { Hero } from "@/features/hero/Hero";
import { GlobalNetwork } from "@/features/global-network/GlobalNetwork";
import { SportExplorer } from "@/features/sport-explorer/SportExplorer";
import { Rankings } from "@/features/rankings/Rankings";
import { AthleteDiscovery } from "@/features/athlete-discovery/AthleteDiscovery";
import { OpportunityDiscovery } from "@/features/opportunity-discovery/OpportunityDiscovery";
import { Ecosystem } from "@/features/ecosystem/Ecosystem";
import { FinalCta } from "@/features/final-cta/FinalCta";
import { useEarthScrollScene } from "@/hooks/useEarthScrollScene";
import { resetAccentHue } from "@/lib/accent";

/**
 * The homepage shell.
 *
 * One globe, mounted once, with eight acts scrolling over it. The section order
 * here is the narrative order, and `useEarthScrollScene` is what promotes the
 * planet from one act to the next.
 */
export function HomeExperience() {
  useEarthScrollScene();

  // The onboarding flow tints the document per sport; arriving back here must
  // restore the brand accent.
  useEffect(resetAccentHue, []);

  return (
    <>
      <PersistentGlobe />
      <CountryMarkerCard />
      <GlobeAffordance />
      <GlobalSearch />

      <main className="relative z-10">
        <Hero />
        <GlobalNetwork />
        <SportExplorer />
        <Rankings />
        <AthleteDiscovery />
        <OpportunityDiscovery />
        <Ecosystem />
        <FinalCta />
      </main>
    </>
  );
}
