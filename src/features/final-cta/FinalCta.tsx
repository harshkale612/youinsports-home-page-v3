"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Act eight. The globe retreats to a small, distant object low in the frame and
 * the headline takes the screen — the journey ends looking back at the world
 * the visitor has just travelled through.
 */
export function FinalCta() {
  return (
    <section id="cta" className="relative flex min-h-svh flex-col justify-center py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-void/70 to-void/40"
      />

      <Container className="relative text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease }}
          className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-accent uppercase"
        >
          Your move
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="display-lg mx-auto mt-7 max-w-4xl text-balance"
        >
          Your next destination
          <br />
          is out there<span className="text-accent">.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease, delay: 0.22 }}
          className="mx-auto mt-7 max-w-lg text-pretty text-lg leading-relaxed text-muted"
        >
          Build your identity. Connect with the sports world. Discover what&apos;s next.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease, delay: 0.32 }}
          className="mt-11 flex flex-wrap items-center justify-center gap-3"
        >
          <ButtonLink
            href="/#athletes"
            size="lg"
            magnetic
            showArrow
            onClick={() => trackEvent("join_clicked")}
          >
            Explore the world
          </ButtonLink>
        </motion.div>
      </Container>
    </section>
  );
}
