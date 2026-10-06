"use client";

import { Fragment } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { ChessKnight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const ease = [0.16, 1, 0.3, 1] as const;

const LETTERS = "Chessboard".split("");
const STAGGER = 0.055;

const TAGLINE = [
  { text: "Real pieces." },
  { text: "Real board." },
  { text: "Real record.", strong: true },
].flatMap((phrase) => phrase.text.split(" ").map((word) => ({ word, strong: phrase.strong })));

/** Share of the story's scroll over which the title clears the stage. */
const EXIT = 0.1;

/**
 * The product's name, over the board.
 *
 * The letters rise one by one in the board's own materials — porcelain and
 * silver at night, lacquer by day — and a glint in the logo's colours crosses
 * them now and then, the way light runs over the polished pieces. As the story
 * starts the title lifts away, and the camera's first move hands its room back
 * to the board.
 *
 * The type is sized against the viewport's height as well as its width, so on
 * a short laptop screen the title stays a band above the board rather than
 * taking half the stage. The width term is set for the whole ten-letter word,
 * so on a phone it still fits the screen with the page's margins either side.
 */
export function ChessTitle({ progress }: { progress: MotionValue<number> }) {
  const reducedMotion = usePrefersReducedMotion();
  // The title has to leave either way — the board grows into its room — so
  // reduced motion keeps the fade and only drops the travel.
  //
  // Both ranges run to the end of the story on purpose. Motion hands a
  // scroll-linked opacity to the browser as a scroll-driven animation, and a
  // range that stopped at `EXIT` would leave it no keyframe at the end: the
  // browser then eases back to the element's own opacity, and the title
  // fades back in over the rest of the story.
  const opacity = useTransform(progress, [0, EXIT, 1], [1, 0, 0]);
  const y = useTransform(progress, [0, EXIT, 1], reducedMotion ? [0, 0, 0] : [0, -56, -56]);

  return (
    <motion.div style={{ opacity, y }} className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
      {/* A pool of light the name stands in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[150%] w-[min(140%,56rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/calc(0.16*var(--glow))),rgb(var(--orange-rgb)/calc(0.05*var(--glow)))_60%,transparent)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
        className="flex items-center gap-3 font-display text-[0.62rem] font-semibold tracking-[0.3em] text-orange uppercase sm:text-[0.68rem]"
      >
        <span className="h-px w-7 bg-gradient-to-r from-transparent to-orange sm:w-10" aria-hidden />
        <ChessKnight className="size-3.5 -translate-y-px" strokeWidth={2.2} aria-hidden />
        Products
        <span className="h-px w-7 bg-gradient-to-l from-transparent to-orange sm:w-10" aria-hidden />
      </motion.p>

      <h1 id="chess-heading" className="relative mt-[clamp(0.6rem,1.6svh,1.1rem)] font-display text-[clamp(2.5rem,min(15.5vw,12.5svh),8.75rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
        <span className="sr-only">Chessboard</span>
        {/* Each letter rises out of the same slot; the padding gives the
            descenders room inside the clip and the negative margin takes it
            back out of the layout. The sides get room too, so the last
            letter's curve isn't clipped where the tight tracking runs it
            past its box. */}
        <span aria-hidden className="-mb-[0.14em] block overflow-hidden px-[0.12em] pb-[0.14em] whitespace-nowrap">
          {LETTERS.map((char, i) => (
            <motion.span
              key={i}
              // The tracking makes each letter's box narrower than its glyph,
              // and a text-clipped fill only paints inside the box — so each
              // box is widened by padding, and the negative margin keeps the
              // letters exactly where the tracking puts them.
              className="text-metal -mx-[0.1em] inline-block px-[0.1em]"
              initial={{ y: "110%", rotate: 7, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.95, ease, delay: 0.2 + i * STAGGER }}
            >
              {char}
            </motion.span>
          ))}
        </span>

        {/* The glint: the same word again, unkerned so its letters land on
            the separately set ones underneath, carrying only the light. */}
        <span
          aria-hidden
          className="text-sheen pointer-events-none absolute inset-x-0 top-0 animate-sheen px-[0.12em] whitespace-nowrap [font-kerning:none]"
        >
          {LETTERS.join("")}
        </span>
      </h1>

      <p className="mt-[clamp(0.75rem,2svh,1.4rem)] max-w-[22rem] text-pretty text-[0.95rem] leading-relaxed text-muted sm:max-w-none sm:text-[clamp(0.95rem,1.9svh,1.15rem)] [@media(max-height:520px)]:hidden">
        {TAGLINE.map(({ word, strong }, i) => (
          <Fragment key={i}>
            <motion.span
              className={strong ? "inline-block font-medium text-fg" : "inline-block"}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: 0.75 + i * 0.035 }}
            >
              {word}
            </motion.span>{" "}
          </Fragment>
        ))}
      </p>
    </motion.div>
  );
}
