"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { FaqSearch } from "@/features/faq/FaqSearch";
import { isModified, openEntry } from "@/features/faq/navigation";
import { ENTRIES, FAQ_TOPICS, VIDEO_ENTRIES } from "@/features/faq/topics";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** "How can we" in the page ink, then "help" in the logo's orange and a blue question mark. */
const LINE_ONE = "How can we".split("");
const LINE_TWO = [
  ..."help".split("").map((char) => ({ char, className: "text-brand" })),
  { char: "?", className: "text-accent" },
];

/** When each part of the entrance starts, in seconds. */
const LINE_ONE_AT = 0.15;
const LINE_TWO_AT = 0.5;
const LETTER_STEP = 0.045;
const STROKE_AT = LINE_TWO_AT + LINE_TWO.length * LETTER_STEP + 0.25;
const SEARCH_AT = 0.85;

/** Shortcuts under the search: a short label, and the entry it opens. */
const POPULAR = [
  { id: "technical-2", label: "Reset my password" },
  { id: "pricing-3", label: "Cancel anytime" },
  { id: "getting-started-2", label: "Account types" },
  { id: "aichess-3", label: "Fix a PGN file" },
];

/** The topics' marks, floating at the sides on wide screens. Where each sits, and its tilt. */
const FLOATERS = [
  { x: "7%", y: "30%", rotate: -8 },
  { x: "15%", y: "64%", rotate: 6 },
  { x: "5%", y: "84%", rotate: -4 },
  { x: "88%", y: "26%", rotate: 7 },
  { x: "93%", y: "58%", rotate: -6 },
  { x: "83%", y: "82%", rotate: 5 },
];

/**
 * The top of the FAQ page: the question it answers, set large, and a search
 * over every answer right under it.
 *
 * The heading builds letter by letter and a blue stroke draws itself under
 * "help"; then the search rises in, with the most-asked questions beneath
 * it. Behind, rings turn slowly round the heading and, on wide screens, the
 * topics' marks float at the sides.
 */
export function FaqHero() {
  return (
    // Above the sections that follow, so the search's results can open over them.
    <section
      aria-labelledby="faq-heading"
      className="relative isolate z-10 pt-36 pb-24 md:pt-44 md:pb-32"
    >
      <HeroBackdrop />

      <Container className="relative flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="inline-flex items-center gap-2.5 rounded-full border border-tint/10 bg-[var(--glass-bg)] py-1.5 pr-4 pl-3 text-[0.75rem] text-muted shadow-[var(--shadow-float)] backdrop-blur-md"
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-orange" />
            <span className="relative size-2 rounded-full bg-orange shadow-[0_0_10px_rgb(var(--orange-rgb)/var(--glow))]" />
          </span>
          <span className="font-semibold text-fg">Help centre</span>
          <span aria-hidden className="h-3 w-px bg-tint/15" />
          <span>
            {ENTRIES.size} answers · {VIDEO_ENTRIES.length} video guides
          </span>
        </motion.p>

        <h1
          id="faq-heading"
          className="mt-8 font-display text-[clamp(3.4rem,14vw,8.5rem)] leading-[0.9] font-semibold tracking-[-0.05em] text-fg"
        >
          <span className="sr-only">How can we help?</span>
          {/* Each letter rises out of its line's clip; the padding gives the
              descenders room inside it. */}
          <span aria-hidden className="-mb-[0.14em] block overflow-hidden pb-[0.14em] whitespace-nowrap">
            {LINE_ONE.map((char, i) => (
              <Letter key={i} char={char} delay={LINE_ONE_AT + i * LETTER_STEP} />
            ))}
          </span>
          <span aria-hidden className="relative mx-auto block w-fit">
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em] whitespace-nowrap">
              {LINE_TWO.map(({ char, className }, i) => (
                <Letter key={i} char={char} className={className} delay={LINE_TWO_AT + i * LETTER_STEP} />
              ))}
            </span>
            <Stroke />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease, delay: SEARCH_AT - 0.15 }}
          className="mt-9 max-w-xl text-lg leading-relaxed text-pretty text-muted md:text-xl"
        >
          Search every answer, browse them by topic, or watch a quick walkthrough.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: SEARCH_AT }}
          className="mt-10 flex w-full justify-center"
        >
          <FaqSearch />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: SEARCH_AT + 0.2 }}
          className="mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2"
        >
          <span className="mr-1 font-display text-[0.62rem] font-semibold tracking-[0.22em] text-faint uppercase">
            Popular
          </span>
          {POPULAR.map(({ id, label }) => {
            const entry = ENTRIES.get(id);
            return entry ? (
              <a
                key={id}
                href={`#${id}`}
                aria-label={entry.question}
                onClick={(event) => {
                  if (isModified(event)) return;
                  event.preventDefault();
                  openEntry(id);
                  trackEvent("faq_question_opened", { id, from: "hero" });
                }}
                className="rounded-full border border-tint/10 bg-tint/[0.03] px-3.5 py-1.5 text-[0.82rem] text-muted transition-[color,border-color,background-color,translate] duration-300 hover:-translate-y-0.5 hover:border-orange-line hover:bg-orange-soft hover:text-fg"
              >
                {label}
              </a>
            ) : null;
          })}
        </motion.div>
      </Container>
    </section>
  );
}

