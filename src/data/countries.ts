import type { Country } from "@/types/network";

/**
 * Registry for every country represented in the demo athlete network.
 * Coordinates are approximate national centroids — used to frame the camera
 * when a country is selected from search or the athlete directory.
 */
export const COUNTRIES: Country[] = [
  { code: "ARG", name: "Argentina", flag: "🇦🇷", latitude: -34.6, longitude: -58.38, population: 46 },
  { code: "AUS", name: "Australia", flag: "🇦🇺", latitude: -33.87, longitude: 151.21, population: 27 },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", latitude: -23.55, longitude: -46.63, population: 217 },
  { code: "CAN", name: "Canada", flag: "🇨🇦", latitude: 43.65, longitude: -79.38, population: 40 },
  { code: "CHN", name: "China", flag: "🇨🇳", latitude: 31.22, longitude: 121.46, population: 1412 },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", latitude: 45.81, longitude: 15.98, population: 3.9 },
  { code: "CUB", name: "Cuba", flag: "🇨🇺", latitude: 23.13, longitude: -82.38, population: 11 },
  { code: "DEU", name: "Germany", flag: "🇩🇪", latitude: 52.52, longitude: 13.4, population: 84 },
  { code: "DNK", name: "Denmark", flag: "🇩🇰", latitude: 55.68, longitude: 12.57, population: 5.9 },
  { code: "EGY", name: "Egypt", flag: "🇪🇬", latitude: 30.06, longitude: 31.25, population: 111 },
  { code: "ESP", name: "Spain", flag: "🇪🇸", latitude: 40.42, longitude: -3.7, population: 48 },
  { code: "ETH", name: "Ethiopia", flag: "🇪🇹", latitude: 9.02, longitude: 38.75, population: 126 },
  { code: "FIJ", name: "Fiji", flag: "🇫🇯", latitude: -18.14, longitude: 178.44, population: 0.93 },
  { code: "FRA", name: "France", flag: "🇫🇷", latitude: 48.85, longitude: 2.35, population: 68 },
  { code: "GBR", name: "United Kingdom", flag: "🇬🇧", latitude: 51.51, longitude: -0.13, population: 68 },
  { code: "GHA", name: "Ghana", flag: "🇬🇭", latitude: 5.56, longitude: -0.2, population: 34 },
  { code: "IDN", name: "Indonesia", flag: "🇮🇩", latitude: -6.21, longitude: 106.85, population: 277 },
  { code: "IND", name: "India", flag: "🇮🇳", latitude: 19.08, longitude: 72.88, population: 1429 },
  { code: "ITA", name: "Italy", flag: "🇮🇹", latitude: 41.89, longitude: 12.48, population: 59 },
  { code: "JAM", name: "Jamaica", flag: "🇯🇲", latitude: 17.97, longitude: -76.79, population: 2.8 },
  { code: "JPN", name: "Japan", flag: "🇯🇵", latitude: 35.69, longitude: 139.69, population: 124 },
  { code: "KEN", name: "Kenya", flag: "🇰🇪", latitude: -1.29, longitude: 36.82, population: 55 },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", latitude: 37.57, longitude: 126.98, population: 52 },
  { code: "MAR", name: "Morocco", flag: "🇲🇦", latitude: 33.57, longitude: -7.59, population: 38 },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", latitude: 19.43, longitude: -99.13, population: 129 },
  { code: "NGA", name: "Nigeria", flag: "🇳🇬", latitude: 6.45, longitude: 3.39, population: 223 },
  { code: "NLD", name: "Netherlands", flag: "🇳🇱", latitude: 52.37, longitude: 4.9, population: 18 },
  { code: "NOR", name: "Norway", flag: "🇳🇴", latitude: 59.91, longitude: 10.75, population: 5.5 },
  { code: "NZL", name: "New Zealand", flag: "🇳🇿", latitude: -36.85, longitude: 174.76, population: 5.2 },
  { code: "PAK", name: "Pakistan", flag: "🇵🇰", latitude: 31.56, longitude: 74.35, population: 240 },
  { code: "POL", name: "Poland", flag: "🇵🇱", latitude: 52.23, longitude: 21.01, population: 37 },
  { code: "PRT", name: "Portugal", flag: "🇵🇹", latitude: 38.72, longitude: -9.14, population: 10 },
  { code: "QAT", name: "Qatar", flag: "🇶🇦", latitude: 25.29, longitude: 51.53, population: 2.7 },
  { code: "RUS", name: "Russia", flag: "🇷🇺", latitude: 55.75, longitude: 37.62, population: 144 },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", latitude: 14.72, longitude: -17.47, population: 18 },
  { code: "SRB", name: "Serbia", flag: "🇷🇸", latitude: 44.79, longitude: 20.45, population: 6.6 },
  { code: "SWE", name: "Sweden", flag: "🇸🇪", latitude: 59.33, longitude: 18.07, population: 11 },
  { code: "TUR", name: "Türkiye", flag: "🇹🇷", latitude: 41.01, longitude: 28.95, population: 85 },
  { code: "UGA", name: "Uganda", flag: "🇺🇬", latitude: 0.32, longitude: 32.58, population: 49 },
  { code: "ARE", name: "United Arab Emirates", flag: "🇦🇪", latitude: 25.2, longitude: 55.27, population: 9.4 },
  { code: "USA", name: "United States", flag: "🇺🇸", latitude: 38.9, longitude: -77.04, population: 335 },
  { code: "VNM", name: "Vietnam", flag: "🇻🇳", latitude: 21.02, longitude: 105.84, population: 99 },
  { code: "ZAF", name: "South Africa", flag: "🇿🇦", latitude: -26.2, longitude: 28.04, population: 60 },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

const FALLBACK: Country = {
  code: "WLD",
  name: "World",
  flag: "🌍",
  latitude: 0,
  longitude: 0,
  population: 8000,
};

export function getCountry(code: string): Country {
  return BY_CODE.get(code) ?? FALLBACK;
}

/**
 * Illustrative network size per country. DEMO DATA — the seeded network holds
 * only a handful of real athletes per country, which reads as empty on a
 * "global network" globe, so the card reports an indicative figure instead.
 *
 * Scaled by population between these bounds, and derived rather than stored so
 * the same country always reports the same number, in every section and on
 * every hover.
 */
const MIN_ATHLETES = 10_000;
const MAX_ATHLETES = 25_000;

// Log scale, because population spans three orders of magnitude here: on a
// linear one every country but China and India would sit on the floor.
const LOG_MIN = Math.log10(Math.min(...COUNTRIES.map((c) => c.population)));
const LOG_MAX = Math.log10(Math.max(...COUNTRIES.map((c) => c.population)));

export function getCountryAthleteCount(code: string): number {
  const { population } = getCountry(code);
  const t = Math.min(Math.max((Math.log10(population) - LOG_MIN) / (LOG_MAX - LOG_MIN), 0), 1);
  // Rounded to ten so the figure reads as a reported total, not a measurement.
  return Math.round((MIN_ATHLETES + t * (MAX_ATHLETES - MIN_ATHLETES)) / 10) * 10;
}

/**
 * The share of a country's athletes playing one sport, at the same illustrative
 * scale as {@link getCountryAthleteCount} — a card must never put a five-figure
 * total next to a count taken from the seeded rows.
 */
export function getCountrySportAthleteCount(code: string, sport: string): number {
  const key = `${code}:${sport}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  // 4%–16% each, so the sports of one country stay plausible side by side.
  const share = 0.04 + ((hash % 1000) / 1000) * 0.12;
  return Math.round((getCountryAthleteCount(code) * share) / 10) * 10;
}
