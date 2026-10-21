import { notFound } from "next/navigation";

// The contact page is switched off for now: /contact renders the 404 page.
// To bring it back, restore the code below and delete the stub at the bottom,
// then uncomment the /contact links in SiteNav, Footer, AboutCta and data/faq.

// import type { Metadata } from "next";
// import { Footer } from "@/components/navigation/Footer";
// import { ContactExperience } from "@/features/contact/ContactExperience";
// import { SUPPORT_EMAIL } from "@/data/contact";
//
// export const metadata: Metadata = {
//   title: "Contact Us",
//   description: `Questions, feedback, chessboard orders or partnerships: write to the YouInSports team at ${SUPPORT_EMAIL}.`,
// };
//
// export default function ContactPage() {
//   return (
//     <>
//       <ContactExperience />
//       <Footer />
//     </>
//   );
// }

export default function ContactPage() {
  notFound();
}
