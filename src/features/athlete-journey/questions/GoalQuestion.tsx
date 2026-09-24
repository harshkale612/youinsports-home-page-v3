"use client";

import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { ChoiceCard } from "@/components/journey/ChoiceCard";
import { GOALS } from "@/data/goals";
import type { Goal } from "@/types/journey";

/**
 * Question six.
 *
 * The answer that makes the recommendations feel written for this athlete
 * rather than assembled from their numbers — two players with identical
 * readings and different ambitions should not be told the same thing.
 */
export function GoalQuestion({
  levelLabel,
  selected,
  onSelect,
  onBack,
}: {
  levelLabel: string;
  selected: Goal | null;
  onSelect: (goal: Goal) => void;
  onBack: () => void;
}) {
  return (
    <QuestionFrame
      acknowledgement={`${levelLabel} level. Last one.`}
      question="Where do you want to go?"
      hint="What you are actually chasing. This shapes everything we show you next."
      onBack={onBack}
    >
      <div
        role="group"
        aria-label="Choose what you are working toward"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {GOALS.map((goal, i) => (
          <ChoiceCard
            key={goal.id}
            index={i}
            label={goal.label}
            icon={goal.icon}
            size="sm"
            selected={selected === goal.id}
            onSelect={() => onSelect(goal.id)}
          />
        ))}
      </div>
    </QuestionFrame>
  );
}
