"use client";

import { useMemo } from "react";
import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { ChoiceCard } from "@/components/journey/ChoiceCard";
import { COMPETITIONS, suggestedCompetitions } from "@/data/competitions";
import type { CompetitionScope, JourneyLevel } from "@/types/journey";

/**
 * Question four.
 *
 * The suggested options for the athlete's level come first, but the full list
 * stays available below — a district player entering a national open is exactly
 * the kind of ambition this question should not quietly rule out.
 */
export function CompetitionQuestion({
  level,
  selected,
  onSelect,
  onBack,
}: {
  level: JourneyLevel | null;
  selected: CompetitionScope | null;
  onSelect: (competition: CompetitionScope) => void;
  onBack: () => void;
}) {
  const { suggested, rest } = useMemo(() => {
    const suggestedIds = suggestedCompetitions(level);
    const isSuggested = (id: CompetitionScope) => suggestedIds.includes(id);
    return {
      suggested: suggestedIds
        .map((id) => COMPETITIONS.find((c) => c.id === id))
        .filter((c): c is (typeof COMPETITIONS)[number] => Boolean(c)),
      rest: COMPETITIONS.filter((c) => !isSuggested(c.id)),
    };
  }, [level]);

  return (
    <QuestionFrame
      acknowledgement="Let's talk about the field"
      question="What are you competing in?"
      hint="The competition you are actually playing right now — not the one you are aiming at."
      onBack={onBack}
    >
      <div role="group" aria-label="Choose what you are competing in">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {suggested.map((competition, i) => (
            <ChoiceCard
              key={competition.id}
              index={i}
              label={competition.label}
              detail={competition.detail}
              selected={selected === competition.id}
              onSelect={() => onSelect(competition.id)}
            />
          ))}
        </div>

        <p className="mt-6 font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
          Or something else
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {rest.map((competition, i) => (
            <ChoiceCard
              key={competition.id}
              index={i}
              label={competition.label}
              detail={competition.detail}
              size="sm"
              selected={selected === competition.id}
              onSelect={() => onSelect(competition.id)}
            />
          ))}
        </div>
      </div>
    </QuestionFrame>
  );
}
