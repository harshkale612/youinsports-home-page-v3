import {
  BatteryMedium,
  Cable,
  ChessQueen,
  FileCheck,
  History,
  Magnet,
  Network,
  PauseCircle,
  RadioTower,
  Rows3,
  ShieldCheck,
  Smartphone,
  Swords,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The smart chessboard, as the Products page presents it: what it does at the
 * board, what it does for a tournament, and what it costs to own or rent.
 *
 * Every claim here is one the hardware team has built and tested. Battery
 * life, wireless range, accuracy figures, shipping dates, analysis on the
 * board, a clock, recording with the app in the background, and any
 * endorsement are not — keep them off the page until they are. The same goes
 * for "AI" and "computer vision": neither is involved.
 *
 * Prices are in US dollars, and the page derives every figure it quotes from
 * the ones below, so a price change is a one-line edit.
 */

export type BoardFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** A short fact the card leads with. */
  spec: string;
};

export const BOARD_FEATURES: BoardFeature[] = [
  {
    id: "sensors",
    title: "It feels every move",
    description:
      "A magnetic sensor under every square, a magnet in every piece. The app has followed the game from the opening position, so each change on the board can only be one legal move. No camera, so it works in any light, from any angle.",
    icon: Magnet,
    spec: "64 sensors",
  },
  {
    id: "autostart",
    title: "Starts by itself",
    description:
      "Set up all 32 pieces and it starts recording. No button, no pairing step, no telling it the game has begun.",
    icon: Zap,
    spec: "32 pieces",
  },
  {
    id: "pgn",
    title: "Standard PGN, opens anywhere",
    description:
      "Every game in standard chess notation, the format every chess site and database reads. Verified in Lichess, ChessBase and Chess.com, not assumed.",
    icon: FileCheck,
    spec: ".pgn",
  },
  {
    id: "tricky",
    title: "Reads the tricky moves",
    description: "Captures, castling and en passant are all read correctly from the magnets alone.",
    icon: Swords,
    spec: "O-O · e.p.",
  },
  {
    id: "promotion",
    title: "Works out your promotion",
    description:
      "Press queen, rook, bishop or knight, or don't. It assumes a queen so play never pauses, then corrects itself from your next moves: a knight gives itself away the moment it moves like one.",
    icon: ChessQueen,
    spec: "Q R B N",
  },
  {
    id: "four-boards",
    title: "Four boards, one phone",
    description: "One phone follows up to four boards at once, enough for a club night or a small event.",
    icon: Smartphone,
    spec: "1 : 4",
  },
  {
    id: "memory",
    title: "Walk away mid-game. The board remembers.",
    description:
      "If your phone drops out (out of range, flat battery, a call), the board keeps recording and holds roughly 85 moves. Reconnect and the missed moves arrive in order, as though nothing happened.",
    icon: History,
    spec: "~85 moves",
  },
];

export type EventFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** What the boards do for a tournament, beyond the live broadcast itself. */
export const EVENT_FEATURES: EventFeature[] = [
  {
    id: "pause",
    title: "Pause and resume",
    description: "Pause the public broadcast whenever you need to. Recording never stops; only publication does.",
    icon: PauseCircle,
  },
  {
    id: "pairings",
    title: "Pairings to tables",
    description:
      "Pair the round on our platform, attach a board to each pairing, and every game records and broadcasts without anyone typing a move.",
    icon: Network,
  },
  {
    id: "provable",
    title: "Every game, provable",
    description:
      "Every sensor reading is kept, so a disputed result can be rebuilt from the original data, not from someone's memory.",
    icon: ShieldCheck,
  },
  {
    id: "health",
    title: "Board health at a glance",
    description:
      "Battery, voltage, charging and temperature for every board, so you find the one that needs attention before the round.",
    icon: BatteryMedium,
  },
  {
    id: "standalone",
    title: "Works on its own",
    description:
      "Running Swiss Manager or anything else? The boards still record, export and broadcast with no pairing system attached.",
    icon: Cable,
  },
];

/** Where the board's PGN files have been opened and checked, not just assumed to work. */
export const PGN_VERIFIED_IN = ["Lichess", "ChessBase", "Chess.com"];

/** The delay a broadcast typically runs behind the boards, in minutes. */
export const TYPICAL_DELAY_MINUTES = 15;

/** One phone follows this many boards at once. */
export const BOARDS_PER_PHONE = 4;

/** What one board costs to buy, in US dollars. */
export const BOARD_PRICE = 350;

/** Renting boards for an event, in US dollars per board. */
export const RENTAL = {
  hourly: 5,
  minimumHours: 2,
  /** No board costs more than this for one day, however long the day runs. */
  dailyCap: 40,
  /** The estimator's range. */
  maxHours: 12,
  maxBoards: 64,
} as const;

/**
 * What renting `boards` boards for a day of `hours` hours comes to: billed for
 * at least the minimum, and never more than the day cap per board.
 */
export function rentalEstimate(boards: number, hours: number) {
  const billedHours = Math.max(hours, RENTAL.minimumHours);
  const uncapped = billedHours * RENTAL.hourly;
  const perBoard = Math.min(uncapped, RENTAL.dailyCap);
  return {
    total: perBoard * boards,
    perBoard,
    billedHours,
    capped: uncapped > RENTAL.dailyCap,
  };
}

/** Phones needed to follow `boards` boards at once. */
export function phonesFor(boards: number) {
  return Math.ceil(boards / BOARDS_PER_PHONE);
}

/** The hours after which the day cap means the rest of the day is free. */
export const CAP_HOURS = RENTAL.dailyCap / RENTAL.hourly;

/** Hours of renting a board that cost as much as owning it. */
export const RENT_TO_OWN_HOURS = Math.round(BOARD_PRICE / RENTAL.hourly);

export type OfferFeature = { label: string; icon: LucideIcon };

/** Everything a board does, as the card for owning one lists it. */
export const OWN_FEATURES: OfferFeature[] = [
  { label: "A sensor under every square", icon: Magnet },
  { label: "Starts recording by itself", icon: Zap },
  { label: "Standard PGN export", icon: FileCheck },
  { label: "Four promotion buttons", icon: ChessQueen },
  { label: "~85 moves held through a dropout", icon: History },
  { label: "Live broadcast with a delay", icon: RadioTower },
  { label: "Four boards on one phone", icon: Smartphone },
  { label: "Battery and health readings", icon: BatteryMedium },
];

/** What a rental comes with, as its card lists it. */
export const RENT_FEATURES: OfferFeature[] = [
  { label: "Live broadcast with your delay", icon: RadioTower },
  { label: "Pairings to tables, or standalone", icon: Rows3 },
  { label: "PGN and raw record of every game", icon: FileCheck },
  { label: "Health readings before each round", icon: BatteryMedium },
];
