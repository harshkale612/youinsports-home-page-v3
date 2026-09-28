import type { PieceType } from "@/scenes/chess/pieces";

export type Side = "white" | "black";

export type PieceSpec = {
  id: string;
  type: PieceType;
  side: Side;
  /** Algebraic square, e.g. "e2". */
  square: string;
};

/**
 * One ply. Castling moves two pieces at once, so a ply is a list of steps; the
 * first step is the one the board highlights.
 */
export type Ply = {
  san: string;
  steps: { from: string; to: string }[];
};

const BACK_RANK: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
const FILES = "abcdefgh";

export const STARTING_POSITION: PieceSpec[] = (["white", "black"] as const).flatMap((side) => {
  const back = side === "white" ? 1 : 8;
  const pawns = side === "white" ? 2 : 7;
  return [...FILES].flatMap((file, i) => [
    { id: `${side}-${file}${back}`, type: BACK_RANK[i], side, square: `${file}${back}` },
    { id: `${side}-${file}${pawns}`, type: "pawn" as const, side, square: `${file}${pawns}` },
  ]);
});

/**
 * The Giuoco Pianissimo — the quiet Italian. Twelve plies, no captures, and it
 * ends with both sides castled, so the board can rewind to the start without
 * any piece having to come back from off the board.
 */
export const OPENING: Ply[] = [
  { san: "e4", steps: [{ from: "e2", to: "e4" }] },
  { san: "e5", steps: [{ from: "e7", to: "e5" }] },
  { san: "Nf3", steps: [{ from: "g1", to: "f3" }] },
  { san: "Nc6", steps: [{ from: "b8", to: "c6" }] },
  { san: "Bc4", steps: [{ from: "f1", to: "c4" }] },
  { san: "Bc5", steps: [{ from: "f8", to: "c5" }] },
  { san: "c3", steps: [{ from: "c2", to: "c3" }] },
  { san: "Nf6", steps: [{ from: "g8", to: "f6" }] },
  { san: "d3", steps: [{ from: "d2", to: "d3" }] },
  { san: "d6", steps: [{ from: "d7", to: "d6" }] },
  {
    san: "O-O",
    steps: [
      { from: "e1", to: "g1" },
      { from: "h1", to: "f1" },
    ],
  },
  {
    san: "O-O",
    steps: [
      { from: "e8", to: "g8" },
      { from: "h8", to: "f8" },
    ],
  },
];

/** Board-space centre of a square. White sits at +z, the a-file at -x. */
export function squareToXZ(square: string): [x: number, z: number] {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return [file - 3.5, 3.5 - rank];
}
