"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { ArrowRight, Check, DollarSign, Hourglass, Magnet, Scale, Smartphone } from "lucide-react";
import { BodyText, Container, DisplayText, SectionLabel } from "@/components/ui/Primitives";
import {
  BOARD_PRICE,
  BOARDS_PER_PHONE,
  CAP_HOURS,
  OWN_FEATURES,
  PGN_VERIFIED_IN,
  phonesFor,
  RENT_FEATURES,
  RENT_TO_OWN_HOURS,
  RENTAL,
  rentalEstimate,
  type OfferFeature,
} from "@/data/chessboard";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
/** The curve the board's pieces land on, for a board set down on display. */
const land = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Renders of the board's own model (the one the stage above plays on), on a
 * transparent ground so they sit in either theme's display window: set up
 * for the board you own, mid-game for the boards you rent for an event.
 */
const ART = {
  own: {
    src: "/products/board-set.webp",
    width: 1400,
    height: 768,
    alt: "The smart chessboard with all 32 pieces set up",
  },
  rent: {
    src: "/products/board-in-play.webp",
    width: 1400,
    height: 792,
    alt: "A smart chessboard with a game in progress",
  },
};

/** Where the estimators start: a phone's worth of boards to own, two to rent for a club night. */
const DEFAULT_OWN_BOARDS = BOARDS_PER_PHONE;
const DEFAULT_RENT_BOARDS = 2 * BOARDS_PER_PHONE;
const DEFAULT_HOURS = 4;

/**
 * The board's two prices: one to own, one by the hour.
 *
 * Owning is the card the page leads to: the wider one, with the logo's
 * colours round its edge and a warm glow beneath it, the board set up in its
 * window. Both cards work the sum out for you — boards in to own, boards and
 * hours in to rent, with the rental's minimum and day cap applied as they
 * bite. Both follow the page theme.
 */
