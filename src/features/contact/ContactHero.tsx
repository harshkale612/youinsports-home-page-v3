"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ContactForm } from "@/features/contact/ContactForm";
import { CopyButton } from "@/features/contact/CopyButton";
import { SUPPORT_EMAIL } from "@/data/contact";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** "Let’s talk.", lettered like the About heading: page ink, then brand orange, then a blue stop. */
const HEADLINE = [
  { text: "Let’s", className: "text-fg" },
  { text: " ", className: "" },
  { text: "talk", className: "text-brand" },
  { text: ".", className: "text-accent" },
].flatMap((part) => part.text.split("").map((char) => ({ char, className: part.className })));

const INTRO_WORDS = [
  { text: "Questions, feedback, a board to order or an idea to build together —" },
  { text: "write to us,", strong: true },
  { text: "and someone from the team will get back to you." },
].flatMap((segment) => segment.text.split(" ").map((word) => ({ word, strong: segment.strong })));

/**
 * The address, lettered so the domain reads like the wordmark: "you" in the
 * logo's orange, "in" in its blue.
 */
const ADDRESS = (() => {
  const [local, domain] = SUPPORT_EMAIL.split("@");
  const parts = [
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
  return parts.flatMap((part) => part.text.split("").map((char) => ({ char, className: part.className })));
})();

/** When the support card lands, and when its address starts writing itself out. */
const CARD_AT = 1.05;
const ADDRESS_AT = CARD_AT + 0.45;

/**
 * The top of the Contact page, in one screen: who to write to on the left,
 * and the form to write with on the right.
 *
 * The heading builds letter by letter, the intro settles in word by word,
 * then the support card rises and its address writes itself out — while the
 * form swings in beside it, with two slow orbits behind it like the network
 * the message is about to travel.
 */
export function ContactHero() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="relative isolate overflow-hidden pt-32 pb-20 lg:flex lg:min-h-svh lg:items-center lg:pt-28 lg:pb-24"
    >
      <HeroBackdrop />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-16 xl:gap-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange" aria-hidden />
            Contact us
          </motion.p>

          <h1
            id="contact-heading"
            className="mt-7 font-display text-[clamp(3.25rem,15vw,5.25rem)] leading-[0.9] font-semibold tracking-[-0.045em] lg:text-[clamp(4.5rem,7.4vw,7.25rem)]"
          >
            <span className="sr-only">Let’s talk.</span>
            {/* Each letter rises out of the line's clip; the padding gives the
                descenders room inside it. */}
            <span aria-hidden className="-mb-[0.16em] block overflow-hidden pb-[0.16em] whitespace-nowrap">
              {HEADLINE.map(({ char, className }, i) => (
                <motion.span
                  key={i}
                  className={cn("inline-block", className)}
                  initial={{ y: "110%", rotate: 7, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease, delay: 0.12 + i * 0.045 }}
                >
                  {char === " " ? " " : char}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
            {INTRO_WORDS.map(({ word, strong }, i) => (
              <Fragment key={i}>
                <motion.span
                  className={cn("inline-block", strong && "font-medium text-fg")}
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease, delay: 0.55 + i * 0.028 }}
                >
                  {word}
                </motion.span>{" "}
              </Fragment>
            ))}
          </p>

          <SupportCard />
        </div>

        <div className="relative">
          <Orbits />
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

/**
 * The support inbox, front and centre: the address set large, a way to copy
 * it, and a way straight into the visitor's own mail app.
 */
function SupportCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease, delay: CARD_AT }}
      className="group glass-brand relative mt-11 max-w-xl overflow-hidden rounded-[1.75rem] p-6 sm:p-7"
    >
      {/* Stage light in the corner, brightening as the pointer comes over. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-[radial-gradient(circle,rgb(var(--orange-rgb)/calc(0.2*var(--glow))),transparent_65%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100"
      />

      <div className="relative flex items-center gap-3.5">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent-strong">
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/50" />
          <Mail className="size-4" aria-hidden />
        </span>
        <div>
          <p className="font-display text-[0.6rem] font-semibold tracking-[0.24em] text-faint uppercase">
            Support inbox
          </p>
          <p className="mt-0.5 text-[0.86rem] text-muted">For anything YouInSports</p>
        </div>
      </div>

      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        onClick={() => trackEvent("contact_cta_clicked", { target: "address" })}
        className="group/address relative mt-6 inline-block font-display text-[clamp(1.05rem,5.6vw,2.1rem)] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap"
      >
        <span className="sr-only">{SUPPORT_EMAIL}</span>
        <span aria-hidden>
          {ADDRESS.map(({ char, className }, i) => (
            <motion.span
              key={i}
              className={cn("inline-block", className)}
              initial={{ opacity: 0, y: "0.35em", filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease, delay: ADDRESS_AT + i * 0.03 }}
            >
              {char}
            </motion.span>
          ))}
        </span>
        {/* Drawn under the address on hover, in the logo's colours. */}
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-orange to-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/address:scale-x-100"
        />
      </a>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: ADDRESS_AT + ADDRESS.length * 0.03 + 0.1 }}
        className="relative mt-7 flex flex-wrap items-center gap-3"
      >
        <CopyButton
          text={SUPPORT_EMAIL}
          label="Copy address"
          copiedLabel="Address copied"
          onCopied={() => trackEvent("contact_email_copied", { what: "address" })}
        />
        <ButtonLink
          href={`mailto:${SUPPORT_EMAIL}`}
          variant="ghost"
          onClick={() => trackEvent("contact_cta_clicked", { target: "mail-app" })}
          className="px-3"
        >
          Open my mail app
        </ButtonLink>
      </motion.div>
    </motion.div>
  );
}

/**
 * Two slow orbits behind the form, each carrying one point of light — the
 * logo's orange one way, its blue the other — like the About page's network
 * at rest.
 */
function Orbits() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.8, ease, delay: 0.5 }}
      className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden size-[40rem] -translate-x-1/2 -translate-y-1/2 md:block"
    >
      <div className="absolute inset-0 animate-orbit rounded-full border border-dashed border-tint/[0.09] [animation-duration:80s]">
        <span className="absolute top-1/2 -left-1 size-2 rounded-full bg-orange shadow-[0_0_14px_rgb(var(--orange-rgb)/var(--glow))]" />
      </div>
      <div className="absolute -inset-20 animate-orbit rounded-full border border-tint/[0.05] [animation-direction:reverse] [animation-duration:130s]">
        <span className="absolute -top-[3px] left-1/2 size-1.5 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--accent-rgb)/var(--glow))]" />
      </div>
    </motion.div>
  );
}

/** Stage light and a faint dotted field — the page's own sky, as on About. */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(var(--dot-field)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_70%_60%_at_40%_45%,black,transparent_75%)]" />
      <div className="absolute top-1/4 -left-48 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.13),transparent_62%)]" />
      <div className="absolute -top-48 -right-40 size-[48rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.13),transparent_62%)] [animation-delay:-9s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
