"use client";

import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Typography";
import { SPORTS } from "@/data/sports";
import type { Sport } from "@/types/athlete";
import { cn } from "@/lib/utils";

export function SportStep({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: Sport | null;
  onSelect: (sport: Sport) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl"
    >
      <Eyebrow className="mb-5">Step 02 of 04</Eyebrow>
      <h2 className="text-balance font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold text-fg">
        {name ? `${name}, what do you play?` : "What do you play?"}
      </h2>

      <div
        role="listbox"
        aria-label="Select your sport"
        className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      >
        {SPORTS.map((sport, i) => {
          const Icon = sport.icon;
          const isSelected = selected === sport.id;
          return (
            <motion.button
              key={sport.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(sport.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border border-border bg-surface/40 p-4 text-left transition-colors",
                isSelected ? "border-accent bg-accent-soft" : "hover:border-accent/40",
              )}
            >
              <Icon
                className={cn("size-5", isSelected ? "text-accent" : "text-muted")}
                aria-hidden
              />
              <span className="font-display text-sm font-semibold text-fg">{sport.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
