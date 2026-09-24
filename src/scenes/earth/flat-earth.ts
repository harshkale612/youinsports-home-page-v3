import { getLandPolygons } from "@/data/world-land";

/**
 * The flat Earth renderer.
 *
 * A 2D canvas replacement for the WebGL scene: the planet is drawn as a
 * halftone lattice of dots sampled from a land bitmap, over a graticule and an
 * atmospheric rim. No React, no three.js — a caller owns the canvas, tells it
 * how the globe is framed each frame, and gets back where the markers landed.
 */

/** Equirectangular land mask resolution. 1024×512 resolves islands the dot
 *  lattice can actually show — anything finer is sampled away. */
const MASK_W = 1024;
const MASK_H = 512;

/**
 * Viewing latitude, in degrees. Fixed on purpose: every quantity in the dot
 * lattice except longitude is independent of the rotation, so a constant tilt
 * lets the whole lattice be solved once and reduced to an array lookup per
 * frame. This is the one thing the WebGL scene could do that this cannot — its
 * per-act `tilt` is dropped rather than faked.
 */
const TILT_DEG = 14;

/** Spacing between dot centres, in CSS pixels. */
const DOT_STEP = 4.4;
const GRID_STEP_DEG = 15;

/**
 * The planet's own hue. Fixed, deliberately: the atmosphere, graticule and
 * ocean are the Earth, not the sport, and swinging them from blue to green
 * every time the selection changes would read as the world itself changing.
 * Only the markers take the sport's hue.
 */
const PLANET_HUE = 205;

/** Shading levels across the sphere. Each is one batched fill per frame. */
const LEVELS = 5;

/** Rebuild the lattice only once the radius has drifted this far, in device
 *  pixels. Acts are damped over about a second, so a dolly costs a handful of
 *  rebuilds rather than one per frame. */
const RADIUS_EPSILON = 6;

const DEG = Math.PI / 180;
const SIN_TILT = Math.sin(TILT_DEG * DEG);
const COS_TILT = Math.cos(TILT_DEG * DEG);

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type FlatEarthMarker = {
  /** Present for markers that can be hit-tested and pinned. */
  id?: string;
  lat: number;
  lng: number;
  /** 0..1. Below 1 dims a marker filtered out by the active sport, rather than
   *  removing it — the network never reads as having fewer athletes in it. */
  match?: number;
  /** Draws larger, with a pulsing ring. Used for a section's spotlight. */
  emphasis?: boolean;
  /** Hovered or pinned. */
  active?: boolean;
};

export type FlatEarthFrame = {
  /** Disc centre and radius, in device pixels. */
  cx: number;
  cy: number;
  radius: number;
  /** Longitude sitting at the centre of the disc, in degrees. */
  rotationDeg: number;
  /** Atmosphere multiplier. 1 is the resting glow. */
  glow: number;
  /** Hue for the markers. */
  markerHue: number;
  markers: readonly FlatEarthMarker[];
  /** Milliseconds, for the marker pulse and the star twinkle. */
  time: number;
  /** Frame duration in seconds, for the drifting rain. */
  delta: number;
  /** Suppressed under `prefers-reduced-motion`. */
  animate: boolean;
};

export type FlatEarthMarkerPoint = {
  id: string;
  /** CSS pixels, relative to the viewport. */
  x: number;
  y: number;
  /** >0 when the marker is on the near side of the globe. */
  facing: number;
};

/* ------------------------------------------------------------------ *
 * Land mask
 * ------------------------------------------------------------------ */

let maskCache: Uint8Array | null = null;

/**
 * Rasterises the Natural Earth outlines into an equirectangular land bitmap.
 *
 * Built once per page load and shared by every renderer. Rings are drawn three
 * times — shifted -360°, 0° and +360° — because a ring that crosses the
 * antimeridian is unwrapped into a continuous longitude run that would
 * otherwise be clipped away at one edge instead of reappearing at the other.
 */
