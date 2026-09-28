export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /**
   * A portrait under `public/`, e.g. `"/team/roshan-vilas-ingole.jpg"`.
   *
   * Until one is set the card shows a monogram instead, so photos can land one
   * at a time. Portrait (4:5) crops best; faces should sit in the upper half,
   * clear of the name.
   */
  photo?: string;
};

/** In the order they appear on the About page. */
export const TEAM: TeamMember[] = [
  { id: "roshan-vilas-ingole", name: "Roshan Vilas Ingole", role: "Founder & Chief Executive Officer" },
  { id: "tushar-shelar", name: "Tushar Shelar", role: "Chief Technology Officer" },
  { id: "sahil-yadav", name: "Sahil Yadav", role: "Machine Learning Engineer" },
  { id: "tejavardhan-vydyam", name: "TejaVardhan Vydyam", role: "VLSI Engineer" },
  { id: "saily-walunj", name: "Saily Walunj", role: "QA Engineer" },
  { id: "dnyaneshwari-dalave", name: "Dnyaneshwari Dalave", role: "QA Engineer" },
  { id: "yogesh-ravandale", name: "Yogesh Ravandale", role: "QA Engineer & Marketing" },
  { id: "mrinal-pathak", name: "Mrinal Pathak", role: "Marketing" },
];
