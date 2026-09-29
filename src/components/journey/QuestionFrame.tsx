"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Shared shell for a single question.
 *
 * Every question gets the same three parts — an acknowledgement of the previous
 * answer, the question itself, and the choices — which is what makes the
 * sequence read as one conversation rather than six separate screens.
 */
export function QuestionFrame({
  /** Short reaction to what was just answered, e.g. "Nice. Cricket it is." */
  acknowledgement,
  question,
  hint,
  onBack,
  className,
  children,
}: {
  acknowledgement?: string;
  question: string;
  hint?: string;
  onBack?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      {acknowledgement && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-2.5 rounded-full border border-orange/30 bg-orange-soft py-1.5 pr-3.5 pl-2.5 font-display text-[0.66rem] font-semibold tracking-[0.2em] text-orange-strong uppercase"
        >
          <span className="size-1.5 rounded-full bg-orange shadow-[0_0_8px_rgb(var(--orange-rgb)/var(--glow))]" aria-hidden />
          {acknowledgement}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        className={cn("display-md text-balance text-fg", acknowledgement ? "mt-4" : "mt-0")}
      >
        {question}
      </motion.h2>

      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.14 }}
          className="mt-3 max-w-md text-pretty text-[0.92rem] leading-relaxed text-muted"
        >
          {hint}
        </motion.p>
      )}

      <div className="mt-7">{children}</div>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-7 inline-flex items-center gap-2 font-display text-[0.62rem] font-semibold tracking-[0.2em] text-faint uppercase transition-colors duration-300 hover:text-fg"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Back
        </button>
      )}
    </div>
  );
}
