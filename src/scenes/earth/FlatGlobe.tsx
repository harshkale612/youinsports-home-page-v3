"use client";

import { useEffect, useRef } from "react";

import { ATHLETES } from "@/data/athletes";
import { useGlobeInteraction } from "@/hooks/useGlobeInteraction";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { markerScreen } from "@/scenes/earth/marker-registry";
import { getFlatFraming } from "@/scenes/earth/scene-framing";
import { getTheme, themeMotion } from "@/theme/theme";
import {
  FlatEarthRenderer,
  angleDelta,
  damp,
  type FlatEarthMarker,
} from "@/scenes/earth/flat-earth";

/**
 * Marker colours, as hues: brand blue for the network at rest, brand orange for
 * a sport that has been picked out. Fixed rather than per sport, so the globe
 * speaks in the same two colours as the rest of the page.
 */
const MARKER_HUE_REST = 208;
const MARKER_HUE_FOCUS = 20;

/** Idle spin, in degrees per second. The retired scene used 0.065 rad/s. */
const IDLE_SPIN_DEG = (0.065 * 180) / Math.PI;

/**
 * How far the bare cursor turns the planet, in degrees — about 15° of yaw at
 * the edges of the viewport. Enough to read as the planet following the cursor,
 * bounded so each section's framing survives.
 */
const STEER_YAW_DEG = (0.26 * 180) / Math.PI;

/** Parallax travel of the disc as the cursor crosses the viewport, in CSS px. */
const PARALLAX_X = 22;
const PARALLAX_Y = 15;

/** Seconds a focus request holds the globe before idle drift resumes. */
const FOCUS_HOLD = 2.6;

const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * The single, persistent planet.
 *
 * Mounted once at the root of the page and never unmounted as sections change.
 * It replaces the WebGL scene but keeps its contracts: `earthMotion` carries
 * drag and pointer state in, `marker-registry` carries marker positions back
 * out, and `scene-framing` still owns where the globe sits in each act.
 */
