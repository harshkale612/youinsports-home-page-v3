"use client";

import { motion } from "motion/react";
import { SectionLabel, DisplayText, BodyText, Container } from "@/components/ui/Primitives";
import { ATHLETES } from "@/data/athletes";
import { SPORTS } from "@/data/sports";

const PILLARS = [
  { label: "Athletes", copy: "Every athlete, from a local club to an international squad." },
  { label: "Sports", copy: "Twelve disciplines and counting, each with its own pathway." },
  { label: "Countries", copy: "Talent mapped where it actually is, not where it gets noticed." },
  { label: "Communities", copy: "Clubs, academies and coaches who build athletes." },
  { label: "Opportunities", copy: "Trials, competitions and the people who select for them." },
];

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act two. The globe pulls to the centre and the copy wraps above and below it,
 * so the planet itself is the evidence for the claim the headline makes.
 */
export function GlobalNetwork() {
  const countries = new Set(ATHLETES.map((a) => a.countryCode)).size;

  return (
    <section
      id="network"
      className="relative flex min-h-svh flex-col justify-between py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-void)_0%,rgba(3,11,18,0.15)_32%,rgba(3,11,18,0.15)_58%,rgba(3,11,18,0.88)_78%,var(--color-void)_100%)]"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-3xl"
        >
          <SectionLabel index="02">The global athlete network</SectionLabel>
          <DisplayText as="h2" size="lg" className="mt-7">
            Talent has no borders.
          </DisplayText>
          <BodyText className="mt-6 max-w-xl">
            Sport is everywhere. The systems that find it are not. YouInSports maps
            athletes wherever they are — so the next one doesn&apos;t go unseen because
            of where they were born.
          </BodyText>
        </motion.div>
      </Container>

      <Container className="relative mt-auto pt-24">
        <motion.dl
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.08] pt-8 md:grid-cols-3 lg:grid-cols-5"
        >
          {PILLARS.map((pillar, i) => (
            <div key={pillar.label} className="max-w-[16rem]">
              <dt className="flex items-baseline gap-2.5">
                <span className="tabular font-display text-[0.6rem] font-semibold text-accent">
                  0{i + 1}
                </span>
                <span className="font-display text-base font-semibold tracking-tight text-fg">
                  {pillar.label}
                </span>
              </dt>
              <dd className="mt-2 text-[0.85rem] leading-relaxed text-muted">{pillar.copy}</dd>
            </div>
          ))}
        </motion.dl>

        <p className="mt-8 font-display text-[0.6rem] font-semibold tracking-[0.2em] text-faint uppercase">
          Demo network — {ATHLETES.length} athletes · {countries} countries · {SPORTS.length} sports
        </p>
      </Container>
    </section>
  );
}
