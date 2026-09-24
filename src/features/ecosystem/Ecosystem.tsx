"use client";

import { motion } from "motion/react";
import { Container, SectionLabel, DisplayText } from "@/components/ui/Primitives";

const LAYERS = [
  { label: "Athlete identity", copy: "A profile that holds everything you've done, in one place you own." },
  { label: "Performance", copy: "Results, progression and the numbers that actually describe your game." },
  { label: "Visibility", copy: "Being findable by the people whose job it is to find athletes." },
  { label: "Network", copy: "Coaches, clubs, academies and athletes on the same pathway as you." },
  { label: "Opportunities", copy: "Trials, competitions and programmes matched to where you are now." },
  { label: "Career", copy: "The long view — what this sport can become for you." },
];

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act seven. The globe pulls back and takes the middle of the frame on its own:
 * the argument sits above it and the six layers below, so the planet is
 * literally the thing the platform wraps around rather than something the copy
 * has to fight for space with.
 */
export function Ecosystem() {
  return (
    <section id="ecosystem" className="relative flex min-h-svh flex-col justify-between py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-void)_0%,rgba(3,11,18,0.82)_28%,rgba(3,11,18,0.22)_48%,rgba(3,11,18,0.90)_70%,var(--color-void)_88%)]"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.85, ease }}
          className="mx-auto max-w-4xl text-center"
        >
          <SectionLabel index="07" className="justify-center">
            The connective layer
          </SectionLabel>
          <DisplayText as="h2" size="lg" className="mt-7">
            The world is full of talent.
          </DisplayText>
          <DisplayText as="p" size="lg" className="mt-1 text-muted">
            The system should help it get discovered.
          </DisplayText>
        </motion.div>
      </Container>

      <Container className="relative mt-auto pt-28">
        <ul className="grid gap-x-10 gap-y-8 border-t border-white/[0.08] pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((layer, i) => (
            <motion.li
              key={layer.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.6, ease, delay: (i % 3) * 0.08 }}
            >
              <p className="flex items-baseline gap-3">
                <span className="tabular font-display text-[0.6rem] font-semibold text-accent">
                  0{i + 1}
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-fg">
                  {layer.label}
                </span>
              </p>
              <p className="mt-2 max-w-[22rem] text-[0.86rem] leading-relaxed text-muted">
                {layer.copy}
              </p>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
