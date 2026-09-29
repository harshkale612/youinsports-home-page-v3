"use client";

import { useMemo } from "react";
import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { ChoiceCard } from "@/components/journey/ChoiceCard";
import { Button } from "@/components/ui/Button";
import { COMPETITIONS, suggestedCompetitions } from "@/data/competitions";
import type { CompetitionScope, JourneyLevel } from "@/types/journey";

/**
 * Question four.
 *
 * The suggested options for the athlete's level come first, but the full list
 * stays available below — a district player entering a national open is exactly
 * the kind of ambition this question should not quietly rule out.
 *
 * The free-text field is the only place in the flow where the athlete can name
 * something we do not have a category for, and it is optional throughout.
 */
export function CompetitionQuestion({
  level,
  selected,
  competitionName,
  onSelect,
  onNameChange,
  onContinue,
  onBack,
}: {
  level: JourneyLevel | null;
  selected: CompetitionScope | null;
  competitionName: string;
  onSelect: (competition: CompetitionScope) => void;
  onNameChange: (name: string) => void;
  onContinue: () => void;
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

      <div className="mt-7 max-w-md">
        <label className="block">
          <span className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-faint uppercase">
            Tell us what you&apos;re competing in
            <span className="ml-2 normal-case tracking-normal text-faint/80">optional</span>
          </span>
          <input
            type="text"
            value={competitionName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Maharashtra District Cricket Tournament"
            className="mt-2.5 w-full rounded-full border border-tint/12 bg-field-soft px-5 py-3.5 text-[0.92rem] text-fg shadow-[var(--shadow-tile)] transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:border-accent/70 focus:shadow-[var(--focus-halo)] focus:outline-none"
          />
        </label>
      </div>

      {/* This is the one question that cannot auto-advance: the optional name
          field would be snatched away mid-sentence if it did. */}
      <div className="mt-6">
        <Button size="md" disabled={!selected} showArrow onClick={onContinue}>
          Continue
        </Button>
      </div>
    </QuestionFrame>
  );
}
