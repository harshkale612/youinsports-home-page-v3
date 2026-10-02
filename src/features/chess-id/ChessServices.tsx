"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Download, Sparkles } from "lucide-react";
import { BodyText, Container, DisplayText, SectionLabel } from "@/components/ui/Primitives";
import { CHESS_FEATURES, FEATURE_GROUPS, type ChessFeature, type FeatureGroup } from "@/data/chess-plans";
import { OPENING } from "@/scenes/chess/opening";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

const feature = (id: string) => CHESS_FEATURES.find((item) => item.id === id)!;

/**
 * The chess tools, laid out as a bento: the two that do the most get room for
 * a working picture, the rest sit beside them in rows of three. Spans are per
 * breakpoint so every row closes flush — one column on phones, two on
 * tablets, six on desktop.
 */
const BENTO: { id: string; className: string; visual?: "scoresheet" | "review" | "share" | "puzzle" }[] = [
  { id: "scoresheet-pgn", className: "sm:col-span-2 lg:col-span-4", visual: "scoresheet" },
  { id: "share-pgn", className: "lg:col-span-2", visual: "share" },
  { id: "stockfish", className: "lg:col-span-2" },
  { id: "insights", className: "lg:col-span-2" },
  { id: "bots", className: "lg:col-span-2" },
  // Five small tiles leave one over at two columns, so on tablets Puzzles
  // takes a row of its own.
  { id: "puzzles", className: "sm:col-span-2 lg:col-span-2", visual: "puzzle" },
  { id: "ai-review", className: "sm:col-span-2 lg:col-span-4", visual: "review" },
];

const ATHLETE = CHESS_FEATURES.filter((item) => item.group === "athlete");

/**
 * What Chess ID does, between the board and the plans.
 *
 * The section opens in the board's own light — the stage's orange sunrise is
 * cut off where the pinned stage ends, so the first thing here is the rest of
 * it — a full section's spacing below the board, which itself stops short of
 * the stage's foot. The tiles rise in as they reach the screen, staggered
 * across each row rather than down the whole grid.
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
                Everything your <span className="text-brand">game</span> needs
                <span className="text-accent">.</span>
              </DisplayText>
            </motion.div>
          </div>

          <motion.div {...reveal} transition={{ duration: 0.8, ease, delay: 0.1 }}>
            <BodyText className="max-w-md text-base lg:pb-2">
              From the scoresheet in your hand to the deepest engine lines — one place to record,
              review and improve every game you play.
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
              wide={tile.visual === "scoresheet" || tile.visual === "review"}
            >
              {tile.visual === "scoresheet" && <ScoresheetVisual />}
              {tile.visual === "review" && <ReviewVisual />}
              {tile.visual === "share" && <ShareVisual />}
              {tile.visual === "puzzle" && <PuzzleVisual />}
            </FeatureTile>
          ))}
        </ul>

        <AthletePanel />
      </Container>
    </section>
  );
}

/** Which plans include a feature: orange for Premium's chess tools, blue for every plan. */
export function PlanChip({ group, className }: { group: FeatureGroup; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[0.55rem] font-semibold tracking-[0.2em] uppercase",
        group === "chess"
          ? "border-orange-line bg-orange-soft text-orange-strong"
          : "border-accent-line bg-accent-soft text-accent-strong",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1 rounded-full",
          group === "chess"
            ? "bg-orange shadow-[0_0_6px_rgb(var(--orange-rgb)/var(--glow))]"
            : "bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/var(--glow))]",
        )}
      />
      {FEATURE_GROUPS[group].plans}
    </span>
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
  feature: ChessFeature;
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
            ? "grid gap-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-8"
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
            <PlanChip group={feature.group} />
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

/** The opening the board plays, as numbered move pairs. */
const MOVE_PAIRS = OPENING.reduce<string[][]>((pairs, ply, i) => {
  if (i % 2 === 0) pairs.push([ply.san]);
  else pairs[pairs.length - 1].push(ply.san);
  return pairs;
}, []);

/**
 * A handwritten scoresheet being read into PGN: a scanner runs down the
 * sheet, and as each row is read its moves arrive in the file beside it. It
 * is the same opening the board above plays.
 */
