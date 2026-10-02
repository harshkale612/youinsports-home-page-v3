"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CalendarCheck, Check, IndianRupee, RefreshCcw, Sparkles } from "lucide-react";
import { BodyText, Container, DisplayText, SectionLabel } from "@/components/ui/Primitives";
import {
  CHESS_FEATURES,
  CHESS_PLANS,
  yearlySaving,
  type BillingCycle,
  type ChessFeature,
  type ChessPlan,
} from "@/data/chess-plans";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
/** The curve the board's pieces land on, for a piece set down on display. */
const land = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

const CYCLES: BillingCycle[] = ["monthly", "yearly"];
const CYCLE_LABEL: Record<BillingCycle, string> = { monthly: "Monthly", yearly: "Yearly" };

const CHESS_TOOLS = CHESS_FEATURES.filter((feature) => feature.group === "chess");
const ATHLETE = CHESS_FEATURES.filter((feature) => feature.group === "athlete");
/** The tools Basic's card names when it says what Premium would add. */
const UPSELL = ["ai-review", "stockfish", "puzzles"].map(
  (id) => CHESS_TOOLS.find((feature) => feature.id === id)!.title,
);

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * What a plan costs on a billing cycle, the way the card states it. A yearly
 * plan that also bills monthly is quoted per month, so the two cycles compare
 * like for like, with the monthly price beside it as `was`; a yearly-only
 * plan is quoted for the year.
 */
function quote(plan: ChessPlan, cycle: BillingCycle) {
  const { monthly, yearly } = plan.prices;
  if (cycle === "monthly" && monthly !== undefined) {
    return { amount: monthly, per: "month", note: "Billed every month", was: null };
  }
  if (yearly !== undefined && monthly !== undefined) {
    return { amount: yearly / 12, per: "month", note: `${rupees.format(yearly)} billed once a year`, was: monthly };
  }
  return { amount: yearly ?? 0, per: "year", note: "Billed once a year", was: null };
}

/**
 * Chess ID's plans, as the two pieces they're named for: Basic is the pawn,
 * where every player starts; Premium the queen, the most powerful piece on
 * the board. Each card opens on its piece, rendered from the board's own
 * models and standing in its own stage light.
 *
 * Premium is the plan the page leads to: the wider card, the same height as
 * Basic, with the logo's colours round its edge and a warm glow beneath it.
 * Both cards follow the page theme, each piece turning black by day so it
 * holds against the paper.
 */
