import { ATHLETES } from "@/data/athletes";
import { GLOBAL_OPPORTUNITIES } from "@/data/global-opportunities";
import type { DemoAthlete, DemoOpportunity, Sport } from "@/types/network";

export type Connection = {
  id: string;
  athlete: DemoAthlete;
  opportunity: DemoOpportunity;
};

/** Rough great-circle separation, used to prefer arcs that actually sweep. */
function angularDistance(a: DemoAthlete, b: DemoOpportunity) {
  const toRad = Math.PI / 180;
  const lat1 = a.latitude * toRad;
  const lat2 = b.latitude * toRad;
  const dLng = (b.longitude - a.longitude) * toRad;
  return Math.acos(
    Math.min(
      1,
      Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLng),
    ),
  );
}

/**
 * Athlete → opportunity routes. Pairs are sport-matched so every arc means
 * something, and the longest ones are preferred: an arc that sweeps from Nairobi
 * to Copenhagen tells the "talent has no borders" story, one between two
 * European cities does not.
 */
export function buildConnections(
  limit: number,
  sport: Sport | null = null,
  athleteId: string | null = null,
): Connection[] {
  const pairs: { connection: Connection; score: number }[] = [];

  for (const opportunity of GLOBAL_OPPORTUNITIES) {
    if (sport && !opportunity.sports.includes(sport)) continue;

    for (const athlete of ATHLETES) {
      if (!opportunity.sports.includes(athlete.sport)) continue;
      if (athleteId && athlete.id !== athleteId) continue;
      // Skip local matches — an arc that barely leaves the city reads as noise.
      const distance = angularDistance(athlete, opportunity);
      if (distance < 0.35) continue;

      pairs.push({
        connection: { id: `${athlete.id}-${opportunity.id}`, athlete, opportunity },
        score: distance + athlete.rating / 400,
      });
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  // One arc per opportunity keeps the globe readable rather than fanning a
  // dozen lines into the same destination.
  const used = new Set<string>();
  const result: Connection[] = [];

  for (const pair of pairs) {
    if (result.length >= limit) break;
    const key = pair.connection.opportunity.id;
    if (used.has(key)) continue;
    used.add(key);
    result.push(pair.connection);
  }

  return result;
}
