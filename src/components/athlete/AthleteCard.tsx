"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleteAvatar } from "@/components/athlete/AthleteAvatar";
import { getCountry } from "@/data/countries";
import { getSportConfig } from "@/data/sports";
import { getLevelConfig } from "@/data/levels";
import type { DemoAthlete } from "@/types/network";

/** Editorial athlete card used in the discovery rail and the directory. */
export function AthleteCard({
  athlete,
  active = false,
  onActivate,
  onHoverStart,
  onHoverEnd,
  className,
}: {
  athlete: DemoAthlete;
  active?: boolean;
  onActivate?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
}) {
  const country = getCountry(athlete.countryCode);
  const sport = getSportConfig(athlete.sport);
  const level = getLevelConfig(athlete.level);

  return (
    <motion.button
      type="button"
      onClick={onActivate}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-pressed={active}
      className={cn(
        "group relative flex w-[17.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border p-6 text-left",
        "bg-[rgba(6,22,34,0.72)] backdrop-blur-xl transition-colors duration-300",
        active
          ? "border-accent/70 shadow-[0_0_0_1px_var(--color-accent-line),0_28px_70px_-40px_var(--color-accent)]"
          : "border-white/10 hover:border-white/25",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <AthleteAvatar athlete={athlete} size={58} />
        <span className="text-xl leading-none" aria-hidden>
          {country.flag}
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg leading-tight font-semibold tracking-tight text-fg">
        {athlete.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{athlete.discipline}</p>
      <p className="mt-0.5 text-sm text-faint">
        {athlete.city}, {country.name}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <span className="rounded-full border border-white/10 px-2.5 py-1 font-display text-[0.58rem] font-semibold tracking-[0.16em] text-muted uppercase">
          {sport.label}
        </span>
        <span className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 font-display text-[0.58rem] font-semibold tracking-[0.16em] text-accent uppercase">
          {level.label}
        </span>
      </div>

      <dl className="mt-6 flex items-end justify-between border-t border-white/[0.08] pt-4">
        <div>
          <dt className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
            Performance
          </dt>
          <dd className="tabular mt-1 font-display text-2xl leading-none font-semibold text-fg">
            {athlete.performance}
          </dd>
        </div>
        <span className="flex items-center gap-1.5 font-display text-[0.6rem] font-semibold tracking-[0.16em] text-muted uppercase transition-colors group-hover:text-accent">
          View athlete
          <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </dl>
    </motion.button>
  );
}
