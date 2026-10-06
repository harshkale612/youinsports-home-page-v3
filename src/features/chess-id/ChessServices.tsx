"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import {
  Check,
  ChessBishop,
  ChessKnight,
  ChessQueen,
  ChessRook,
  Download,
  Link2,
  Link2Off,
  Pause,
  Play,
  Smartphone,
  Timer,
} from "lucide-react";
import { BodyText, Container, DisplayText, SectionLabel } from "@/components/ui/Primitives";
import {
  BOARD_FEATURES,
  BOARDS_PER_PHONE,
  EVENT_FEATURES,
  PGN_VERIFIED_IN,
  TYPICAL_DELAY_MINUTES,
  type BoardFeature,
  type EventFeature,
} from "@/data/chessboard";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { OPENING, STARTING_POSITION, type Ply } from "@/scenes/chess/opening";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

const feature = (id: string) => BOARD_FEATURES.find((item) => item.id === id)!;

type Visual = "sensors" | "autostart" | "pgn" | "tricky" | "promotion" | "four-boards" | "memory";

/**
 * The board's features, laid out as a bento: how it senses a move and how it
 * rides out a dropped phone get room for a working picture, the rest sit
 * beside them in rows of three. Spans are per breakpoint so every row closes
 * flush — one column on phones, two on tablets, six on desktop.
 */
const BENTO: { id: string; className: string; visual: Visual }[] = [
  { id: "sensors", className: "sm:col-span-2 lg:col-span-4", visual: "sensors" },
  { id: "autostart", className: "lg:col-span-2", visual: "autostart" },
  { id: "pgn", className: "lg:col-span-2", visual: "pgn" },
  { id: "tricky", className: "lg:col-span-2", visual: "tricky" },
  { id: "promotion", className: "lg:col-span-2", visual: "promotion" },
  // Five small tiles leave one over at two columns, so on tablets this one
  // takes a row of its own.
  { id: "four-boards", className: "sm:col-span-2 lg:col-span-2", visual: "four-boards" },
  { id: "memory", className: "sm:col-span-2 lg:col-span-4", visual: "memory" },
];

const WIDE: Visual[] = ["sensors", "memory"];

/**
 * What the board does, between the board itself and the prices.
 *
 * The section opens in the board's own light — the stage's orange sunrise is
 * cut off where the pinned stage ends, so the first thing here is the rest of
 * it — a full section's spacing below the board, which itself stops short of
 * the stage's foot. The tiles rise in as they reach the screen, staggered
 * across each row rather than down the whole grid, and their pictures play
 * only while they're on screen.
 */
