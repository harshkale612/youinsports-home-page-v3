/** Brand blue, as a hue. The accent colours themselves are fixed hex tokens in `globals.css`. */
export const DEFAULT_ACCENT_HUE = 208;

/**
 * Sets `--accent-hue`. The brand accent no longer derives from it — the UI keeps
 * the brand colours whatever sport is chosen — so this only affects anything
 * still written against the raw hue.
 */
export function setAccentHue(hue: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent-hue", String(hue));
}

/**
 * Drops back to the brand hue. The onboarding flow retints the page per sport,
 * and that override lives on `documentElement` — without this it would survive a
 * client-side navigation and leave the homepage tinted lime.
 */
export function resetAccentHue() {
  if (typeof document === "undefined") return;
  document.documentElement.style.removeProperty("--accent-hue");
}