function getLandMask(): Uint8Array {
  if (maskCache) return maskCache;

  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const mask = new Uint8Array(MASK_W * MASK_H);
  if (!ctx) return (maskCache = mask);

  ctx.fillStyle = "#fff";

  for (const polygon of getLandPolygons()) {
    for (const shift of [-360, 0, 360]) {
      ctx.beginPath();

      for (const ring of polygon) {
        // Unwrap: consecutive vertices never jump more than 180°, so a ring
        // spanning the dateline reads as e.g. 170°→190° rather than 170°→-170°.
        let prevLng = ring[0];
        let unwrapped = prevLng;

        for (let i = 0; i < ring.length; i += 2) {
          const lng = ring[i];
          if (i > 0) {
            let delta = lng - prevLng;
            if (delta > 180) delta -= 360;
            else if (delta < -180) delta += 360;
            unwrapped += delta;
            prevLng = lng;
          }

          const x = ((unwrapped + shift + 180) / 360) * MASK_W;
          const y = ((90 - ring[i + 1]) / 180) * MASK_H;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
      }

      // Even-odd so the rings after the first punch holes (lakes) out of it.
      ctx.fill("evenodd");
    }
  }

  const pixels = ctx.getImageData(0, 0, MASK_W, MASK_H).data;
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] > 96 ? 1 : 0;

  return (maskCache = mask);
}

/* ------------------------------------------------------------------ *
 * Precomputed geometry
 * ------------------------------------------------------------------ */

type Lattice = {
  count: number;
  /** Radius the spacing was solved at, in device pixels. */
  radius: number;
  /** Position on the unit disc. `ny` is up-positive, unlike screen space. */
  nx: Float32Array;
  ny: Float32Array;
  /** Row index into the land mask, pre-multiplied by MASK_W. */
  row: Int32Array;
  /** Longitude of this point when the globe is at rotation 0, in degrees. */
  lng: Float32Array;
  /** Shading level, 0 (limb) to LEVELS-1 (centre). */
  level: Uint8Array;
};

function buildLattice(radius: number, dpr: number): Lattice {
  const step = DOT_STEP * dpr;

  const capacity = Math.ceil((Math.PI * radius * radius) / (step * step)) + 64;
  const nx = new Float32Array(capacity);
  const ny = new Float32Array(capacity);
  const row = new Int32Array(capacity);
  const lng = new Float32Array(capacity);
  const level = new Uint8Array(capacity);

  let n = 0;
  let rowIndex = 0;

  for (let py = -radius; py <= radius; py += step, rowIndex++) {
    // Offset alternate rows into a hex packing — a square grid reads as
    // corduroy at this density, a staggered one reads as a halftone.
    const offset = rowIndex % 2 ? step * 0.5 : 0;

    for (let px = -radius + offset; px <= radius; px += step) {
      const x = px / radius;
      const y = -py / radius;
      const rho2 = x * x + y * y;
      if (rho2 >= 1 || n >= capacity) continue;

      const cosC = Math.sqrt(1 - rho2);
      const lat = Math.asin(cosC * SIN_TILT + y * COS_TILT) / DEG;

      let maskRow = Math.floor(((90 - lat) / 180) * MASK_H);
      if (maskRow < 0) maskRow = 0;
      else if (maskRow >= MASK_H) maskRow = MASK_H - 1;

      nx[n] = x;
      ny[n] = y;
      row[n] = maskRow * MASK_W;
      lng[n] = Math.atan2(x, cosC * COS_TILT - y * SIN_TILT) / DEG;

      let bucket = Math.floor(Math.pow(cosC, 0.55) * LEVELS);
      if (bucket >= LEVELS) bucket = LEVELS - 1;
      level[n] = bucket;

      n++;
    }
  }

  return { count: n, radius, nx, ny, row, lng, level };
}

/** Vertical runs of 1s and 0s drifting behind the planet. */
type RainColumn = { x: number; y: number; speed: number; alpha: number; glyphs: string };

function buildRain(width: number, height: number, dpr: number): RainColumn[] {
  const count = Math.min(26, Math.round(width / (64 * dpr)));
  const cell = 13 * dpr;
  const columns: RainColumn[] = [];

  for (let i = 0; i < count; i++) {
    const length = 6 + Math.floor(Math.random() * 12);
    let glyphs = "";
    for (let g = 0; g < length; g++) glyphs += Math.random() > 0.5 ? "1" : "0";

    columns.push({
      x: Math.random() * width,
      y: Math.random() * height - length * cell,
      speed: (6 + Math.random() * 18) * dpr,
      alpha: 0.05 + Math.random() * 0.12,
      glyphs,
    });
  }

  return columns;
}

