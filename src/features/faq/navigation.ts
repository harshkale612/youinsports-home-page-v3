"use client";

import { FAQ_ENTRY_IDS } from "@/data/faq";
import { readHash, replaceHash } from "@/hooks/useLocationHash";

/**
 * Getting around the FAQ page: to a category, or straight to an answer. The
 * hero's shortcuts and the list itself share these, so every way in lands
 * the same way.
 */

/** How long an answer takes to open or fold away, in seconds. */
export const PANEL_DURATION = 0.5;

/**
 * Opens an entry from elsewhere on the page and brings it into view. Opening
 * it closes whichever was open; if that one sits above, its fold carries the
 * entry up the page, so the scroll waits for the fold to finish.
 */
export function openEntry(id: string) {
  const previous = readHash();
  replaceHash(id);
  const target = document.getElementById(id);
  if (!target) return;
  if (foldsAbove(previous, id)) afterFold(previous, () => scrollToRest(target));
  else window.setTimeout(() => scrollToRest(target), 50);
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

/**
 * Glides to a category rather than jumping, and leaves the hash alone: the
 * hash belongs to the open entry. A modified click still opens the anchor
 * the browser's own way (a new tab, say).
 */
export function jumpToCategory(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  if (isModified(event)) return;
  const section = document.getElementById(id);
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  section.focus({ preventScroll: true });
}

/** A click the browser should handle itself: another button, or with a modifier key. */
export function isModified(event: React.MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Whether the entry `previousId` is open above `id`, so closing it moves `id` up the page. */
export function foldsAbove(previousId: string | undefined, id: string) {
  if (!previousId || previousId === id || !FAQ_ENTRY_IDS.has(previousId)) return false;
  const previous = document.getElementById(previousId);
  const target = document.getElementById(id);
  return Boolean(previous && target && previous.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/**
 * Brings `element` to the top of the screen, below the bar, measured where it
 * will come to rest: entries rise into place as they're revealed, and a
 * scroll aimed at one mid-rise would leave it short of the bar once it lands.
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
