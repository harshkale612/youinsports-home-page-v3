"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { careerInsightProvider } from "@/lib/career-insight";
import { trackEvent } from "@/lib/analytics";
import type { Athlete, CareerInsight as CareerInsightData } from "@/types/athlete";

const CHECKLIST = ["Competition level", "Performance", "Visibility", "Goals", "Achievements"];

type Phase = "idle" | "analyzing" | "done";

export function CareerInsightCard({ athlete }: { athlete: Athlete }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [checkedCount, setCheckedCount] = useState(0);
  const [insight, setInsight] = useState<CareerInsightData | null>(null);

  async function handleAnalyze() {
    setPhase("analyzing");
    setCheckedCount(0);
    trackEvent("career_analysis_started");

    for (let i = 0; i < CHECKLIST.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 380));
      setCheckedCount((c) => c + 1);
    }

    const result = await careerInsightProvider.generateInsight(athlete);
    setInsight(result);
    setPhase("done");
    trackEvent("career_analysis_completed");
  }

  return (
    <SurfaceCard className="p-8 md:p-10">
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-muted">
              Run a demo analysis of {athlete.name}&rsquo;s athlete profile to see how YouInSports will
              surface career recommendations.
            </p>
            <Button variant="primary" showArrow magnetic className="mt-8" onClick={handleAnalyze}>
              Analyze my career
            </Button>
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <p className="font-display text-sm font-semibold tracking-[0.2em] text-fg uppercase">
              Analyzing your athlete profile
            </p>
            <ul className="flex flex-col gap-3">
              {CHECKLIST.map((item, i) => {
                const checked = i < checkedCount;
                return (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex size-5 items-center justify-center rounded-full border transition-colors duration-300 ${
                        checked ? "border-accent bg-accent" : "border-border"
                      }`}
                    >
                      {checked && <Check className="size-3 text-bg" strokeWidth={3} />}
                    </span>
                    <span className={checked ? "text-fg" : "text-muted"}>{item}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {phase === "done" && insight && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Analysis complete
            </p>
            <p className="mt-3 font-display text-2xl font-semibold text-fg md:text-3xl">
              {insight.headline}
            </p>
            <p className="mt-4 text-muted">{insight.summary}</p>

            <p className="mt-8 font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              Next steps
            </p>
            <ol className="mt-4 flex flex-col gap-3">
              {insight.nextSteps.map((step, i) => (
                <li key={step} className="flex items-center gap-4 text-sm text-fg">
                  <span className="font-display text-xs font-semibold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </SurfaceCard>
  );
}