export function FlatGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reducedMotion = usePrefersReducedMotion();
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);

  const pointer = useGlobeInteraction({ enabled: true, onSelectAthlete: selectAthlete });

  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new FlatEarthRenderer(canvas, "space");

    // --- Choreography state, all kept out of React -------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;

    let idleRotation = 0;
    let rotationDeg = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    let glow = 1;
    /** 0 in the dark theme, 1 in the light — see `FlatEarthFrame.paper`. */
    let paper = 0;
    /** How day-side the current act wants the planet, before the theme. */
    let daylight = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    let focusOffset = 0;
    let focusHold = 0;
    let lastFocusToken = 0;
    /** Longitude a focus request is waiting to turn to. */
    let pendingFocus: number | null = null;

    let hasFramed = false;
    let ready = false;
    let lastHovered: string | null = null;
    let lastTime = 0;
    let frame = 0;

    const markers: FlatEarthMarker[] = [];

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(window.innerWidth * dpr);
      height = Math.round(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      renderer.resize(width, height, dpr);
      // The framing is expressed against the new viewport, so re-snap rather
      // than sliding the planet across the screen on an orientation change.
      hasFramed = false;
    }

    function render(time: number) {
      frame = requestAnimationFrame(render);

      // Guards against multi-second jumps after a tab switch without putting a
      // 20fps device into slow motion.
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.12) : 0;
      lastTime = time;

      const still = reducedMotionRef.current;
      const state = useGlobalExperience.getState();
      const activeSport = state.hoveredSport ?? state.selectedSport;

      const framing = getFlatFraming(state.earthScene, window.innerWidth, window.innerHeight);

      /* --- Rotation ------------------------------------------------------ */
      if (focusHold > 0) focusHold -= delta;

      if (state.focus && state.focus.token !== lastFocusToken) {
        lastFocusToken = state.focus.token;
        pendingFocus = state.focus.longitude;
      }

      if (pendingFocus !== null) {
        // `rotationDeg` *is* the longitude at the centre of the disc, so facing
        // a place is just aiming the rotation at its longitude. Resolved against
        // the current angle so the globe takes the short way round, then held
        // as an offset on top of whatever the idle spin and the act contribute.
        const base =
          idleRotation + framing.spinDeg + earthMotion.dragRotationY * RADIANS_TO_DEGREES;
        focusOffset = rotationDeg + angleDelta(rotationDeg, pendingFocus) - base;

        // Hold briefly so idle drift doesn't immediately undo the framing.
        focusHold = FOCUS_HOLD;
        earthMotion.dragVelocityY = 0;
        earthMotion.dragVelocityX = 0;
        pendingFocus = null;
      }

      if (!still && !earthMotion.isDragging && focusHold <= 0) {
        earthMotion.idleTime += delta;
        // Idle spin eases back in after an interaction rather than snapping on.
        const resume = Math.min(1, earthMotion.idleTime / 0.7);
        idleRotation += delta * IDLE_SPIN_DEG * resume;
      }

      // Drag inertia: the globe keeps turning after release, then settles.
      if (!earthMotion.isDragging) {
        earthMotion.dragRotationY += earthMotion.dragVelocityY * delta;
        const decay = Math.exp(-2.6 * delta);
        earthMotion.dragVelocityY *= decay;
        earthMotion.dragVelocityX *= decay;
      }

      // Cursor steer: an offset rather than an accumulation, so the planet
      // leans as the cursor crosses the screen and comes back to neutral as the
      // cursor does. Dragging is still what spins it past a lean.
      const steering = !still && !earthMotion.isDragging && focusHold <= 0;
      const targetRotation =
        idleRotation +
        framing.spinDeg +
        earthMotion.dragRotationY * RADIANS_TO_DEGREES +
        focusOffset +
        (steering ? earthMotion.pointerX * STEER_YAW_DEG : 0);

      // Damped, not cut to: this is what gives the planet weight instead of
      // making it feel welded to the scrollbar.
      rotationDeg += angleDelta(rotationDeg, targetRotation) * (1 - Math.exp(-(still ? 12 : 3.2) * delta));

      /* --- Framing ------------------------------------------------------- */
      // The first painted frame must already be composed. Damping up from zero
      // would otherwise slide the planet in from the centre on every load.
      const settle = (current: number, target: number, lambda: number) =>
        hasFramed ? damp(current, target, lambda, delta) : target;

      const lambda = still ? 12 : 2.0;
      // Selecting an athlete draws the view in — the closest the scene ever
      // gets, which completes the scale story the scroll narrative starts.
      const targetRadius = framing.radius * (state.selectedAthleteId ? 1 / 0.84 : 1);

      radius = settle(radius, targetRadius * dpr, lambda);
      cx = settle(cx, framing.cx * dpr, lambda);
      cy = settle(cy, framing.cy * dpr, lambda);
      glow = settle(glow, framing.glow, lambda);
      // Eased, so crossing into an act where copy runs over the planet reads
      // as the planet turning into daylight rather than a cut — but quicker
      // than the camera, because halfway between night and day is grey.
      daylight = settle(daylight, framing.daylight, still ? lambda : 4.5);

      // The theme is read per frame rather than subscribed to: switching it
      // must never tear down or re-create this canvas, only repaint it.
      const targetPaper = getTheme() === "light" ? 1 : 0;
      paper = hasFramed && !still && !themeMotion.snap ? damp(paper, targetPaper, 9, delta) : targetPaper;
      if (Math.abs(paper - targetPaper) < 0.002) paper = targetPaper;

      parallaxX = damp(parallaxX, still ? 0 : -earthMotion.pointerX * PARALLAX_X * dpr, 2.2, delta);
      parallaxY = damp(parallaxY, still ? 0 : -earthMotion.pointerY * PARALLAX_Y * dpr, 2.2, delta);
      hasFramed = true;

      /* --- Markers ------------------------------------------------------- */
      markers.length = 0;

      for (const athlete of ATHLETES) {
        markers.push({
          id: athlete.id,
          lat: athlete.latitude,
          lng: athlete.longitude,
          // Filtered-out athletes stay clearly on the map: the selected sport
          // leads on brightness, but the network never reads as having fewer
          // athletes in it than it does.
          match: !activeSport || athlete.sport === activeSport ? 1 : 0,
          active: athlete.id === state.hoveredAthleteId || athlete.id === state.selectedAthleteId,
        });
      }

      for (const spot of state.spotlight) {
        markers.push({ lat: spot.latitude, lng: spot.longitude, emphasis: true });
      }

      /* --- Draw ---------------------------------------------------------- */
      const points = renderer.draw({
        cx: cx + parallaxX,
        cy: cy + parallaxY,
        radius,
        rotationDeg,
        glow,
        markerHue: activeSport ? MARKER_HUE_FOCUS : MARKER_HUE_REST,
        markers,
        time,
        delta,
        animate: !still,
        paper,
        // Night-side always in the dark theme.
        day: paper * daylight,
      });

      markerScreen.points = points;
      markerScreen.byId.clear();
      for (const point of points) markerScreen.byId.set(point.id, point);

      /* --- Hover --------------------------------------------------------- */
      // Resolved here rather than in a pointer handler: the planet turns under
      // a stationary cursor, so what is under it changes without the pointer
      // moving at all.
      let hovered: string | null = null;
      if (pointer.current.active) {
        let best = 26 * 26;
        for (const point of points) {
          if (point.facing <= 0.06) continue;
          const dx = point.x - pointer.current.x;
          const dy = point.y - pointer.current.y;
          const distance = dx * dx + dy * dy;
          if (distance < best) {
            best = distance;
            hovered = point.id;
          }
        }
      }
      if (hovered !== lastHovered) {
        lastHovered = hovered;
        state.hoverAthlete(hovered);
      }

      if (!ready) {
        ready = true;
        state.setSceneReady(true);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      markerScreen.points = [];
      markerScreen.byId.clear();
    };
  }, [pointer]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" />;
}

export default FlatGlobe;
