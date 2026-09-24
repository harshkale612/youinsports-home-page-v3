"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { LoadingTransition } from "@/components/shared/LoadingTransition";
import { JourneyProgress } from "@/components/journey/JourneyProgress";
import { SportQuestion } from "@/features/athlete-journey/questions/SportQuestion";
import { EnvironmentQuestion } from "@/features/athlete-journey/questions/EnvironmentQuestion";
import { CompetitionQuestion } from "@/features/athlete-journey/questions/CompetitionQuestion";
import { LevelQuestion } from "@/features/athlete-journey/questions/LevelQuestion";
import { GoalQuestion } from "@/features/athlete-journey/questions/GoalQuestion";
import { useJourney } from "@/stores/journeyStore";
import { getSportConfig } from "@/data/sports";
import { getJourneyLevelConfig } from "@/data/journey-levels";
import { trackEvent } from "@/lib/analytics";
import { QUESTION_STEPS, type QuestionStep } from "@/types/journey";

/** Long enough that a click still reads as deliberate, short enough to flow. */
const ADVANCE_DELAY = 520;
/** The analysis "building itself" before the reveal. */
const ANALYSIS_DELAY = 1100;

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The conversation.
 *
 * All five questions live in one section rather than five scroll sections: the
 * athlete is being asked something, and scrolling away mid-answer would break
 * that. The globe changes act as the questions change, so the page still moves
 * — it just moves because of what was answered, not because of a scrollbar.
 */
export function JourneyConversation({ onComplete }: { onComplete: () => void }) {
  const step = useJourney((s) => s.step);
  const answers = useJourney((s) => s.answers);
  const isAnalyzing = useJourney((s) => s.isAnalyzing);

  const setSport = useJourney((s) => s.setSport);
  const setEnvironment = useJourney((s) => s.setEnvironment);
  const setCompetition = useJourney((s) => s.setCompetition);
  const setCompetitionName = useJourney((s) => s.setCompetitionName);
  const setLevel = useJourney((s) => s.setLevel);
  const setGoal = useJourney((s) => s.setGoal);
  const nextQuestion = useJourney((s) => s.nextQuestion);
  const previousQuestion = useJourney((s) => s.previousQuestion);
  const goToStep = useJourney((s) => s.goToStep);
  const setAnalyzing = useJourney((s) => s.setAnalyzing);

  /**
   * Selection auto-advances after a beat. Without tracking the pending timer,
   * changing your mind before it fires stacks a second advance on top of the
   * first and silently skips a whole question — so every advance goes through
   * here and only the latest selection wins.
   */
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAdvance = useCallback((callback: () => void, delay: number) => {
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(() => {
      advanceTimeout.current = null;
      callback();
    }, delay);
  }, []);

  useEffect(
    () => () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    },
    [],
  );

  const answered = useCallback(
    (question: QuestionStep, value: string) => {
      trackEvent("journey_question_answered", { question, value });
    },
    [],
  );

  const isQuestion = QUESTION_STEPS.includes(step as QuestionStep);

  /**
   * Keeps the question on screen when the question swaps under it.
   *
   * The browser clamps scroll position to the document's new height on every
   * commit — so answering a long question (say, Competition, with a dozen
   * cards and a text field) and landing on a much shorter one (Level) can
   * leave the scroll position past the new content entirely, stranding the
   * athlete in the footer with no visible question at all.
   *
   * This has to watch the per-question content node, not the section that
   * wraps it: the section spans the whole conversation area regardless of
   * which question is showing, so its own bounding box barely changes step to
   * step and never reports the problem.
   *
   * It also has to wait: `AnimatePresence mode="wait"` holds the outgoing
   * question on screen for its full exit transition before the incoming one
   * ever mounts, so checking on the same tick `step` changes measures either
   * nothing or the question that's on its way out. The delay below matches
   * that exit duration — by the time it fires, the new node is mounted and
   * `contentRef` has already been re-attached to it.
   */
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const node = contentRef.current;
      if (!node) return;

      // The top of the question — the heading and acknowledgement line —
      // has to actually be near the top of the viewport. A large negative
      // `top` (scrolled well past it) trivially satisfies "top < some large
      // threshold", which is what let the previous version of this check
      // through even when the heading was hundreds of pixels off-screen.
      const rect = node.getBoundingClientRect();
      const isReasonablyVisible = rect.top > -40 && rect.top < window.innerHeight * 0.5;
      if (!isReasonablyVisible) {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // The exit transition below runs at 0.4s; a little past that is when the
      // incoming node has definitely mounted.
    }, 450);

    return () => clearTimeout(timeout);
  }, [step, isAnalyzing]);

  if (!isQuestion && !isAnalyzing) return null;

  const sportLabel = getSportConfig(answers.sport).label;
  const levelLabel = getJourneyLevelConfig(answers.level).label;

  function handleGoal(goal: Parameters<typeof setGoal>[0]) {
    setGoal(goal);
    answered("goal", goal);
    setAnalyzing(true);
    trackEvent("journey_questions_completed");

    scheduleAdvance(() => {
      setAnalyzing(false);
      onComplete();
    }, ANALYSIS_DELAY);
  }

  return (
    <section
      id="conversation"
      className="relative flex min-h-svh flex-col justify-center py-24"
      aria-label="Your athlete journey"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/94 via-void/84 to-void/94 md:bg-gradient-to-r md:from-void/95 md:via-void/62 md:to-transparent"
      />

      <Container className="relative">
        <div className="max-w-xl lg:max-w-[40rem]">
          <div className="max-w-md">
            <JourneyProgress
              step={step}
              // Only backwards: jumping forward past an unanswered question
              // would leave the analysis unable to build.
              onStepSelect={(target) => goToStep(target)}
            />
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" ref={contentRef} exit={{ opacity: 0 }}>
                  <LoadingTransition label="Reading your journey" />
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  ref={contentRef}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease }}
                >
                  {step === "sport" && (
                    <SportQuestion
                      selected={answers.sport}
                      onBack={previousQuestion}
                      onSelect={(sport) => {
                        setSport(sport);
                        answered("sport", sport);
                        scheduleAdvance(nextQuestion, ADVANCE_DELAY);
                      }}
                    />
                  )}

                  {step === "environment" && (
                    <EnvironmentQuestion
                      sportLabel={sportLabel}
                      selected={answers.environment}
                      onBack={previousQuestion}
                      onSelect={(environment) => {
                        setEnvironment(environment);
                        answered("environment", environment);
                        scheduleAdvance(nextQuestion, ADVANCE_DELAY);
                      }}
                    />
                  )}

                  {step === "competition" && (
                    <CompetitionQuestion
                      level={answers.level}
                      selected={answers.competition}
                      competitionName={answers.competitionName}
                      onSelect={(competition) => {
                        setCompetition(competition);
                        answered("competition", competition);
                      }}
                      onNameChange={setCompetitionName}
                      onContinue={nextQuestion}
                      onBack={previousQuestion}
                    />
                  )}

                  {step === "level" && (
                    <LevelQuestion
                      selected={answers.level}
                      onBack={previousQuestion}
                      onBrowse={setLevel}
                      onSelect={(level) => {
                        setLevel(level);
                        answered("level", level);
                        scheduleAdvance(nextQuestion, ADVANCE_DELAY + 180);
                      }}
                    />
                  )}

                  {step === "goal" && (
                    <GoalQuestion
                      levelLabel={levelLabel}
                      selected={answers.goal}
                      onBack={previousQuestion}
                      onSelect={handleGoal}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
