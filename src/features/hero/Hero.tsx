"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Search, ArrowDown } from "lucide-react";
import { Container, DemoBadge } from "@/components/ui/Primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";

const HERO_STATS = [
  { value: "120K+", label: "Athletes" },
  { value: "150+", label: "Countries" },
  { value: "50+", label: "Sports" },
];

const reveal = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);

  useEffect(() => {
    trackEvent("homepage_viewed");
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-end pt-28 pb-10 md:justify-center md:pb-16"
      aria-labelledby="hero-heading"
    >
      {/* A soft vertical scrim keeps the copy legible wherever the planet
          happens to sit behind it, without dimming the globe itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/85 via-void/20 to-void/90 md:bg-gradient-to-r md:from-void/90 md:via-void/30 md:to-transparent"
      />

      <Container className="relative">
        <div className="max-w-xl lg:max-w-[38rem]">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease }}
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            <span className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-accent uppercase">
              The global athlete network
            </span>
            <DemoBadge />
          </motion.div>

          <motion.h1
            id="hero-heading"
            {...reveal}
            transition={{ duration: 0.9, ease, delay: 0.08 }}
            className="display-xl mt-7 text-fg"
          >
            Athletes
            <br />
            Everywhere<span className="text-accent">.</span>
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="mt-8 max-w-md text-pretty text-lg leading-relaxed text-muted"
          >
            A global stage for athletes to build their identity, improve their game and
            discover what&apos;s next.
          </motion.p>

          {/* Discovery entry point. Rendered as a button rather than an input so
              the overlay owns focus management in one place. */}
          <motion.button
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            type="button"
            onClick={() => {
              setSearchOpen(true);
              trackEvent("search_opened");
            }}
            className="group mt-9 flex w-full max-w-md items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3.5 text-left backdrop-blur-md transition-colors duration-300 hover:border-accent/60 hover:bg-accent-soft"
          >
            <Search className="size-4 shrink-0 text-muted transition-colors group-hover:text-accent" aria-hidden />
            <span className="font-display text-[0.7rem] font-medium tracking-[0.16em] text-muted uppercase">
              Search athletes, sports or countries
            </span>
          </motion.button>

          <motion.div
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <ButtonLink
              href="/#athletes"
              size="lg"
              magnetic
              showArrow
              onClick={() => trackEvent("explore_athletes_clicked")}
            >
              Explore athletes
            </ButtonLink>
          </motion.div>
        </div>
      </Container>

      {/* Global figures, anchored to the base of the hero. */}
      <Container className="relative mt-14 md:absolute md:inset-x-0 md:bottom-10 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.55 }}
          className="flex items-end justify-between gap-6 border-t border-white/[0.08] pt-6"
        >
          <dl className="flex gap-8 sm:gap-14">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="tabular font-display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-none font-semibold tracking-tight text-fg">
                  {stat.value}
                </dd>
                <p className="mt-2 font-display text-[0.6rem] font-semibold tracking-[0.22em] text-muted uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>

          <Button
            variant="ghost"
            size="sm"
            className="hidden shrink-0 gap-2 px-0 text-[0.62rem] text-faint hover:text-accent md:inline-flex"
            onClick={() =>
              document.getElementById("network")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Scroll to explore
            <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
