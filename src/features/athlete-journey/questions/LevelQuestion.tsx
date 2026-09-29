"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { cn } from "@/lib/utils";
import { JOURNEY_LEVELS } from "@/data/journey-levels";
import type { JourneyLevel } from "@/types/journey";

/**
 * Question four — the ladder.
 *
 * Every other question in the flow is a bordered, padded card that visibly
 * invites a click or tap. The first version of this step was a bare list —
 * a small dot and two lines of plain text, no border, no fill — which read as
 * static copy rather than something you could act on, especially with no
 * hover state to reveal it on touch. Each rung is now the same card language
 * as the rest of the flow (border, background, a trailing check on select),
 * with the leading dot kept only to carry the ladder's own idea: rungs below
 * the one you pick visibly light up as "already climbed".
 *
 * Still a real radio group with roving tabindex and arrow-key movement,
 * because that is what a vertical progression actually is — the card
 * treatment changes how it looks, not what a screen reader announces.
 */
export function LevelQuestion({
  selected,
  onSelect,
  onBrowse,
  onBack,
}: {
  selected: JourneyLevel | null;
  /** Commits the answer. The flow moves on from here. */
  onSelect: (level: JourneyLevel) => void;
  /**
   * Moves the selection without committing it. Arrow keys call this so a
   * keyboard user can read their way down the ladder without the flow
   * advancing out from under them mid-browse.
   */
  onBrowse: (level: JourneyLevel) => void;
  onBack: () => void;
}) {
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // The ladder reads top-down as it's shown — international first, local last
  // — matching how the rungs are written in the data.
  const rungs = [...JOURNEY_LEVELS].reverse();
  const selectedOrder = selected ? JOURNEY_LEVELS.find((l) => l.id === selected)?.order ?? -1 : -1;

  function handleKeyDown(event: React.KeyboardEvent, visualIndex: number) {
    const delta =
      event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowDown" || event.key === "ArrowRight"
          ? 1
          : 0;
    if (delta === 0) return;

    event.preventDefault();
    const next = (visualIndex + delta + rungs.length) % rungs.length;
    itemsRef.current[next]?.focus();
    // Browse, not commit — Enter or Space on the focused rung is what answers.
    onBrowse(rungs[next].id);
  }

  return (
    <QuestionFrame
      acknowledgement="Almost there"
      question="Where are you in the journey?"
      hint="The level you compete at today. There is no wrong rung to be standing on."
      onBack={onBack}
    >
      <div
        role="radiogroup"
        aria-label="Your current level"
        className="flex max-w-sm flex-col gap-2.5"
      >
        {rungs.map((level, visualIndex) => {
          const isSelected = selected === level.id;
          const isBelow = selectedOrder >= 0 && level.order < selectedOrder;

          return (
            <button
              key={level.id}
              ref={(node) => {
                itemsRef.current[visualIndex] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              // Roving tabindex: one stop for the whole group, then arrows.
              tabIndex={isSelected || (selectedOrder === -1 && visualIndex === 0) ? 0 : -1}
              onClick={() => onSelect(level.id)}
              onKeyDown={(event) => handleKeyDown(event, visualIndex)}
              className={cn(
                "group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 sm:px-5 sm:py-4",
                isSelected
                  ? "border-accent bg-accent-soft"
                  : isBelow
                    ? "border-accent/30 bg-accent/[0.06] hover:border-accent/55 hover:bg-accent/[0.1]"
                    : "border-tint/12 bg-rung shadow-[var(--shadow-tile)] hover:border-tint/30 hover:bg-rung-hover hover:shadow-[var(--shadow-tile-hover)]",
              )}
            >
              {/* The rung indicator — the one thing this question keeps that a
                  plain ChoiceCard wouldn't have, since "already climbed" only
                  means something on a ladder. */}
              <span
                aria-hidden
                className={cn(
                  "relative flex size-[1.3rem] shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isSelected
                    ? "border-accent bg-accent"
                    : isBelow
                      ? "border-accent/50 bg-accent/25"
                      : "border-tint/20 bg-void group-hover:border-tint/40",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-300",
                    isSelected ? "bg-white" : isBelow ? "bg-accent" : "bg-tint/35",
                  )}
                />
                {isSelected && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-display text-[0.95rem] font-semibold tracking-tight transition-colors duration-300",
                    isSelected ? "text-fg" : "text-fg/90",
                  )}
                >
                  {level.label}
                </span>
                <span className="mt-0.5 block text-[0.78rem] leading-snug text-muted">
                  {level.description}
                </span>
              </span>

              {/* Same trailing check every other question in the flow uses —
                  the point is to look like the same kind of clickable thing. */}
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isSelected ? "border-accent bg-accent" : "border-tint/20",
                )}
              >
                {isSelected && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </QuestionFrame>
  );
}
