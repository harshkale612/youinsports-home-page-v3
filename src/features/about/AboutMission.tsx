"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Medal, Route, Waypoints, type LucideIcon } from "lucide-react";
import { Container, SectionLabel, BodyText } from "@/components/ui/Primitives";
import { JOURNEY_LEVELS, type JourneyLevelConfig } from "@/data/journey-levels";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** The statement lights up word by word as it is read down the screen. */
const STATEMENT_WORDS = [
  { text: "Talent is everywhere. We make sure it’s" },
  { text: "seen, connected and supported.", brand: true },
].flatMap((segment) => segment.text.split(" ").map((word) => ({ word, brand: segment.brand })));

type Pillar = { id: string; icon: LucideIcon; title: string; body: string };

/** The tagline's three ideas, one card each. */
const PILLARS: Pillar[] = [
  {
    id: "networking",
    icon: Waypoints,
    title: "The power of networking",
    body: "Coaches, clubs, scouts, sponsors and fellow athletes — the people who open doors, brought within reach.",
  },
  {
    id: "amateur",
    icon: Medal,
    title: "Made for amateur athletes",
    body: "Built for the athletes still chasing their break, not only the few who have already made it.",
  },
  {
    id: "every-stage",
    icon: Route,
    title: "Every stage of the journey",
    body: "From a first local event to the international stage — support that grows as you do.",
  },
];

/**
 * What we're for, told three ways: a statement you read into, the three ideas
 * behind it, and the path they add up to.
 */
export function AboutMission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="relative scroll-mt-20 py-[var(--section-y)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-64 size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.08),transparent_65%)]"
      />

      <Container className="relative">
        <SectionLabel index="01">Our mission</SectionLabel>

        <Statement />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.8, ease }}
        >
          <BodyText className="mt-8 max-w-2xl">
            Every great athlete starts somewhere — a local ground, a school team, a weekend
            league. YouInSports connects them with the coaches, clubs, scouts and sponsors who
            can help them go further.
          </BodyText>
        </motion.div>

        <ul className="mt-16 grid gap-4 md:grid-cols-3 md:gap-5">
          {PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </ul>

        <JourneyStages />
      </Container>
    </section>
  );
}

function Statement() {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  return (
    <h2 ref={ref} id="mission-heading" className="display-lg mt-8 max-w-4xl text-balance text-fg">
      {STATEMENT_WORDS.map(({ word, brand }, i) => (
        <Fragment key={i}>
          <LitWord
            progress={scrollYProgress}
            range={[i / STATEMENT_WORDS.length, (i + 1) / STATEMENT_WORDS.length]}
            still={reducedMotion}
            className={brand ? "text-brand" : undefined}
          >
            {word}
          </LitWord>{" "}
        </Fragment>
      ))}
    </h2>
  );
}

function LitWord({
  progress,
  range,
  still,
  className,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  /** Reduced motion: every word already lit. */
  still: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // Always bound, with a flat range when still: dropping the binding instead
  // would leave the server-rendered opacity stuck on the word.
  const opacity = useTransform(progress, range, still ? [1, 1] : [0.16, 1]);

  return (
    <motion.span style={{ opacity }} className={className}>
      {children}
    </motion.span>
  );
}

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const Icon = pillar.icon;

  // The spotlight follows the pointer through CSS variables, so moving it
  // never re-renders the card.
  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease, delay: index * 0.12 }}
    >
      {/* Glass built from utilities rather than `.glass`, which sits outside
          the cascade layers and would win over the hover border. */}
      <div
        onPointerMove={handlePointerMove}
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-xl md:p-8",
          "shadow-[var(--glass-shadow)]",
          "transition-[translate,border-color,box-shadow] duration-500 ease-out",
          "hover:-translate-y-1 hover:border-orange/40 hover:shadow-[var(--glass-shadow-hover)]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(26rem_circle_at_var(--spot-x,50%)_var(--spot-y,0%),rgb(240_107_40/0.13),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange/80 via-orange/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative flex items-start justify-between">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-strong ring-1 ring-accent-line ring-inset transition-colors duration-500 group-hover:bg-orange-soft group-hover:text-orange-strong group-hover:ring-orange-line">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="tabular font-display text-[0.7rem] font-semibold tracking-[0.2em] text-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="relative mt-10 font-display text-[1.35rem] leading-tight font-semibold tracking-tight text-fg">
          {pillar.title}
        </h3>
        <p className="relative mt-3 text-pretty text-[0.95rem] leading-relaxed text-muted">
          {pillar.body}
        </p>
      </div>
    </motion.li>
  );
}

