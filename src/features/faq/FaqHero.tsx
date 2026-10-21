"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { CircleHelp, Play } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { BRAND_NAME, CONTACT_PATH, FAQ_CATEGORIES, FAQ_ENTRY_IDS, type FaqEntry } from "@/data/faq";
import { isModified, openEntry } from "@/features/faq/navigation";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** The heading, in two lines: the page ink, then "help you" in the brand blue and an orange question mark. */
const LINE_ONE = "How can we".split("");
/** Blue lit from above, like the orange of `.text-brand`. A vertical fill, so each letter can carry its own. */
const BLUE_FILL = "bg-[linear-gradient(180deg,var(--color-accent-strong),var(--color-accent)_75%)] bg-clip-text text-transparent";
const LINE_TWO = [
  ..."help you".split("").map((char) => ({ char, className: BLUE_FILL })),
  { char: "?", className: "text-brand" },
];

/** When each part of the entrance starts, in seconds. */
const LINE_ONE_AT = 0.15;
const LINE_TWO_AT = 0.45;
const LETTER_STEP = 0.045;
const STROKE_AT = LINE_TWO_AT + LINE_TWO.length * LETTER_STEP + 0.2;
const INTRO_AT = 0.75;
const STATS_AT = 1.05;
const CONSTELLATION_AT = 0.35;

const INTRO_WORDS = `Find quick answers to common questions about ${BRAND_NAME}. Can’t find what you’re looking for?`.split(" ");

const ENTRIES = new Map(FAQ_CATEGORIES.flatMap((category) => category.questions.map((entry) => [entry.id, entry])));

/** What the page holds, counted from the data so the figures can't drift from it. */
const STATS = [
  { value: FAQ_ENTRY_IDS.size, label: "Answers" },
  { value: [...ENTRIES.values()].filter((entry) => entry.hasVideo && entry.videoId).length, label: "Video guides" },
  { value: FAQ_CATEGORIES.length, label: "Topics" },
];

/**
 * Popular questions, set around the help tile. `x`/`y` are where each chip
 * meets its line, as a percentage of the constellation; `align` says which
 * way the chip runs from there, so every chip stays inside the square.
 */
const POPULAR: { id: string; x: number; y: number; align: "start" | "center" | "end" }[] = [
  { id: "aichess-3", x: 50, y: 6, align: "center" },
  { id: "pricing-3", x: 100, y: 29, align: "end" },
  { id: "pricing-8", x: 97, y: 73, align: "end" },
  { id: "getting-started-2", x: 50, y: 94, align: "center" },
  { id: "technical-2", x: -4, y: 35, align: "start" },
];

/**
 * Where a question's line ends: a little way in from where the chip meets it,
 * so the end stays under the chip as it floats rather than peeking out.
 */
function lineEnd({ x, y, align }: (typeof POPULAR)[number]) {
  if (align === "start") return { x: x + 10, y };
  if (align === "end") return { x: x - 10, y };
  return { x, y: y < 50 ? y + 2 : y - 2 };
}

/**
 * The top of the FAQ page: the question it answers, set large, with what
 * the page holds counted beneath it, and beside it the help tile at the centre of the
 * questions people ask most, each one a shortcut to its answer.
 *
 * The heading builds letter by letter and an orange stroke draws itself under
 * "help you"; the intro settles word by word and the figures count up. Beside
 * it the rings turn, lines run out from the tile, and the questions arrive
 * one by one at the ends of them.
 */
export function FaqHero() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="relative isolate overflow-hidden pt-32 pb-16 md:pt-36 md:pb-20 lg:pt-36 lg:pb-24"
    >
      <HeroBackdrop />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,35rem)] xl:gap-20">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-4"
          >
            <MiniTile />
            <p className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase">
              <span className="hidden h-px w-8 bg-gradient-to-r from-transparent to-orange lg:block" aria-hidden />
              Help centre
            </p>
          </motion.div>

          <h1
            id="faq-heading"
            className="mt-7 font-display text-[clamp(3rem,14vw,4.75rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-fg lg:text-[clamp(4rem,6.4vw,6.5rem)]"
          >
            <span className="sr-only">How can we help you?</span>
            {/* Each letter rises out of its line's clip; the padding gives the
                descenders room inside it. */}
            <span aria-hidden className="-mb-[0.16em] block overflow-hidden pb-[0.16em] whitespace-nowrap">
              {LINE_ONE.map((char, i) => (
                <Letter key={i} char={char} delay={LINE_ONE_AT + i * LETTER_STEP} />
              ))}
            </span>
            <span aria-hidden className="relative block w-fit">
              <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em] whitespace-nowrap">
                {LINE_TWO.map(({ char, className }, i) => (
                  <Letter key={i} char={char} className={className} delay={LINE_TWO_AT + i * LETTER_STEP} />
                ))}
              </span>
              <Stroke />
            </span>
          </h1>

          <p className="mt-9 max-w-xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
            {INTRO_WORDS.map((word, i) => (
              <Fragment key={i}>
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease, delay: INTRO_AT + i * 0.025 }}
                >
                  {word}
                </motion.span>{" "}
              </Fragment>
            ))}
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: INTRO_AT + INTRO_WORDS.length * 0.025 }}
            >
              <Link
                href={CONTACT_PATH}
                onClick={() => trackEvent("faq_cta_clicked", { target: "hero" })}
                className="group relative inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-accent"
              >
                Contact our support team
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
                {/* Drawn under the link on hover, in the logo's colours. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-orange transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
              </Link>
            </motion.span>
          </p>

          <Stats />
        </div>

        <Constellation />
      </Container>

      {/* The hero's lower edge, as a hairline in the logo's colours. */}
      <span aria-hidden className="rule-brand absolute inset-x-0 bottom-0 opacity-60" />
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
      {char === " " ? "\u00a0" : char}
    </motion.span>
  );
}

