import {
  CalendarDays,
  ChessKnight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  Medal,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { FAQ_CATEGORIES, categoryId, type FaqEntry } from "@/data/faq";

/**
 * Each topic's mark and a one-line summary. The summaries only name what the
 * topic's own questions cover, so they can't promise more than the answers.
 */
const DETAILS: Record<string, { icon: LucideIcon; summary: string }> = {
  "getting-started": {
    icon: Rocket,
    summary: "Creating your account, signing up with Google, parent and child profiles, and booking your first event.",
  },
  "for-athletes": {
    icon: Medal,
    summary: "Finding financial support, tracking your progress, and connecting with coaches and mentors.",
  },
  "for-coaches": {
    icon: ClipboardList,
    summary: "Offering your coaching services and the tools for managing your athletes.",
  },
  "for-organizers": {
    icon: CalendarDays,
    summary: "Creating and promoting sports events, and finding sponsors for them.",
  },
  "technical-support": {
    icon: LifeBuoy,
    summary: "Uploading photos and videos, resetting your password, and keeping your information secure.",
  },
  "ai-chess-premium": {
    icon: ChessKnight,
    summary: "Analysing your games, the URL scraper, and fixing PGN files with the PGN Editor.",
  },
  pricing: {
    icon: CreditCard,
    summary: "What each plan includes, billing, trials and refunds, cancelling, and paying securely.",
  },
};

export function hasVideo(entry: FaqEntry): entry is FaqEntry & { videoId: string } {
  return Boolean(entry.hasVideo && entry.videoId);
}

/** The FAQ's categories as the page shows them: an id, a mark, a summary, and the questions under each. */
export const FAQ_TOPICS = FAQ_CATEGORIES.map((category) => {
  const id = categoryId(category.category);
  return {
    ...category,
    id,
    icon: DETAILS[id]?.icon ?? CircleHelp,
    summary: DETAILS[id]?.summary ?? "",
    videoCount: category.questions.filter(hasVideo).length,
  };
});

export type FaqTopic = (typeof FAQ_TOPICS)[number];

export const TOPIC_IDS: ReadonlySet<string> = new Set(FAQ_TOPICS.map((topic) => topic.id));

/** Which topic each entry belongs to, by entry id. */
export const TOPIC_OF_ENTRY: ReadonlyMap<string, FaqTopic> = new Map(
  FAQ_TOPICS.flatMap((topic) => topic.questions.map((entry) => [entry.id, topic] as const)),
);

/** Every entry, by id. */
export const ENTRIES: ReadonlyMap<string, FaqEntry> = new Map(
  FAQ_CATEGORIES.flatMap((category) => category.questions.map((entry) => [entry.id, entry] as const)),
);

/** The entries with a video walkthrough, in the order the page lists them. */
export const VIDEO_ENTRIES = [...ENTRIES.values()].filter(hasVideo);
