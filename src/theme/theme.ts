import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_COLOR,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/theme/theme-config";

export type { Theme };

/**
 * The site theme: which of the two palettes in `globals.css` is showing.
 *
 * The DOM is the store. `<html data-theme>` is set before first paint by
 * `THEME_INIT_SCRIPT`, and every colour on the page reads from CSS variables
 * keyed on it — so switching is one attribute write, not a React re-render.
 * The few things that draw outside CSS (the globe's canvas) read `getTheme()`
 * per frame, and the components that need the value in markup (the toggle's
 * label) subscribe through `useTheme()`.
 */

export function getTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * How the globe should follow a switch. When the page crossfades through a
 * view transition the canvas snaps, because the crossfade already blends it;
 * in the fallback it eases alongside the CSS colour transition.
 */
export const themeMotion = { snap: false };

const listeners = new Set<() => void>();

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[theme]);
  for (const listener of listeners) listener();
}

export function setTheme(theme: Theme) {
  if (theme === getTheme()) return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or storage disabled: the switch still works for this visit.
  }

  const root = document.documentElement;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    themeMotion.snap = true;
    apply(theme);
    return;
  }

  // A crossfade of the whole page: gradients, the canvas and every surface
  // change together, which per-property transitions can't do.
  if (typeof document.startViewTransition === "function") {
    themeMotion.snap = true;
    root.setAttribute("data-theme-switching", "");
    const transition = document.startViewTransition(() => apply(theme));
    transition.finished.finally(() => root.removeAttribute("data-theme-switching"));
    return;
  }

  themeMotion.snap = false;
  root.setAttribute("data-theme-easing", "");
  apply(theme);
  window.setTimeout(() => root.removeAttribute("data-theme-easing"), 420);
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

/** Another tab switched: follow it, without a crossfade nobody asked for. */
function onStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  const next: Theme = event.newValue === "light" ? "light" : "dark";
  if (next === getTheme()) return;
  themeMotion.snap = true;
  apply(next);
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * The current theme, for markup that has to say it out loud. The server (and
 * hydration) see the default and the real value lands on the next render —
 * which is why anything *visual* keys off `data-theme` in CSS instead.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
}
