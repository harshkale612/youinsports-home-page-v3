import {
  BufferGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

/**
 * Pieces are modelled in board units (one square = 1) and then scaled once, so
 * the profiles below read as proportions: a king a touch under one and a half
 * squares tall, bases a little under three quarters of a square wide.
 */
const PIECE_SCALE = 1.1;

/** Lathe resolution — high enough that silhouettes read as turned, not faceted. */
const TURNS = 72;

type Point = [radius: number, height: number];

/** Points on a circle in the profile plane, angles in degrees from +x. */
function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    points.push([Math.max(0, cx + r * Math.cos(a)), cy + r * Math.sin(a)]);
  }
  return points;
}

/** The weighted foot every piece stands on: a plinth, a bead, a waist. */
const FOOT: Point[] = [
  [0, 0],
  [0.34, 0],
  [0.36, 0.015],
  [0.36, 0.06],
  [0.34, 0.08],
  [0.3, 0.09],
  [0.3, 0.115],
  [0.27, 0.13],
];

/** A collar: the ring that separates a stem from a head. */
function collar(y: number, stem: number, width: number): Point[] {
  return [
    [stem, y],
    [width - 0.01, y + 0.02],
    [width, y + 0.04],
    [width - 0.01, y + 0.06],
    [stem - 0.01, y + 0.08],
  ];
}

function lathe(points: Point[]) {
  return new LatheGeometry(
    points.map(([x, y]) => new Vector2(x, y)),
    TURNS,
  );
}

/**
 * Lathe, extrude, box and sphere geometries disagree on whether they are
 * indexed, and `mergeGeometries` needs them to agree — so every part is
 * flattened first.
 */
function merge(parts: BufferGeometry[]) {
  const flat = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const merged = mergeGeometries(flat);
  parts.forEach((part) => part.dispose());
  flat.forEach((part) => part.dispose());
  return merged;
}

function pawn() {
  return lathe([
    ...FOOT,
    [0.21, 0.17],
    [0.155, 0.23],
    [0.125, 0.32],
    ...collar(0.42, 0.11, 0.19),
    ...arc(0, 0.63, 0.135, -58, 90, 18),
  ]);
}

function rook() {
  const body = lathe([
    ...FOOT,
    [0.25, 0.16],
    [0.22, 0.22],
    [0.19, 0.5],
    [0.2, 0.56],
    [0.25, 0.6],
    [0.26, 0.63],
    [0.26, 0.74],
    [0.19, 0.74],
    [0.19, 0.7],
    [0, 0.7],
  ]);

  // Five merlons round the rim: ring sectors, extruded upwards, with bevelled
  // edges so they catch the key light like machined stone.
  const merlons: BufferGeometry[] = [];
  const count = 5;
  const gap = 0.34;
  const span = (Math.PI * 2) / count - gap;
  for (let i = 0; i < count; i++) {
    const start = (i * Math.PI * 2) / count;
    const shape = new Shape();
    shape.absarc(0, 0, 0.245, start, start + span, false);
    shape.absarc(0, 0, 0.2, start + span, start, true);
    const merlon = new ExtrudeGeometry(shape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 10,
    });
    merlon.rotateX(-Math.PI / 2);
    merlon.translate(0, 0.742, 0);
    merlons.push(merlon);
  }

  return merge([body, ...merlons]);
}

