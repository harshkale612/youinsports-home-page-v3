"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { SectionFrame } from "@/features/home/SectionFrame";
import { SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { MetricBar } from "@/components/diagrams/MetricBar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { AthleteJourney, JourneyIdentity } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

const schema = z.object({
  name: z.string().trim().min(1, "We'll need a name for your profile"),
  email: z.string().trim().email("That doesn't look like an email address"),
});

type FormValues = z.infer<typeof schema>;

/**
 * Act seven — the ask, and the first time anything is asked for.
 *
 * The recap above the form is doing the real work: the athlete has to see the
 * thing they would be saving before they are asked to save it. No password —
 * this is a homepage MVP, and a password field would turn a lightweight moment
 * into an account-creation flow.
 */
export function JourneySave({
  journey,
  onSave,
}: {
  journey: AthleteJourney;
  onSave: (identity: JourneyIdentity) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  function onSubmit(values: FormValues) {
    trackEvent("journey_signup_submitted");
    onSave({ name: values.name.trim(), email: values.email.trim() });
  }

  const focus = journey.gaps.slice(0, 4);

  return (
    <SectionFrame id="save" align="wide">
      <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-xl">
          <SectionLabel index="05">Your journey so far</SectionLabel>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-none font-semibold tracking-tight text-fg">
              {journey.snapshot.sportLabel}
            </p>
            <p className="font-display text-[0.9rem] tracking-[0.08em] text-muted uppercase">
              {journey.snapshot.levelLabel} level
            </p>
          </div>

          {/* The route they described, compressed to one line of the story. */}
          <ol className="mt-7 flex flex-col gap-2.5 border-y border-white/[0.08] py-6">
            {[
              journey.snapshot.environmentLabel,
              journey.snapshot.competitionLabel,
              journey.nextLevelLabel
                ? `${journey.nextLevelLabel} level target`
                : `${journey.snapshot.levelLabel} level`,
            ].map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.45, ease, delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    i === 2 ? "bg-orange shadow-[0_0_8px_var(--color-orange)]" : "bg-accent/60",
                  )}
                />
                <span
                  className={cn(
                    "font-display text-[0.95rem] font-semibold tracking-tight",
                    i === 2 ? "text-orange-strong" : "text-fg",
                  )}
                >
                  {line}
                </span>
              </motion.li>
            ))}
          </ol>

          <p className="mt-7 font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            Your focus
          </p>
          <div className="mt-5 flex flex-col gap-5">
            {focus.map((gap, i) => (
              <MetricBar key={gap.id} label={gap.label} value={gap.current} delay={i * 0.08} />
            ))}
          </div>

          <BodyText className="mt-9 text-base text-fg">
            You have a journey worth building.
          </BodyText>
        </div>

        <div className="lg:w-[25rem]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.7, ease }}
            className="glass-brand rounded-2xl p-7 md:p-8"
          >
            <DisplayText as="h2" size="md">
              Want to save your <span className="text-brand">journey</span>?
            </DisplayText>
            <BodyText className="mt-4 text-[0.92rem]">
              Create your YouInSports profile and turn this into something you can build on.
            </BodyText>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
              <Field
                id="journey-name"
                label="Your name"
                error={errors.name?.message}
                inputProps={{
                  ...register("name"),
                  type: "text",
                  autoComplete: "name",
                  placeholder: "Harsh",
                }}
              />

              <Field
                id="journey-email"
                label="Your email"
                error={errors.email?.message}
                inputProps={{
                  ...register("email"),
                  type: "email",
                  autoComplete: "email",
                  placeholder: "you@example.com",
                }}
              />

              <Button type="submit" size="lg" showArrow disabled={isSubmitting} className="mt-2 w-full">
                Save my journey
              </Button>
            </form>

            <p className="mt-5 text-[0.72rem] leading-relaxed text-faint">
              No password needed. This demo keeps your answers in the browser and does not
              send them anywhere.
            </p>
          </motion.div>
        </div>
      </div>
    </SectionFrame>
  );
}

/** Label, input and error wired together so the error is announced, not just shown. */
function Field({
  id,
  label,
  error,
  inputProps,
}: {
  id: string;
  label: string;
  error?: string;
  inputProps: React.ComponentProps<"input">;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        className={cn(
          "mt-2.5 w-full rounded-full border bg-[rgb(3_14_22/0.6)] px-5 py-3.5 text-[0.92rem] text-fg transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:outline-none",
          error
            ? "border-red-400/70"
            : "border-[var(--glass-border)] focus:border-accent focus:shadow-[0_0_0_4px_rgb(44_143_227/0.18)]",
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[0.78rem] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