type Star = { x: number; y: number; r: number; alpha: number; phase: number };

function buildStars(width: number, height: number, dpr: number): Star[] {
  const count = Math.round((width * height) / (26000 * dpr * dpr));
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: (0.4 + Math.random() * 0.9) * dpr,
      alpha: 0.18 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return stars;
}

/* ------------------------------------------------------------------ *
 * Renderer
 * ------------------------------------------------------------------ */

export type FlatEarthBackdrop =
  /** Near-black, with a faint wash behind the planet. For the page-wide layer. */
  | "space"
  /** Deep navy, like the reference artwork. For a bounded panel. */
  | "panel";

export class FlatEarthRenderer {
  private ctx: CanvasRenderingContext2D | null;
  private mask: Uint8Array;

  private width = 0;
  private height = 0;
  private dpr = 1;

  private lattice: Lattice | null = null;
  private rain: RainColumn[] = [];
  private stars: Star[] = [];

  private landPaths: Path2D[] = [];
  private oceanPaths: Path2D[] = [];

  /** Reused between frames so a 60fps draw allocates nothing. */
  private points: FlatEarthMarkerPoint[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private backdrop: FlatEarthBackdrop = "space",
  ) {
    this.ctx = canvas.getContext("2d");
    this.mask = getLandMask();
  }

  resize(width: number, height: number, dpr: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.lattice = null;
    this.rain = buildRain(width, height, dpr);
    this.stars = this.backdrop === "space" ? buildStars(width, height, dpr) : [];
  }

  /**
   * Draws one frame and returns where the identified markers landed, in CSS
   * pixels. The array is reused, so a caller that needs to keep it must copy.
   */
  draw(frame: FlatEarthFrame): FlatEarthMarkerPoint[] {
    const ctx = this.ctx;
    this.points.length = 0;
    if (!ctx) return this.points;

    const { cx, cy, radius, rotationDeg } = frame;

    if (!this.lattice || Math.abs(this.lattice.radius - radius) > RADIUS_EPSILON) {
      this.lattice = buildLattice(radius, this.dpr);
    }

    ctx.clearRect(0, 0, this.width, this.height);

    this.drawBackdrop(ctx, frame);
    this.drawRain(ctx, frame);
    this.drawAtmosphere(ctx, frame);
    this.drawOcean(ctx, frame);
    this.drawGraticule(ctx, cx, cy, radius, rotationDeg);
    this.drawDots(ctx, frame);
    this.drawLimb(ctx, frame);
    this.drawMarkers(ctx, frame);

    return this.points;
  }

  /* -- layers ------------------------------------------------------- */