function knight() {
  const base = lathe([
    ...FOOT,
    [0.25, 0.16],
    [0.23, 0.2],
    [0.2, 0.22],
    [0, 0.22],
  ]);

  // The horse's head as a single silhouette, facing +x, then given thickness.
  // A flat-sided knight is the modern-set convention, and it keeps the profile
  // legible from every camera angle the story uses.
  const head = new Shape();
  head.moveTo(-0.2, 0.19);
  head.lineTo(0.2, 0.19);
  head.splineThru(
    [
      [0.19, 0.3],
      [0.13, 0.42],
      [0.16, 0.5],
      [0.26, 0.56],
      [0.33, 0.6],
      [0.345, 0.66],
      [0.31, 0.72],
      [0.2, 0.78],
      [0.12, 0.86],
      [0.08, 0.95],
      [0.05, 0.99],
      [0.01, 0.93],
      [-0.07, 0.9],
      [-0.16, 0.82],
      [-0.22, 0.68],
      [-0.25, 0.5],
      [-0.24, 0.32],
      [-0.2, 0.19],
    ].map(([x, y]) => new Vector2(x, y)),
  );

  const depth = 0.16;
  const extruded = new ExtrudeGeometry(head, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.03,
    bevelSegments: 6,
    curveSegments: 6,
  });
  extruded.translate(0, 0, -depth / 2);

  // Sculpt the slab into a head: full width at the neck, narrowing towards
  // the muzzle and the ears.
  const position = extruded.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const muzzle = Math.min(Math.max((x + 0.05) / 0.4, 0), 1);
    const ears = Math.min(Math.max((y - 0.82) / 0.17, 0), 1);
    position.setZ(i, position.getZ(i) * (1 - 0.38 * muzzle) * (1 - 0.35 * ears));
  }

  // Extrusions come out flat-shaded; weld the vertices so the bevels read as
  // one smooth, carved surface.
  extruded.deleteAttribute("normal");
  const profile = mergeVertices(extruded);
  profile.computeVertexNormals();
  extruded.dispose();

  return merge([base, profile]);
}

function bishop() {
  return lathe([
    ...FOOT,
    [0.22, 0.17],
    [0.15, 0.25],
    [0.12, 0.36],
    ...collar(0.5, 0.105, 0.19),
    [0.13, 0.63],
    [0.155, 0.69],
    [0.16, 0.74],
    [0.145, 0.8],
    [0.11, 0.86],
    [0.06, 0.91],
    [0.03, 0.925],
    ...arc(0, 0.955, 0.035, -60, 90, 8),
  ]);
}

function queen() {
  const body = lathe([
    ...FOOT,
    [0.24, 0.17],
    [0.17, 0.26],
    [0.13, 0.4],
    ...collar(0.58, 0.115, 0.21),
    [0.14, 0.76],
    [0.18, 0.86],
    [0.215, 0.94],
    [0.2, 0.96],
    [0.15, 0.965],
    [0.12, 0.99],
    [0.08, 1.02],
    [0.05, 1.03],
    ...arc(0, 1.075, 0.05, -65, 90, 10),
  ]);

  // The coronet: a ring of beads around the rim.
  const beads: BufferGeometry[] = [];
  const count = 9;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const bead = new SphereGeometry(0.03, 12, 8);
    bead.translate(Math.cos(a) * 0.205, 0.962, Math.sin(a) * 0.205);
    beads.push(bead);
  }

  return merge([body, ...beads]);
}

function king() {
  const body = lathe([
    ...FOOT,
    [0.25, 0.17],
    [0.18, 0.26],
    [0.14, 0.42],
    ...collar(0.62, 0.125, 0.22),
    [0.15, 0.8],
    [0.19, 0.9],
    [0.22, 0.98],
    [0.2, 1.0],
    [0.14, 1.01],
    [0.11, 1.05],
    [0.07, 1.08],
    [0, 1.09],
  ]);

  const upright = new RoundedBoxGeometry(0.06, 0.22, 0.06, 2, 0.012);
  upright.translate(0, 1.18, 0);
  const beam = new RoundedBoxGeometry(0.17, 0.06, 0.06, 2, 0.012);
  beam.translate(0, 1.21, 0);

  return merge([body, upright, beam]);
}

export function createPieceGeometries(): Record<PieceType, BufferGeometry> {
  const geometries = { pawn: pawn(), rook: rook(), knight: knight(), bishop: bishop(), queen: queen(), king: king() };
  for (const geometry of Object.values(geometries)) {
    geometry.scale(PIECE_SCALE, PIECE_SCALE, PIECE_SCALE);
  }
  return geometries;
}
