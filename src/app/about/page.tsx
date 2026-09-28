import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { AboutExperience } from "@/features/about/AboutExperience";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bringing the power of networking to support amateur athletes at every stage of their journey. Meet the team behind YouInSports.",
};

export default function AboutPage() {
  return (
    <>
      <AboutExperience />
      <Footer />
    </>
  );
}
