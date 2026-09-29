import type { EarthSceneState } from "@/types/network";

/**
 * How the globe is framed in each act of the scroll narrative.
 *
 * Offsets are fractions of the viewport, not world units, so the same table
 * composes correctly on a 21:9 display and a phone. Everything is damped toward
 * these targets rather than cut to, which is what makes section changes read as
 * camera moves instead of jumps.
 *
 * `distance` is still written as a camera distance with the globe at unit
 * radius, because that is what these values were tuned as; `getFlatFraming`
 * converts it to a radius on screen. Globe tilt, arc progress and the night
 * terminator are gone with the WebGL scene — a flat dotted globe has no honest
 * equivalent of any of the three.
 */
export type SceneFraming = {
  /** Viewing distance from the globe. Larger = smaller planet on screen. */
  distance: number;
  offsetX: number;
  offsetY: number;
  /** Extra Y rotation this act contributes, in radians. */
  spin: number;
  // No marker opacity here on purpose: the athlete population reads the same in
  // every act, so a section can never make the network look smaller than it is.
  // Only the atmosphere carries a section's emphasis.
  atmosphere: number;
};

const DESKTOP: Record<EarthSceneState, SceneFraming> = {
  // Hero: planet pushed right of centre, leaving the left to the headline. Held
  // a little back so the ring of sports orbiting it fits inside the frame.
  hero: {
    distance: 5.7, offsetX: 0.25, offsetY: -0.02,
    spin: 0, atmosphere: 1.0,
  },
  // --- The athlete journey ------------------------------------------------
  // Through the questions the planet holds the right of the frame, leaving the
  // left to the conversation. It moves between acts, but never so far that the
  // athlete loses the thread of "this is still the same world".
  "journey-sport": {
    distance: 5.2, offsetX: 0.30, offsetY: -0.02,
    spin: 0.4, atmosphere: 1.12,
  },
  // Place is the one act where the camera comes in: the globe is about to turn
  // to the athlete's own city, and that has to read as an arrival.
  "journey-place": {
    distance: 4.3, offsetX: 0.26, offsetY: -0.02,
    spin: 0.75, atmosphere: 1.05,
  },
  "journey-competition": {
    distance: 4.9, offsetX: 0.28, offsetY: 0.0,
    spin: 1.05, atmosphere: 1.1,
  },
  "journey-level": {
    distance: 4.6, offsetX: 0.30, offsetY: -0.03,
    spin: 1.35, atmosphere: 1.0,
  },
  // The payoff framing: closest the journey gets, the athlete's location lit
  // and facing camera while the analysis builds alongside it.
  position: {
    distance: 5.2, offsetX: 0.37, offsetY: -0.04,
    spin: 1.6, atmosphere: 1.08,
  },
  // The gap section is about distance still to travel, so the camera pulls back
  // and lets the atmosphere carry it.
  gap: {
    distance: 6.6, offsetX: 0.34, offsetY: 0.0,
    spin: 2.0, atmosphere: 1.28,
  },

  "global-network": {
    distance: 4.4, offsetX: 0.0, offsetY: 0.0,
    spin: 0.55, atmosphere: 1.08,
  },
  "sport-explorer": {
    distance: 4.9, offsetX: -0.32, offsetY: 0.02,
    spin: 1.15, atmosphere: 1.15,
  },
  // Rankings pulls closest — the ladder is about the individual, so the camera
  // drops to something nearer a continental view.
  rankings: {
    distance: 4.0, offsetX: 0.32, offsetY: -0.04,
    spin: 1.8, atmosphere: 1.0,
  },
  athletes: {
    distance: 4.6, offsetX: -0.05, offsetY: 0.17,
    spin: 2.4, atmosphere: 1.0,
  },
  opportunities: {
    distance: 4.4, offsetX: 0.26, offsetY: 0.0,
    spin: 3.0, atmosphere: 1.08,
  },
  // The ecosystem section abstracts away from geography: pull back, dim the
  // markers, let the atmosphere and arcs carry it.
  career: {
    distance: 7.4, offsetX: 0.0, offsetY: -0.04,
    spin: 3.6, atmosphere: 1.35,
  },
  final: {
    distance: 8.4, offsetX: 0.0, offsetY: -0.36,
    spin: 4.1, atmosphere: 1.25,
  },
};

