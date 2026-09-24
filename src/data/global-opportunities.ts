import type { DemoOpportunity, OpportunityKind, Sport } from "@/types/network";

/**
 * DEMO NETWORK — illustrative opportunities, geolocated so they can be drawn on
 * the globe and connected by arc to the athletes they'd plausibly reach.
 */
type Row = [
  id: string,
  kind: OpportunityKind,
  title: string,
  organization: string,
  countryCode: string,
  city: string,
  latitude: number,
  longitude: number,
  sports: Sport[],
  window: string,
];

// prettier-ignore
const ROWS: Row[] = [
  ["o01", "trial",       "National Under-23 Trials",     "Athletics Federation",          "IND", "Delhi",         28.65,   77.23, ["athletics"],                        "Opens in March"],
  ["o02", "academy",     "Elite Development Academy",    "Continental Football Group",    "ESP", "Barcelona",     41.39,    2.17, ["football"],                         "Rolling intake"],
  ["o03", "competition", "Pacific Open Championship",    "Regional Sports Council",       "AUS", "Melbourne",    -37.81,  144.96, ["swimming", "athletics"],            "Entries close April"],
  ["o04", "coach",       "High-Performance Coaching",    "Institute of Sport",            "GBR", "London",        51.51,   -0.13, ["boxing", "athletics"],              "Two places open"],
  ["o05", "sponsor",     "Emerging Talent Grant",        "YouInSports Partner Network",   "ARE", "Dubai",         25.20,   55.27, ["tennis", "badminton", "swimming"],  "Applications open"],
  ["o06", "club",        "First-Team Pathway",           "Metropolitan Sports Club",      "BRA", "São Paulo",    -23.55,  -46.63, ["football", "volleyball"],           "Scouting now"],
  ["o07", "event",       "Global Youth Games",           "International Games Committee", "JPN", "Tokyo",         35.69,  139.69, ["gymnastics", "volleyball"],         "Qualifiers in June"],
  ["o08", "trial",       "Provincial Selection Camp",    "Hockey Association",            "NLD", "Amsterdam",     52.37,    4.90, ["hockey"],                           "Two-day camp"],
  ["o09", "academy",     "Altitude Training Residency",  "Distance Running Centre",       "KEN", "Eldoret",        0.52,   35.27, ["athletics"],                        "Six-week block"],
  ["o10", "competition", "Continental Masters",          "Chess Federation",              "DEU", "Berlin",        52.52,   13.40, ["chess"],                            "Open entry"],
  ["o11", "sponsor",     "Equipment Partnership",        "National Cricket Board",        "IND", "Mumbai",        19.08,   72.88, ["cricket"],                          "Shortlist stage"],
  ["o12", "coach",       "Sprint Mechanics Programme",   "University Athletics Dept",     "USA", "Los Angeles",   34.05, -118.24, ["athletics"],                        "Summer intake"],
  ["o13", "club",        "Semi-Pro Roster Spots",        "City Basketball Club",          "CAN", "Toronto",       43.65,  -79.38, ["basketball"],                       "Four spots"],
  ["o14", "event",       "Invitational Showcase",        "Talent Scouting Network",       "ZAF", "Cape Town",    -33.92,   18.42, ["football", "athletics", "boxing"],  "Invite only"],
  ["o15", "trial",       "Junior National Squad",        "Badminton Association",         "DNK", "Copenhagen",    55.68,   12.57, ["badminton"],                        "Trials in May"],
  ["o16", "academy",     "Performance Swim Programme",   "Aquatics Institute",            "NOR", "Oslo",          59.91,   10.75, ["swimming"],                         "Annual intake"],
];

export const GLOBAL_OPPORTUNITIES: DemoOpportunity[] = ROWS.map(
  ([id, kind, title, organization, countryCode, city, latitude, longitude, sports, window]) => ({
    id, kind, title, organization, countryCode, city, latitude, longitude, sports, window,
  }),
);

export const OPPORTUNITY_KIND_LABELS: Record<OpportunityKind, string> = {
  trial: "Trial",
  competition: "Competition",
  academy: "Academy",
  coach: "Coach",
  sponsor: "Sponsor",
  club: "Club",
  event: "Event",
};

export function opportunitiesForSport(sport: Sport | null): DemoOpportunity[] {
  return sport ? GLOBAL_OPPORTUNITIES.filter((o) => o.sports.includes(sport)) : GLOBAL_OPPORTUNITIES;
}
