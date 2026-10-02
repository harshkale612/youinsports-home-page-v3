"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { ChessBoardCanvas } from "@/features/chess-id/ChessBoardCanvas";
import { ChessTitle } from "@/features/chess-id/ChessTitle";

/**
 * The board on a pinned stage, under its title.
 *
 * The stage stays put while the page scrolls past it, and scroll progress
 * moves the camera through the shots in `STORY_POSES`. The title's band is
 * measured and handed to the scene, so the opening shot frames the board in
 * the room left beneath it at every screen size.
 */
export function ChessIdStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [headroom, setHeadroom] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    // The border box, so the padding that clears the nav bar counts too.
    const observer = new ResizeObserver(([entry]) => {
      setHeadroom(entry.borderBoxSize?.[0]?.blockSize ?? title.offsetHeight);
    });
    observer.observe(title, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="chess-heading" className="relative h-[440vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Stage light: the site's orange sunrise under the board, a blue haze above. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-[30%] left-1/2 h-[70%] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.2),transparent)]" />
          <div className="absolute -top-[20%] left-[10%] h-[60%] w-[60%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(44_143_227/0.12),transparent)]" />
        </div>

        <ChessBoardCanvas progress={scrollYProgress} headroom={headroom} className="absolute inset-0" />

        {/* Clears the fixed nav bar above it. The bottom padding is the gap
            above the board: the opening shot fits the board right up to it. */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-[clamp(5.5rem,13.5svh,9.5rem)] pb-[clamp(1.25rem,5svh,3.5rem)] md:px-10"
        >
          <ChessTitle progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
