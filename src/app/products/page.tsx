import type { Metadata } from "next";
import { ChessIdStory } from "@/features/chess-id/ChessIdStory";

export const metadata: Metadata = {
  title: "Chess ID",
};

export default function ProductsPage() {
  return (
    <main className="relative">
      <ChessIdStory />
    </main>
  );
}
