import { ATHLETES } from "@/data/athletes";
import { SPORTS, getSportConfig } from "@/data/sports";
import { COUNTRIES, getCountry } from "@/data/countries";
import type { Sport } from "@/types/network";

export type SearchResult =
  | {
      kind: "athlete";
      id: string;
      title: string;
      subtitle: string;
      flag: string;
      latitude: number;
      longitude: number;
      sport: Sport;
    }
  | {
      kind: "sport";
      id: Sport;
      title: string;
      subtitle: string;
    }
  | {
      kind: "country";
      id: string;
      title: string;
      subtitle: string;
      flag: string;
      latitude: number;
      longitude: number;
    };

function normalize(value: string) {
  // Strip diacritics so "Sao Paulo" finds "São Paulo" and "Petric" finds "Petrič".
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Ranked local search across athletes, sports and countries.
 *
 * Prefix matches outrank substring matches so typing "in" surfaces India before
 * Badminton, and name matches outrank the city/discipline fields behind them.
 */
export function searchNetwork(query: string, limit = 8): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: { result: SearchResult; score: number }[] = [];

  function score(haystack: string, weight: number) {
    const value = normalize(haystack);
    if (value.startsWith(q)) return 100 * weight;
    const index = value.indexOf(q);
    if (index === 0) return 100 * weight;
    if (index > 0) {
      // Matching the start of any word beats matching mid-word.
      const isWordStart = value[index - 1] === " ";
      return (isWordStart ? 70 : 40) * weight;
    }
    return 0;
  }

  for (const sport of SPORTS) {
    const value = score(sport.label, 1.1);
    if (value > 0) {
      const count = ATHLETES.filter((a) => a.sport === sport.id).length;
      scored.push({
        score: value,
        result: {
          kind: "sport",
          id: sport.id,
          title: sport.label,
          subtitle: `${count} demo athletes · ${sport.tagline}`,
        },
      });
    }
  }

  for (const country of COUNTRIES) {
    const value = score(country.name, 1);
    if (value > 0) {
      const count = ATHLETES.filter((a) => a.countryCode === country.code).length;
      if (count === 0) continue;
      scored.push({
        score: value,
        result: {
          kind: "country",
          id: country.code,
          title: country.name,
          subtitle: `${count} demo ${count === 1 ? "athlete" : "athletes"}`,
          flag: country.flag,
          latitude: country.latitude,
          longitude: country.longitude,
        },
      });
    }
  }

  for (const athlete of ATHLETES) {
    const value = Math.max(
      score(athlete.name, 1.2),
      score(athlete.city, 0.8),
      score(athlete.discipline, 0.7),
      // Country too, so "india" returns the country *and* the athletes in it
      // rather than making the user guess a city name.
      score(getCountry(athlete.countryCode).name, 0.75),
    );
    if (value > 0) {
      scored.push({
        score: value + athlete.rating / 1000,
        result: {
          kind: "athlete",
          id: athlete.id,
          title: athlete.name,
          subtitle: `${athlete.discipline} · ${athlete.city}`,
          flag: getCountry(athlete.countryCode).flag,
          latitude: athlete.latitude,
          longitude: athlete.longitude,
          sport: athlete.sport,
        },
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.result);
}

/** Shown before the user types anything — a way in rather than an empty box. */
export const SEARCH_SUGGESTIONS: { label: string; query: string }[] = [
  { label: "Cricket", query: "cricket" },
  { label: "Athletes in India", query: "india" },
  { label: "Football", query: "football" },
  { label: "Kenya", query: "kenya" },
  { label: "Gymnastics", query: "gymnastics" },
  { label: "Basketball", query: "basketball" },
];

export function sportLabel(sport: Sport) {
  return getSportConfig(sport).label;
}
