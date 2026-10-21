"use client";

import { FAQ_ENTRY_IDS } from "@/data/faq";
import { readHash, replaceHash } from "@/hooks/useLocationHash";

/**
 * Getting around the FAQ page. The URL's hash is the page's one record of
 * which answer is open (`#technical-2`), so a shared link opens exactly what
 * was being read. A topic's id in the hash (`#pricing`) is a link to that
 * topic's section; the page's own topic links scroll there without touching
 * the hash, which belongs to the open answer.
 */

/** How long an answer takes to open or fold away, in seconds. */
export const PANEL_DURATION = 0.5;

/** Closes an answer. */
export function closeEntry() {
  replaceHash(null);
}

/**
 * Opens an entry from anywhere on the page (the search, a shortcut) and
 * brings it into view. If an answer open above it is folding away, the
 * scroll waits for the fold to finish.
 */
export function openEntry(id: string) {
  const previous = readHash();
  replaceHash(id);
  // A frame for the entry to start opening before measuring.
  requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) return;
    if (foldsAbove(previous, id)) afterFold(previous, () => scrollToRest(target));
    else window.setTimeout(() => scrollToRest(target), 50);
  });
}

/** The id of an entry's answer panel, the part that opens and folds. */
export function answerPanelId(id: string) {
  return `${id}-answer`;
}

/**
 * Runs `then` once the entry `foldingId` has finished folding away: when its
 * answer panel has reached zero height. Watching the panel rather than the
 * clock means a fold that starts late, or runs slow, can't be cut short.
 * Gives up waiting after a while, and returns a cancel.
 */
export function afterFold(foldingId: string, then: () => void) {
  const panel = document.getElementById(answerPanelId(foldingId));
  if (!panel) {
    then();
    return () => {};
  }
  const stop = () => {
    observer.disconnect();
    window.clearTimeout(cap);
  };
  const finish = () => {
    stop();
    then();
  };
  const observer = new ResizeObserver(() => {
    if (panel.getBoundingClientRect().height < 1) finish();
  });
  const cap = window.setTimeout(finish, PANEL_DURATION * 1000 + 1500);
  observer.observe(panel);
  return stop;
}

/** A click the browser should handle itself: another button, or with a modifier key. */
export function isModified(event: React.MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Whether the entry `previousId` is open on screen above `id`, so closing it moves `id` up the page. */
export function foldsAbove(previousId: string | undefined, id: string) {
  if (!previousId || previousId === id || !FAQ_ENTRY_IDS.has(previousId)) return false;
  const previous = document.getElementById(previousId);
  const target = document.getElementById(id);
  if (!previous || !target || previous.getClientRects().length === 0) return false;
  return Boolean(previous.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/**
 * Brings `element` to the top of the screen, below the bar, measured where it
 * will come to rest: content rises into place as it's revealed, and a scroll
 * aimed at something mid-rise would leave it short once it lands.
 */
export function scrollToRest(element: HTMLElement) {
  let top = element.getBoundingClientRect().top + window.scrollY;
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const { transform } = getComputedStyle(node);
    if (transform !== "none") top -= new DOMMatrixReadOnly(transform).m42;
  }
  top -= parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  window.scrollTo({ top, behavior: scrollBehavior() });
}

export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