/**
 * Portrait layouts get their own table rather than a scaled-down desktop one.
 * The planet has to share the screen with the copy, so it sits low and further
 * back, and horizontal offsets collapse to zero.
 */
const MOBILE: Record<EarthSceneState, SceneFraming> = {
  hero: {
    distance: 6.1, offsetX: 0.0, offsetY: -0.27,
    spin: 0, atmosphere: 1.0,
  },
  "journey-sport": {
    distance: 6.3, offsetX: 0.0, offsetY: -0.34,
    spin: 0.4, atmosphere: 1.12,
  },
  "journey-place": {
    distance: 5.4, offsetX: 0.0, offsetY: -0.32,
    spin: 0.75, atmosphere: 1.05,
  },
  "journey-competition": {
    distance: 6.1, offsetX: 0.0, offsetY: -0.33,
    spin: 1.05, atmosphere: 1.1,
  },
  "journey-level": {
    distance: 5.9, offsetX: 0.0, offsetY: -0.33,
    spin: 1.35, atmosphere: 1.0,
  },
  position: {
    distance: 5.0, offsetX: 0.0, offsetY: -0.3,
    spin: 1.6, atmosphere: 1.08,
  },
  gap: {
    distance: 6.8, offsetX: 0.0, offsetY: -0.24,
    spin: 2.0, atmosphere: 1.28,
  },

  "global-network": {
    distance: 5.6, offsetX: 0.0, offsetY: -0.14,
    spin: 0.55, atmosphere: 1.08,
  },
  "sport-explorer": {
    distance: 5.4, offsetX: 0.0, offsetY: -0.2,
    spin: 1.15, atmosphere: 1.15,
  },
  rankings: {
    distance: 5.0, offsetX: 0.0, offsetY: -0.24,
    spin: 1.8, atmosphere: 1.0,
  },
  athletes: {
    distance: 5.2, offsetX: 0.0, offsetY: -0.22,
    spin: 2.4, atmosphere: 1.0,
  },
  opportunities: {
    distance: 5.6, offsetX: 0.0, offsetY: -0.2,
    spin: 3.0, atmosphere: 1.08,
  },
  career: {
    distance: 6.4, offsetX: 0.0, offsetY: -0.1,
    spin: 3.6, atmosphere: 1.35,
  },
  final: {
    distance: 8.6, offsetX: 0.0, offsetY: -0.26,
    spin: 4.1, atmosphere: 1.25,
  },
};

const MOBILE_MAX = 860;
const TABLET_MAX = 1200;

/**
 * Framing for the current viewport.
 *
 * Three tiers, not two. Below 860 the portrait table applies. Above 1200 the
 * desktop table applies as written. In between — tablets and small laptops —
 * the copy column takes a much larger share of the width than it does on a wide
 * display, so the planet is pushed back and further out rather than being left
 * to sit underneath the headline.
 */
export function getFraming(scene: EarthSceneState, viewportWidth: number): SceneFraming {
  if (viewportWidth < MOBILE_MAX) return MOBILE[scene];

  const framing = DESKTOP[scene];
  if (viewportWidth >= TABLET_MAX) return framing;

  // Ease the correction out as the viewport approaches desktop width.
  const t = 1 - (viewportWidth - MOBILE_MAX) / (TABLET_MAX - MOBILE_MAX);
  return {
    ...framing,
    distance: framing.distance * (1 + 0.2 * t),
    offsetX: framing.offsetX * (1 + 0.22 * t),
  };
}

