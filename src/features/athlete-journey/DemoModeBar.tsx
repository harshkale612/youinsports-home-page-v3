"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_PERSONAS } from "@/features/athlete-journey/journey-data";
import { useJourney } from "@/stores/journeyStore";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Investor-demo controls.
 *
 * Loads a complete persona straight to the analysis so the whole story can be
 * walked through in seconds, and switches between four very different athletes
 * to show the experience is driven by the answers rather than scripted. Kept
 * visually quiet and out of the way — it is a presenter's tool, not a feature.
 */
export function DemoModeBar({ onLoad }: { onLoad: () => void }) {
  const [open, setOpen] = useState(false);
  const loadPersona = useJourney((s) => s.loadPersona);
  const reset = useJourney((s) => s.reset);
  const activeId = useJourney((s) => s.demoPersonaId);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.28, ease }}
            className="pointer-events-auto w-[17.5rem] rounded-2xl border border-white/10 bg-[rgba(6,22,34,0.92)] p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[0.55rem] font-semibold tracking-[0.22em] text-faint uppercase">
                Demo personas
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close demo panel"
                className="text-faint transition-colors hover:text-fg"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>

            <ul className="mt-3 flex flex-col gap-1.5">
              {DEMO_PERSONAS.map((persona) => (
                <li key={persona.id}>
                  <button
                    type="button"
                    onClick={() => {
                      loadPersona(persona);
                      trackEvent("demo_persona_loaded", { persona: persona.id });
                      onLoad();
                    }}
                    aria-pressed={activeId === persona.id}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 text-left transition-colors duration-250",
                      activeId === persona.id
                        ? "border-accent bg-accent-soft"
                        : "border-white/10 hover:border-white/28 hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="block font-display text-[0.78rem] font-semibold tracking-tight text-fg">
                      {persona.label}
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted">
                      {persona.summary}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                reset();
                trackEvent("journey_reset");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 font-display text-[0.58rem] font-semibold tracking-[0.18em] text-muted uppercase transition-colors hover:border-white/28 hover:text-fg"
            >
              <RotateCcw className="size-3" aria-hidden />
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/12 bg-[rgba(6,22,34,0.82)] px-4 py-2.5 font-display text-[0.55rem] font-semibold tracking-[0.2em] text-muted uppercase backdrop-blur-xl transition-colors hover:border-accent/60 hover:text-fg"
      >
        <Play className="size-3" aria-hidden />
        Demo mode
      </button>
    </div>
  );
}
