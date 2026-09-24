"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

export function NameStep({
  initialValue,
  shouldFocus,
  onSubmit,
}: {
  initialValue: string;
  shouldFocus: boolean;
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only steal focus once the user has actually started the journey (and the
    // scroll-into-view triggered by that action has had time to settle) —
    // a native `autoFocus` here would jump-scroll past the hero on page load.
    if (!shouldFocus) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 450);
    return () => clearTimeout(timeout);
  }, [shouldFocus]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Tell us your name first.");
      return;
    }
    setError("");
    onSubmit(value.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl"
    >
      <Eyebrow className="mb-5">Step 01 of 04</Eyebrow>
      <h2 className="text-balance font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold text-fg">
        What&rsquo;s your name?
      </h2>

      <form onSubmit={handleSubmit} className="mt-10">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          placeholder="Type your name"
          aria-label="Your name"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "name-error" : undefined}
          className="w-full border-b-2 border-border bg-transparent py-3 font-display text-3xl font-semibold text-fg placeholder:text-muted/40 focus:border-accent focus:outline-none md:text-4xl"
        />
        {error && (
          <p id="name-error" className="mt-3 text-sm text-accent">
            {error}
          </p>
        )}

        <div className="mt-10">
          <Button type="submit" variant="primary" showArrow magnetic>
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
