"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Move } from "lucide-react";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { useHasFinePointer } from "@/hooks/useMediaQuery";

/**
 * Teaches the globe interaction, then gets out of the way.
 *
 * A persistent custom cursor would be a trope; what the page actually needs is
 * for a first-time visitor to discover that the planet is draggable. So: the
 * cursor becomes a grab handle over the scene, a marker turns it into a
 * pointer, and a single hint appears in the hero until the user drags once.
 */
export function GlobeAffordance() {
  const [showHint, setShowHint] = useState(false);
  const hoveredAthleteId = useGlobalExperience((s) => s.hoveredAthleteId);
  const isSceneReady = useGlobalExperience((s) => s.isSceneReady);
  const earthScene = useGlobalExperience((s) => s.earthScene);

  // Hover-capable pointers only — there is nothing to teach about a cursor on
  // a touchscreen, where dragging the globe is already the obvious gesture.
  const isPointerFine = useHasFinePointer();

  useEffect(() => {
    if (!isPointerFine || !isSceneReady) return;
    const timer = setTimeout(() => setShowHint(true), 2600);
    return () => clearTimeout(timer);
  }, [isPointerFine, isSceneReady]);

  // Dismiss on the first real drag, checked on a slow interval rather than by
  // subscribing every pointer move.
  useEffect(() => {
    if (!showHint) return;
    const interval = setInterval(() => {
      if (Math.abs(earthMotion.dragRotationY) > 0.05) {
        setShowHint(false);
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [showHint]);

  useEffect(() => {
    if (!isPointerFine) return;
    document.body.style.cursor = hoveredAthleteId ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hoveredAthleteId, isPointerFine]);

  if (!isPointerFine) return null;

  return (
    <AnimatePresence>
      {showHint && earthScene === "hero" && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed right-8 bottom-32 z-20 hidden items-center gap-2 rounded-full border border-white/10 bg-[rgba(4,15,24,0.88)] px-4 py-2 font-display text-[0.58rem] font-semibold tracking-[0.18em] text-muted uppercase backdrop-blur-md xl:flex"
        >
          <Move className="size-3 text-accent" aria-hidden />
          Drag to rotate the globe
        </motion.p>
      )}
    </AnimatePresence>
  );
}
