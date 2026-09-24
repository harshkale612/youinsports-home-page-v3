import type { Sport } from "@/types/athlete";
import {
  Zap,
  CircleDot,
  Target,
  Waves,
  Swords,
  Grid3x3,
  Timer,
  ShieldHalf,
  Volleyball as VolleyballIcon,
  Hand,
  Trophy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SportVisualConfig = {
  id: Sport;
  label: string;
  tagline: string;
  icon: LucideIcon;
  /** Hue in degrees, used to retint the accent color and 3D lighting. */
  accentHue: number;
};

export const SPORTS: SportVisualConfig[] = [
  { id: "cricket", label: "Cricket", tagline: "Bat, ball, and precision", icon: Target, accentHue: 84 },
  { id: "football", label: "Football", tagline: "The world's game", icon: CircleDot, accentHue: 142 },
  { id: "basketball", label: "Basketball", tagline: "Court vision, elevated", icon: ShieldHalf, accentHue: 24 },
  { id: "tennis", label: "Tennis", tagline: "Precision under pressure", icon: Swords, accentHue: 84 },
  { id: "athletics", label: "Athletics", tagline: "Speed against the clock", icon: Timer, accentHue: 200 },
  { id: "swimming", label: "Swimming", tagline: "Flow, power, rhythm", icon: Waves, accentHue: 195 },
  { id: "badminton", label: "Badminton", tagline: "Fast hands, faster reflexes", icon: VolleyballIcon, accentHue: 264 },
  { id: "volleyball", label: "Volleyball", tagline: "Built on the rally", icon: Hand, accentHue: 32 },
  { id: "hockey", label: "Hockey", tagline: "Control the field", icon: Grid3x3, accentHue: 168 },
  { id: "boxing", label: "Boxing", tagline: "One-on-one, all heart", icon: Zap, accentHue: 4 },
  { id: "gymnastics", label: "Gymnastics", tagline: "Control, held in the air", icon: Sparkles, accentHue: 300 },
  { id: "chess", label: "Chess", tagline: "The sport of the mind", icon: Trophy, accentHue: 44 },
];

export function getSportConfig(sport: Sport | null | undefined): SportVisualConfig {
  return SPORTS.find((s) => s.id === sport) ?? SPORTS[0];
}

/**
 * Illustrative network counts for the sport explorer. DEMO DATA — derived from
 * the demo athlete set, scaled to suggest a populated platform. Not a metric.
 */
export type SportNetworkStats = {
  athletes: number;
  countries: number;
};

const NETWORK_STATS: Record<Sport, SportNetworkStats> = {
  football: { athletes: 4820, countries: 92 },
  cricket: { athletes: 1240, countries: 47 },
  basketball: { athletes: 3160, countries: 78 },
  athletics: { athletes: 5410, countries: 118 },
  swimming: { athletes: 2280, countries: 84 },
  tennis: { athletes: 1960, countries: 71 },
  badminton: { athletes: 1180, countries: 53 },
  volleyball: { athletes: 1640, countries: 62 },
  boxing: { athletes: 980, countries: 49 },
  hockey: { athletes: 870, countries: 38 },
  gymnastics: { athletes: 740, countries: 44 },
  chess: { athletes: 1320, countries: 66 },
};

export function getSportStats(sport: Sport): SportNetworkStats {
  return NETWORK_STATS[sport];
}

/** Hue → the marker/arc tint the Earth scene uses when this sport is active. */
export function getSportAccent(sport: Sport | null): number {
  return sport ? getSportConfig(sport).accentHue : 210;
}
