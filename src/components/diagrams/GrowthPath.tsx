"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export type GrowthStep = {
  id: string;
  label: string;
  detail?: string;
};

/**
 * A sequence that builds itself as it scrolls into view.
 *
 * Used for the pathway diagrams — identity → performance → visibility →
 * network → opportunities → career, and the before/after transformation. Steps
 * can be selectable, which is what lets the ecosystem section drive the globe
 * from the diagram.
 */
export function GrowthPath({
  steps,
  activeId,
  onSelect,
  orientation = "vertical",
  className,
}: {
  steps: GrowthStep[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const isVertical = orientation === "vertical";
  const interactive = Boolean(onSelect);

  return (
    <ol
      className={cn(
        "relative flex",
        isVertical ? "flex-col" : "flex-col gap-3 sm:flex-row sm:items-stretch",
        className,
      )}
    >
      {steps.map((step, i) => {
        const isActive = activeId === step.id;
        // The path runs from where the athlete is (blue) to where they could
        // go (orange), so its two ends carry the brand's now/next colours.
        const isStart = i === 0;
        const isEnd = i === steps.length - 1;
        const Tag = interactive ? "button" : "div";

        return (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            className={cn("relative", isVertical ? "pl-8" : "flex-1")}
          >
            {/* The connector between steps. Drawn per-item so the last one can
                simply not have it, rather than being clipped. */}
            {isVertical && i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-6 bottom-0 left-[0.31rem] w-px bg-gradient-to-b from-accent/50 to-orange/50"
                style={{
                  // Each segment picks up the gradient where the last left off.
                  opacity: 0.35 + (0.65 * i) / Math.max(1, steps.length - 2),
                }}
              />
            )}

            <Tag
              {...(interactive
                ? {
                    type: "button" as const,
                    onClick: () => onSelect?.(step.id),
                    "aria-pressed": isActive,
                  }
                : {})}
              className={cn(
                "w-full text-left transition-colors duration-300",
                isVertical ? "pb-6" : "h-full rounded-xl border px-4 py-4",
                !isVertical &&
                  (isActive
                    ? "border-accent bg-accent-soft"
                    : "border-tint/10 bg-tile shadow-[var(--shadow-tile)] hover:border-tint/25"),
              )}
            >
              {isVertical && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-[0.3rem] flex size-[0.62rem] items-center justify-center rounded-full border transition-colors duration-300",
                    isActive || isStart
                      ? "border-accent bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/calc(0.8*var(--glow)))]"
                      : isEnd
                        ? "border-orange bg-orange shadow-[0_0_10px_rgb(var(--orange-rgb)/calc(0.8*var(--glow)))]"
                        : "border-tint/25 bg-void",
                  )}
                />
              )}

              <span
                className={cn(
                  "block font-display font-semibold tracking-tight transition-colors duration-300",
                  isVertical ? "text-[1rem]" : "text-[0.9rem]",
                  isActive ? "text-accent" : "text-fg",
                )}
              >
                {step.label}
              </span>
              {step.detail && (
                <span className="mt-1.5 block text-[0.8rem] leading-snug text-muted">
                  {step.detail}
                </span>
              )}
            </Tag>
          </motion.li>
        );
      })}
    </ol>
  );
}
