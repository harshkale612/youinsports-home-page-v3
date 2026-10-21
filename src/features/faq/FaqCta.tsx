"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { CONTACT_PATH } from "@/data/faq";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

/**
 * For anything the answers don't cover: one card that leads to the team.
 *
 * The page then ends on the same horizon as About and Contact — the rim of
 * a planet rising into frame and running on into the footer.
 */
export function FaqCta() {
  return (
    <section
      aria-labelledby="faq-cta-heading"
      className="relative overflow-hidden border-t border-tint/5 pt-16 pb-[calc(var(--section-y)+7rem)] md:pt-24"
    >
      {/* Washes in the logo's colours, one rising from each side. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/2 -left-[10%] h-[200%] w-3/5 bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.05),transparent_70%)]" />
        <div className="absolute -right-[10%] -bottom-1/2 h-[200%] w-3/5 bg-[radial-gradient(circle,rgb(var(--orange-rgb)/0.05),transparent_70%)]" />
      </div>

      {/* Gradients, not a blurred box-shadow: a glow this large rasterises in
          tiles, and the tiles show. The planet covers the lower half of it. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30rem]"
      >
        <div className="absolute top-[calc(100%-7rem)] left-1/2 h-[36rem] w-[max(170%,62rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(44_143_227/0.16),transparent)]" />
        <div className="absolute top-[calc(100%-7rem)] left-1/2 h-[20rem] w-[max(120%,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.42),rgb(240_107_40/0.1)_55%,transparent)]" />
        <div className="absolute top-[calc(100%-7rem)] left-1/2 aspect-square w-[max(160%,40rem)] -translate-x-1/2 rounded-full bg-planet shadow-[inset_0_1px_0_rgb(255_138_76/0.75)]" />
      </motion.div>

      <Container className="relative max-w-300">
        <div className="mx-auto mb-12 max-w-[600px] text-center">
          <motion.h2
            id="faq-cta-heading"
            {...reveal}
            transition={{ duration: 0.9, ease }}
            className="mb-4 font-display text-[2.5rem] leading-[1.1] font-bold tracking-[-0.02em] text-balance text-fg sm:text-5xl"
          >
            Still have <span className="text-brand">questions</span>
            <span className="text-accent">?</span>
          </motion.h2>
          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="text-lg leading-[1.6] text-pretty text-muted"
          >
            Our dedicated support team is always ready to help you succeed on your sports journey.
          </motion.p>
        </div>

        <motion.div {...reveal} transition={{ duration: 0.9, ease, delay: 0.2 }} className="mx-auto max-w-sm">
          <EmailCard />
        </motion.div>
      </Container>
    </section>
  );
}

/** The way to a person: lifts toward the pointer, and its corner warms in orange. */
function EmailCard() {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-tint/5 bg-[var(--glass-bg)] p-8 text-center shadow-[var(--shadow-card)] backdrop-blur-xl transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-2 hover:border-orange/30 hover:shadow-[var(--shadow-card),0_15px_35px_-10px_rgb(var(--orange-rgb)/0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.22*var(--glow))),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <span className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-[20px] bg-orange/10 text-orange transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6">
        <Mail className="size-7" aria-hidden />
      </span>
      <h3 className="relative mb-2 font-display text-xl font-bold text-fg">Email Us</h3>
      <p className="relative mb-8 flex-1 text-[15px] text-muted">
        Send us a detailed message and we’ll reply within 24h
      </p>
      <Link
        href={CONTACT_PATH}
        onClick={() => trackEvent("faq_cta_clicked", { target: "email-card" })}
        className="group/button relative flex w-full items-center justify-center gap-2 rounded-xl border border-orange/50 py-3 text-base font-bold text-orange transition-colors duration-200 hover:border-orange hover:bg-orange/5"
      >
        Send Email
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