export function ChessServices() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative scroll-mt-20 pt-[var(--section-y)] pb-[var(--section-y)]"
    >
      {/* The lower part of the stage's sunrise, which the pinned stage clips
          at its foot. Same shape, same size, so the two meet without a seam. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[30svh] overflow-hidden">
        <div className="absolute -top-[40svh] left-1/2 h-[70svh] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.2),transparent)]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-[45%] -left-40 size-[40rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.09),transparent_62%)]"
      />

      <Container className="relative max-w-[84rem]">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            <SectionLabel index="01">What we offer</SectionLabel>
            <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
              <DisplayText id="features-heading" as="h2" className="mt-7">
                The board doesn&apos;t watch your game. It <span className="text-brand">feels</span> it
                <span className="text-accent">.</span>
              </DisplayText>
            </motion.div>
          </div>

          <motion.div {...reveal} transition={{ duration: 0.8, ease, delay: 0.1 }}>
            <BodyText className="max-w-md text-base lg:pb-2">
              Real pieces on a real board, and every move recorded as you play it. Nothing to type. Nothing to
              transcribe.
            </BodyText>
          </motion.div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {BENTO.map((tile, i) => (
            <FeatureTile
              key={tile.id}
              feature={feature(tile.id)}
              className={tile.className}
              // Staggered across the row each tile starts on, not the whole list.
              delay={[0, 0.1, 0, 0.1, 0.2, 0, 0.1][i]}
              wide={WIDE.includes(tile.visual)}
            >
              {tile.visual === "sensors" && <SensorVisual />}
              {tile.visual === "autostart" && <AutostartVisual />}
              {tile.visual === "pgn" && <PgnVisual />}
              {tile.visual === "tricky" && <TrickyVisual />}
              {tile.visual === "promotion" && <PromotionVisual />}
              {tile.visual === "four-boards" && <FourBoardsVisual />}
              {tile.visual === "memory" && <MemoryVisual />}
            </FeatureTile>
          ))}
        </ul>

        <EventsPanel />
      </Container>
    </section>
  );
}

/**
 * One feature, as a card. A faint hairline at rest; on hover the logo's
 * orange-to-blue runs round its edge and the icon turns towards you. A wide
 * card sets its picture beside the copy; a narrow one keeps its picture at
 * the foot, so a row's cards close on the same line however tall it runs.
 */
function FeatureTile({
  feature,
  className,
  delay,
  wide,
  children,
}: {
  feature: BoardFeature;
  className?: string;
  delay: number;
  wide?: boolean;
  children?: React.ReactNode;
}) {
  const Icon = feature.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
      className={cn("group relative rounded-[1.5rem] p-px", className)}
    >
      <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-tint/[0.08]" />
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(150deg,rgb(var(--orange-rgb)/0.85),rgb(var(--orange-rgb)/0.05)_40%,rgb(var(--accent-rgb)/0.05)_60%,rgb(var(--accent-rgb)/0.85))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <article
        className={cn(
          "relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-bg-elevated p-6 shadow-[var(--shadow-tile)] transition-shadow duration-500 group-hover:shadow-[var(--shadow-card-hover)] sm:p-7",
          wide
            ? "grid gap-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center md:gap-8"
            : "flex flex-col",
        )}
      >
        {/* Stage light in the corner, brighter on hover. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.12*var(--glow))),transparent_65%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-11 items-center justify-center rounded-xl border border-orange-line bg-orange-soft text-orange-strong transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110">
              <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-tint/10 bg-tag px-2.5 py-1 font-mono text-[0.66rem] text-muted transition-colors duration-500 group-hover:border-orange-line group-hover:text-fg">
              <span
                aria-hidden
                className="size-1 rounded-full bg-orange shadow-[0_0_6px_rgb(var(--orange-rgb)/var(--glow))]"
              />
              {feature.spec}
            </span>
          </div>
          <h3 className="mt-6 font-display text-[1.15rem] leading-snug font-semibold tracking-tight text-balance text-fg">
            {feature.title}
          </h3>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-pretty text-muted">{feature.description}</p>
        </div>

        {children && <div className={cn("relative", !wide && "mt-auto pt-6")}>{children}</div>}
      </article>
    </motion.li>
  );
}

// -- Pictures ---------------------------------------------------------------

/**
 * A step counter for the looping pictures. It counts only while its picture
 * is on screen, and with reduced motion it never starts — each picture then
 * holds the one frame that tells its story.
 */
function useSteps(ref: RefObject<Element | null>, interval: number) {
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setStep((s) => s + 1), interval);
    return () => window.clearInterval(id);
  }, [inView, reduced, interval]);

  return { step, reduced };
}

/** A small uppercase caption over a picture's panel. */
function PanelLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("font-display text-[0.55rem] font-semibold tracking-[0.18em] text-faint uppercase", className)}>
      {children}
    </p>
  );
}

const FILES = "abcdefgh";
/** The 64 squares as they're drawn: a8 at the top left, h1 at the bottom right. */
const SQUARES = Array.from({ length: 64 }, (_, i) => `${FILES[i % 8]}${8 - Math.floor(i / 8)}`);

/** Which squares hold a piece after each ply of the opening — all the board itself ever knows. */
const OCCUPIED: Set<string>[] = OPENING.reduce(
  (states, ply) => {
    const next = new Set(states[states.length - 1]);
    for (const step of ply.steps) {
      next.delete(step.from);
      next.add(step.to);
    }
    return [...states, next];
  },
  [new Set(STARTING_POSITION.map((piece) => piece.square))],
);

/** The first `count` plies of the opening as numbered move pairs. */
function movePairs(count: number) {
  return OPENING.slice(0, count).reduce<Ply[][]>((pairs, ply, i) => {
    if (i % 2 === 0) pairs.push([ply]);
    else pairs[pairs.length - 1].push(ply);
    return pairs;
  }, []);
}

