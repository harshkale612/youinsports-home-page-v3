"use client";

import { motion, AnimatePresence } from "motion/react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { useJourney } from "@/stores/journeyStore";
import { trackEvent } from "@/lib/analytics";
import { QUESTION_STEPS, type QuestionStep } from "@/types/journey";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The homepage bar: the site bar, plus the journey.
 *
 * While the athlete is answering questions the empty middle of the bar shows
 * their position in the journey, and once there is a journey to keep, the bar
 * carries the way to save it.
 */
export function JourneyNav({ onSave }: { onSave: () => void }) {
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);

  const step = useJourney((s) => s.step);
  const hasJourney = useJourney((s) => s.journey !== null);

  const questionIndex = QUESTION_STEPS.indexOf(step as QuestionStep);
  const inConversation = questionIndex !== -1;

  return (
    <SiteNav
      onSearch={() => {
        setSearchOpen(true);
        trackEvent("search_opened");
      }}
      status={
        <AnimatePresence>
          {inConversation && (
            <motion.p
              key="progress"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease }}
              className="hidden items-center gap-3 font-display text-[0.6rem] font-semibold tracking-[0.24em] text-muted uppercase sm:flex lg:hidden"
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
          )}
        </AnimatePresence>
      }
      actions={
        hasJourney && (
          <button
            type="button"
            onClick={onSave}
            className="bg-brand-cta rounded-full px-5 py-2 font-display text-[0.62rem] font-bold tracking-[0.16em] text-ink uppercase transition-all"
          >
            Join
          </button>
        )
      }
    />
  );
}