export function ChessPricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-20 overflow-hidden pt-[calc(var(--section-y)*0.6)] pb-[calc(var(--section-y)+1rem)]"
    >
      <Backdrop />

      <Container className="relative max-w-[84rem]">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel index="02" className="justify-center">
            Pricing
          </SectionLabel>
          <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
            <DisplayText id="pricing-heading" as="h2" className="mt-7">
              Own it, or rent it <span className="text-brand">by the hour</span>
              <span className="text-accent">.</span>
            </DisplayText>
          </motion.div>
          <motion.div {...reveal} transition={{ duration: 0.8, ease, delay: 0.1 }}>
            <BodyText className="mx-auto mt-5 max-w-xl">
              A board of your own for {dollars.format(BOARD_PRICE)}, or as many as your event needs at{" "}
              {dollars.format(RENTAL.hourly)} a board an hour.
            </BodyText>
          </motion.div>
        </div>

        <ul className="mx-auto mt-14 grid max-w-xl gap-6 lg:mt-20 lg:max-w-[70rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] lg:gap-7">
          {/* Owning first in the markup, so phones see it first; on desktop
              it moves right. No fixed height: the grid stretches both cards
              to the row, so side by side they stand the same. */}
          <motion.li
            initial={{ opacity: 0, y: 56, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.95, ease }}
            className="lg:order-last"
          >
            <OwnCard />
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: 56, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.95, ease, delay: 0.12 }}
          >
            <RentCard />
          </motion.li>
        </ul>

        <motion.ul
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.82rem] text-muted"
        >
          {[
            { icon: DollarSign, text: "Prices in US dollars" },
            { icon: Hourglass, text: `Rentals billed by the hour, ${RENTAL.minimumHours}-hour minimum` },
            { icon: Smartphone, text: `One phone runs up to ${BOARDS_PER_PHONE} boards` },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="size-3.5 text-accent" strokeWidth={2} aria-hidden />
              {text}
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}

function OwnCard() {
  const [boards, setBoards] = useState(DEFAULT_OWN_BOARDS);

  return (
    <OfferCard id="own" featured>
      <Showcase art={ART.own} featured label="The board" caption="Set up and ready to record">
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-pill px-2.5 py-1 text-[0.66rem] text-fg shadow-[var(--shadow-float)] ring-1 ring-tint/10 ring-inset backdrop-blur-md">
          <Magnet className="size-3 text-orange-strong" strokeWidth={2.2} aria-hidden />
          {/* On a phone the full chip would run into the caption beside it. */}
          <span>
            64 sensors<span className="hidden sm:inline">, no camera</span>
          </span>
        </span>
      </Showcase>

      <div className="flex flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-7 sm:pb-6">
        <OfferHeading id="own" name="Own" badge="Yours to keep" featured />
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-pretty text-muted">
          For clubs, coaches and serious players: every game you play on it, recorded.
        </p>

        <Price amount={BOARD_PRICE} unit="board" className="mt-7" />
        <p className="mt-2 text-[0.82rem] text-faint">One price for the board, and everything it does.</p>

        <EstimateBox label="Equip your club" featured>
          <Slider
            id="own-boards"
            label={
              <>
                Boards<span className="sr-only"> to buy</span>
              </>
            }
            value={boards}
            min={1}
            max={RENTAL.maxBoards}
            onChange={setBoards}
          >
            {boards}
          </Slider>
          <TotalRow
            label="Total"
            value={boards * BOARD_PRICE}
            detail={`${boards} ${boards === 1 ? "board" : "boards"} × ${dollars.format(BOARD_PRICE)}`}
          />
          <EstimateNote icon={Scale}>
            The same as renting {boards === 1 ? "it" : "them"} for about{" "}
            <span className="tabular text-fg">{RENT_TO_OWN_HOURS}</span> hours of play
          </EstimateNote>
          <PhonesNote boards={boards} />
        </EstimateBox>

        <span aria-hidden className="rule-brand my-7 block" />

        <ListLabel featured>Everything it does</ListLabel>
        <FeatureList features={OWN_FEATURES} featured className="sm:grid-cols-2 sm:gap-x-5" />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.76rem] text-faint">Its games open in</span>
          {PGN_VERIFIED_IN.map((app) => (
            <span
              key={app}
              className="inline-flex items-center gap-1 rounded-full bg-tag py-1 pr-2.5 pl-2 text-[0.74rem] text-muted ring-1 ring-tint/10 ring-inset"
            >
              <Check className="size-3 text-accent" strokeWidth={2.6} aria-hidden />
              {app}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <PlanButton
            label={boards === 1 ? "Reserve your board" : `Reserve ${boards} boards`}
            onClick={() => trackEvent("pricing_cta_clicked", { offer: "own", boards, total: boards * BOARD_PRICE })}
          />
          <p className="mt-3.5 text-center text-[0.76rem] text-faint">
            Works with our pairing system, or on its own.
          </p>
        </div>
      </div>
    </OfferCard>
  );
}

function RentCard() {
  const [boards, setBoards] = useState(DEFAULT_RENT_BOARDS);
  const [hours, setHours] = useState(DEFAULT_HOURS);

  return (
    <OfferCard id="rent">
      <Showcase art={ART.rent} label="In play" caption="Boards for your event">
        <RentalClock />
      </Showcase>

      <div className="flex flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-7 sm:pb-6">
        <OfferHeading id="rent" name="Rent" badge="For events" />
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-pretty text-muted">
          For tournaments, club nights and camps: as many boards as you need, for as long as you play.
        </p>

        <Price amount={RENTAL.hourly} unit="board / hour" className="mt-7" />
        <p className="mt-2 text-[0.82rem] leading-relaxed text-faint">
          Billed for at least {RENTAL.minimumHours} hours, and never more than {dollars.format(RENTAL.dailyCap)} a
          board in a day.
        </p>

        <RentalEstimator boards={boards} hours={hours} onBoards={setBoards} onHours={setHours} />

        <span aria-hidden className="my-7 block h-px bg-tint/[0.08]" />

        <ListLabel>What&apos;s included</ListLabel>
        <FeatureList features={RENT_FEATURES} />

        <div className="mt-auto pt-8">
          <PlanButton
            label="Request a rental"
            onClick={() =>
              trackEvent("pricing_cta_clicked", {
                offer: "rent",
                boards,
                hours,
                total: rentalEstimate(boards, hours).total,
              })
            }
          />
          <p className="mt-3.5 text-center text-[0.76rem] text-faint">Estimates in US dollars, per day of play.</p>
        </div>
      </div>
    </OfferCard>
  );
}

/**
 * A pricing card's frame. The featured card wears the logo's colours round
 * its edge and stands in a pool of warm light; the other's hairline lights
 * up in the same colours on hover.
 */
function OfferCard({ id, featured, children }: { id: string; featured?: boolean; children: React.ReactNode }) {
  return (
    <div className="group relative isolate h-full">
      {featured && (
        // The pool of light the card stands in.
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -inset-y-14 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.2),rgb(44_143_227/0.08)_55%,transparent)] opacity-80 transition-opacity duration-700 group-hover:opacity-100"
        />
      )}

      <div
        className={cn(
          "relative h-full rounded-[2rem] p-px transition-[translate] duration-500 ease-out group-hover:-translate-y-1",
          featured ? "bg-[image:var(--featured-edge)] shadow-[var(--featured-shadow)]" : "bg-tint/[0.09]",
        )}
      >
        {!featured && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgb(var(--orange-rgb)/0.6),rgb(var(--orange-rgb)/0.04)_40%,rgb(var(--accent-rgb)/0.04)_60%,rgb(var(--accent-rgb)/0.7))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <article
          aria-labelledby={`offer-${id}`}
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1px)] p-2",
            featured ? "bg-[image:var(--featured-surface)]" : "bg-bg-elevated shadow-[var(--shadow-card)]",
          )}
        >
          {children}
        </article>
      </div>
    </div>
  );
}

