import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { SUPPORT_EMAIL } from "@/data/contact";
import { ComingSoonPage } from "@/features/coming-soon/ComingSoonPage";
import { TermsMotif } from "@/features/coming-soon/motifs/TermsMotif";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The YouInSports terms of use are being finalised. Coming soon.",
};

export default function TermsPage() {
  return (
    <>
      <ComingSoonPage
        eyebrow="Terms of use"
        description="Our terms of use are being finalised, and written to be read rather than scrolled past."
        visual={<TermsMotif />}
        note={
          <>
            Questions in the meantime?{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-muted underline decoration-orange/50 underline-offset-4 transition-colors hover:text-orange-strong"
            >
              {SUPPORT_EMAIL}
            </a>
          </>
        }
      />
      <Footer />
    </>
  );
}