function ScoresheetVisual() {
  const rowDelay = (i: number) => 0.35 + i * 0.22;

  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      aria-hidden
      className="relative grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 sm:gap-4"
    >
      {/* The sheet. */}
      <div className="relative overflow-hidden rounded-xl border border-tint/10 bg-[linear-gradient(180deg,var(--color-surface),var(--color-bg))] px-3 pt-2.5 pb-3 shadow-[var(--shadow-tile)]">
        <div className="grid grid-cols-[1.1rem_1fr_1fr] gap-x-2 border-b border-tint/10 pb-1.5 font-display text-[0.5rem] font-semibold tracking-[0.18em] text-faint uppercase">
          <span>#</span>
          <span>White</span>
          <span>Black</span>
        </div>
        {MOVE_PAIRS.map(([white, black], i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0.35 },
              shown: { opacity: 1, transition: { duration: 0.5, delay: rowDelay(i) } },
            }}
            className="grid grid-cols-[1.1rem_1fr_1fr] gap-x-2 border-b border-dashed border-tint/[0.08] py-[0.3rem] text-[0.72rem] last:border-0"
          >
            <span className="tabular text-faint">{i + 1}</span>
            <span className="font-medium text-accent italic">{white}</span>
            <span className="font-medium text-accent italic">{black}</span>
          </motion.div>
        ))}

        {/* The scanner: a full-height layer whose foot is the line, so one
            pass of the animation carries the line from the top to the foot. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 animate-scan">
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[rgb(var(--orange-rgb)/calc(0.2*var(--glow)+0.06))]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-orange via-orange-strong to-accent shadow-[0_0_10px_rgb(var(--orange-rgb)/var(--glow))]" />
          </div>
        </div>
      </div>

      {/* Sheet to file. */}
      <span className="absolute top-1/2 left-[45%] z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-orange-line bg-bg-elevated text-orange-strong shadow-[var(--shadow-float)]">
        <ArrowRight className="size-3.5" strokeWidth={2.2} />
      </span>

      {/* The file. */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-tint/10 bg-void font-mono text-[0.66rem] leading-[1.7] shadow-[var(--shadow-tile)] sm:text-[0.7rem]">
        <div className="flex items-center gap-1.5 border-b border-tint/[0.08] px-3 py-2">
          <span className="size-1.5 rounded-full bg-orange/70" />
          <span className="size-1.5 rounded-full bg-tint/20" />
          <span className="size-1.5 rounded-full bg-accent/70" />
          <span className="ml-1.5 font-sans text-[0.6rem] text-faint">game.pgn</span>
        </div>
        <div className="px-3 py-2.5">
          {[
            ["Event", "Club night"],
            ["White", "You"],
          ].map(([tag, value]) => (
            <p key={tag} className="truncate">
              <span className="text-faint">[</span>
              <span className="text-accent">{tag}</span> <span className="text-orange-strong">&quot;{value}&quot;</span>
              <span className="text-faint">]</span>
            </p>
          ))}
          <p className="mt-1.5 text-fg">
            {MOVE_PAIRS.map(([white, black], i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0 },
                  shown: { opacity: 1, transition: { duration: 0.4, delay: rowDelay(i) + 0.18 } },
                }}
              >
                <span className="text-faint">{i + 1}.</span>
                {white} {black}{" "}
              </motion.span>
            ))}
            <motion.span
              variants={{
                hidden: { opacity: 0 },
                shown: { opacity: 1, transition: { delay: rowDelay(MOVE_PAIRS.length) + 0.1 } },
              }}
              className="text-faint"
            >
              *
            </motion.span>
          </p>
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 6 },
            shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: rowDelay(MOVE_PAIRS.length) + 0.3 } },
          }}
          className="mt-auto flex items-center gap-1.5 border-t border-tint/[0.08] px-3 py-2 font-sans text-[0.62rem] text-muted"
        >
          <Check className="size-3 text-accent" strokeWidth={3} />
          {MOVE_PAIRS.length} moves read
        </motion.div>
      </div>
    </motion.div>
  );
}

/** A game on its way out: the file, and the people it goes to. */
function ShareVisual() {
  return (
    <div aria-hidden className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-line bg-orange-soft px-2.5 py-1.5 font-mono text-[0.66rem] text-orange-strong">
        <Download className="size-3" strokeWidth={2.2} />
        game.pgn
      </span>
      <span className="h-px w-4 bg-gradient-to-r from-orange to-accent" />
      {["Coach", "Club", "Friends"].map((who, i) => (
        <motion.span
          key={who}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 + i * 0.12 }}
          className="rounded-full border border-tint/10 bg-tag px-2.5 py-1 text-[0.68rem] text-muted transition-colors duration-300 group-hover:border-accent-line group-hover:text-fg"
        >
          {who}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * A puzzle waiting: four squares of a board with the target picked out, and
 * the prompt beside it.
 */
function PuzzleVisual() {
  return (
    <div aria-hidden className="flex items-center gap-4">
      <span className="grid size-12 shrink-0 grid-cols-4 overflow-hidden rounded-md border border-tint/10 shadow-[var(--shadow-tile)]">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={cn(
              (Math.floor(i / 4) + i) % 2 === 0 ? "bg-tint/[0.14]" : "bg-tint/[0.04]",
              i === 6 && "animate-pulse bg-orange/80",
              i === 13 && "bg-accent/70",
            )}
          />
        ))}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[0.6rem] font-semibold tracking-[0.18em] text-faint uppercase">
          White to play
        </span>
        <span className="mt-1 block font-display text-[1rem] font-semibold tracking-tight text-fg">Mate in 2</span>
      </span>
    </div>
  );
}

