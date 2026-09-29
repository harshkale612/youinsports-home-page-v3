import { SPORTS } from "@/data/sports";

/**
 * Every sport on the platform, running past between the hero and the mission.
 *
 * Decorative, so it's hidden from assistive tech. The list is doubled for a
 * seamless loop, and each item carries its own trailing space rather than
 * using `gap`, so the second copy starts exactly where the marquee wraps.
 */
export function SportsRibbon() {
  return (
    <div
      aria-hidden
      className="relative border-y border-tint/[0.06] bg-[linear-gradient(90deg,rgb(240_107_40/0.04),rgb(44_143_227/0.05))] py-5 md:py-6"
    >
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[...SPORTS, ...SPORTS].map((sport, i) => {
            const Icon = sport.icon;
            return (
              <span
                key={`${sport.id}-${i}`}
                className="flex items-center gap-3 font-display text-[clamp(1.05rem,1.9vw,1.45rem)] font-semibold tracking-tight text-faint"
              >
                <Icon className="size-[0.85em] text-accent/70" />
                {sport.label}
                <span className="mx-8 size-1 rounded-full bg-orange/60 md:mx-11" />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
