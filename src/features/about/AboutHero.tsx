"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { NetworkOrbit } from "@/features/about/NetworkOrbit";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

/** "YouInSports", lettered in the logo's colours like `Wordmark`. */
const NAME_LETTERS = [
  { text: "You", className: "text-brand" },
  { text: "In", className: "text-accent" },
  { text: "Sports", className: "text-fg" },
].flatMap((part) => part.text.split("").map((char) => ({ char, className: part.className })));

/** The tagline, with the three ideas the rest of the page is built on picked out. */
const TAGLINE_WORDS = [
  { text: "Bringing" },
  { text: "the power of networking", strong: true },
  { text: "to support" },
  { text: "amateur athletes", strong: true },
  { text: "at" },
  { text: "every stage of their journey.", strong: true },
].flatMap((segment) => segment.text.split(" ").map((word) => ({ word, strong: segment.strong })));

/**
 * Who we are, in one screen.
 *
 * The name builds letter by letter, the tagline settles in word by word, and
 * the network the tagline talks about is drawn beside it. Once the page moves
 * on, copy and diagram part at different speeds so the hand-off into the rest
 * of the page reads as depth rather than a cut.
 */
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Reduced motion flattens the ranges rather than unbinding the styles, which
  // would leave whatever was last applied stuck on the element.
  const copyY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, -80]);
  const orbitY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], reducedMotion ? [1, 1] : [1, 0]);
  // The cue sits lowest, so it has to be gone before it slides under the bar.
  const cueFade = useTransform(scrollYProgress, [0, 0.3], reducedMotion ? [1, 1] : [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-32 pb-24 lg:pt-28"
    >
      <HeroBackdrop />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-10">
        <motion.div style={{ y: copyY, opacity: fade }}>
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange" aria-hidden />
            Who we are
          </motion.p>

          <h1
            id="about-heading"
            className="mt-7 font-display text-[clamp(2.6rem,12.5vw,4.75rem)] leading-[0.9] font-semibold tracking-[-0.045em] text-fg lg:text-[clamp(3rem,6.6vw,6.25rem)]"
          >
            <span className="sr-only">About YouInSports</span>
            {/* Each line rises out of its own slot; the padding gives the
                descenders room inside the clip. */}
            <span aria-hidden className="-mb-[0.06em] block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.1 }}
              >
                About
              </motion.span>
            </span>
            <span aria-hidden className="-mb-[0.16em] block overflow-hidden pb-[0.16em] whitespace-nowrap">
              {NAME_LETTERS.map(({ char, className }, i) => (
                <motion.span
                  key={i}
                  className={cn("inline-block", className)}
                  initial={{ y: "110%", rotate: 6 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.22 + i * 0.035 }}
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                className="inline-block text-accent"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.22 + NAME_LETTERS.length * 0.035 }}
              >
                .
              </motion.span>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
            {TAGLINE_WORDS.map(({ word, strong }, i) => (
              <Fragment key={i}>
                <motion.span
                  className={cn("inline-block", strong && "font-medium text-fg")}
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease, delay: 0.7 + i * 0.03 }}
                >
                  {word}
                </motion.span>{" "}
              </Fragment>
            ))}
          </p>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 1.25 }}
            className="mt-6 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-tight font-semibold tracking-tight text-fg"
          >
            We&apos;re here to make{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-brand">dreams happen!</span>
              {/* Drawn on, like a coach's marker under the one thing that matters. */}
              <svg
                aria-hidden
                viewBox="0 0 220 14"
                className="absolute -bottom-[0.38em] left-0 h-auto w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="about-dream-underline" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#ff8a4c" />
                    <stop offset="100%" stopColor="#2c8fe3" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M3 10 C 52 3, 124 1, 217 6"
                  fill="none"
                  stroke="url(#about-dream-underline)"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease, delay: 1.7 }}
                />
              </svg>
            </span>
          </motion.p>

          <motion.div
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 1.45 }}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            <ButtonLink
              href="#team"
              size="lg"
              magnetic
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("team");
              }}
            >
              Meet the team
              <ArrowDown
                className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
                aria-hidden
              />
            </ButtonLink>

            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-display text-[0.66rem] font-semibold tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-fg"
            >
              <span
                className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/var(--glow))] transition-transform duration-300 group-hover:scale-125"
                aria-hidden
              />
              Start your journey
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: orbitY }}
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-[34rem]"
        >
          <NetworkOrbit />
        </motion.div>
      </Container>

      <Container className="absolute inset-x-0 bottom-8 hidden md:block">
        <motion.div style={{ opacity: cueFade }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease, delay: 1.9 }}
            className="relative flex items-center justify-between gap-6 pt-6"
          >
            <span aria-hidden className="rule-brand absolute inset-x-0 top-0" />
            <p className="font-display text-[0.58rem] font-semibold tracking-[0.24em] text-faint uppercase">
              Our mission · Our team
            </p>
            <a
              href="#mission"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("mission");
              }}
              className="inline-flex items-center gap-2 font-display text-[0.58rem] font-semibold tracking-[0.2em] text-faint uppercase transition-colors hover:text-accent"
            >
              Scroll
              <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

/** Stage light and a faint dotted field — the page's own sky, without the globe. */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(var(--dot-field)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_70%_60%_at_62%_45%,black,transparent_75%)]" />
      <div className="absolute top-1/4 -left-48 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.13),transparent_62%)]" />
      <div className="absolute -top-48 -right-40 size-[48rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.13),transparent_62%)] [animation-delay:-9s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