const MOVE_ROWS = OPENING.length / 2;

/** One ply in a move list, arriving as it's played. */
function ListedPly({
  ply,
  latest,
  synced,
  delay = 0,
}: {
  ply?: Ply;
  latest?: boolean;
  synced?: boolean;
  delay?: number;
}) {
  if (!ply) return <span />;
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease, delay }}
      className={cn(
        "-mx-1 max-w-full justify-self-start truncate rounded px-1 transition-colors duration-700",
        latest ? "text-orange-strong" : "text-fg",
        synced && "bg-orange-soft text-orange-strong",
      )}
    >
      {ply.san}
    </motion.span>
  );
}

const SENSOR_CYCLE = OPENING.length + 3;

/** How long after a square changes the app shows the move, so the picture reads board first, app second. */
const WORKED_OUT_AFTER = 0.35;

/**
 * The board's whole view of the game beside the app's. The board only knows
 * which squares are occupied — every sensor lights alike, because a magnet is
 * a magnet — and a beat after one goes dark and another lights, the move
 * appears in the app. The same opening the board above plays.
 */
function SensorVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, reduced } = useSteps(ref, 1150);
  const played = reduced ? OPENING.length : Math.min(step % SENSOR_CYCLE, OPENING.length);
  const occupied = OCCUPIED[played];
  const last = played > 0 ? OPENING[played - 1] : null;
  const from = new Set(last?.steps.map((s) => s.from));
  const to = new Set(last?.steps.map((s) => s.to));
  const pairs = movePairs(played);

  return (
    <div ref={ref} aria-hidden className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:gap-4">
      <div>
        <PanelLabel>The board feels</PanelLabel>
        <div className="mt-2 grid aspect-square grid-cols-8 overflow-hidden rounded-lg border border-tint/10 shadow-[var(--shadow-tile)]">
          {SQUARES.map((square, i) => {
            const dark = (Math.floor(i / 8) + i) % 2 === 1;
            const on = occupied.has(square);
            return (
              <span
                key={square}
                className={cn("relative flex items-center justify-center", dark ? "bg-tint/[0.1]" : "bg-tint/[0.025]")}
              >
                <span
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    from.has(square) && "bg-accent/30",
                    to.has(square) && "bg-orange/35",
                    from.has(square) || to.has(square) ? "opacity-100" : "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "relative size-[34%] rounded-full transition-[opacity,scale,background-color] duration-300",
                    on ? "scale-100 opacity-100" : "scale-50 opacity-0",
                    to.has(square)
                      ? "bg-orange-strong shadow-[0_0_8px_rgb(var(--orange-rgb)/var(--glow))]"
                      : "bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/calc(0.8*var(--glow)))]",
                  )}
                />
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        <PanelLabel>The app works out</PanelLabel>
        <div className="mt-2 flex flex-1 flex-col overflow-hidden rounded-lg border border-tint/10 bg-void font-mono text-[0.68rem] shadow-[var(--shadow-tile)]">
          <ol className="flex-1 px-3 py-2">
            {Array.from({ length: MOVE_ROWS }, (_, row) => (
              <li key={row} className="grid grid-cols-[1.3rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-1.5 py-[0.18rem] leading-[1.5]">
                <span className="text-faint">{row + 1}.</span>
                <ListedPly
                  key={`w${pairs[row]?.[0]?.san}`}
                  ply={pairs[row]?.[0]}
                  latest={played === row * 2 + 1}
                  delay={WORKED_OUT_AFTER}
                />
                <ListedPly
                  key={`b${pairs[row]?.[1]?.san}`}
                  ply={pairs[row]?.[1]}
                  latest={played === row * 2 + 2}
                  delay={WORKED_OUT_AFTER}
                />
              </li>
            ))}
          </ol>
          <div className="min-h-8 border-t border-tint/[0.08] px-3 py-1.5 text-[0.62rem] leading-5 text-muted">
            <motion.span
              key={played}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: last ? WORKED_OUT_AFTER : 0 }}
              className="flex items-center gap-1.5"
            >
              {last ? (
                <>
                  <span className="text-accent">{last.steps[0].from}</span>
                  <span className="text-faint">→</span>
                  <span className="text-orange-strong">{last.steps[0].to}</span>
                  <span className="text-faint">=</span>
                  <span className="font-medium text-fg">{last.san}</span>
                </>
              ) : (
                <span className="font-sans">32 pieces home. Ready.</span>
              )}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Counts up to `to` once it's on screen, in step with the pieces landing. */
function CountUp({ to, duration, delay }: { to: number; duration: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, delay, ease: "linear", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration, delay]);

  return <span ref={ref}>{value}</span>;
}

