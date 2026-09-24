"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useInView, animate } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const SIZE = 120;
const STROKE = 2;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A single illustrative reading, drawn as a ring.
 *
 * One measure, one hue — the number in the middle is the direct label, so there
 * is nothing to put in a legend. The track stays a recessive neutral; only the
 * filled arc carries the accent, brightening toward its tip.
 */
export function ProgressRing({
  value,
  label,
  caption,
  delay = 0,
  className,
}: {
  /** 0-100. */
  value: number;
  label: string;
  caption?: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [animated, setDisplay] = useState(0);

  useEffect(() => {
    // Reduced motion takes the derived path below instead — writing state here
    // just to skip the animation would be a render for nothing.
    if (!isInView || reducedMotion) return;

    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, delay, reducedMotion]);

  const display = reducedMotion ? value : animated;
  const offset = CIRCUMFERENCE * (1 - display / 100);

  return (
    <div ref={ref} className={cn("flex flex-col items-center text-center", className)}>
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          // The figure is decorative: the value and label below are the real
          // content, and they are already readable text.
          aria-hidden
          className="-rotate-90 overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7cc0f5" />
              <stop offset="1" stopColor="var(--brand-blue)" />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS - 10}
            fill="var(--color-accent-soft)"
            className="opacity-40"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-white/[0.08]"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE + 1}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="drop-shadow-[0_0_6px_rgb(44_143_227/0.8)]"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular font-display text-[1.75rem] leading-none font-semibold tracking-tight text-fg">
            {display}
            <span className="text-[0.9rem] text-muted">%</span>
          </span>
        </div>
      </div>

      <p className="mt-3 font-display text-[0.6rem] font-semibold tracking-[0.2em] text-muted uppercase">
        {label}
      </p>
      {caption && <p className="mt-1.5 max-w-[14rem] text-[0.75rem] leading-snug text-faint">{caption}</p>}
    </div>
  );
}