/**
 * The journey's own ladder, walked as the page scrolls.
 *
 * The track fills with scroll and each stage lights as the fill reaches it —
 * horizontal from `md`, a vertical line down the left on phones. Reduced
 * motion gets the whole path already walked.
 */
function JourneyStages() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const walked = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  const progress = useTransform(walked, [0, 1], reducedMotion ? [1, 1] : [0, 1]);

  return (
    <div ref={ref} className="mt-24">
      <p className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
        From first step to global stage
      </p>

      <ol className="relative mt-10 grid gap-y-10 md:grid-cols-4">
        <span
          aria-hidden
          className="absolute top-[0.6rem] left-[0.6rem] h-[calc(100%-1.2rem)] w-px bg-tint/10 md:left-0 md:h-px md:w-full"
        />
        <motion.span
          aria-hidden
          style={{ scaleY: progress }}
          className="absolute top-[0.6rem] left-[0.6rem] h-[calc(100%-1.2rem)] w-px origin-top bg-gradient-to-b from-accent to-orange md:hidden"
        />
        <motion.span
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute top-[0.6rem] left-0 hidden h-px w-full origin-left bg-gradient-to-r from-accent via-accent to-orange shadow-[0_0_12px_rgb(var(--orange-rgb)/calc(0.5*var(--glow)))] md:block"
        />

        {JOURNEY_LEVELS.map((level, i) => (
          <Stage
            key={level.id}
            level={level}
            index={i}
            count={JOURNEY_LEVELS.length}
            progress={progress}
          />
        ))}
      </ol>
    </div>
  );
}

function Stage({
  level,
  index,
  count,
  progress,
}: {
  level: JourneyLevelConfig;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  // Lit once the fill reaches this stage's dot. The first is lit from the
  // start: it's where everyone begins.
  const at = index / count;
  const lit = useTransform(progress, [at - 0.06, at], [0, 1]);
  const textOpacity = useTransform(lit, [0, 1], [0.45, 1]);
  // Where you start is blue, where you're headed is orange — as on the homepage.
  const isLast = index === count - 1;

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease, delay: index * 0.08 }}
      className="relative pl-10 md:pr-8 md:pl-0"
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 flex size-[1.2rem] items-center justify-center rounded-full border border-tint/20 bg-void md:relative"
      >
        <motion.span
          style={{ opacity: lit }}
          className={cn(
            "absolute -inset-px rounded-full border",
            isLast
              ? "border-orange bg-orange-soft shadow-[0_0_16px_rgb(var(--orange-rgb)/calc(0.75*var(--glow)))]"
              : "border-accent bg-accent-soft shadow-[0_0_14px_rgb(var(--accent-rgb)/calc(0.7*var(--glow)))]",
          )}
        />
        <motion.span
          style={{ opacity: lit }}
          className={cn("relative size-1.5 rounded-full", isLast ? "bg-orange-strong" : "bg-accent-strong")}
        />
      </span>

      <motion.div style={{ opacity: textOpacity }} className="md:mt-6">
        <p className="tabular font-display text-[0.58rem] font-semibold tracking-[0.2em] text-faint uppercase">
          Stage {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-fg">
          {level.label}
        </h3>
        <p className="mt-1.5 text-[0.88rem] leading-snug text-muted">{level.description}</p>
      </motion.div>
    </motion.li>
  );
}
