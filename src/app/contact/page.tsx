import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { ComingSoonPage } from "@/features/coming-soon/ComingSoonPage";
import { ContactMotif } from "@/features/coming-soon/motifs/ContactMotif";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "A proper way to reach the YouInSports team is on its way. Until then, write to hello@youinsports.ai.",
};

export default function ContactPage() {
  return (
    <>
      <ComingSoonPage
        eyebrow="Contact us"
        description="A proper way to reach the team is on its way. Until then, our inbox is open and a real person reads every message."
        visual={<ContactMotif />}
        actions={[
          { label: "Email us", href: "mailto:hello@youinsports.ai", icon: "mail" },
          { label: "Back to home", href: "/", variant: "secondary", icon: "back" },
        ]}
        note="hello@youinsports.ai"
      />
      <Footer />
    </>
  );
}