/** The pieces going on, one by one, and the board starting on its own when the last one lands. */
function AutostartVisual() {
  const stagger = 0.035;
  return (
    <motion.div initial="hidden" whileInView="shown" viewport={{ once: true, margin: "-10% 0px" }} aria-hidden>
      <div className="flex items-end justify-between gap-3">
        <PanelLabel>Pieces set up</PanelLabel>
        <span className="tabular font-display text-[1.05rem] leading-none font-semibold text-fg">
          <CountUp to={32} duration={32 * stagger} delay={0.25} />
          <span className="text-faint"> / 32</span>
        </span>
      </div>
      <motion.div
        variants={{ shown: { transition: { staggerChildren: stagger, delayChildren: 0.25 } } }}
        className="mt-2.5 grid grid-cols-16 gap-1"
      >
        {Array.from({ length: 32 }, (_, i) => (
          <motion.span
            key={i}
            variants={{ hidden: { opacity: 0.16 }, shown: { opacity: 1, transition: { duration: 0.2 } } }}
            className="h-2.5 rounded-[3px] bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/calc(0.5*var(--glow)))]"
          />
        ))}
      </motion.div>
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 6 },
          shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.25 + 32 * stagger + 0.2 } },
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-line bg-orange-soft px-3 py-1.5 text-[0.72rem] font-medium text-fg"
      >
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-orange/60" />
          <span className="relative size-2 rounded-full bg-orange" />
        </span>
        Recording · no button pressed
      </motion.span>
    </motion.div>
  );
}

/** A game on its way out, and the places it opens. */
function PgnVisual() {
  return (
    <div aria-hidden className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-line bg-orange-soft px-2.5 py-1.5 font-mono text-[0.66rem] text-orange-strong">
        <Download className="size-3" strokeWidth={2.2} />
        game.pgn
      </span>
      <span className="h-px w-4 bg-gradient-to-r from-orange to-accent" />
      {PGN_VERIFIED_IN.map((app, i) => (
        <motion.span
          key={app}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 + i * 0.12 }}
          className="inline-flex items-center gap-1 rounded-full border border-tint/10 bg-tag py-1 pr-2.5 pl-2 text-[0.68rem] text-muted transition-colors duration-300 group-hover:border-accent-line group-hover:text-fg"
        >
          <Check className="size-3 text-accent" strokeWidth={2.6} />
          {app}
        </motion.span>
      ))}
    </div>
  );
}

const TRICKY = [
  { san: "Nxe5", label: "Capture" },
  { san: "O-O-O", label: "Castling" },
  { san: "exd6", label: "En passant" },
];

