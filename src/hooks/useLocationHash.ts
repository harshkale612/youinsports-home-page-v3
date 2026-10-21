"use client";

import { useSyncExternalStore } from "react";

/**
 * `history.replaceState` changes the hash without firing `hashchange`, so
 * {@link replaceHash} announces its own changes with this event instead.
 * Listeners that should only hear outside changes (the address bar, a link)
 * keep listening to `hashchange` alone.
 */
const HASH_REPLACED = "hashreplace";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(HASH_REPLACED, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(HASH_REPLACED, onChange);
  };
}

/** The URL's fragment without its "#", decoded. */
export function readHash() {
  const raw = window.location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * The URL's fragment, kept in sync as it changes. The server has no hash,
 * so it renders `""` and the real value arrives right after hydration.
 */
export function useLocationHash() {
  return useSyncExternalStore(subscribe, readHash, () => "");
}

/**
 * Points the URL at `id`, or at no fragment at all, in place: no history
 * entry, and no jump to the element.
 */
export function replaceHash(id: string | null) {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", id ? `#${encodeURIComponent(id)}` : pathname + search);
  window.dispatchEvent(new Event(HASH_REPLACED));
}
