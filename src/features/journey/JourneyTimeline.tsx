"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow, DisplayHeading } from "@/components/ui/Typography";
import { useAthleteJourneyStore } from "@/stores/athleteJourneyStore";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function JourneyTimeline() {
  const athlete = useAthleteJourneyStore((s) => s.athlete);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!athlete || !section || !track) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const ctx = gsap.context(() => {
      const distance = track.scrollWidth - section.clientWidth;
      if (distance <= 0) return;

      // Pin duration is independent of how far the cards travel — without this,
      // a short card row barely holds the pin long enough to read as deliberate.
      const pinDuration = Math.max(distance, window.innerHeight * 1.2);

      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${pinDuration}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [athlete]);

  useEffect(() => {
    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!athlete) return null;

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden border-t border-border bg-bg-elevated py-24 md:py-32 lg:py-40"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Athlete journey</Eyebrow>
            <DisplayHeading as="h2" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
              {athlete.name}&rsquo;s path so far
            </DisplayHeading>
          </div>
          <p className="max-w-xs text-sm text-muted">Keep scrolling to explore the full timeline.</p>
        </div>
      </Container>

      <div className="mt-14 overflow-hidden px-6 md:px-10 lg:px-16">
        <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
          {athlete.timeline.map((entry, i) => (
            <motion.div
              key={`${entry.year}-${entry.label}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={cn(
                "w-64 shrink-0 rounded-2xl border p-6 select-none",
                entry.isFuture
                  ? "border-dashed border-accent/50 bg-transparent"
                  : entry.isCurrent
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface/40",
              )}
            >
              <p
                className={cn(
                  "font-display text-xs font-semibold tracking-[0.18em] uppercase",
                  entry.isCurrent || entry.isFuture ? "text-accent" : "text-muted",
                )}
              >
                {entry.year}
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-fg">{entry.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