/** Order of the athlete-journey acts, as the homepage plays them. */
export const JOURNEY_SCENE_ORDER: EarthSceneState[] = [
  "hero",
  "journey-sport",
  "journey-place",
  "journey-competition",
  "journey-level",
  "position",
  "gap",
  "career",
  "opportunities",
  "final",
];

/** Order of the free-exploration acts. */
export const SCENE_ORDER: EarthSceneState[] = [
  "hero",
  "global-network",
  "sport-explorer",
  "rankings",
  "athletes",
  "opportunities",
  "career",
  "final",
];

/* ------------------------------------------------------------------ *
 * Flat-globe conversion
 * ------------------------------------------------------------------ */

/** Vertical half-angle of the retired WebGL camera, in radians. */
const HALF_FOV = (32 / 2) * (Math.PI / 180);
const TAN_HALF_FOV = Math.tan(HALF_FOV);

export type FlatFraming = {
  /** Disc centre, in CSS pixels. */
  cx: number;
  cy: number;
  /** Disc radius, in CSS pixels. */
  radius: number;
  /** Extra rotation this act contributes, in degrees. */
  spinDeg: number;
  glow: number;
  /**
   * How far the planet turns day-side in this act — light theme only. See
   * `DAYLIGHT_ACTS`.
   */
  daylight: number;
};

/**
 * Acts where the planet keeps its night side in the light theme — wide
 * screens only.
 *
 * Everywhere else copy runs across the planet, and its section lays a scrim
 * over the globe to keep the copy legible. At night that dims a dark planet
 * into darker space, which reads as depth; in daylight the same scrim would
 * fade a dark planet into a flat grey disc. So those acts turn the planet
 * day-side — a brand-blue halftone on paper — and the night side is kept for
 * where the planet has the stage beside the copy: the hero and the questions.
 * On a phone the copy always sits on top of the planet, so it is day-side
 * throughout.
 */
const NIGHT_ACTS: ReadonlySet<EarthSceneState> = new Set([
  "hero",
  "journey-sport",
  "journey-place",
  "journey-competition",
  "journey-level",
]);

/**
 * Where the flat globe sits on screen for an act.
 *
 * `distance` is converted the way the camera would have seen it: a unit sphere
 * at distance d subtends asin(1/d), and that angle is projected against the
 * half-FOV to get a fraction of the viewport height. Keeping the conversion
 * honest is what lets the framing table stay as it was tuned instead of every
 * act needing to be re-eyeballed.
 */
export function getFlatFraming(
  scene: EarthSceneState,
  viewportWidth: number,
  viewportHeight: number,
): FlatFraming {
  const framing = getFraming(scene, viewportWidth);

  // The table was tuned against a photographed globe, which had a night side
  // and dark oceans to set copy over. A dot field is lit evenly all the way
  // across, so on a phone — where the copy has no choice but to share the width
  // with the planet — it sits lower and further back than the table asks.
  const portrait = viewportWidth < MOBILE_MAX;
  const distance = framing.distance * (portrait ? 1.12 : 1);
  const offsetY = framing.offsetY - (portrait ? 0.09 : 0);

  const angular = Math.asin(Math.min(1 / distance, 1));
  const radius = (viewportHeight / 2) * (Math.tan(angular) / TAN_HALF_FOV);

  let cx = viewportWidth / 2 + framing.offsetX * viewportWidth;
  // The hero planet carries a ring of sports (`HeroSportsOrbit`) reaching about
  // 1.36 radii out. On wide, short-ish viewports a fixed offset would push that
  // ring off the right edge, so the planet comes in just far enough to keep it.
  if (scene === "hero" && !portrait) {
    cx = Math.min(cx, viewportWidth - radius * 1.36 - 84);
  }

  return {
    cx,
    // Screen Y grows downward, so a negative offset puts the planet low.
    cy: viewportHeight / 2 - offsetY * viewportHeight,
    radius,
    spinDeg: (framing.spin * 180) / Math.PI,
    glow: framing.atmosphere,
    daylight: !portrait && NIGHT_ACTS.has(scene) ? 0 : 1,
  };
}
