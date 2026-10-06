import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ProductsExperience } from "@/features/chess-id/ProductsExperience";

export const metadata: Metadata = {
  title: "Chessboard",
  description:
    "A real chessboard with real pieces that records your game as you play it. Standard PGN, live broadcast with an organiser-set delay, and a board that keeps recording when your phone doesn't. Own one, or rent boards by the hour.",
};

export default function ProductsPage() {
  return (
    <>
      <ProductsExperience />
      <Footer />
    </>
  );
}
