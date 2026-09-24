"use client";

import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Typography";
import { LEVELS } from "@/data/levels";
import type { Level } from "@/types/athlete";
import { cn } from "@/lib/utils";

export function LevelStep({
  selected,
  onSelect,
}: {
  selected: Level | null;
  onSelect: (level: Level) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl"
    >
      <Eyebrow className="mb-5">Step 03 of 04</Eyebrow>
      <h2 className="text-balance font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold text-fg">
        Where are you competing today?
      </h2>

      <div role="listbox" aria-label="Select your competitive level" className="mt-10 flex flex-col">
        {[...LEVELS].reverse().map((level, i) => {
          const isSelected = selected === level.id;
          return (
            <motion.button
              key={level.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(level.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={cn(
                "group flex items-center justify-between border-b border-border py-4 text-left transition-colors first:pt-0 last:border-b-0",
                "hover:border-accent/40",
              )}
            >
              <span
                className={cn(
                  "font-display text-2xl font-semibold transition-colors md:text-3xl",
                  isSelected ? "text-accent" : "text-fg/80 group-hover:text-fg",
                )}
              >
                {level.label}
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden text-sm text-muted sm:inline">{level.description}</span>
                {isSelected && (
                  <motion.span
                    layoutId="level-you-indicator"
                    className="rounded-full bg-accent px-3 py-1 font-display text-xs font-bold tracking-widest text-bg uppercase"
                  >
                    You
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
