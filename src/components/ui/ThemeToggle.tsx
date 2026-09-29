"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme, useTheme } from "@/theme/theme";
import { cn } from "@/lib/utils";

/**
 * Switches between the dark and light themes.
 *
 * Shows the theme you're in — a moon at night, a sun by day — and turns into
 * the other as the page crossfades. Both icons and both tooltip lines are in
 * the markup and `data-theme` picks between them in CSS, so the button is
 * right on the first paint even though React only learns the stored theme
 * after hydration. Only the accessible name waits for that render.
 */
export function ThemeToggle({
  className,
  tooltipAlign = "center",
}: {
  className?: string;
  /** `end` keeps the tooltip on screen when the button sits at the right edge. */
  tooltipAlign?: "center" | "end";
}) {
  const theme = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={cn(
        "group relative flex size-9 shrink-0 items-center justify-center rounded-full border border-tint/10 text-muted",
        "transition-colors duration-300 hover:border-accent/60 hover:text-fg",
        // A 44px target around a 36px circle, so it's easy to hit on a phone
        // without crowding the bar.
        "before:absolute before:-inset-1 before:rounded-full",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative size-4 transition-transform duration-500 ease-out group-hover:rotate-[18deg]"
      >
        <Moon className="theme-icon theme-icon-moon absolute inset-0 size-4" />
        <Sun className="theme-icon theme-icon-sun absolute inset-0 size-4" />
      </span>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-full z-10 mt-2.5 translate-y-1 rounded-lg border border-tint/10 bg-popover px-2.5 py-1.5 whitespace-nowrap",
          tooltipAlign === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
          "font-display text-[0.58rem] font-semibold tracking-[0.16em] text-fg uppercase opacity-0 shadow-[var(--shadow-popover)] backdrop-blur-xl",
          "transition-[opacity,translate] duration-200 ease-out",
          "group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
        )}
      >
        <span className="theme-label-dark">Switch to light mode</span>
        <span className="theme-label-light">Switch to dark mode</span>
      </span>
    </button>
  );
}
