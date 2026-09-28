"use client";

import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** "Coming soon.", lettered like the About heading: white, then brand orange, then a blue stop. */
const LETTERS = [
  { text: "Coming", className: "text-fg" },
  { text: " ", className: "" },
  { text: "soon", className: "text-brand" },
  { text: ".", className: "text-accent" },
].flatMap((part) => part.text.split("").map((char) => ({ char, className: part.className })));

const STAGGER = 0.045;

/**
 * The headline every unbuilt page shares.
 *
 * Letters rise out of a clipped slot one after another, then a hairline in the
 * brand colours draws out underneath with a spark running along it — the one
 * piece of the page that says "still being built" on a loop. `play` holds the
 * whole thing back, so a page can wait for its own visual to finish first.
 *
 * Opacity rides along with the rise so that, with reduced motion on (which
 * skips transforms), the letters still fade in rather than popping.
 */
export function ComingSoonHeadline({
  play = true,
  delay = 0,
  className,
}: {
  play?: boolean;
  delay?: number;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const letter: Variants = {
    hidden: { y: "110%", rotate: 7, opacity: 0 },
    shown: (i: number) => ({
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: { duration: 0.9, ease, delay: delay + i * STAGGER },
    }),
  };

  const rule: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    shown: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 1.1, ease, delay: delay + LETTERS.length * STAGGER + 0.15 },
    },
  };

  return (
    <motion.h1
      initial="hidden"
      animate={play ? "shown" : "hidden"}
      className={cn(
        "font-display text-[clamp(3.1rem,13vw,4.5rem)] leading-[0.9] font-semibold tracking-[-0.045em] md:text-[clamp(4.25rem,7.6vw,6.25rem)]",
        className,
      )}
    >
      <span className="sr-only">Coming soon</span>
      {/* The padding gives descenders room inside the clip; the negative
          margin takes it back out of the layout. */}
      <span aria-hidden className="-mb-[0.16em] block overflow-hidden pb-[0.16em] whitespace-nowrap">
        {LETTERS.map(({ char, className: tone }, i) => (
          <motion.span key={i} custom={i} variants={letter} className={cn("inline-block", tone)}>
            {char === " " ? "\u00a0" : char}
          </motion.span>
        ))}
      </span>

      <motion.span
        aria-hidden
        variants={rule}
        className="rule-brand relative mx-auto mt-5 block w-[min(100%,24rem)] origin-center overflow-hidden"
      >
        {!reducedMotion && (
          <motion.span
            className="absolute inset-0"
            initial={{ x: "-100%" }}
            animate={play ? { x: "100%" } : undefined}
            transition={{
              duration: 2.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.9,
              delay: delay + LETTERS.length * STAGGER + 1.1,
            }}
          >
            <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          </motion.span>
        )}
      </motion.span>
    </motion.h1>
  );
}
