"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

/**
 * Copies text on demand and reports how it went for a moment, then settles
 * back to idle so the same control can be used again.
 */
export function useCopyToClipboard(resetAfter = 2200) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      setState(ok ? "copied" : "failed");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), resetAfter);
      return ok;
    },
    [resetAfter],
  );

  return { state, copy };
}

/**
 * The async clipboard needs a secure context, so plain-http previews (a phone
 * on the LAN dev server) fall back to selecting a hidden textarea.
 */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
