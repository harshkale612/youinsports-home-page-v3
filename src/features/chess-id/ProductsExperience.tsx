"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { ChessIdStory } from "@/features/chess-id/ChessIdStory";
import { ChessServices } from "@/features/chess-id/ChessServices";
// Pricing is hidden for now — uncomment this and <ChessPricing /> below to show it again.
// import { ChessPricing } from "@/features/chess-id/ChessPricing";
import { trackEvent } from "@/lib/analytics";

/**
 * The Products page: the smart chessboard's story, what it does, and what it
 * costs to own or rent (that last part is commented out until pricing is ready
 * to show).
 *
 * `reducedMotion="user"` hands every entrance on the page to the OS setting —
 * with reduced motion on, things fade in where they are instead of travelling.
 */
export function ProductsExperience() {
  useEffect(() => {
    trackEvent("products_viewed");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SiteNav />

      <main className="relative overflow-x-clip">
        <ChessIdStory />
        <ChessServices />
        {/* <ChessPricing /> */}
      </main>
    </MotionConfig>
  );
}
