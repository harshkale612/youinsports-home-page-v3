"use client";

import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Typography";
import { GOALS } from "@/data/goals";
import type { Goal } from "@/types/athlete";
import { cn } from "@/lib/utils";

export function GoalStep({ onSelect }: { onSelect: (goal: Goal) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl"
    >
      <Eyebrow className="mb-5">Step 04 of 04</Eyebrow>
      <h2 className="text-balance font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold text-fg">
        What are you trying to achieve?
      </h2>

      <div role="listbox" aria-label="Select your athletic goal" className="mt-10 grid gap-3 sm:grid-cols-2">
        {GOALS.map((goal, i) => {
          const Icon = goal.icon;
          return (
            <motion.button
              key={goal.id}
              type="button"
              role="option"
              onClick={() => onSelect(goal.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-5 py-4 text-left transition-colors hover:border-accent/40",
              )}
            >
              <Icon className="size-4 shrink-0 text-accent" aria-hidden />
              <span className="font-display text-sm font-semibold text-fg">{goal.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
