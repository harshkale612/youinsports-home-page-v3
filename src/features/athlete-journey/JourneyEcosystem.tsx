"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { NetworkGraph } from "@/components/diagrams/NetworkGraph";
import { GrowthPath, type GrowthStep } from "@/components/diagrams/GrowthPath";
import { useJourney } from "@/stores/journeyStore";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney, MetricId } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act five — the product, introduced only now.
 *
 * Nothing about YouInSports has been said until this point; the bridge is the
 * athlete's own answers. Selecting a capability re-stages the globe around it,
 * which is what keeps this from being a six-card feature grid.
 */

type Capability = GrowthStep & {
  /** The dimension this capability answers — also what the globe reacts to. */
  focus: MetricId;
  body: string;
  /** Small supporting diagram, drawn as an arrow chain. */
  chain: string[];
};

const CAPABILITIES: Capability[] = [
  {
    id: "identity",
    label: "Identity",
    detail: "One profile that holds everything",
    focus: "career-readiness",
    body: "Achievements, statistics, media and history in one place — a professional sports profile that travels with you instead of living across screenshots.",
    chain: ["Achievements", "Stats", "Media", "History", "Athlete profile"],
  },
  {
    id: "performance",
    label: "Performance",
    detail: "Progress you can actually see",
    focus: "performance-readiness",
    body: "Track the work you already do, so improvement becomes something you can point at rather than something you feel.",
    chain: ["Train", "Measure", "Analyse", "Improve", "Repeat"],
  },
  {
    id: "visibility",
    label: "Visibility",
    detail: "Be findable by the right people",
    focus: "visibility",
    body: "Your journey becomes easier to discover and easier to share — with a community, with coaches, and with the people who decide who gets a look.",
    chain: ["You", "Profile", "Community", "Coaches", "Scouts and teams"],
  },
  {
    id: "network",
    label: "Network",
    detail: "One connection away",
    focus: "network",
    body: "Coaches, athletes, clubs, organisers and sponsors — the people around your sport, reachable rather than theoretical.",
    chain: ["Athlete", "Coach", "Club", "Organiser", "Sponsor"],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    detail: "Discover what's next",
    focus: "competitive-reach",
    body: "Trials, camps, competitions and programmes surfaced against where you are and what you are working toward.",
    chain: ["Search", "Match", "Apply", "Compete"],
  },
  {
    id: "career",
    label: "Career",
    detail: "The whole thing, compounding",
    focus: "career-readiness",
    body: "Every session, result and connection builds one record of your progress. That record is the thing the next opportunity asks for.",
    chain: ["Identity", "Performance", "Visibility", "Network", "Career"],
  },
];

const BEFORE = [
  "Achievements scattered across phones and group chats",
  "No single athlete identity",
  "Progress you can feel but not show",
  "Opportunities found by word of mouth",
];

const AFTER = [
  "One athlete identity that travels with you",
  "Progress tracked and visible",
  "A network that knows your game",
  "Opportunities that find you back",
];

export function JourneyEcosystem({ journey }: { journey: AthleteJourney }) {
  const setFocus = useJourney((s) => s.setFocus);
  const [activeId, setActiveId] = useState<string>("identity");

  const active = CAPABILITIES.find((c) => c.id === activeId) ?? CAPABILITIES[0];

  function handleSelect(id: string) {
    const capability = CAPABILITIES.find((c) => c.id === id);
    if (!capability) return;
    setActiveId(id);
    // The globe re-stages around the selected dimension — arcs for the network,
    // markers for visibility, opportunity routes for reach.
    setFocus(capability.focus);
    trackEvent("journey_focus_selected", { capability: id });
  }

  return (
    <SectionFrame id="youinsports" align="wide">
      <div className="max-w-2xl">
        <SectionLabel index="03">The ecosystem</SectionLabel>
        <DisplayText as="h2" size="lg" className="mt-7">
          This is where
          <br />
          YouInSports comes in.
        </DisplayText>

        <div className="mt-7 flex flex-col gap-1.5 text-pretty text-base leading-relaxed text-muted md:text-lg">
          <p>
            You already have the sport. You already have the competition. You already have
            the ambition.
          </p>
          <p className="text-fg">
            What you need is somewhere to build, measure, connect and progress.
          </p>
        </div>
      </div>

      {/* Personalised, ordered by what this athlete's answers imply. */}
      <div className="mt-14 max-w-3xl">
        <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
          For your journey, we&apos;d start here
        </p>

        <ol className="mt-7 flex flex-col">
          {journey.recommendations.map((recommendation, i) => (
            <motion.li
              key={recommendation.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.55, ease, delay: i * 0.07 }}
              className="flex gap-5 border-t border-tint/[0.08] py-5 last:border-b"
            >
              <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-full border border-orange/40 bg-orange-soft font-display text-[0.66rem] font-semibold tracking-[0.06em] text-orange-strong">
                {recommendation.index}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[1.05rem] font-semibold tracking-tight text-fg">
                  {recommendation.title}
                </h3>
                <p className="mt-1.5 text-pretty text-[0.9rem] leading-relaxed text-muted">
                  {recommendation.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* The capability map. Selecting a node drives the globe. */}
      <div className="mt-16">
        <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
          How it fits together
        </p>
        <p className="mt-2 text-[0.8rem] text-faint">
          Select any part of the pathway — the globe responds to what you choose.
        </p>

        <GrowthPath
          steps={CAPABILITIES}
          activeId={activeId}
          onSelect={handleSelect}
          orientation="horizontal"
          className="mt-6 sm:gap-2.5"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
              className="max-w-xl"
            >
              <h3 className="display-md text-fg">{active.detail}</h3>
              <BodyText className="mt-4 text-base">{active.body}</BodyText>

              {/* The supporting chain, as a single line of steps. */}
              <ol className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                {active.chain.map((node, i) => (
                  <li key={node} className="flex items-center gap-2.5">
                    <span className="rounded-full border border-tint/12 bg-tag px-3 py-1.5 font-display text-[0.6rem] font-semibold tracking-[0.14em] text-fg uppercase">
                      {node}
                    </span>
                    {i < active.chain.length - 1 && (
                      <span aria-hidden className="text-[0.7rem] text-faint">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>

          {active.focus === "network" || active.id === "network" ? (
            <NetworkGraph className="lg:w-[17rem]" />
          ) : null}
        </div>
      </div>

      {/* The transformation. Two states of the same athlete, not a pricing
          comparison table. */}
      <div className="mt-20 max-w-4xl">
        <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
          What changes
        </p>

        <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-14">
          <div>
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.2em] text-muted uppercase">
              Today
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9rem] leading-snug text-faint">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-tint/25" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.2em] text-accent uppercase">
              With YouInSports
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {AFTER.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-12% 0px" }}
                  transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.1 }}
                  className="flex gap-3 text-[0.9rem] leading-snug text-fg"
                >
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
