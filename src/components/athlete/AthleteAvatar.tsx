import { cn } from "@/lib/utils";
import { getSportConfig } from "@/data/sports";
import type { DemoAthlete } from "@/types/network";

/**
 * Deliberately not a photograph.
 *
 * These athletes are demo data, and rendering invented people as photorealistic
 * portraits would present fabricated identities as real. Instead each athlete
 * gets a generated monogram: a gradient disc tinted by their sport, a progress
 * ring carrying their rating, and their initials. It reads as premium, it is
 * honest about being synthetic, and it ships no image bytes at all.
 */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AthleteAvatar({
  athlete,
  size = 56,
  className,
  showRating = true,
}: {
  athlete: DemoAthlete;
  size?: number;
  className?: string;
  showRating?: boolean;
}) {
  const hue = getSportConfig(athlete.sport).accentHue;
  const gradientId = `avatar-${athlete.id}`;

  // The ring is a real data channel, not decoration: arc length is the rating.
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const filled = (athlete.rating / 100) * circumference;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={`${athlete.name}, ${athlete.discipline}, rating ${athlete.rating} out of 100`}
    >
      <defs>
        <radialGradient id={gradientId} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor={`hsl(${hue} 78% 42%)`} />
          <stop offset="58%" stopColor={`hsl(${hue} 62% 22%)`} />
          <stop offset="100%" stopColor={`hsl(${hue + 18} 45% 11%)`} />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="40" fill={`url(#${gradientId})`} />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

      {showRating && (
        <>
          <circle
            cx="50" cy="50" r={radius}
            fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="2.5"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={`hsl(${hue} 92% 66%)`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            transform="rotate(-90 50 50)"
          />
        </>
      )}

      <text
        x="50" y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255,255,255,0.94)"
        fontSize="28"
        fontWeight="600"
        letterSpacing="0.5"
        style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
      >
        {initials(athlete.name)}
      </text>
    </svg>
  );
}
