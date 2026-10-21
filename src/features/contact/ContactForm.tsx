"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { ArrowLeft, ArrowUpRight, Send } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/features/contact/CopyButton";
import {
  CONTACT_TOPIC_IDS,
  CONTACT_TOPICS,
  composeEmail,
  emailAsText,
  gmailHref,
  mailtoHref,
  MESSAGE_LIMIT,
  SUPPORT_EMAIL,
  topicById,
  type ComposedEmail,
} from "@/data/contact";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const schema = z.object({
  topic: z.enum(CONTACT_TOPIC_IDS),
  name: z.string().trim().min(1, "Let us know who we're talking to"),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two helps us help you")
    .max(MESSAGE_LIMIT, `Keep it under ${MESSAGE_LIMIT.toLocaleString("en-US")} characters`),
});

type FormValues = z.infer<typeof schema>;

/**
 * The message form.
 *
 * There's no mail server behind the site yet, so "Send" writes the email —
 * topic and name in the subject, the message signed underneath — and opens
 * it in the visitor's own mail app, addressed to the support inbox. The card
 * then says so plainly rather than claiming the message has gone, and offers
 * Gmail and a copy of the message for anyone whose mail app didn't open.
 *
 * The form stays in place (faded and inert) under the confirmation, so the
 * card keeps its size and "Edit message" brings back exactly what was typed.
 */
