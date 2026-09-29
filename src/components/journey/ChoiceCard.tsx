"use client";

import { motion } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * One answer.
 *
 * A real `<button>` with `aria-pressed`, never a styled div: the whole
 * conversation has to be answerable from the keyboard, and selection state has
 * to reach a screen reader without depending on the colour change.
 */
export function ChoiceCard({
  label,
  detail,
  icon: Icon,
  selected,
  index = 0,
  size = "md",
  onSelect,
  onPreview,
  onPreviewEnd,
}: {
  label: string;
  detail?: string;
  icon?: LucideIcon;
  selected: boolean;
  /** Position in the grid, used only to stagger the entrance. */
  index?: number;
  size?: "sm" | "md";
  onSelect: () => void;
  onPreview?: () => void;
  onPreviewEnd?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      // Focus previews too, so a keyboard user gets the same live response from
      // the globe that a mouse user does.
      onFocus={onPreview}
      onBlur={onPreviewEnd}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay: Math.min(index * 0.028, 0.35) }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border text-left transition-all duration-300",
        size === "md" ? "px-4 py-3.5 md:px-5 md:py-4" : "px-3.5 py-3",
        selected
          ? "border-accent bg-[image:var(--surface-choice-selected)] shadow-[var(--shadow-choice-selected)]"
          : "border-[var(--glass-border)] bg-choice shadow-[var(--shadow-choice)] backdrop-blur-sm hover:-translate-y-px hover:border-accent/45 hover:bg-choice-hover hover:shadow-[var(--shadow-tile-hover)]",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0 transition-colors duration-300",
            selected ? "text-accent" : "text-faint group-hover:text-muted",
          )}
          aria-hidden
        />
      )}

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-display font-semibold tracking-tight transition-colors duration-300",
            size === "md" ? "text-[0.95rem]" : "text-[0.85rem]",
            selected ? "text-fg" : "text-fg/90",
          )}
        >
          {label}
        </span>
        {detail && (
          <span className="mt-1 block text-[0.78rem] leading-snug text-muted">{detail}</span>
        )}
      </span>

      {/* Reinforces selection with a shape, not just a hue — the accent alone
          is not enough for a colour-blind user. */}
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          selected ? "border-accent bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/var(--glow))]" : "border-tint/20 group-hover:border-accent/50",
        )}
      >
        {selected && <Check className="size-2.5 text-white" strokeWidth={3} />}
      </span>
    </motion.button>
  );
}
