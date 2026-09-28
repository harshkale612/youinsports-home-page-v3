import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ComingSoonPage } from "@/features/coming-soon/ComingSoonPage";
import { PrivacyMotif } from "@/features/coming-soon/motifs/PrivacyMotif";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "The YouInSports privacy policy is being finalised. Coming soon.",
};

export default function PrivacyPage() {
  return (
    <>
      <ComingSoonPage
        eyebrow="Privacy policy"
        description="Our privacy policy is being finalised: what we collect, why we collect it, and how you stay in control of it."
        visual={<PrivacyMotif />}
        note={
          <>
            Questions in the meantime?{" "}
            <a
              href="mailto:hello@youinsports.ai"
              className="text-muted underline decoration-orange/50 underline-offset-4 transition-colors hover:text-orange-strong"
            >
              hello@youinsports.ai
            </a>
          </>
        }
      />
      <Footer />
    </>
  );
}