/** The moves a sensor board is supposed to stumble on, each read and ticked. */
function TrickyVisual() {
  return (
    <ul aria-hidden className="grid grid-cols-3 gap-2">
      {TRICKY.map((move, i) => (
        <motion.li
          key={move.san}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.35 + i * 0.1 }}
          className="rounded-xl border border-tint/10 bg-tag px-1.5 py-2.5 text-center transition-colors duration-300 group-hover:border-orange-line"
        >
          <span className="block font-mono text-[0.8rem] font-medium text-fg">{move.san}</span>
          <span className="mt-1 flex items-center justify-center gap-1 text-[0.6rem] whitespace-nowrap text-muted">
            <Check className="size-2.5 shrink-0 text-accent" strokeWidth={3} />
            {move.label}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

const PROMOTION_PIECES = [
  { piece: "queen", icon: ChessQueen },
  { piece: "rook", icon: ChessRook },
  { piece: "bishop", icon: ChessBishop },
  { piece: "knight", icon: ChessKnight },
] as const;

const PROMOTION_STEPS: { piece: "queen" | "knight" | null; text: string }[] = [
  { piece: null, text: "A pawn reaches e8. No button pressed." },
  { piece: "queen", text: "It plays on as a queen. No pause." },
  { piece: "queen", text: "It plays on as a queen. No pause." },
  { piece: "knight", text: "It moved like a knight, so it’s a knight." },
  { piece: "knight", text: "It moved like a knight, so it’s a knight." },
];

/**
 * A promotion as the app records it: nothing yet, then a queen pencilled in
 * so the game runs on, then the knight the next move gives away.
 */
function PromotionVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, reduced } = useSteps(ref, 1400);
  const current = PROMOTION_STEPS[reduced ? 3 : step % PROMOTION_STEPS.length];

  return (
    <div ref={ref} aria-hidden>
      <PanelLabel>Promoted to</PanelLabel>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {PROMOTION_PIECES.map(({ piece, icon: Icon }) => {
          const on = current.piece === piece;
          const assumed = on && piece === "queen";
          return (
            <span
              key={piece}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-xl border transition-[background-color,border-color,color,box-shadow] duration-500",
                assumed && "border-dashed border-accent-line bg-accent-soft text-accent-strong",
                on && !assumed &&
                  "border-orange-line bg-orange-soft text-orange-strong shadow-[0_0_24px_-6px_rgb(var(--orange-rgb)/var(--glow))]",
                !on && "border-tint/10 bg-tag text-faint",
              )}
            >
              <Icon className="size-5" strokeWidth={1.7} />
              {assumed && (
                <span className="absolute -top-2 rounded-full bg-bg-elevated px-1.5 font-display text-[0.5rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  Assumed
                </span>
              )}
            </span>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={current.text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease }}
          className="mt-3 text-[0.74rem] text-muted"
        >
          {current.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/** A board in miniature, for the tables in the club-night picture. */
function MiniBoard() {
  return (
    <span className="grid size-5 shrink-0 grid-cols-4 overflow-hidden rounded-[3px] border border-tint/15">
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className={(Math.floor(i / 4) + i) % 2 === 0 ? "bg-tint/25" : "bg-transparent"} />
      ))}
    </span>
  );
}

/**
 * Four tables reporting to one phone: a reading runs along each link in
 * turn, from the board to the phone, as the board sends what it feels.
 */
function FourBoardsVisual() {
  return (
    <div aria-hidden className="flex items-center">
      <div className="relative flex-1">
        <ul className="grid gap-1.5">
          {Array.from({ length: BOARDS_PER_PHONE }, (_, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.08 }}
              className="flex h-7 items-center gap-2"
            >
              <MiniBoard />
              <span className="w-11 shrink-0 text-[0.66rem] text-muted">Table {i + 1}</span>
              {/* The link: a hairline, in a box tall enough to carry the reading's dot. */}
              <span className="relative h-2 flex-1 overflow-hidden">
                <span className="absolute inset-x-0 top-1/2 h-px bg-tint/15" />
                <span className="absolute inset-0 animate-signal" style={{ animationDelay: `${i * -0.6}s` }}>
                  <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/var(--glow))]" />
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
        {/* The bus the four links join, from the first table's line to the last's. */}
        <span className="absolute top-3.5 right-0 bottom-3.5 w-px bg-tint/15" />
      </div>
      <span className="h-px w-3 bg-tint/15" />
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-accent-line bg-accent-soft text-accent-strong shadow-[0_0_24px_-8px_rgb(var(--accent-rgb)/var(--glow))]">
        <Smartphone className="size-5" strokeWidth={1.8} />
      </span>
    </div>
  );
}

const MEMORY_CYCLE = 18;
/** Plies the phone has before it drops out, in the memory picture, and how many it misses. */
const BEFORE_DROP = 3;
const MISSED = 6;

/**
 * Where the memory picture is at step `t`: three moves arrive live, the
 * phone drops out and six more wait on the board, the phone comes back and
 * they all arrive at once, then the game plays on to its last move.
 */
function memoryAt(t: number) {
  const played = t <= 3 ? t : t === 4 ? 3 : t <= 10 ? t - 1 : t === 11 ? 9 : t <= 14 ? t - 2 : OPENING.length;
  const connected = t < 4 || t >= 11;
  return { played, connected, delivered: connected ? played : BEFORE_DROP, synced: t >= 11, justSynced: t >= 11 && t < 14 };
}

/**
 * A phone dropping out mid-game. The board keeps recording and holds the
 * moves; the link comes back and they arrive on the phone in order, marked
 * as the ones it missed.
 */
function MemoryVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, reduced } = useSteps(ref, 950);
  const t = reduced ? 11 : step % MEMORY_CYCLE;
  // Keys carry the loop they belong to, so a move from the last loop that is
  // still leaving is never mistaken for the same move arriving in this one.
  const loop = reduced ? 0 : Math.floor(step / MEMORY_CYCLE);
  const { played, connected, delivered, synced, justSynced } = memoryAt(t);
  const held = OPENING.slice(delivered, played);
  const pairs = movePairs(delivered);

  return (
    <div ref={ref} aria-hidden className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-stretch">
      <div className="flex flex-col rounded-xl border border-tint/10 bg-[linear-gradient(180deg,var(--color-surface),var(--color-bg))] p-3 shadow-[var(--shadow-tile)]">
        <div className="flex items-center justify-between gap-2">
          <PanelLabel>Board</PanelLabel>
          <span className="inline-flex items-center gap-1.5 text-[0.6rem] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-orange" />
            Recording
          </span>
        </div>
        <p className="mt-3 text-[0.62rem] text-faint">Held for the phone</p>
        <ul className="relative mt-1.5 flex min-h-[3.4rem] flex-wrap content-start gap-1">
          <AnimatePresence>
            {held.map((ply, i) => (
              <motion.li
                key={`${loop}-${delivered + i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 14, transition: { duration: 0.35, delay: i * 0.04 } }}
                transition={{ duration: 0.35, ease }}
                className="rounded-md border border-orange-line bg-orange-soft px-1.5 py-0.5 font-mono text-[0.62rem] text-orange-strong"
              >
                {ply.san}
              </motion.li>
            ))}
          </AnimatePresence>
          {/* Laid over the chips' row rather than in it, so it never shoves
              the moves that are still on their way out. */}
          {held.length === 0 && (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="absolute top-0 left-0 py-0.5 text-[0.62rem] text-faint"
            >
              Nothing waiting
            </motion.li>
          )}
        </ul>
        <div className="mt-auto pt-3">
          <div className="h-1 overflow-hidden rounded-full bg-tint/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange to-orange-strong transition-[width] duration-500"
              style={{ width: `${(held.length / 85) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 flex justify-between gap-2 text-[0.58rem] text-faint">
            <span className="tabular">{held.length} held</span>
            <span>room for ~85</span>
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <span
          className={cn(
            "absolute inset-x-1 top-1/2",
            connected ? "h-px bg-gradient-to-r from-orange to-accent" : "border-t border-dashed border-tint/25",
          )}
        />
        {connected && (
          <span className="absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 overflow-hidden">
            <span className="absolute inset-0 animate-signal">
              <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-accent" />
            </span>
          </span>
        )}
        <span
          className={cn(
            "relative flex size-7 items-center justify-center rounded-full border bg-bg-elevated shadow-[var(--shadow-float)] transition-colors duration-300",
            connected ? "border-accent-line text-accent-strong" : "border-orange-line text-orange-strong",
          )}
        >
          {connected ? (
            <Link2 className="size-3.5" strokeWidth={2} />
          ) : (
            <Link2Off className="size-3.5" strokeWidth={2} />
          )}
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-tint/10 bg-void font-mono text-[0.66rem] shadow-[var(--shadow-tile)]">
        <div className="flex items-center justify-between gap-2 border-b border-tint/[0.08] px-3 py-2 font-sans">
          <PanelLabel>Phone</PanelLabel>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={!connected ? "out" : justSynced ? "synced" : "on"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25, ease }}
              className={cn(
                "truncate text-[0.6rem]",
                !connected ? "text-orange-strong" : justSynced ? "text-fg" : "text-accent-strong",
              )}
            >
              {!connected ? "Out of range" : justSynced ? `${MISSED} moves caught up` : "Connected"}
            </motion.span>
          </AnimatePresence>
        </div>
        <ol className="flex-1 px-3 py-2">
          {Array.from({ length: MOVE_ROWS }, (_, row) => (
            <li key={row} className="grid grid-cols-[1.3rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-1.5 py-[0.15rem] leading-[1.5]">
              <span className="text-faint">{row + 1}.</span>
              {[0, 1].map((side) => {
                const index = row * 2 + side;
                const ply = pairs[row]?.[side];
                const caughtUp = index >= BEFORE_DROP && index < BEFORE_DROP + MISSED;
                return (
                  <ListedPly
                    key={`${side}${ply?.san}`}
                    ply={ply}
                    synced={synced && caughtUp}
                    // The missed moves land in order, not all at once.
                    delay={caughtUp ? 0.15 + (index - BEFORE_DROP) * 0.08 : 0}
                  />
                );
              })}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// -- Tournaments ------------------------------------------------------------

/** What the boards do for an organiser: the live broadcast, and everything around it. */
function EventsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease }}
      className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-accent-line/70 bg-[linear-gradient(135deg,rgb(var(--accent-rgb)/calc(0.1*var(--glow)+0.02)),transparent_55%),linear-gradient(var(--color-bg-elevated),var(--color-bg-elevated))] p-6 shadow-[var(--shadow-tile)] sm:p-8 lg:mt-5 lg:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-40 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.1*var(--glow))),transparent_65%)]"
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft px-2.5 py-1 font-display text-[0.55rem] font-semibold tracking-[0.2em] text-accent-strong uppercase">
            <span
              aria-hidden
              className="size-1 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/var(--glow))]"
            />
            For tournaments
          </span>
          <h3 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-[1.1] font-semibold tracking-tight text-balance text-fg">
            Broadcast live, with the delay serious events require<span className="text-accent">.</span>
          </h3>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-pretty text-muted">
            Games go out to spectators behind a delay you set, typically {TYPICAL_DELAY_MINUTES} minutes, so no one
            watching online can feed moves to a player. The delay is enforced on our servers, not in the app, so it
            can&apos;t be bypassed.
          </p>
        </div>

        <BroadcastConsole />
      </div>

      <ul className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-5">
        {EVENT_FEATURES.map((item, i) => (
          <EventItem
            key={item.id}
            item={item}
            index={i}
            // An odd one out on two columns takes the whole row.
            className={cn(i === EVENT_FEATURES.length - 1 && EVENT_FEATURES.length % 2 === 1 && "sm:col-span-2 lg:col-span-1")}
          />
        ))}
      </ul>
    </motion.div>
  );
}

