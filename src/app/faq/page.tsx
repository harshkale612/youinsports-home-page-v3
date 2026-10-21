import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { FaqExperience } from "@/features/faq/FaqExperience";
import { BRAND_NAME, SITE_URL } from "@/data/faq";

const DESCRIPTION = `Find answers to common questions about ${BRAND_NAME} platform, features, and services`;

export const metadata: Metadata = {
  title: "FAQ",
  description: DESCRIPTION,
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `Frequently Asked Questions - ${BRAND_NAME}`,
  description: DESCRIPTION,
  url: `${SITE_URL}/faq`,
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // `<` escaped so nothing in the data can close the script tag early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      <FaqExperience />
      <Footer />
    </>
  );
}
