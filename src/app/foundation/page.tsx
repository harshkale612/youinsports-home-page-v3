import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ComingSoonPage } from "@/features/coming-soon/ComingSoonPage";
import { FoundationMotif } from "@/features/coming-soon/motifs/FoundationMotif";

export const metadata: Metadata = {
  title: "YouInSports Foundation",
  description: "The YouInSports Foundation, backing amateur athletes at every stage of their journey. Coming soon.",
};

export default function FoundationPage() {
  return (
    <>
      <ComingSoonPage
        eyebrow="YouInSports Foundation"
        description="Backing amateur athletes whose talent deserves a chance to go further. More on how we'll help is coming soon."
        visual={<FoundationMotif />}
      />
      <Footer />
    </>
  );
}