export function ChessPricing() {
  const plans = [...CHESS_PLANS].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

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
            Plans &amp; pricing
          </SectionLabel>
          <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
            <DisplayText id="pricing-heading" as="h2" className="mt-7">
              YouInSports <span className="text-brand">Premium</span>
            </DisplayText>
          </motion.div>
          <motion.div {...reveal} transition={{ duration: 0.8, ease, delay: 0.1 }}>
            <BodyText className="mx-auto mt-5 max-w-lg">Unlock your full athletic potential.</BodyText>
          </motion.div>
        </div>

        <ul className="mx-auto mt-14 grid max-w-xl gap-6 lg:mt-20 lg:max-w-[70rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] lg:gap-7">
          {plans.map((plan, i) => (
            <motion.li
              key={plan.id}
              initial={{ opacity: 0, y: 56, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.95, ease, delay: i * 0.12 }}
              // Featured first in the markup, so phones see it first; on
              // desktop it moves right. No fixed height: the grid stretches
              // both cards to the row, so side by side they stand the same.
              className={cn(plan.featured && "lg:order-last")}
            >
              <PlanCard plan={plan} />
            </motion.li>
          ))}
        </ul>

        <motion.ul
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.82rem] text-muted"
        >
          {[
            { icon: CalendarCheck, text: "7-day free trial on Premium" },
            { icon: RefreshCcw, text: "Cancel anytime" },
            { icon: IndianRupee, text: "Prices in Indian rupees" },
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

function PlanCard({ plan }: { plan: ChessPlan }) {
  const featured = Boolean(plan.featured);
  const [cycle, setCycle] = useState<BillingCycle>(plan.defaultCycle);
  const cycles = CYCLES.filter((c) => plan.prices[c] !== undefined);
  const features = featured ? CHESS_TOOLS : ATHLETE;

  function choose(next: BillingCycle) {
    setCycle(next);
    trackEvent("pricing_billing_changed", { plan: plan.id, cycle: next });
  }

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
          // Basic's edge lights up in the logo's colours on hover.
          <span
            aria-hidden
            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgb(var(--orange-rgb)/0.6),rgb(var(--orange-rgb)/0.04)_40%,rgb(var(--accent-rgb)/0.04)_60%,rgb(var(--accent-rgb)/0.7))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <article
          aria-labelledby={`plan-${plan.id}`}
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1px)] p-2",
            featured ? "bg-[image:var(--featured-surface)]" : "bg-bg-elevated shadow-[var(--shadow-card)]",
          )}
        >
          <Showcase plan={plan} featured={featured} />

          <div className="flex flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-7 sm:pb-6">
            {/* The trial badge sits by the name rather than in the window,
                where on a phone it would land on the queen's crown. */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h3
                id={`plan-${plan.id}`}
                className="font-display text-[1.9rem] leading-none font-semibold tracking-[-0.03em] text-fg"
              >
                {plan.name}
              </h3>
              {plan.trialDays && (
                <span className="inline-flex items-center rounded-full bg-brand-cta px-3 py-1.5 font-display text-[0.58rem] font-bold tracking-[0.16em] whitespace-nowrap text-ink uppercase">
                  {plan.trialDays}-day free trial
                </span>
              )}
            </div>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-pretty text-muted">{plan.tagline}</p>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
              <Price plan={plan} cycle={cycle} />
              {cycles.length > 1 && (
                <BillingSwitch plan={plan} cycles={cycles} cycle={cycle} onChange={choose} />
              )}
            </div>

            <span aria-hidden className={cn("my-7 block h-px", featured ? "rule-brand" : "bg-tint/[0.08]")} />

            {featured && (
              <>
                <ListLabel featured>Everything in Basic</ListLabel>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {ATHLETE.map((feature) => (
                    <li
                      key={feature.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pr-3 pl-2 text-[0.8rem] text-fg ring-1 ring-accent-line ring-inset"
                    >
                      <Check className="size-3.5 text-accent-strong" strokeWidth={2.6} aria-hidden />
                      {feature.title}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <ListLabel featured={featured} className={cn(featured && "mt-7")}>
              {featured ? `Plus ${CHESS_TOOLS.length} chess tools` : "What’s included"}
            </ListLabel>
            <motion.ul
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: "-10% 0px" }}
              className={cn("mt-4 grid gap-3", featured && "sm:grid-cols-2 sm:gap-x-5")}
            >
              {features.map((feature, i) => (
                <FeatureRow key={feature.id} feature={feature} featured={featured} index={i} />
              ))}
            </motion.ul>

            {!featured && (
              <div className="mt-6 flex gap-3 rounded-2xl bg-orange-soft p-4 ring-1 ring-orange-line/60 ring-inset">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-orange-strong" strokeWidth={2} aria-hidden />
                <p className="text-[0.84rem] leading-relaxed text-pretty text-muted">
                  <span className="font-medium text-fg">Premium adds {CHESS_TOOLS.length} chess tools</span> —{" "}
                  {UPSELL.slice(0, -1).join(", ")}, {UPSELL.at(-1)} and more.
                </p>
              </div>
            )}

            {/* Last on the card, and pinned to its foot. */}
            <div className="mt-auto pt-8">
              <PlanButton
                label={plan.cta}
                onClick={() => trackEvent("pricing_cta_clicked", { plan: plan.id, cycle })}
              />
              <p className="mt-3.5 text-center text-[0.76rem] text-faint">{plan.note}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

/**
 * The card's display window: the plan's piece standing on a sliver of the
 * board, lit from below in the plan's colour — orange for Premium, blue for
 * Basic, as across the rest of the page.
 *
 * The piece is set down on its square as the card arrives, then hovers a
 * breath above it, its shadow tightening as it rises.
 */
function Showcase({ plan, featured }: { plan: ChessPlan; featured: boolean }) {
  const { piece } = plan;
  const swaps = piece.art.light !== piece.art.dark;

  return (
    <div className="relative h-56 overflow-hidden rounded-[calc(2rem-0.5rem)] bg-[image:var(--showcase-surface)] ring-1 ring-[var(--showcase-edge)] ring-inset sm:h-60">
      <div
        aria-hidden
        className={cn(
          "absolute top-[44%] left-1/2 h-[120%] w-[130%] -translate-x-1/2 rounded-[50%] opacity-80 transition-opacity duration-700 group-hover:opacity-100",
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

      {/* A sliver of the board, receding from the window's foot. */}
      <div aria-hidden className="absolute inset-0 perspective-[420px] perspective-origin-[50%_30%]">
        <div className="absolute inset-x-[-60%] bottom-0 h-[150%] origin-bottom rotate-x-[72deg] bg-[conic-gradient(var(--showcase-square-light)_90deg,var(--showcase-square-dark)_90deg_180deg,var(--showcase-square-light)_180deg_270deg,var(--showcase-square-dark)_270deg)] [background-position:50%_100%] [background-size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_32%_55%_at_50%_100%,black_35%,transparent)]" />
      </div>

      <span
        aria-hidden
        className="absolute bottom-[15%] left-1/2 h-5 w-[7.5rem] -translate-x-1/2 animate-hover-shadow rounded-[50%] bg-[radial-gradient(closest-side,var(--piece-shadow),transparent)]"
      />
      <motion.div
        aria-hidden
        initial={{ y: -48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: land, delay: 0.3 }}
        className="absolute bottom-[12%] left-1/2 aspect-[4/5] h-[84%] -translate-x-1/2"
      >
        <div className="size-full animate-hover transition-[scale] duration-700 ease-out group-hover:scale-[1.04]">
          <Image
            src={piece.art.dark}
            alt=""
            width={720}
            height={900}
            sizes="(min-width: 640px) 12rem, 10rem"
            draggable={false}
            className={cn("size-full object-contain select-none", swaps && "theme-art-dark")}
          />
          {swaps && (
            <Image
              src={piece.art.light}
              alt=""
              width={720}
              height={900}
              sizes="(min-width: 640px) 12rem, 10rem"
              draggable={false}
              className="theme-art-light size-full object-contain select-none"
            />
          )}
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-5">
        <p className="font-display text-[0.58rem] font-semibold tracking-[0.24em] text-fg uppercase">{piece.name}</p>
        <p className="mt-1 text-[0.72rem] text-muted">{piece.caption}</p>
      </div>

    </div>
  );
}

/**
 * The price, which rolls over when the cycle changes. On a yearly plan that
 * could also be paid monthly, the monthly price sits beside it, struck out.
 */
function Price({ plan, cycle }: { plan: ChessPlan; cycle: BillingCycle }) {
  const { amount, per, note, was } = quote(plan, cycle);
  const parts = rupees.formatToParts(amount);
  const symbol = parts.find((part) => part.type === "currency")?.value ?? "₹";
  const whole = parts
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.value)
    .join("");
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";

  return (
    <div aria-live="polite">
      <div className="flex items-end gap-3">
        <p className="relative flex h-[3.5rem] items-end overflow-hidden pr-0.5 font-display leading-none font-semibold tracking-[-0.045em] text-fg sm:h-[3.9rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={amount}
              initial={{ y: "75%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-75%", opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="tabular flex items-start"
            >
              <span className="mt-[0.35rem] mr-0.5 text-[1.45rem] font-medium text-muted sm:text-[1.6rem]">{symbol}</span>
              <span className="text-[3.25rem] sm:text-[3.6rem]">{whole}</span>
              <span className="mt-[0.35rem] text-[1.45rem] sm:text-[1.6rem]">.{fraction}</span>
            </motion.span>
          </AnimatePresence>
        </p>
        <div className="pb-1.5 leading-tight">
          <AnimatePresence initial={false}>
            {was !== null && (
              <motion.s
                key="was"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease }}
                className="tabular block text-[0.8rem] text-faint decoration-orange-strong/70"
              >
                <span className="sr-only">Monthly plan: </span>
                {rupees.format(was)}
              </motion.s>
            )}
          </AnimatePresence>
          <span className="block text-[0.85rem] text-muted">/ {per}</span>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={note}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease }}
          className="mt-2 text-[0.82rem] text-faint"
        >
          {note}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * Monthly or yearly. Native radios underneath, so the arrow keys move between
 * cycles as in any radio group; a porcelain pill — the white pieces' finish —
 * slides to the one chosen.
 */
function BillingSwitch({
  plan,
  cycles,
  cycle,
  onChange,
}: {
  plan: ChessPlan;
  cycles: BillingCycle[];
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  const saving = yearlySaving(plan);

  return (
    <fieldset className="flex rounded-full bg-tint/[0.06] p-1 ring-1 ring-tint/10 ring-inset">
      <legend className="sr-only">Billing for {plan.name}</legend>
      {cycles.map((option) => (
        <label
          key={option}
          className={cn(
            "relative flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 font-display text-[0.74rem] font-semibold whitespace-nowrap transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
            option === cycle ? "text-ink" : "text-muted hover:text-fg",
          )}
        >
          <input
            type="radio"
            name={`${plan.id}-billing`}
            value={option}
            checked={option === cycle}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {option === cycle && (
            <motion.span
              layoutId={`${plan.id}-billing-pill`}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="absolute inset-0 rounded-full bg-[image:var(--switch-pill)] shadow-[var(--switch-pill-shadow)]"
            />
          )}
          <span className="relative">{CYCLE_LABEL[option]}</span>
          {option === "yearly" && saving && (
            <span className="relative rounded-full bg-brand-cta px-1.5 py-px text-[0.6rem] font-bold text-ink">
              −{saving}%
            </span>
          )}
        </label>
      ))}
    </fieldset>
  );
}

function ListLabel({
  featured,
  className,
  children,
}: {
  featured: boolean;
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

function FeatureRow({ feature, featured, index }: { feature: ChessFeature; featured: boolean; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.li
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
      {feature.title}
    </motion.li>
  );
}

/**
 * The plan's call to action, the same lit orange on both cards. A plain
 * button, and it goes nowhere yet: checkout isn't on this site. On hover a
 * glint crosses it.
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