  private drawBackdrop(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    const { cx, cy, radius } = frame;

    if (this.backdrop === "panel") {
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(this.width, this.height) * 0.75);
      wash.addColorStop(0, "rgba(10, 42, 62, 0.95)");
      wash.addColorStop(0.55, "rgba(5, 22, 34, 0.92)");
      wash.addColorStop(1, "rgba(3, 11, 18, 0.98)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, this.width, this.height);
      return;
    }

    // The page background is the same material as the space behind the planet,
    // so this layer paints the void itself rather than a panel over it.
    ctx.fillStyle = "#030b12";
    ctx.fillRect(0, 0, this.width, this.height);

    for (const star of this.stars) {
      const twinkle = frame.animate
        ? 0.72 + 0.28 * Math.sin(frame.time * 0.0009 + star.phase)
        : 1;
      ctx.fillStyle = `rgba(214, 228, 255, ${star.alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const wash = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.6);
    // Brand navy, the logo's "SPORTS", as the light the planet sits in.
    wash.addColorStop(0, "rgba(10, 47, 66, 0.6)");
    wash.addColorStop(1, "rgba(3, 11, 18, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawRain(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    if (!frame.animate || this.rain.length === 0) return;

    const cell = 13 * this.dpr;
    ctx.font = `${10 * this.dpr}px ui-monospace, monospace`;
    ctx.textBaseline = "top";

    for (const column of this.rain) {
      column.y += frame.delta * column.speed;
      if (column.y > this.height) column.y = -column.glyphs.length * cell;

      for (let i = 0; i < column.glyphs.length; i++) {
        const y = column.y + i * cell;
        if (y < -cell || y > this.height) continue;
        // Brightest at the head of the run, fading back up the column.
        const fade = (i + 1) / column.glyphs.length;
        ctx.fillStyle = `hsl(${PLANET_HUE} 90% 66% / ${column.alpha * fade})`;
        ctx.fillText(column.glyphs[i], column.x, y);
      }
    }
  }

  private drawAtmosphere(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    const { cx, cy, radius, glow } = frame;
    const outer = radius * 1.42;

    const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, outer);
    atmosphere.addColorStop(0, `hsl(${PLANET_HUE} 100% 62% / ${0.3 * glow})`);
    atmosphere.addColorStop(0.45, `hsl(${PLANET_HUE} 100% 58% / ${0.09 * glow})`);
    atmosphere.addColorStop(1, `hsl(${PLANET_HUE} 100% 58% / 0)`);
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fill();

    // A low orange sun behind the lower-right limb: the brand's two colours
    // meeting on the planet itself. Painted before the ocean, so only the
    // part outside the sphere shows, as a warm rim of light.
    const sx = cx + radius * 0.62;
    const sy = cy + radius * 0.58;
    const sun = ctx.createRadialGradient(sx, sy, radius * 0.25, sx, sy, radius * 1.05);
    sun.addColorStop(0, `rgba(240, 107, 40, ${0.34 * glow})`);
    sun.addColorStop(0.5, `rgba(240, 107, 40, ${0.1 * glow})`);
    sun.addColorStop(1, "rgba(240, 107, 40, 0)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(sx, sy, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOcean(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    const { cx, cy, radius } = frame;

    const ocean = ctx.createRadialGradient(
      cx - radius * 0.3,
      cy - radius * 0.34,
      radius * 0.08,
      cx,
      cy,
      radius,
    );
    ocean.addColorStop(0, "rgba(16, 64, 104, 0.95)");
    ocean.addColorStop(0.62, "rgba(8, 36, 58, 0.96)");
    ocean.addColorStop(1, "rgba(4, 16, 28, 0.98)");
    ctx.fillStyle = ocean;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Draws the graticule arcs that are on the near side of the sphere. */
  private drawGraticule(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    rotation: number,
  ) {
    ctx.lineWidth = Math.max(1, 0.7 * this.dpr);
    ctx.strokeStyle = `hsl(${PLANET_HUE} 90% 62% / 0.13)`;

    const trace = (lat: number | null, lng: number | null) => {
      let drawing = false;
      ctx.beginPath();

      const from = lat === null ? -88 : -180;
      const to = lat === null ? 88 : 180;

      for (let v = from; v <= to; v += 4) {
        const phi = (lat === null ? v : lat) * DEG;
        const dLambda = ((lng === null ? v : lng) - rotation) * DEG;
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        const cosD = Math.cos(dLambda);

        if (SIN_TILT * sinPhi + COS_TILT * cosPhi * cosD <= 0) {
          drawing = false;
          continue;
        }

        const x = cx + radius * cosPhi * Math.sin(dLambda);
        const y = cy - radius * (COS_TILT * sinPhi - SIN_TILT * cosPhi * cosD);

        if (drawing) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        drawing = true;
      }

      ctx.stroke();
    };

    for (let lat = -75; lat <= 75; lat += GRID_STEP_DEG) trace(lat, null);
    for (let lng = -180; lng < 180; lng += GRID_STEP_DEG) trace(null, lng);
  }

  private drawDots(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    const lattice = this.lattice;
    if (!lattice) return;

    const { cx, cy, radius, rotationDeg } = frame;

    for (let i = 0; i < LEVELS; i++) {
      this.landPaths[i] = new Path2D();
      this.oceanPaths[i] = new Path2D();
    }

    const { count, nx, ny, row, lng, level } = lattice;
    const size = Math.max(1, 1.9 * this.dpr);
    const half = size / 2;

    for (let i = 0; i < count; i++) {
      // Wrap into [0, 360) without a branch-heavy modulo chain.
      let longitude = (lng[i] + rotationDeg + 180) % 360;
      if (longitude < 0) longitude += 360;

      let col = ((longitude / 360) * MASK_W) | 0;
      if (col >= MASK_W) col = MASK_W - 1;

      const x = cx + nx[i] * radius - half;
      const y = cy - ny[i] * radius - half;
      const path = this.mask[row[i] + col] ? this.landPaths[level[i]] : this.oceanPaths[level[i]];
      path.rect(x, y, size, size);
    }

    for (let i = 0; i < LEVELS; i++) {
      const shade = (i + 1) / LEVELS;
      ctx.fillStyle = `hsl(196 100% ${52 + shade * 26}% / ${0.2 + shade * 0.72})`;
      ctx.fill(this.landPaths[i]);
      ctx.fillStyle = `hsl(205 90% 60% / ${0.03 + shade * 0.1})`;
      ctx.fill(this.oceanPaths[i]);
    }
  }

  private drawLimb(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    // Blue on the lit upper-left, warming to orange where the sun sits.
    const { cx, cy, radius } = frame;
    const limb = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    limb.addColorStop(0, `hsl(${PLANET_HUE} 100% 72% / ${0.4 * frame.glow})`);
    limb.addColorStop(0.55, `hsl(${PLANET_HUE} 100% 72% / ${0.22 * frame.glow})`);
    limb.addColorStop(1, `rgba(255, 138, 76, ${0.75 * frame.glow})`);
    ctx.strokeStyle = limb;
    ctx.lineWidth = Math.max(1, 1.3 * this.dpr);
    ctx.beginPath();
    ctx.arc(frame.cx, frame.cy, frame.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawMarkers(ctx: CanvasRenderingContext2D, frame: FlatEarthFrame) {
    const { cx, cy, radius, rotationDeg, markerHue: hue, time } = frame;
    const dpr = this.dpr;
    const pulse = frame.animate ? (Math.sin(time * 0.0028) + 1) / 2 : 0.5;

    for (const marker of frame.markers) {
      const phi = marker.lat * DEG;
      const dLambda = (marker.lng - rotationDeg) * DEG;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const cosD = Math.cos(dLambda);

      const facing = SIN_TILT * sinPhi + COS_TILT * cosPhi * cosD;
      const x = cx + radius * cosPhi * Math.sin(dLambda);
      const y = cy - radius * (COS_TILT * sinPhi - SIN_TILT * cosPhi * cosD);

      if (marker.id) {
        // Published in CSS pixels: the card and the hit test both work in the
        // coordinate space the DOM does, not the backing store's.
        this.points.push({ id: marker.id, x: x / dpr, y: y / dpr, facing });
      }

      if (facing <= 0.04) continue;

      // Markers near the limb are seen almost edge-on; fading them there is
      // what stops the rim collecting a bright, misleading crowd of dots.
      const match = marker.match ?? 1;
      const strength = Math.min(1, facing * 2.2) * (0.45 + 0.55 * match);
      const scale = marker.emphasis ? 1 : 0.62;

      const haloRadius = 16 * dpr * scale;
      const halo = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
      halo.addColorStop(0, `hsl(${hue} 100% 70% / ${0.42 * strength})`);
      halo.addColorStop(1, `hsl(${hue} 100% 70% / 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      const core = (marker.active ? 3 : 2.1) * dpr * scale;
      ctx.fillStyle = `hsl(${hue} 100% ${marker.active ? 92 : 82}% / ${strength})`;
      ctx.beginPath();
      ctx.arc(x, y, core, 0, Math.PI * 2);
      ctx.fill();

      if (!marker.emphasis && !marker.active) continue;

      ctx.strokeStyle = `hsl(${hue} 100% 74% / ${(1 - pulse) * 0.5 * strength})`;
      ctx.lineWidth = Math.max(1, dpr);
      ctx.beginPath();
      ctx.arc(x, y, (3 + pulse * 9) * dpr * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/**
 * Frame-rate independent exponential approach, as the WebGL scene used.
 * `lambda` is roughly "how many e-folds per second".
 */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

/** Shortest signed angular difference, in degrees, wrapped to (-180, 180]. */
export function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}
