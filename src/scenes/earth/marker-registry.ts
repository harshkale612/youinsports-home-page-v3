/**
 * Screen-space positions of the athlete markers, republished every frame.
 *
 * Hit testing and the floating athlete card both need to know where a marker
 * landed on screen. Routing that through React state would re-render the tree
 * on every frame of rotation, so it lives here and consumers read it from their
 * own animation frame instead.
 */
export type MarkerScreenPoint = {
  id: string;
  /** CSS pixels, relative to the viewport. */
  x: number;
  y: number;
  /** >0 when the marker is on the near side of the globe. */
  facing: number;
};

export const markerScreen: {
  points: MarkerScreenPoint[];
  byId: Map<string, MarkerScreenPoint>;
} = {
  points: [],
  byId: new Map(),
};

export function findMarkerNear(x: number, y: number, radius = 26): string | null {
  let bestId: string | null = null;
  let bestDistance = radius * radius;

  for (const point of markerScreen.points) {
    if (point.facing <= 0.06) continue;
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = point.id;
    }
  }

  return bestId;
}
