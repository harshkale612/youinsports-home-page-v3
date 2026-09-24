"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Primitives";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { useJourney } from "@/stores/journeyStore";
import { trackEvent } from "@/lib/analytics";
import { QUESTION_STEPS, type QuestionStep } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The homepage bar.
 *
 * Minimal at rest, and quieter still once the conversation starts: while the
 * athlete is answering questions the links give way to their position in the
 * journey, because that is the only navigation that means anything at that
 * moment. The bar should never compete with the planet.
 */
export function JourneyNav({ onSave }: { onSave: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);

  const step = useJourney((s) => s.step);
  const hasJourney = useJourney((s) => s.journey !== null);

  const questionIndex = QUESTION_STEPS.indexOf(step as QuestionStep);
  const inConversation = questionIndex !== -1;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-[var(--glass-border)] bg-[rgba(3,11,18,0.74)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-6 py-5 md:px-10 lg:px-14">
        <Link
          href="/"
          className="font-display text-[0.82rem] font-bold tracking-[0.22em] uppercase"
          aria-label="YouInSports"
        >
          <Wordmark />
        </Link>

        <AnimatePresence mode="wait">
          {inConversation ? (
            <motion.p
              key="progress"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease }}
              className="hidden items-center gap-3 font-display text-[0.6rem] font-semibold tracking-[0.24em] text-muted uppercase sm:flex"
            >
              Your athlete journey
              <span className="tabular text-orange">
                {String(questionIndex + 1).padStart(2, "0")}
                <span className="text-faint">
                  {" / "}
                  {String(QUESTION_STEPS.length).padStart(2, "0")}
                </span>
              </span>
            </motion.p>
          ) : (
            <motion.nav
              key="links"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease }}
              aria-label="Primary"
              className="hidden items-center gap-9 lg:flex"
            >
              {/* Only ever links to sections that exist right now — a nav that
                  scrolls to nothing is worse than a shorter nav. */}
              {hasJourney &&
                [
                  { label: "Where you stand", href: "#position" },
                  { label: "The next rung", href: "#gap" },
                  { label: "Ecosystem", href: "#youinsports" },
                  { label: "What's next", href: "#next" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[0.82rem] text-muted transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </a>
                ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              trackEvent("search_opened");
            }}
            aria-label="Search athletes, sports or countries"
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/60 hover:text-fg"
          >
            <Search className="size-4" aria-hidden />
          </button>

          {hasJourney && (
            <button
              type="button"
              onClick={onSave}
              className="bg-brand-cta rounded-full px-5 py-2 font-display text-[0.62rem] font-bold tracking-[0.16em] text-ink uppercase transition-all"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
