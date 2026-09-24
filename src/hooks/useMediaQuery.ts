"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without a mount effect.
 *
 * The obvious `useState` + `useEffect` version writes state during the first
 * commit, which costs a second render on every mount and trips React's
 * set-state-in-effect rule. `useSyncExternalStore` is what this API is for: it
 * reads the current value during render and falls back to `false` on the server.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True for mouse/trackpad/pen; false on touch-only devices. */
export function useHasFinePointer() {
  return useMediaQuery("(pointer: fine)");
}