export function ContactForm() {
  const [sent, setSent] = useState<ComposedEmail | null>(null);
  const refocus = useRef(false);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: "support", name: "", message: "" },
  });
  const topic = useWatch({ control, name: "topic" });
  const message = useWatch({ control, name: "message" });

  // A pool of light that follows the pointer across the card.
  const spotX = useMotionValue(-400);
  const spotY = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(26rem circle at ${spotX}px ${spotY}px, rgb(var(--orange-rgb) / calc(0.1 * var(--glow))), rgb(var(--accent-rgb) / calc(0.05 * var(--glow))) 45%, transparent 70%)`;

  useEffect(() => {
    if (sent) {
      sentHeadingRef.current?.focus();
    } else if (refocus.current) {
      refocus.current = false;
      setFocus("message");
    }
  }, [sent, setFocus]);

  function onSubmit(values: FormValues) {
    const email = composeEmail({ topic: values.topic, name: values.name.trim(), message: values.message.trim() });
    setSent(email);
    trackEvent("contact_message_composed", { topic: values.topic });
    window.location.assign(mailtoHref(email));
  }

  const nameError = errors.name?.message;
  const messageError = errors.message?.message;
  const count = message.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -10, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, rotateY: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.25, ease, delay: 0.4 }}
      style={{ transformPerspective: 1400 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        spotX.set(event.clientX - rect.left);
        spotY.set(event.clientY - rect.top);
      }}
      className="group/card glass-brand relative overflow-hidden rounded-[2rem]"
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        inert={Boolean(sent)}
        aria-labelledby="contact-form-heading"
        animate={sent ? { opacity: 0, scale: 0.97, filter: "blur(6px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease }}
        className="relative flex flex-col p-6 sm:p-8"
      >
        <h2
          id="contact-form-heading"
          className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-tight font-semibold tracking-[-0.03em] text-fg"
        >
          Send us a <span className="text-brand">message</span>
        </h2>
        <p className="mt-2 text-[0.92rem] text-muted">Pick a topic and tell us what&apos;s on your mind.</p>

        <fieldset className="mt-7">
          <legend className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            What&apos;s it about?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONTACT_TOPICS.map(({ id, label, icon: Icon }) => {
              const selected = topic === id;
              return (
                <label
                  key={id}
                  className={cn(
                    "relative isolate inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[0.82rem] transition-[color,border-color,background-color] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                    selected
                      ? "border-accent-line text-fg"
                      : "border-[var(--glass-border)] bg-choice text-muted shadow-[var(--shadow-choice)] hover:border-border-strong hover:bg-choice-hover hover:text-fg",
                  )}
                >
                  <input type="radio" value={id} {...register("topic")} className="sr-only" />
                  {selected && (
                    <motion.span
                      layoutId="contact-topic"
                      aria-hidden
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute -inset-px -z-10 rounded-full bg-[image:var(--surface-choice-selected)] shadow-[var(--shadow-choice-selected)]"
                    />
                  )}
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0 transition-colors duration-300",
                      selected ? "text-accent-strong" : "text-faint",
                    )}
                    aria-hidden
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          <FieldLabel htmlFor="contact-name">Your name</FieldLabel>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Lee"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "contact-name-error" : undefined}
            {...register("name")}
            className={cn(FIELD, "rounded-full! py-3.5", nameError ? FIELD_ERROR : FIELD_OK)}
          />
          <FieldError id="contact-name-error" message={nameError} />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="contact-message">Your message</FieldLabel>
          <textarea
            id="contact-message"
            rows={5}
            maxLength={MESSAGE_LIMIT}
            placeholder={topicById(topic).prompt}
            aria-invalid={Boolean(messageError)}
            aria-describedby={messageError ? "contact-message-error contact-message-count" : "contact-message-count"}
            {...register("message")}
            className={cn(
              FIELD,
              "block min-h-36 resize-y rounded-3xl! py-4 leading-relaxed",
              messageError ? FIELD_ERROR : FIELD_OK,
            )}
          />
          <div className="mt-2 flex items-start justify-between gap-4">
            <FieldError id="contact-message-error" message={messageError} className="mt-0" />
            <p
              id="contact-message-count"
              className={cn(
                "tabular ml-auto shrink-0 text-[0.72rem] transition-colors",
                count > MESSAGE_LIMIT * 0.9 ? "text-orange-strong" : "text-faint",
              )}
            >
              <span className="sr-only">Characters used: </span>
              {count.toLocaleString("en-US")} / {MESSAGE_LIMIT.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full">
          Send message
          <Send
            className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Button>

        <p className="mt-4 text-center text-[0.74rem] leading-relaxed text-faint">
          Opens your email app with your message ready to send to{" "}
          <span className="text-muted">{SUPPORT_EMAIL}</span>.
        </p>
      </motion.form>

      <AnimatePresence>
        {sent && (
          <Composed
            email={sent}
            headingRef={sentHeadingRef}
            onEdit={() => {
              refocus.current = true;
              setSent(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* The site's `:focus-visible` rule is unlayered, so it beats utilities: it
   would square a field's corners off and draw an outline round it. The fields
   draw their own focus ring, so they opt out with `!`. */
const FIELD =
  "mt-2.5 w-full border bg-field px-5 text-[0.92rem] text-fg shadow-[var(--shadow-tile)] outline-none! transition-[border-color,box-shadow] duration-200 placeholder:text-faint";
const FIELD_OK = "border-[var(--glass-border)] focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent-rgb)/0.18)]";
const FIELD_ERROR = "border-error-line focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-error)_20%,transparent)]";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase"
    >
      {children}
    </label>
  );
}

/** Announced as it appears, not just shown. */
function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease }}
          className={cn("mt-2 text-[0.78rem] text-error", className)}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/**
 * What the card shows once the email is written: a message taking off, a
 * plain account of where it is now, and the ways round a mail app that
 * didn't open.
 */
function Composed({
  email,
  headingRef,
  onEdit,
}: {
  email: ComposedEmail;
  headingRef: React.Ref<HTMLHeadingElement>;
  onEdit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease, delay: 0.15 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center sm:p-10"
    >
      <div className="relative flex size-20 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-orange/50"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.7], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.45 }}
        />
        <motion.span
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-brand-cta text-ink"
          initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 17, delay: 0.2 }}
        >
          <motion.span
            initial={{ x: -26, y: 26, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.4 }}
          >
            <Send className="size-7 -translate-x-px translate-y-px" />
          </motion.span>
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.45 }}
        className="flex flex-col items-center"
      >
        <p className="mt-8 font-display text-[0.62rem] font-semibold tracking-[0.28em] text-orange uppercase">
          Almost there
        </p>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 max-w-sm font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.03em] text-balance text-fg focus:outline-none"
        >
          Press send in your <span className="text-brand">email app</span>.
        </h3>
        <p className="mt-3 max-w-sm text-[0.92rem] leading-relaxed text-pretty text-muted">
          Your message is written and addressed to {SUPPORT_EMAIL}. It reaches us once you send it
          from there.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.6 }}
        className="mt-8 flex w-full flex-col items-center"
      >
        <p className="flex w-full max-w-xs items-center gap-3 font-display text-[0.56rem] font-semibold tracking-[0.22em] text-faint uppercase">
          <span aria-hidden className="h-px flex-1 bg-tint/10" />
          Didn&apos;t open?
          <span aria-hidden className="h-px flex-1 bg-tint/10" />
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <ButtonLink
            href={gmailHref(email)}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="sm"
            onClick={() => trackEvent("contact_cta_clicked", { target: "gmail" })}
          >
            Write it in Gmail
            <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
          </ButtonLink>
          <CopyButton
            text={emailAsText(email)}
            label="Copy message"
            copiedLabel="Message copied"
            size="sm"
            onCopied={() => trackEvent("contact_email_copied", { what: "message" })}
          />
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="group mt-7 inline-flex items-center gap-2 font-display text-[0.66rem] font-semibold tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-fg"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
          Edit message
        </button>
      </motion.div>
    </motion.div>
  );
}