/**
 * A brushed orange stroke under "help you", drawn left to right once the
 * letters have landed. It stretches with the words, so its weight grows with
 * the type.
 */
function Stroke() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.1em] left-[-1%] h-[0.3em] w-[88%] overflow-visible"
    >
      <defs>
        <linearGradient id="faq-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--brand-orange)" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="var(--brand-orange)" />
          <stop offset="1" stopColor="#ff9a5c" />
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
 * What the page holds — answers, video guides, topics — in the site's
 * editorial figures, each counting up as the row arrives.
 */
function Stats() {
  return (
    <motion.dl
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: STATS_AT }}
      className="mt-12 flex items-stretch"
    >
      {STATS.map(({ value, label }, i) => (
        <div
          key={label}
          className={cn(
            "flex flex-col-reverse gap-2",
            i > 0 && "ml-5 border-l border-tint/10 pl-5 sm:ml-10 sm:pl-10",
          )}
        >
          <dt className="font-display text-[0.6rem] font-semibold tracking-[0.22em] whitespace-nowrap text-faint uppercase">
            {label}
          </dt>
          <dd className="tabular font-display text-[clamp(1.9rem,3.2vw,2.75rem)] leading-none font-semibold tracking-tight text-fg">
            <CountUp value={value} delay={STATS_AT + 0.15 + i * 0.12} />
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}

/**
 * A figure that counts up from zero. The server renders the real number, so
 * it's what crawlers and a page without script see; it drops to zero on
 * mount, while the row is still fully transparent, so the drop never shows.
 */
function CountUp({ value, delay }: { value: number; delay: number }) {
  const count = useMotionValue(value);
  const shown = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    count.jump(0);
    const controls = animate(count, value, { duration: 1.4, ease, delay });
    return () => controls.stop();
  }, [count, value, delay]);

  return <motion.span>{shown}</motion.span>;
}

/**
 * The help tile at the centre of the questions people ask most. Lines run
 * out from the tile to each one, carrying a pulse of light now and then;
 * pointing at a question warms its line to orange. Wide screens only — on a
 * phone the topics row does this job.
 */
function Constellation() {
  const [hovered, setHovered] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative hidden lg:block">
      <div className="relative mx-auto aspect-square w-full max-w-[35rem]">
        <Halo />

        {/* Lines from the tile to each question, and the pulses that travel them.
            Strokes are in the square's own units (100 across). */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
          {POPULAR.map((spot, i) => {
            const { id } = spot;
            const { x, y } = lineEnd(spot);
            return (
              <Fragment key={id}>
                <motion.line
                  x1={50}
                  y1={50}
                  x2={x}
                  y2={y}
                  strokeWidth={0.18}
                  className={cn(
                    "transition-[stroke] duration-300",
                    hovered === id ? "stroke-orange" : "stroke-[var(--line)]",
                  )}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease, delay: CONSTELLATION_AT + 0.5 + i * 0.08 }}
                />
                {!reducedMotion && (
                  <motion.line
                    x1={50}
                    y1={50}
                    x2={x}
                    y2={y}
                    strokeWidth={0.4}
                    strokeLinecap="round"
                    className={hovered === id ? "stroke-orange" : "stroke-accent"}
                    initial={{ pathLength: 0.12, pathOffset: 0, opacity: 0 }}
                    animate={{ pathOffset: [0, 0.88], opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 2.6 + i * 0.7,
                      delay: CONSTELLATION_AT + 1.6 + i * 0.55,
                    }}
                  />
                )}
              </Fragment>
            );
          })}
        </svg>

        <CentreTile />

        <ul aria-label="Popular questions" className="absolute inset-0">
          {POPULAR.map((spot, i) => {
            const entry = ENTRIES.get(spot.id);
            return entry ? (
              <QuestionChip
                key={spot.id}
                entry={entry}
                spot={spot}
                index={i}
                onHover={(on) => setHovered(on ? spot.id : null)}
              />
            ) : null;
          })}
        </ul>
      </div>
    </div>
  );
}