function EventItem({ item, index, className }: { item: EventFeature; index: number; className?: string }) {
  const Icon = item.icon;
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.8, ease, delay: 0.1 + index * 0.07 }}
      className={cn(
        "group rounded-2xl border border-tint/[0.07] bg-tile p-5 shadow-[var(--shadow-tile)] transition-[translate,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-accent-line hover:shadow-[var(--shadow-tile-hover)]",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-accent-line bg-accent-soft text-accent-strong transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110">
        <Icon className="size-[1.1rem]" strokeWidth={1.8} aria-hidden />
      </span>
      <h4 className="mt-4 font-display text-[1rem] font-semibold tracking-tight text-fg">{item.title}</h4>
      <p className="mt-1.5 text-[0.85rem] leading-relaxed text-pretty text-muted">{item.description}</p>
    </motion.li>
  );
}

const TABLES = [
  { start: 24, battery: 86 },
  { start: 31, battery: 72 },
  { start: 19, battery: 14 },
  { start: 27, battery: 91 },
];
/** How many moves the public view runs behind, standing in for the delay. */
const PUBLIC_LAG = 6;
const LOW_BATTERY = 20;

/**
 * An organiser's view of a round, and a working pause. The boards keep
 * playing — one table moves on every few seconds — while the public column
 * runs the delay behind them. Pause the broadcast and the public column
 * stops where it is; the boards don't.
 */
