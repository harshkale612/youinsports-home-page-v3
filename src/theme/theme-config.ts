/**
 * Theme constants, safe to import from Server Components (the root layout
 * inlines the init script). The runtime lives in `theme.ts`.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "youinsports-theme";

/** Dark is the site's first identity; light is opt-in. */
export const DEFAULT_THEME: Theme = "dark";

/** Browser chrome colour per theme; matches `--color-void`. */
export const THEME_COLOR: Record<Theme, string> = {
  dark: "#030b12",
  light: "#f6f4ef",
};

/**
 * Runs in `<head>`, before the body is parsed, so the stored theme is on the
 * page for the very first paint — no flash of the other one. Kept tiny and
 * dependency-free on purpose: it is inlined into every document.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(t!=="light"&&t!=="dark")t=${JSON.stringify(DEFAULT_THEME)};d.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?${JSON.stringify(
  THEME_COLOR.light,
)}:${JSON.stringify(THEME_COLOR.dark)})})();`;
