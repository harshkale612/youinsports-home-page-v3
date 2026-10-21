"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, ChessKnight, Compass, Users, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

const PLACES: { href: string; label: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/products",
    label: "Products",
    title: "The smart chessboard",
    description: "A real board with real pieces that records your game as you play it.",
    icon: ChessKnight,
  },
  {
    href: "/",
    label: "Your journey",
    title: "Start your journey",
    description: "Tell us about your sport and see where you could go next.",
    icon: Compass,
  },
  {
    href: "/about",
    label: "About us",
    title: "Meet the team",
    description: "Who we are, and why we're building YouInSports.",
    icon: Users,
  },
];

/**
 * For anyone not ready to write yet: the rest of the site, one card each.
 *
 * The page then ends on the same horizon as About — the rim of a planet
 * rising into frame and running on into the footer.
 */
export function ContactExplore() {
  return (
    <section
      aria-labelledby="contact-explore-heading"
      className="relative overflow-hidden pt-[calc(var(--section-y)*0.55)] pb-[calc(var(--section-y)+8rem)]"
    >
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

      <Container className="relative">
        <div className="text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease }}
            className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-accent uppercase"
          >
            Keep exploring
          </motion.p>
          <motion.h2
            id="contact-explore-heading"
            {...reveal}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="display-lg mt-6 text-balance text-fg"
          >
            While you’re <span className="text-brand">here</span>
            <span className="text-accent">.</span>
          </motion.h2>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3 md:gap-5">
          {PLACES.map(({ href, label, title, description, icon: Icon }, i) => (
            <motion.li key={href} {...reveal} transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.09 }}>
              <Link
                href={href}
                onClick={() => trackEvent("contact_cta_clicked", { target: label })}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl transition-[translate,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange-line hover:shadow-[var(--shadow-card-hover)] md:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.22*var(--glow))),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-tint/10 bg-tile text-accent-strong shadow-[var(--shadow-tile)] transition-colors duration-300 group-hover:text-orange-strong">
                    <Icon className="size-[1.15rem]" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-faint transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-strong"
                    aria-hidden
                  />
                </div>

                <p className="relative mt-9 font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
                  {label}
                </p>
                <h3 className="relative mt-2 font-display text-xl font-semibold tracking-tight text-fg">{title}</h3>
                <p className="relative mt-2 text-[0.9rem] leading-relaxed text-pretty text-muted">{description}</p>
              </Link>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
