"use client";

import { useEffect } from "react";
import { QuestionFrame } from "@/components/journey/QuestionFrame";
import { ChoiceCard } from "@/components/journey/ChoiceCard";
import { SPORTS } from "@/data/sports";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import type { Sport } from "@/types/journey";

/**
 * Question one.
 *
 * Hovering or focusing a sport previews it on the globe before it is chosen —
 * the answer changes the world before the athlete has committed to it, which is
 * the whole promise of the flow in miniature.
 */
export function SportQuestion({
  selected,
  onSelect,
  onBack,
}: {
  selected: Sport | null;
  onSelect: (sport: Sport) => void;
  onBack: () => void;
}) {
  const hoverSport = useGlobalExperience((s) => s.hoverSport);

  // Choosing a sport unmounts this question while the cursor is still over the
  // card, so the pointer-leave that would clear the preview never arrives. Left
  // set, the preview outlives the step and the globe keeps lighting — and the
  // country card keeps counting — the last sport hovered rather than the one
  // actually chosen.
  useEffect(() => () => hoverSport(null), [hoverSport]);

  return (
    <QuestionFrame
      acknowledgement="Let's start here"
      question="What do you play?"
      hint="Pick your sport and the globe will show you who else is out there playing it."
      onBack={onBack}
    >
      <div
        role="group"
        aria-label="Choose your sport"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      >
        {SPORTS.map((sport, i) => (
          <ChoiceCard
            key={sport.id}
            index={i}
            label={sport.label}
            icon={sport.icon}
            size="sm"
            selected={selected === sport.id}
            onSelect={() => onSelect(sport.id)}
            onPreview={() => hoverSport(sport.id)}
            onPreviewEnd={() => hoverSport(null)}
          />
        ))}
      </div>
    </QuestionFrame>
  );
}
