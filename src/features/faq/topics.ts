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
import { FAQ_CATEGORIES, categoryId } from "@/data/faq";

const ICONS: Record<string, LucideIcon> = {
  "getting-started": Rocket,
  "for-athletes": Medal,
  "for-coaches": ClipboardList,
  "for-organizers": CalendarDays,
  "technical-support": LifeBuoy,
  "ai-chess-premium": ChessKnight,
  pricing: CreditCard,
};

/** The FAQ's categories as the page shows them: an anchor id, a mark, and the questions under each. */
export const FAQ_TOPICS = FAQ_CATEGORIES.map((category) => {
  const id = categoryId(category.category);
  return { ...category, id, icon: ICONS[id] ?? CircleHelp };
});
