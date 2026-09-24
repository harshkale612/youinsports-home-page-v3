"use client";

import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { ChoiceCard } from "@/components/journey/ChoiceCard";
import { ENVIRONMENTS } from "@/data/environments";
import type { Environment } from "@/types/journey";

/**
 * Question two — the environment, not the geography.
 *
 * "Where do you play" is asked twice on purpose: this half is about the setup
 * an athlete trains inside, which is a much stronger signal than their city.
 */
export function EnvironmentQuestion({
  sportLabel,
  selected,
  onSelect,
  onBack,
}: {
  sportLabel: string;
  selected: Environment | null;
  onSelect: (environment: Environment) => void;
  onBack: () => void;
}) {
  return (
    <QuestionFrame
      acknowledgement={`${sportLabel}. Good.`}
      question="Where do you play?"
      hint="Not the city yet — the setup you play inside. It tells us more about your journey than a map pin does."
      onBack={onBack}
    >
      <div
        role="group"
        aria-label="Choose where you currently play"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {ENVIRONMENTS.map((environment, i) => (
          <ChoiceCard
            key={environment.id}
            index={i}
            label={environment.label}
            detail={environment.detail}
            icon={environment.icon}
            selected={selected === environment.id}
            onSelect={() => onSelect(environment.id)}
          />
        ))}
      </div>
    </QuestionFrame>
  );
}
