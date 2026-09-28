"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { ChessBoardCanvas } from "@/features/chess-id/ChessBoardCanvas";

/**
 * The board on a pinned stage.
 *
 * The stage stays put while the page scrolls past it, and scroll progress
 * moves the camera through the shots in `STORY_POSES`.
 */
export function ChessIdStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  return (
    <section ref={sectionRef} aria-label="Chess ID" className="relative h-[440vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Stage light: the site's orange sunrise under the board, a blue haze above. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-[30%] left-1/2 h-[70%] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.2),transparent)]" />
          <div className="absolute -top-[20%] left-[10%] h-[60%] w-[60%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(44_143_227/0.12),transparent)]" />
        </div>

        <ChessBoardCanvas progress={scrollYProgress} className="absolute inset-0" />
      </div>
    </section>
  );
}
