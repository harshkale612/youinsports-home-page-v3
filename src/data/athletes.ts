import type { DemoAthlete, Sport, AthleteLevel } from "@/types/network";

/**
 * DEMO NETWORK — these athletes are illustrative, not real people.
 * Coordinates are real city coordinates so the markers land in the right place
 * on the globe; everything else is fabricated for the product demo.
 *
 * Stored as tuples to keep the module compact and the columns scannable.
 */
type Row = [
  id: string,
  name: string,
  sport: Sport,
  discipline: string,
  countryCode: string,
  city: string,
  latitude: number,
  longitude: number,
  level: AthleteLevel,
  rating: number,
  note: string,
];

// prettier-ignore
const ROWS: Row[] = [
  ["a01", "Jordan Miles",       "athletics",  "100m Sprint",        "USA", "Los Angeles",    34.05, -118.24, "national",      84, "Broke the state record twice in one season."],
  ["a02", "Elena Petrova",      "swimming",   "200m Freestyle",     "RUS", "Moscow",         55.75,   37.62, "national",      81, "Six years in the national training pool."],
  ["a03", "Rafael Costa",       "football",   "Attacking Midfield", "BRA", "São Paulo",     -23.55,  -46.63, "state",         79, "Academy graduate chasing a first-team seat."],
  ["a04", "Amina Diallo",       "athletics",  "Marathon",           "SEN", "Dakar",          14.72,  -17.47, "national",      82, "Negative-splits every race she finishes."],
  ["a05", "Kenji Tanaka",       "gymnastics", "All-Around",         "JPN", "Tokyo",          35.69,  139.69, "international", 91, "Two world-tour podiums before turning 21."],
  ["a06", "Ishaan Rao",         "cricket",    "Right-arm Pace",     "IND", "Mumbai",         19.08,   72.88, "state",         83, "Bowls at 142kph with a genuine outswinger."],
  ["a07", "Meera Krishnan",     "badminton",  "Women's Singles",    "IND", "Chennai",        13.08,   80.27, "national",      86, "Unbeaten across the last two national circuits."],
  ["a08", "Arjun Deshmukh",     "hockey",     "Centre Half",        "IND", "Delhi",          28.65,   77.23, "state",      80, "Reads the press better than anyone in his age group."],
  ["a09", "Priya Nair",         "athletics",  "400m Hurdles",       "IND", "Bengaluru",      12.97,   77.59, "local",      72, "Moved from 800m and dropped a second in a month."],
  ["a10", "Ravi Sengupta",      "chess",      "Classical",          "IND", "Kolkata",        22.57,   88.36, "international", 88, "Untitled at 16, 2400-rated at 19."],
  ["a11", "Tyler Brooks",       "basketball", "Shooting Guard",     "USA", "Chicago",        41.88,  -87.63, "state",         77, "Catch-and-shoot specialist with deep range."],
  ["a12", "Samira Okonkwo",     "athletics",  "Long Jump",          "NGA", "Lagos",           6.45,    3.39, "national",      85, "Consistent 6.60m+ on an outdoor runway."],
  ["a13", "Lucas Fernández",    "football",   "Left Back",          "ARG", "Buenos Aires",  -34.60,  -58.38, "national",      84, "Overlaps for ninety minutes without dropping off."],
  ["a14", "Chloe Bennett",      "swimming",   "100m Butterfly",     "AUS", "Sydney",        -33.87,  151.21, "national",      83, "Trains in open water through the winter."],
  ["a15", "Marcus Whitfield",   "boxing",     "Middleweight",       "GBR", "Manchester",     53.48,   -2.24, "national",      81, "Twenty-two amateur bouts, nineteen wins."],
  ["a16", "Yuki Nakamura",      "volleyball", "Outside Hitter",     "JPN", "Osaka",          34.69,  135.50, "district",         76, "Vertical jump puts her in the national conversation."],
  ["a17", "Thabo Mokoena",      "football",   "Goalkeeper",         "ZAF", "Johannesburg",  -26.20,   28.04, "state",      82, "Kept nine clean sheets in a fourteen-game run."],
  ["a18", "Eliud Kipchirchir",  "athletics",  "5000m",              "KEN", "Eldoret",         0.52,   35.27, "international", 93, "Altitude-trained since he could run to school."],
  ["a19", "Sofia Rossi",        "tennis",     "Women's Singles",    "ITA", "Rome",           41.89,   12.48, "national",      80, "Clay-court grinder with a heavy topspin forehand."],
  ["a20", "Daniel Okafor",      "basketball", "Power Forward",      "GBR", "London",         51.51,   -0.13, "national",      82, "Switched from athletics at seventeen."],
  ["a21", "Léa Moreau",         "gymnastics", "Uneven Bars",        "FRA", "Lyon",           45.76,    4.84, "national",      84, "Difficulty score climbing every meet."],
  ["a22", "Hans Albrecht",      "hockey",     "Forward",            "DEU", "Munich",         48.14,   11.58, "national",      79, "Drag-flick conversion rate above forty percent."],
  ["a23", "Fatima Zahra",       "athletics",  "1500m",              "MAR", "Casablanca",     33.57,   -7.59, "international", 87, "Closes the last lap faster than she opens."],
  ["a24", "Ethan Caldwell",     "swimming",   "400m Medley",        "CAN", "Toronto",        43.65,  -79.38, "district",         75, "Four-stroke athlete still finding his best event."],
  ["a25", "Nadia Haddad",       "tennis",     "Women's Doubles",    "ARE", "Dubai",          25.20,   55.27, "national",      78, "Net game built on a decade of junior doubles."],
  ["a26", "Bruno Almeida",      "football",   "Striker",            "PRT", "Lisbon",         38.72,   -9.14, "state",         80, "Scored in eleven consecutive league fixtures."],
  ["a27", "Anjali Verma",       "cricket",    "Top-order Batter",   "IND", "Delhi",          28.65,   77.23, "national",      85, "Strike rate above 140 in the domestic T20."],
  ["a28", "Kwame Mensah",       "boxing",     "Welterweight",       "GHA", "Accra",           5.56,   -0.20, "national",      83, "Southpaw with an unusually quick lead hand."],
  ["a29", "Ingrid Solberg",     "swimming",   "800m Freestyle",     "NOR", "Oslo",           59.91,   10.75, "state",      81, "Distance swimmer with a metronomic stroke rate."],
  ["a30", "Diego Morales",      "boxing",     "Lightweight",        "MEX", "Mexico City",    19.43,  -99.13, "international", 89, "Two-time continental champion at his weight."],
  ["a31", "Mei Lin Zhao",       "badminton",  "Mixed Doubles",      "CHN", "Shanghai",       31.22,  121.46, "international", 90, "Front-court reflexes that break rallies open."],
  ["a32", "Oliver Hayes",       "cricket",    "Left-arm Spin",      "AUS", "Melbourne",     -37.81,  144.96, "state",         77, "Turns it square on a fourth-day surface."],
  ["a33", "Zanele Dlamini",     "athletics",  "Triple Jump",        "ZAF", "Cape Town",     -33.92,   18.42, "local",      71, "Two seasons in, already inside the provincial top five."],
  ["a34", "Pierre Lambert",     "football",   "Defensive Midfield", "FRA", "Paris",          48.85,    2.35, "national",      83, "Breaks up play and starts the next move."],
  ["a35", "Aisha Rahman",       "volleyball", "Setter",             "IDN", "Jakarta",        -6.21,  106.85, "state",      79, "Runs a fast offence with unusual composure."],
  ["a36", "Noah Steenkamp",     "hockey",     "Sweeper",            "NLD", "Amsterdam",      52.37,    4.90, "international", 88, "Anchors a back line that concedes almost nothing."],
  ["a37", "Camila Duarte",      "volleyball", "Middle Blocker",     "BRA", "Rio de Janeiro", -22.91,  -43.17, "national",      84, "Beach-to-indoor crossover with elite footwork."],
  ["a38", "Jae-won Park",       "chess",      "Rapid",              "KOR", "Seoul",          37.57,  126.98, "national",      82, "Blitz specialist converting to the classical format."],
  ["a39", "Hassan El-Sayed",    "swimming",   "50m Freestyle",      "EGY", "Cairo",          30.06,   31.25, "state",      80, "Pure sprinter — the first fifteen metres are his."],
  ["a40", "Grace Wanjiru",      "athletics",  "10,000m",            "KEN", "Nairobi",        -1.29,   36.82, "national",      86, "Front-runs every race and rarely gets caught."],
  ["a41", "Tomás Herrera",      "tennis",     "Men's Singles",      "ESP", "Barcelona",      41.39,    2.17, "international", 87, "Grew up on clay, now winning on hard courts."],
  ["a42", "Anika Bergström",    "gymnastics", "Balance Beam",       "SWE", "Stockholm",      59.33,   18.07, "district",         74, "Cleanest beam routine in her federation."],
  ["a43", "Idris Bello",        "football",   "Winger",             "NGA", "Lagos",           6.45,    3.39, "state",         78, "One-on-one, almost nobody stays with him."],
  ["a44", "Katarina Novak",     "tennis",     "Women's Singles",    "SRB", "Belgrade",       44.79,   20.45, "national",      81, "Two-handed backhand down the line, on demand."],
  ["a45", "Malik Johnson",      "basketball", "Point Guard",        "USA", "New York",       40.71,  -74.01, "national",      86, "Assist-to-turnover ratio leads his conference."],
  ["a46", "Bilal Ahmed",        "cricket",    "All-rounder",        "PAK", "Lahore",         31.56,   74.35, "national",      84, "Bats at six, bowls ten overs, fields anywhere."],
  ["a47", "Sara Lindqvist",     "hockey",     "Striker",            "SWE", "Stockholm",      59.33,   18.07, "state",         73, "Reverse-stick finish is already international quality."],
  ["a48", "Emmanuel Okoye",     "boxing",     "Heavyweight",        "UGA", "Kampala",         0.32,   32.58, "local",      70, "Raw power, learning the distance."],
  ["a49", "Hana Yilmaz",        "swimming",   "200m Backstroke",    "TUR", "Istanbul",       41.01,   28.95, "state",      79, "Turned a weak start into her strongest phase."],
  ["a50", "Joel Ratu",          "football",   "Centre Back",        "FIJ", "Suva",          -18.14,  178.44, "national",      76, "Aerially dominant, reads the long ball early."],
  ["a51", "Maya Rodriguez",     "gymnastics", "Floor",              "CUB", "Havana",         23.13,  -82.38, "international", 88, "Tumbling difficulty nobody in her region matches."],
  ["a52", "Andreas Nielsen",    "badminton",  "Men's Singles",      "DNK", "Copenhagen",     55.68,   12.57, "international", 89, "Deceptive from the back court, brutal at the net."],
  ["a53", "Tavita Naidu",       "volleyball", "Libero",             "NZL", "Auckland",      -36.85,  174.76, "district",         75, "Dig percentage that keeps rallies alive."],
  ["a54", "Leila Karimi",       "chess",      "Classical",          "QAT", "Doha",           25.29,   51.53, "national",      80, "Endgame technique well beyond her rating."],
  ["a55", "Owen Fraser",        "athletics",  "110m Hurdles",       "JAM", "Kingston",       17.97,  -76.79, "international", 90, "Three-step rhythm that never breaks down."],
  ["a56", "Nguyen Minh Anh",    "badminton",  "Women's Doubles",    "VNM", "Hanoi",          21.02,  105.84, "district",         74, "Rotation with her partner is close to automatic."],
  ["a57", "Bekele Tadesse",     "athletics",  "3000m Steeplechase", "ETH", "Addis Ababa",     9.02,   38.75, "national",      85, "Water-jump technique costs him nothing."],
  ["a58", "Hannah Wolczyk",     "basketball", "Centre",             "POL", "Warsaw",         52.23,   21.01, "national",      80, "Rebounds outside her area and finishes both hands."],
  ["a59", "Marco Bianchi",      "cricket",    "Wicketkeeper",       "GBR", "London",         51.51,   -0.13, "local",      69, "Glovework improving faster than his batting."],
  ["a60", "Zara Petrič",        "swimming",   "100m Breaststroke",  "CRO", "Zagreb",         45.81,   15.98, "district",         76, "Pullout is the best part of her race."],
  ["a61", "Andre Williams",     "basketball", "Small Forward",      "CAN", "Vancouver",      49.28, -123.12, "local",      72, "Two-way wing still adding a jump shot."],
  ["a62", "Isabela Souza",      "tennis",     "Women's Singles",    "BRA", "São Paulo",     -23.55,  -46.63, "district",         77, "Serve speed jumped 12kph in one off-season."],
  ["a63", "Felix Brandt",       "chess",      "Blitz",              "DEU", "Berlin",         52.52,   13.40, "state",         75, "Opening preparation is his whole edge — for now."],
  ["a64", "Ayesha Siddiqui",    "hockey",     "Midfield",           "IND", "Mumbai",         19.08,   72.88, "state",         78, "Covers more ground than anyone on the pitch."],
];

