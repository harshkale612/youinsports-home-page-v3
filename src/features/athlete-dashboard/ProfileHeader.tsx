"use client";

import { motion } from "motion/react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import type { Athlete } from "@/types/athlete";
import { getSportConfig } from "@/data/sports";
import { getLevelConfig } from "@/data/levels";

export function ProfileHeader({ athlete }: { athlete: Athlete }) {
  const sport = getSportConfig(athlete.sport);
  const level = getLevelConfig(athlete.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end"
    >
      <div>
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Athlete profile
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-fg md:text-6xl">
          {athlete.name}
        </h1>
        <p className="mt-3 font-display text-sm font-semibold tracking-[0.14em] text-muted uppercase">
          {sport.label} &middot; {level.label} level
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex size-24 items-center justify-center rounded-full border border-border">
          <span className="font-display text-2xl font-semibold text-fg">
            <AnimatedCounter value={athlete.profileStrength} suffix="%" />
          </span>
        </div>
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Profile strength
          </p>
          <p className="text-sm text-muted">Complete your profile to improve this score.</p>
        </div>
      </div>
    </motion.div>
  );
}
