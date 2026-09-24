"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LandscapeTier } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "Here is the competitive world you are currently inside."
 *
 * Nested rings, widest at the base of the ladder and narrowing toward the top,
 * with the athlete's own tier marked. The width of each band encodes how large
 * the field is at that tier — the point being that the pyramid narrows, not
 * that any one number is precise.
 */
export function CompetitiveLandscape({
  tiers,
  className,
}: {
  tiers: LandscapeTier[];
  className?: string;
}) {
  // Widest tier outermost, so the athlete sits inside the rings above them.
  const ordered = [...tiers].reverse();

  return (
    <div className={cn("w-full", className)}>
      <ul className="flex flex-col gap-2.5" aria-label="Your competitive landscape">
        {ordered.map((tier, i) => (
          <li key={tier.level}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-[5.5rem] shrink-0 font-display text-[0.6rem] font-semibold tracking-[0.18em] uppercase",
                  tier.isCurrent ? "text-accent" : tier.isTarget ? "text-orange" : "text-faint",
                )}
              >
                {tier.label}
              </span>

              <div className="relative h-5 flex-1">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.75, ease, delay: i * 0.08 }}
                  style={{ width: `${tier.weight}%` }}
                  className={cn(
                    "h-full origin-left rounded-r-[4px] border-y border-r",
                    tier.isCurrent
                      ? "border-accent/80 bg-gradient-to-r from-accent/20 to-accent/50 shadow-[0_0_18px_-4px_rgb(44_143_227/0.7)]"
                      : tier.isTarget
                        ? "border-orange/45 bg-gradient-to-r from-orange/[0.04] to-orange/20"
                        : tier.isReached
                        ? "border-accent/25 bg-accent/12"
                        : "border-white/10 bg-white/[0.04]",
                  )}
                />

                {tier.isCurrent && (
                  <span className="absolute top-1/2 -translate-y-1/2 pl-3 font-display text-[0.5rem] font-semibold tracking-[0.18em] text-accent uppercase"
                    style={{ left: `${tier.weight}%` }}
                  >
                    You
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[0.72rem] leading-snug text-faint">
        Band width suggests how large the field is at each tier. Illustrative, not measured.
      </p>
    </div>
  );
}
