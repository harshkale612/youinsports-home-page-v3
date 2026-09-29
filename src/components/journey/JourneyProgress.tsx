"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { QUESTION_STEPS, type JourneyStep, type QuestionStep } from "@/types/journey";

const LABELS: Record<QuestionStep, string> = {
  sport: "Sport",
  environment: "Place",
  competition: "Competition",
  level: "Level",
  goal: "Goal",
};

/**
 * Editorial progress indicator.
 *
 * Deliberately not a checkout stepper: numbered, letter-spaced, with a single
 * rule that fills. It tells the athlete where they are without making the
 * conversation feel like a form they are submitting.
 */
export function JourneyProgress({
  step,
  onStepSelect,
}: {
  step: JourneyStep;
  /** Jump back to an answered question. Forward steps stay locked. */
  onStepSelect?: (step: QuestionStep) => void;
}) {
  const index = QUESTION_STEPS.indexOf(step as QuestionStep);
  if (index === -1) return null;

  const progress = (index + 1) / QUESTION_STEPS.length;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[0.6rem] font-semibold tracking-[0.28em] text-faint uppercase">
          Your journey
        </p>
        <p className="tabular font-display text-[0.6rem] font-semibold tracking-[0.2em] text-muted">
          {String(index + 1).padStart(2, "0")}
          <span className="text-faint"> / {String(QUESTION_STEPS.length).padStart(2, "0")}</span>
        </p>
      </div>

      <div className="relative mt-3 h-px w-full bg-tint/12">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-orange shadow-[0_0_10px_rgb(var(--orange-rgb)/calc(0.6*var(--glow)))]"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Six letter-spaced names do not fit a phone without clipping mid-word,
          and the rule plus the counter already say where you are — so the names
          are a tablet-and-up refinement, not the primary signal. */}
      <ol className="mt-3 hidden gap-x-5 sm:flex sm:flex-wrap">
        {QUESTION_STEPS.map((questionStep, i) => {
          const isCurrent = i === index;
          const isAnswered = i < index;
          const canReturn = isAnswered && Boolean(onStepSelect);

          return (
            <li key={questionStep} className="shrink-0">
              <button
                type="button"
                disabled={!canReturn}
                onClick={() => onStepSelect?.(questionStep)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "font-display text-[0.58rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300",
                  isCurrent ? "text-orange" : isAnswered ? "text-accent" : "text-faint/60",
                  canReturn && "hover:text-fg",
                  !canReturn && "cursor-default",
                )}
              >
                {LABELS[questionStep]}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
