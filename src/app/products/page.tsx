import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ProductsExperience } from "@/features/chess-id/ProductsExperience";

export const metadata: Metadata = {
  title: "Chess ID",
  description:
    "Scan your scoresheet, review every move with AI and Stockfish, and build your verified athlete profile. See what Chess ID offers and choose a plan.",
};

export default function ProductsPage() {
  return (
    <>
      <ProductsExperience />
      <Footer />
    </>
  );
}