/** One popular question at the end of its line, floating gently; choosing it opens its answer below. */
function QuestionChip({
  entry,
  spot,
  index,
  onHover,
}: {
  entry: FaqEntry;
  spot: (typeof POPULAR)[number];
  index: number;
  onHover: (on: boolean) => void;
}) {
  const video = Boolean(entry.hasVideo && entry.videoId);

  return (
    <li className="absolute w-max" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
      <div
        className={cn(
          "-translate-y-1/2",
          spot.align === "center" && "-translate-x-1/2",
          spot.align === "end" && "-translate-x-full",
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease, delay: CONSTELLATION_AT + 1 + index * 0.12 }}
        >
          {/* Each chip floats on its own beat. */}
          <div className="animate-hover" style={{ animationDelay: `${-index * 1.7}s` }}>
            <a
              href={`#${entry.id}`}
              onClick={(event) => {
                if (isModified(event)) return;
                event.preventDefault();
                openEntry(entry.id);
                trackEvent("faq_question_opened", { id: entry.id, from: "hero" });
              }}
              onPointerEnter={() => onHover(true)}
              onPointerLeave={() => onHover(false)}
              onFocus={() => onHover(true)}
              onBlur={() => onHover(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] py-1.5 pr-4 pl-1.5 text-[0.8rem] font-medium text-fg shadow-[var(--shadow-chip)] backdrop-blur-xl transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-orange-line hover:shadow-[var(--shadow-chip-active)]",
                spot.align === "center" ? "max-w-[24rem]" : "max-w-[19rem]",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                  video
                    ? "bg-orange-soft text-orange-strong"
                    : "bg-accent-soft text-accent-strong group-hover:bg-orange-soft group-hover:text-orange-strong",
                )}
              >
                {video ? (
                  <Play className="size-3 translate-x-px fill-current" aria-hidden />
                ) : (
                  <span aria-hidden className="font-display text-[0.8rem] font-bold">
                    ?
                  </span>
                )}
              </span>
              <span className="truncate">{entry.question}</span>
              {video && <span className="sr-only">(video)</span>}
            </a>
          </div>
        </motion.div>
      </div>
    </li>
  );
}

/** The help mark on a tile edged in the logo's colours, tilted as if set down, with light turning around it. */
function CentreTile() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: -5 }}
      transition={{ type: "spring", stiffness: 150, damping: 14, delay: CONSTELLATION_AT + 0.15 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      {/* A slow turning aura in the logo's colours. */}
      <div className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 animate-orbit rounded-full bg-[conic-gradient(from_0deg,rgb(var(--orange-rgb)/0.55),transparent_28%,rgb(var(--accent-rgb)/0.6)_52%,transparent_78%,rgb(var(--orange-rgb)/0.55))] opacity-[calc(0.35_+_0.4*var(--glow))] blur-2xl [animation-duration:16s]" />
      <div className="animate-hover">
        <div className="glass-brand relative flex size-28 items-center justify-center rounded-[2rem]">
          <span className="absolute inset-0 animate-pulse-ring rounded-[2rem] border border-accent/30" />
          <span className="absolute inset-3 rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_25%,rgb(var(--accent-rgb)/0.18),transparent_70%)]" />
          <CircleHelp className="relative size-14 text-accent" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}

/** The rings the questions sit on, turning slowly each its own way, with a point of light riding each. */
function Halo() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.8, ease, delay: CONSTELLATION_AT }}
      className="pointer-events-none absolute inset-0"
    >
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/calc(0.12*var(--glow))),transparent_70%)]" />
      <div className="absolute inset-[6%] animate-orbit rounded-full border border-tint/[0.07] [animation-duration:140s]">
        <span className="absolute top-1/2 -right-1 size-2 rounded-full bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/var(--glow))]" />
      </div>
      <div className="absolute inset-[19%] animate-orbit rounded-full border border-dashed border-tint/[0.11] [animation-direction:reverse] [animation-duration:90s]">
        <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-orange shadow-[0_0_14px_rgb(var(--orange-rgb)/var(--glow))]" />
      </div>
      <div className="absolute inset-[32%] animate-orbit rounded-full border border-accent/15 [animation-duration:60s]">
        <span className="absolute bottom-[14%] left-[8%] size-1.5 rounded-full bg-accent-strong shadow-[0_0_10px_rgb(var(--accent-rgb)/var(--glow))]" />
      </div>
    </motion.div>
  );
}

/** On phones and tablets the constellation is hidden, so the tile comes along beside the label instead. */
function MiniTile() {
  return (
    <span
      aria-hidden
      className="glass-brand relative flex size-11 -rotate-6 items-center justify-center rounded-[0.9rem] lg:hidden"
    >
      <span className="absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/calc(0.35*var(--glow))),transparent_70%)]" />
      <CircleHelp className="size-5 text-accent" strokeWidth={1.75} />
    </span>
  );
}

/** Stage light and a faint dotted field — the page's own sky, as on About and Contact. */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgb(var(--accent-rgb)/0.03),rgb(var(--orange-rgb)/0.03))]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(var(--dot-field)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_75%_65%_at_62%_45%,black,transparent_75%)]" />
      <div className="absolute -top-40 -left-48 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.12),transparent_62%)]" />
      <div className="absolute top-1/4 -right-40 size-[48rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.14),transparent_62%)] [animation-delay:-9s]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
