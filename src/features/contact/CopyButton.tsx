"use client";

import { motion } from "motion/react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard, type CopyState } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const ICONS = { idle: Copy, copied: Check, failed: X } as const;

/**
 * A copy button that answers back: its label rolls over to say it worked,
 * then rolls back. All three labels share one grid cell, so the button keeps
 * the width of the longest and never jumps as the label changes.
 */
export function CopyButton({
  text,
  label,
  copiedLabel = "Copied",
  onCopied,
  variant = "secondary",
  size = "md",
  className,
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  onCopied?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}) {
  const { state, copy } = useCopyToClipboard();
  const labels: Record<CopyState, string> = { idle: label, copied: copiedLabel, failed: "Couldn't copy" };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={async () => {
          if (await copy(text)) onCopied?.();
        }}
      >
        <span className="grid">
          {(Object.keys(labels) as CopyState[]).map((key) => {
            const Icon = ICONS[key];
            const shown = key === state;
            return (
              <motion.span
                key={key}
                aria-hidden={!shown}
                initial={false}
                animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : key === "idle" ? -10 : 10 }}
                transition={{ duration: 0.32, ease }}
                className={cn(
                  "inline-flex items-center justify-center gap-2 [grid-area:1/1]",
                  key === "copied" && "text-accent-strong",
                  variant === "primary" && "text-ink",
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {labels[key]}
              </motion.span>
            );
          })}
        </span>
      </Button>
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : labels[state]}
      </span>
    </>
  );
}