function OfferHeading({ id, name, badge, featured }: { id: string; name: string; badge: string; featured?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <h3 id={`offer-${id}`} className="font-display text-[1.9rem] leading-none font-semibold tracking-[-0.03em] text-fg">
        {name}
      </h3>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1.5 font-display text-[0.58rem] font-bold tracking-[0.16em] whitespace-nowrap uppercase",
          featured ? "bg-brand-cta text-ink" : "bg-accent-soft text-accent-strong ring-1 ring-accent-line ring-inset",
        )}
      >
        {badge}
      </span>
    </div>
  );
}

/**
 * The card's display window: the board, rendered from the stage's own model,
 * lit from below in the card's colour — orange to own, blue to rent, as
 * across the rest of the page. It is set down as the card arrives, then
 * hovers a breath above its shadow.
 */
function Showcase({
  art,
  featured,
  label,
  caption,
  children,
}: {
  art: (typeof ART)[keyof typeof ART];
  featured?: boolean;
  label: string;
  caption: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative h-60 overflow-hidden rounded-[calc(2rem-0.5rem)] bg-[image:var(--showcase-surface)] ring-1 ring-[var(--showcase-edge)] ring-inset sm:h-72">
      <div
        aria-hidden
        className={cn(
          "absolute top-[48%] left-1/2 h-[110%] w-[125%] -translate-x-1/2 rounded-[50%] opacity-80 transition-opacity duration-700 group-hover:opacity-100",
          featured
            ? "bg-[radial-gradient(closest-side,rgb(var(--orange-rgb)/calc(0.46*var(--glow))),transparent)]"
            : "bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/calc(0.4*var(--glow))),transparent)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -top-1/2 h-full w-3/4 rounded-[50%]",
          featured
            ? "-left-1/4 bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/calc(0.3*var(--glow))),transparent)]"
            : "-right-1/4 bg-[radial-gradient(closest-side,rgb(var(--orange-rgb)/calc(0.2*var(--glow))),transparent)]",
        )}
      />

      <span
        aria-hidden
        className="absolute bottom-[8%] left-1/2 h-9 w-[64%] -translate-x-1/2 animate-hover-shadow rounded-[50%] bg-[radial-gradient(closest-side,var(--piece-shadow),transparent)]"
      />
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: land, delay: 0.3 }}
        className="absolute inset-x-[6%] top-[22%] bottom-[11%]"
      >
        <div className="size-full animate-hover transition-[scale] duration-700 ease-out group-hover:scale-[1.035]">
          <Image
            src={art.src}
            alt={art.alt}
            width={art.width}
            height={art.height}
            sizes="(min-width: 1024px) 36rem, (min-width: 640px) 34rem, 92vw"
            draggable={false}
            className="size-full object-contain select-none"
          />
        </div>
      </motion.div>

      <div className="absolute top-4 left-5">
        <p className="font-display text-[0.58rem] font-semibold tracking-[0.24em] text-fg uppercase">{label}</p>
        <p className="mt-1 text-[0.72rem] text-muted">{caption}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * A rental's clock, running while the card is on screen. The hours are what
 * the card is priced in, so its window keeps time.
 */
function RentalClock() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [seconds, setSeconds] = useState(2 * 3600 + 14 * 60 + 36);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return (
    <span
      ref={ref}
      aria-hidden
      className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-pill px-2.5 py-1 font-mono text-[0.66rem] text-fg shadow-[var(--shadow-float)] ring-1 ring-tint/10 ring-inset backdrop-blur-md"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/var(--glow))]" />
      <span className="tabular">{clock}</span>
    </span>
  );
}