const REVIEW = [
  { move: "4. c3", note: "Prepares d4 for a broad centre." },
  { move: "5. d3", note: "The quiet move that names the Pianissimo." },
  { move: "6. O-O", note: "Both kings safe, and the centre still closed." },
];

/**
 * A review being written: the moves arrive one by one, each with its note,
 * and the last is still being typed, so the card reads as a coach at work
 * rather than a finished report.
 */
function ReviewVisual() {
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      aria-hidden
      className="overflow-hidden rounded-xl border border-tint/10 bg-void shadow-[var(--shadow-tile)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-tint/[0.08] px-4 py-2.5">
        <span className="flex items-center gap-2 font-display text-[0.62rem] font-semibold tracking-[0.18em] text-fg uppercase">
          <Sparkles className="size-3.5 text-orange-strong" strokeWidth={2} />
          Game review
        </span>
        <span className="truncate text-[0.66rem] text-faint">Giuoco Pianissimo</span>
      </div>

      <ol className="divide-y divide-tint/[0.06]">
        {REVIEW.map((row, i) => {
          const last = i === REVIEW.length - 1;
          const words = row.note.split(" ");
          const at = 0.3 + i * 0.45;
          return (
            <motion.li
              key={row.move}
              variants={{
                hidden: { opacity: 0, x: -12 },
                shown: { opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: at } },
              }}
              className={cn(
                "relative grid grid-cols-[3.6rem_minmax(0,1fr)] items-start gap-3 px-4 py-3",
                last && "bg-[linear-gradient(90deg,rgb(var(--orange-rgb)/calc(0.1*var(--glow)+0.03)),transparent_70%)]",
              )}
            >
              {last && <span className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-orange to-accent" />}
              <span className="font-mono text-[0.72rem] font-medium text-fg">{row.move}</span>
              <span className="min-w-0">
                <span className="mr-2 inline-flex rounded-full border border-accent-line bg-accent-soft px-1.5 py-px font-display text-[0.5rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">
                  Book
                </span>
                <span className="text-[0.76rem] leading-relaxed text-muted">
                  {words.map((word, w) => (
                    <Fragment key={w}>
                      <motion.span
                        variants={{
                          hidden: { opacity: 0 },
                          shown: { opacity: 1, transition: { duration: 0.25, delay: at + 0.3 + w * 0.07 } },
                        }}
                      >
                        {word}
                      </motion.span>{" "}
                    </Fragment>
                  ))}
                  {last && (
                    <span className="ml-px inline-block h-[0.9em] w-px translate-y-[0.15em] animate-pulse bg-orange-strong" />
                  )}
                </span>
              </span>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}

/** The three things every plan includes, together on one panel. */
function AthletePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease }}
      className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-accent-line/70 bg-[linear-gradient(135deg,rgb(var(--accent-rgb)/calc(0.1*var(--glow)+0.02)),transparent_55%),linear-gradient(var(--color-bg-elevated),var(--color-bg-elevated))] p-6 shadow-[var(--shadow-tile)] sm:p-8 lg:mt-5 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:items-center lg:gap-10"
    >
      <div>
        <PlanChip group="athlete" />
        <h3 className="mt-5 font-display text-[clamp(1.4rem,2.4vw,1.85rem)] leading-tight font-semibold tracking-tight text-fg">
          Your athlete identity<span className="text-accent">.</span>
        </h3>
        <p className="mt-2.5 max-w-sm text-[0.92rem] leading-relaxed text-pretty text-muted">
          Included with every plan, so the way you&apos;re seen grows with your game.
        </p>
      </div>

      <ul className="mt-7 grid gap-3 sm:grid-cols-3 lg:mt-0">
        {ATHLETE.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.08 }}
              className="group rounded-2xl border border-tint/[0.07] bg-tile p-5 shadow-[var(--shadow-tile)] transition-[translate,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-accent-line hover:shadow-[var(--shadow-tile-hover)]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-accent-line bg-accent-soft text-accent-strong transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="size-[1.1rem]" strokeWidth={1.8} aria-hidden />
              </span>
              <h4 className="mt-4 font-display text-[1rem] font-semibold tracking-tight text-fg">{item.title}</h4>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-pretty text-muted">{item.description}</p>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
