"use client";

import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-15% 0px" },
};

/**
 * The way out: back into the product.
 *
 * The page ends on a horizon — the rim of a planet rising into frame, lit the
 * way the homepage globe is — so the About page closes looking toward the
 * same world the journey starts from.
 */
export function AboutCta() {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="relative overflow-hidden pt-[var(--section-y)] pb-[calc(var(--section-y)+7rem)]"
    >
      {/* The atmosphere is painted with gradients, not a blurred box-shadow:
          a shadow this large rasterises in tiles, and the tiles show. The
          planet then covers the lower half of it, leaving the glow above the
          rim. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30rem]"
      >
        <div className="absolute top-[calc(100%-9rem)] left-1/2 h-[36rem] w-[max(170%,62rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(44_143_227/0.16),transparent)]" />
        <div className="absolute top-[calc(100%-9rem)] left-1/2 h-[20rem] w-[max(120%,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.42),rgb(240_107_40/0.1)_55%,transparent)]" />
        <div className="absolute top-[calc(100%-9rem)] left-1/2 aspect-square w-[max(160%,40rem)] -translate-x-1/2 rounded-full bg-void shadow-[inset_0_1px_0_rgb(255_138_76/0.75)]" />
      </motion.div>

      <Container className="relative text-center">
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease }}
          className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-accent uppercase"
        >
          Join the journey
        </motion.p>

        <motion.h2
          id="about-cta-heading"
          {...reveal}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="display-lg mx-auto mt-7 max-w-4xl text-balance"
        >
          Your dream.
          <br />
          Our <span className="text-brand">network</span>
          <span className="text-accent">.</span>
        </motion.h2>

        <motion.p
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.22 }}
          className="mx-auto mt-7 max-w-lg text-pretty text-lg leading-relaxed text-muted"
        >
          Tell us about your sport and we&apos;ll show you where YouInSports can take you next.
        </motion.p>

        <motion.div
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.32 }}
          className="mt-11 flex flex-wrap items-center justify-center gap-3"
        >
          <ButtonLink
            href="/"
            size="lg"
            magnetic
            showArrow
            onClick={() => trackEvent("about_cta_clicked", { target: "journey" })}
          >
            Start your journey
          </ButtonLink>
          <ButtonLink
            href="mailto:hello@youinsports.ai"
            variant="secondary"
            size="lg"
            onClick={() => trackEvent("about_cta_clicked", { target: "contact" })}
          >
            <Mail className="size-3.5 shrink-0" aria-hidden />
            Get in touch
          </ButtonLink>
        </motion.div>
      </Container>
    </section>
  );
}