/** A dollar price, with its unit beside it. */
function Price({ amount, unit, className }: { amount: number; unit: string; className?: string }) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <p className="sr-only">
        {dollars.format(amount)} per {unit.replace(" / ", " per ")}
      </p>
      <p aria-hidden className="flex items-start font-display leading-none font-semibold tracking-[-0.045em] text-fg">
        <span className="mt-[0.35rem] mr-0.5 text-[1.45rem] font-medium text-muted sm:text-[1.6rem]">$</span>
        <span className="tabular text-[3.25rem] sm:text-[3.6rem]">{amount}</span>
      </p>
      <span aria-hidden className="pb-1.5 text-[0.85rem] leading-tight text-muted">
        / {unit}
      </span>
    </div>
  );
}

/**
 * Boards and hours in, the day's total out. The minimum and the day cap are
 * applied as they bite, and named when they do, so the total never jumps
 * without a reason on screen.
 */
function RentalEstimator({
  boards,
  hours,
  onBoards,
  onHours,
}: {
  boards: number;
  hours: number;
  onBoards: (boards: number) => void;
  onHours: (hours: number) => void;
}) {
  const { total, perBoard, billedHours, capped } = rentalEstimate(boards, hours);
  const rule = capped
    ? `Day cap: ${dollars.format(RENTAL.dailyCap)} a board`
    : hours < RENTAL.minimumHours
      ? `${RENTAL.minimumHours}-hour minimum`
      : `${billedHours} h × ${dollars.format(RENTAL.hourly)}`;

  return (
    <EstimateBox label="Estimate your event">
      <Slider
        id="rental-boards"
        label={
          <>
            Boards<span className="sr-only"> to rent</span>
          </>
        }
        value={boards}
        min={1}
        max={RENTAL.maxBoards}
        onChange={onBoards}
      >
        {boards}
      </Slider>
      <Slider
        id="rental-hours"
        label="Hours"
        value={hours}
        min={1}
        max={RENTAL.maxHours}
        onChange={onHours}
        mark={{ at: CAP_HOURS, label: "Day cap" }}
      >
        {hours} h
      </Slider>

      <TotalRow
        label="Estimated total"
        value={total}
        detail={`${boards} ${boards === 1 ? "board" : "boards"} × ${dollars.format(perBoard)}`}
      >
        <span className={cn("transition-colors duration-300", capped ? "text-orange-strong" : "text-faint")}>
          {rule}
        </span>
      </TotalRow>
      <PhonesNote boards={boards} />
    </EstimateBox>
  );
}

/** How many phones a set of boards needs, one for every four. */
function PhonesNote({ boards }: { boards: number }) {
  const phones = phonesFor(boards);
  return (
    <EstimateNote icon={Smartphone}>
      Runs on <span className="tabular text-fg">{phones}</span> {phones === 1 ? "phone" : "phones"}, one for every{" "}
      {BOARDS_PER_PHONE} boards
    </EstimateNote>
  );
}

/** The panel a card's calculator sits in. */
function EstimateBox({ label, featured, children }: { label: string; featured?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mt-6 rounded-2xl p-4 ring-1 ring-inset sm:p-5",
        featured
          ? "bg-[linear-gradient(160deg,rgb(var(--orange-rgb)/calc(0.08*var(--glow)+0.02)),transparent_60%)] ring-orange-line/60"
          : "bg-tint/[0.035] ring-tint/10",
      )}
    >
      <ListLabel featured={featured}>{label}</ListLabel>
      {children}
    </div>
  );
}

/** A calculator's answer: the total on the left, how it was reached on the right. */
function TotalRow({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: number;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex items-end justify-between gap-4 border-t border-tint/[0.08] pt-4">
      <div>
        <p className="text-[0.72rem] text-faint">{label}</p>
        <RollingTotal label={label} value={value} />
      </div>
      <p className="pb-1 text-right text-[0.74rem] leading-snug text-muted">
        <span className="tabular">{detail}</span>
        {children && (
          <>
            <br />
            {children}
          </>
        )}
      </p>
    </div>
  );
}

