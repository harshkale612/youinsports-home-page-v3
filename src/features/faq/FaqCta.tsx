"use client";

import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/features/contact/CopyButton";
import { SUPPORT_EMAIL } from "@/data/contact";
import { CONTACT_PATH } from "@/data/faq";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

/**
 * The address, lettered so the domain reads like the wordmark: "you" in the
 * logo's orange, "in" in its blue — as on the contact page.
 */
const ADDRESS = (() => {
  const [local, domain] = SUPPORT_EMAIL.split("@");
  return [
    { text: local, className: "text-fg" },
    { text: "@", className: "text-faint" },
    ...(domain.startsWith("youinsports")
      ? [
          { text: "you", className: "text-[var(--wordmark-you)]" },
          { text: "in", className: "text-[var(--wordmark-in)]" },
          { text: domain.slice("youin".length), className: "text-fg" },
        ]
      : [{ text: domain, className: "text-fg" }]),
  ];
})();

/**
 * For anything the answers don't cover: a person, one email away.
 *
 * A wide panel edged in the logo's colours, with the address set large and
 * ways to write or copy it. The page then ends on the same horizon as
 * About — the rim of a planet rising into frame and running on into the
 * footer.
 */
export function FaqCta() {
  return (
    <section
      aria-labelledby="faq-cta-heading"
      className="relative overflow-hidden pt-[calc(var(--section-y)*0.5)] pb-[calc(var(--section-y)+8rem)]"
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
        <motion.div
          {...reveal}
          transition={{ duration: 1, ease }}
          className="glass-brand relative mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] px-6 py-12 sm:px-10 md:px-14 md:py-16"
        >
          {/* Stage light in two corners, and an orbit behind the address. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/calc(0.2*var(--glow))),transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.22*var(--glow))),transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-[-6rem] hidden size-[30rem] -translate-y-1/2 animate-orbit rounded-full border border-dashed border-tint/[0.08] [animation-duration:100s] lg:block"
          >
            <span className="absolute top-1/2 -left-1 size-2 rounded-full bg-orange shadow-[0_0_14px_rgb(var(--orange-rgb)/var(--glow))]" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <p className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange" aria-hidden />
                Still need help?
              </p>
              <h2 id="faq-cta-heading" className="display-lg mt-6 text-balance text-fg">
                Ask a <span className="text-brand">person</span>
                <span className="text-accent">.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-muted">
                Write to the team about anything these answers don’t cover, and someone will get back to you.
              </p>
            </div>

            <div className="lg:justify-self-end">
              <div className="flex items-center gap-3">
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent-strong">
                  <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/50" />
                  <Mail className="size-4" aria-hidden />
                </span>
                <p className="font-display text-[0.62rem] font-semibold tracking-[0.24em] text-faint uppercase">
                  Support inbox
                </p>
              </div>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                onClick={() => trackEvent("faq_cta_clicked", { target: "address" })}
                className="group/address relative mt-5 inline-block font-display text-[clamp(1.2rem,5.4vw,2.15rem)] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap"
              >
                {ADDRESS.map(({ text, className }) => (
                  <span key={text} className={cn(className)}>
                    {text}
                  </span>
                ))}
                {/* Drawn under the address on hover, in the logo's colours. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-orange to-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/address:scale-x-100"
                />
              </a>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={CONTACT_PATH}
                  size="lg"
                  magnetic
                  showArrow
                  onClick={() => trackEvent("faq_cta_clicked", { target: "write" })}
                >
                  Write to us
                </ButtonLink>
                <CopyButton
                  text={SUPPORT_EMAIL}
                  label="Copy address"
                  copiedLabel="Address copied"
                  onCopied={() => trackEvent("faq_cta_clicked", { target: "copy" })}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
