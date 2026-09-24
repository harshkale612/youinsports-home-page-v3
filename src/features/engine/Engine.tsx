"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { ENGINE_CARDS } from "@/data/engine-cards";
import { cn } from "@/lib/utils";

export function Engine() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <Section id="engine" className="border-t border-border">
      <Container>
        <Eyebrow>The YouInSports engine</Eyebrow>
        <DisplayHeading as="h2" className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)]">
          Your talent got you here. We help you go further.
        </DisplayHeading>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {ENGINE_CARDS.map((card, i) => {
            const Icon = card.icon;
            const isActive = activeId === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                onMouseEnter={() => setActiveId(card.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(card.id)}
                onBlur={() => setActiveId(null)}
                tabIndex={0}
                className={cn(
                  "flex min-h-76 flex-col justify-between bg-bg p-8 transition-colors duration-300 outline-none",
                  isActive && "bg-bg-elevated",
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-semibold text-muted">{card.number}</span>
                    <Icon
                      className={cn(
                        "size-5 transition-all duration-300",
                        isActive ? "-rotate-6 text-accent" : "text-muted",
                      )}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-6 font-display text-2xl font-semibold text-fg">{card.title}</p>
                  <p className="mt-2 text-sm text-muted">{card.description}</p>
                </div>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <li
                      key={point}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors duration-300",
                        isActive
                          ? "border-accent/30 bg-accent-soft text-accent"
                          : "border-border text-muted",
                      )}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
