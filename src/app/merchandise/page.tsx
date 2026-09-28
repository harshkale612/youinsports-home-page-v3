import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ComingSoonPage } from "@/features/coming-soon/ComingSoonPage";
import { MerchandiseMotif } from "@/features/coming-soon/motifs/MerchandiseMotif";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "YouInSports merchandise for athletes and the people behind them. Coming soon.",
};

export default function MerchandisePage() {
  return (
    <>
      <ComingSoonPage
        eyebrow="Merchandise"
        description="Kit for the people who play and the people who back them. The first YouInSports collection is on its way."
        visual={<MerchandiseMotif />}
      />
      <Footer />
    </>
  );
}