function Letter({ char, className, delay }: { char: string; className?: string; delay: number }) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ y: "110%", rotate: 7, opacity: 0 }}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {char === " " ? " " : char}
    </motion.span>
  );
}

/**
 * A brushed blue stroke under "help", drawn left to right once the letters
 * have landed. It stretches with the word, so its weight grows with the type.
 */
function Stroke() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.06em] left-[-2%] h-[0.22em] w-[80%] overflow-visible"
    >
      <defs>
        <linearGradient id="faq-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="var(--brand-blue)" />
          <stop offset="1" stopColor="#7cc0f5" />
        </linearGradient>
      </defs>
      <motion.path
        d="M4 17 C 60 9, 150 4, 296 9"
        fill="none"
        stroke="url(#faq-stroke)"
        strokeWidth={6}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.9, ease, delay: STROKE_AT },
          opacity: { duration: 0.2, delay: STROKE_AT },
        }}
      />
    </svg>
  );
}

/**
 * The page's sky: a dotted field, two drifting washes in the logo's colours,
 * rings turning slowly round the heading, and the topics' marks floating at
 * the sides on wide screens.
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,rgb(var(--accent-rgb)/0.035),transparent_70%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(var(--dot-field)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_42%,black,transparent_75%)]" />
      <div className="absolute top-[8%] -left-56 size-[46rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.13),transparent_62%)]" />
      <div className="absolute -top-40 -right-48 size-[50rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.15),transparent_62%)] [animation-delay:-9s]" />

      {/* Rings round the heading, fading out towards the edges. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease, delay: 0.2 }}
        className="absolute inset-0 [mask-image:radial-gradient(circle_at_50%_40%,black_20rem,transparent_44rem)]"
      >
        <div className="absolute top-[40%] left-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 animate-orbit rounded-full border border-tint/[0.07] [animation-duration:120s]">
          <span className="absolute top-1/2 -left-1 size-2 rounded-full bg-orange shadow-[0_0_14px_rgb(var(--orange-rgb)/var(--glow))]" />
        </div>
        <div className="absolute top-[40%] left-1/2 size-[64rem] -translate-x-1/2 -translate-y-1/2 animate-orbit rounded-full border border-dashed border-tint/[0.08] [animation-direction:reverse] [animation-duration:170s]">
          <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/var(--glow))]" />
        </div>
        <div className="absolute top-[40%] left-1/2 size-[86rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-tint/[0.05]" />
      </motion.div>

      {/* The topics' marks, floating at the sides. */}
      <div className="absolute inset-0 hidden xl:block">
        {FLOATERS.map(({ x, y, rotate }, i) => {
          const Icon = FAQ_TOPICS[i].icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 16, delay: 1.1 + i * 0.12 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <div className="animate-hover" style={{ animationDelay: `${-i * 1.1}s` }}>
                <div
                  className={cn(
                    "glass-brand flex size-14 items-center justify-center rounded-2xl",
                    i % 2 ? "text-orange-strong" : "text-accent-strong",
                  )}
                  style={{ rotate: `${rotate}deg` }}
                >
                  <Icon className="size-6" strokeWidth={1.6} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