function BroadcastConsole() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useSteps(ref, 2200);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const paused = pausedAt !== null;

  /** Moves recorded at table `i` by step `s`: each table moves on every fourth step, in turn. */
  const recorded = (i: number, s: number) => TABLES[i].start + Math.floor((s + i) / TABLES.length);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-tint/10 bg-void shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-tint/[0.08] px-4 py-3 sm:px-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[0.58rem] font-bold tracking-[0.18em] uppercase ring-1 ring-inset transition-colors duration-300",
            paused ? "bg-tint/[0.05] text-muted ring-tint/15" : "bg-orange-soft text-orange-strong ring-orange-line",
          )}
        >
          {paused ? (
            <Pause className="size-2.5" strokeWidth={3} aria-hidden />
          ) : (
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-orange" />
          )}
          {paused ? "Paused" : "Live"}
        </span>
        <span className="text-[0.74rem] text-muted">
          Round 4 <span className="text-faint">· example</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[0.74rem] text-muted">
          <Timer className="size-3.5 text-accent" strokeWidth={2} aria-hidden />
          Delay <span className="tabular text-fg">{TYPICAL_DELAY_MINUTES}:00</span>
        </span>
        <button
          type="button"
          onClick={() => setPausedAt(paused ? null : step)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-tint/10 bg-tag px-3 py-1.5 text-[0.72rem] font-medium text-fg shadow-[var(--shadow-float)] transition-colors duration-300 hover:border-accent-line"
        >
          {paused ? (
            <Play className="size-3 text-accent" strokeWidth={2.4} aria-hidden />
          ) : (
            <Pause className="size-3 text-orange-strong" strokeWidth={2.4} aria-hidden />
          )}
          {paused ? "Resume broadcast" : "Pause broadcast"}
        </button>
      </div>

      <table className="w-full text-left text-[0.78rem]">
        <caption className="sr-only">
          An example round: the move each table has reached, the move spectators can see, and each board&apos;s
          battery.
        </caption>
        <thead>
          <tr className="font-display text-[0.55rem] tracking-[0.16em] text-faint uppercase">
            <th scope="col" className="py-2.5 pl-4 font-semibold sm:pl-5">
              Table
            </th>
            <th scope="col" className="py-2.5 font-semibold">
              On the board
            </th>
            <th scope="col" className="py-2.5 font-semibold">
              Public
            </th>
            <th scope="col" className="py-2.5 pr-4 text-right font-semibold sm:pr-5">
              Battery
            </th>
          </tr>
        </thead>
        <tbody>
          {TABLES.map((table, i) => {
            const onBoard = recorded(i, step);
            const shown = recorded(i, pausedAt ?? step) - PUBLIC_LAG;
            const low = table.battery < LOW_BATTERY;
            return (
              <tr key={i} className="border-t border-tint/[0.06]">
                <th scope="row" className="py-2.5 pl-4 font-medium text-fg sm:pl-5">
                  {i + 1}
                </th>
                <td className="py-2.5">
                  {/* Positioned, so the figure rolling out is placed against
                      this cell rather than the console. */}
                  <span className="relative inline-block">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={onBoard}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease }}
                        className="tabular inline-block text-fg"
                      >
                        Move {onBoard}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </td>
                <td className={cn("py-2.5 transition-colors duration-300", paused ? "text-faint" : "text-muted")}>
                  <span className="tabular">Move {shown}</span>
                  {paused && <Pause className="ml-1.5 inline size-2.5 -translate-y-px" strokeWidth={3} aria-hidden />}
                </td>
                <td className="py-2.5 pr-4 text-right sm:pr-5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      low ? "font-medium text-orange-strong" : "text-muted",
                    )}
                  >
                    <span className="relative h-2 w-4 rounded-[2px] border border-current p-px" aria-hidden>
                      <span className="block h-full rounded-[1px] bg-current" style={{ width: `${table.battery}%` }} />
                    </span>
                    <span className="tabular">{table.battery}%</span>
                    {low && <span className="sr-only">, needs charging</span>}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p
        aria-live="polite"
        className="border-t border-tint/[0.08] px-4 py-3 text-[0.74rem] leading-relaxed text-muted sm:px-5"
      >
        {paused ? (
          <>
            <span className="font-medium text-fg">Broadcast paused.</span> The boards are still recording every move.
          </>
        ) : (
          <>
            Spectators see each move <span className="text-fg">{TYPICAL_DELAY_MINUTES} minutes</span> after it&apos;s
            played. Table 3 needs a charge before the next round.
          </>
        )}
      </p>
    </div>
  );
}