function EstimateNote({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-[0.74rem] text-muted">
      <Icon className="size-3.5 shrink-0 text-accent" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Where a slider's thumb centre sits for `value`, as a length along its track. */
function along(value: number, min: number, max: number) {
  return `calc(0.625rem + (100% - 1.25rem) * ${(value - min) / (max - min)})`;
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  onChange,
  mark,
  children,
}: {
  id: string;
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** A point on the track worth naming, e.g. where the day cap starts. */
  mark?: { at: number; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.86rem] text-fg">
          {label}
        </label>
        <output htmlFor={id} className="tabular font-display text-[0.95rem] font-semibold text-fg">
          {children}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-brand mt-2 block w-full"
        style={{ "--fill": along(value, min, max) } as React.CSSProperties}
      />
      {mark && (
        <div aria-hidden className="relative mt-1 h-4 text-[0.62rem] text-faint">
          <span className="absolute top-0 left-0">{min} h</span>
          <span
            className={cn(
              "absolute top-0 -translate-x-1/2 whitespace-nowrap transition-colors duration-300",
              value >= mark.at && "text-orange-strong",
            )}
            style={{ left: along(mark.at, min, max) }}
          >
            ▴ {mark.label}
          </span>
          <span className="absolute top-0 right-0">{max} h</span>
        </div>
      )}
    </div>
  );
}

/**
 * The total, counting to each new figure rather than jumping, so dragging a
 * slider reads as one sum changing. Screen readers get the settled figure.
 */
function RollingTotal({ label, value }: { label: string; value: number }) {
  const reduced = usePrefersReducedMotion();
  const shown = useMotionValue(value);
  const text = useTransform(shown, (v) => dollars.format(Math.round(v)));

  useEffect(() => {
    const controls = animate(shown, value, { duration: reduced ? 0 : 0.45, ease });
    return () => controls.stop();
  }, [shown, value, reduced]);

  return (
    <>
      <motion.p
        aria-hidden
        className="tabular mt-1 font-display text-[2.1rem] leading-none font-semibold tracking-[-0.035em] text-fg"
      >
        {text}
      </motion.p>
      <p aria-live="polite" className="sr-only">
        {label} {dollars.format(value)}
      </p>
    </>
  );
}

function ListLabel({
  featured,
  className,
  children,
}: {
  featured?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-display text-[0.6rem] font-semibold tracking-[0.22em] uppercase",
        featured ? "text-orange-strong" : "text-faint",
        className,
      )}
    >
      {children}
    </p>
  );
}

function FeatureList({
  features,
  featured,
  className,
}: {
  features: OfferFeature[];
  featured?: boolean;
  className?: string;
}) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      className={cn("mt-4 grid gap-3", className)}
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.li
            key={feature.label}
            variants={{
              hidden: { opacity: 0, y: 8 },
              shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.15 + index * 0.05 } },
            }}
            className="flex items-center gap-3 text-[0.9rem] leading-snug text-fg"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-[0.65rem] ring-1 ring-inset",
                featured
                  ? "bg-orange-soft text-orange-strong ring-orange-line"
                  : "bg-accent-soft text-accent-strong ring-accent-line",
              )}
            >
              <Icon className="size-4" strokeWidth={1.9} />
            </span>
            {feature.label}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/**
 * A card's call to action, the same lit orange on both. A plain button, and
 * it goes nowhere yet: ordering isn't on this site. On hover a glint crosses
 * it.
 */
function PlanButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      // Inline, because the site's `:focus-visible` rule sits outside the
      // cascade layers and would square a utility's corners off on focus.
      style={{ borderRadius: "1rem" }}
      className="group/cta relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden bg-brand-cta font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-ink transition-[translate,background-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5"
    >
      {/* The glint travels only on the way in, and snaps back unseen. It is
          white in both themes, as the orange fill's own highlight is. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-[rgb(255_255_255/0.45)] to-transparent transition-[translate] duration-0 group-hover/cta:translate-x-[320%] group-hover/cta:duration-[900ms] group-hover/cta:ease-out"
      />
      <span className="relative">{label}</span>
      <ArrowRight
        className="relative size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
        strokeWidth={2.2}
        aria-hidden
      />
    </motion.button>
  );
}

/** The light the cards stand in. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute top-[35%] left-1/2 h-[56rem] w-[min(140%,90rem)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/calc(0.08*var(--glow))),transparent)]" />
      <div className="absolute top-[30%] -right-48 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.08),transparent_62%)]" />
      <div className="absolute top-[55%] -left-48 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.08),transparent_62%)] [animation-delay:-9s]" />
    </div>
  );
}
