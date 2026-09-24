import type { Metadata } from "next";
import { Footer } from "@/components/navigation/Footer";
import { AthleteJourneyExperience } from "@/features/athlete-journey/AthleteJourneyExperience";

export const metadata: Metadata = {
  title: "YouInSports — Your Athlete Journey",
  description:
    "Tell us about your sport and we'll show you where you are, what you're up against, and where you could go next. An interactive athlete journey on a living globe.",
};

export default function Home() {
  return (
    <>
      <AthleteJourneyExperience />
      <Footer />
    </>
  );
}