/**
 * Performance and visibility are derived from rating so the three numbers stay
 * internally consistent — a high-rated athlete with no visibility is the story
 * the product exists to fix, so visibility is deliberately the weaker number.
 */
function derive(rating: number, index: number) {
  const wobble = ((index * 37) % 11) - 5;
  const performance = Math.min(99, Math.max(40, rating + Math.round(wobble * 0.6)));
  const visibility = Math.min(99, Math.max(28, rating - 14 + wobble));
  return { performance, visibility };
}

export const ATHLETES: DemoAthlete[] = ROWS.map(
  ([id, name, sport, discipline, countryCode, city, latitude, longitude, level, rating, note], i) => ({
    id,
    name,
    sport,
    discipline,
    countryCode,
    city,
    latitude,
    longitude,
    level,
    rating,
    note,
    ...derive(rating, i),
  }),
);

const BY_ID = new Map(ATHLETES.map((a) => [a.id, a]));

export function getAthlete(id: string | null | undefined): DemoAthlete | null {
  return id ? (BY_ID.get(id) ?? null) : null;
}

export function athletesBySport(sport: Sport | null): DemoAthlete[] {
  return sport ? ATHLETES.filter((a) => a.sport === sport) : ATHLETES;
}

export type CountryNetworkStats = {
  code: string;
  /** Athletes registered in the country, ignoring any active sport filter. */
  total: number;
  /** Athletes matching the active sport filter — equal to `total` when none. */
  matching: number;
  /** Distinct sports represented, within the active filter. */
  sports: number;
  /** Distinct cities represented, within the active filter. */
  cities: number;
};

/**
 * Aggregate the demo network for one country. The globe reports countries and
 * counts rather than individuals, so this is what the marker card reads.
 */
export function countryStats(code: string, sport: Sport | null = null): CountryNetworkStats {
  const inCountry = ATHLETES.filter((a) => a.countryCode === code);
  const matching = sport ? inCountry.filter((a) => a.sport === sport) : inCountry;

  return {
    code,
    total: inCountry.length,
    matching: matching.length,
    sports: new Set(matching.map((a) => a.sport)).size,
    cities: new Set(matching.map((a) => a.city)).size,
  };
}
