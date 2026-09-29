"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { JOURNEY_LEVELS } from "@/data/journey-levels";
import type { JourneyLevel } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The ladder, with the athlete placed on it.
 *
 * Reads bottom-up: local at the base, international at the top, the athlete's
 * rung marked YOU and the one above marked NEXT. Position is carried by the
 * labels as much as the highlight, so it survives being read without colour.
 */
export function JourneyPath({
  current,
  target,
  className,
}: {
  current: JourneyLevel;
  target: JourneyLevel | null;
  className?: string;
}) {
  const currentOrder = JOURNEY_LEVELS.find((l) => l.id === current)?.order ?? 0;
  const rungs = [...JOURNEY_LEVELS].reverse();

  return (
    <ol className={cn("relative flex flex-col pl-1", className)} aria-label="Your position on the pathway">
      <div aria-hidden className="absolute top-3 bottom-3 left-[0.6rem] w-px bg-tint/12" />

      <motion.div
        aria-hidden
        className="absolute left-[0.6rem] w-px origin-bottom bg-accent"
        style={{ bottom: "0.75rem", height: `${(currentOrder / (JOURNEY_LEVELS.length - 1)) * 100}%` }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, ease }}
      />

      {rungs.map((level, i) => {
        const isCurrent = level.id === current;
        const isTarget = level.id === target;
        const isReached = level.order <= currentOrder;

        return (
          <motion.li
            key={level.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.07 }}
            className="relative flex items-center gap-3.5 py-2"
          >
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex size-[1.2rem] shrink-0 items-center justify-center rounded-full border",
                isCurrent
                  ? "border-accent bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/calc(0.8*var(--glow)))]"
                  : isTarget
                    ? "border-orange bg-void shadow-[0_0_12px_rgb(var(--orange-rgb)/calc(0.55*var(--glow)))]"
                    : isReached
                      ? "border-accent/45 bg-accent/20"
                      : "border-tint/18 bg-void",
              )}
            >
              <span
                className={cn(
                  "size-1 rounded-full",
                  isCurrent ? "bg-white" : isTarget ? "bg-orange" : isReached ? "bg-accent" : "bg-tint/30",
                )}
              />
            </span>

            <span
              className={cn(
                "font-display text-[0.95rem] font-semibold tracking-tight",
                isCurrent ? "text-fg" : isTarget ? "text-fg/90" : "text-muted",
              )}
            >
              {level.label}
            </span>

            {isCurrent && (
              <span className="rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 font-display text-[0.5rem] font-semibold tracking-[0.18em] text-accent uppercase">
                You are here
              </span>
            )}
            {isTarget && (
              <span className="rounded-full border border-orange/50 bg-orange-soft px-2 py-0.5 font-display text-[0.5rem] font-semibold tracking-[0.18em] text-orange uppercase">
                Next
              </span>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
