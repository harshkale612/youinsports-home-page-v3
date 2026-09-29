"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * One illustrative reading as a horizontal bar, optionally with the level the
 * athlete is climbing toward marked on the same track.
 *
 * The fill is where the athlete is now, in blue; the target tick is where
 * they are headed, in orange — the same now/next pairing the pathway uses.
 * Both are labelled in text, so the bar is never the only way to read them.
 */
export function MetricBar({
  label,
  value,
  target,
  targetLabel = "Next level",
  delay = 0,
  className,
}: {
  label: string;
  /** 0-100. */
  value: number;
  /** 0-100. Omit for a plain magnitude bar. */
  target?: number;
  targetLabel?: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [animated, setDisplay] = useState(0);

  useEffect(() => {
    // Reduced motion takes the derived path below instead — writing state here
    // just to skip the animation would be a render for nothing.
    if (!isInView || reducedMotion) return;

    const controls = animate(0, value, {
      duration: 1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, delay, reducedMotion]);

  const display = reducedMotion ? value : animated;

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[0.7rem] font-semibold tracking-[0.14em] text-fg uppercase">
          {label}
        </p>
        <p className="tabular font-display text-[0.8rem] font-semibold text-muted">
          {display}
          {target !== undefined && (
            <span className="text-faint">
              {" / "}
              <span className="text-orange">{target}</span>
            </span>
          )}
        </p>
      </div>

      <div className="relative mt-2.5 h-1.5 w-full rounded-full bg-tint/[0.08]">
        <div
          className="bg-brand-reading h-full rounded-full transition-none"
          style={{ width: `${display}%` }}
        />

        {target !== undefined && (
          <span
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-orange shadow-[0_0_8px_rgb(var(--orange-rgb)/var(--glow))]"
            style={{ left: `${target}%` }}
            // The tick is decorative; the "current / target" pair above states
            // the same thing in text.
            aria-hidden
            title={targetLabel}
          />
        )}
      </div>
    </div>
  );
}
