import {
  IdCard,
  LineChart,
  Eye,
  Users2,
  Compass,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type EngineCard = {
  id: string;
  number: string;
  title: string;
  description: string;
  points: string[];
  icon: LucideIcon;
};

export const ENGINE_CARDS: EngineCard[] = [
  {
    id: "identity",
    number: "01",
    title: "Athlete identity",
    description: "Build a professional digital identity.",
    points: ["Profile", "Achievements", "Statistics", "Media", "Career history"],
    icon: IdCard,
  },
  {
    id: "performance",
    number: "02",
    title: "Performance",
    description: "Understand and improve performance.",
    points: ["Performance metrics", "Progress", "Trends", "Insights", "AI recommendations"],
    icon: LineChart,
  },
  {
    id: "visibility",
    number: "03",
    title: "Visibility",
    description: "Get discovered.",
    points: ["Athlete profile", "Highlights", "Public presence", "Discovery"],
    icon: Eye,
  },
  {
    id: "network",
    number: "04",
    title: "Network",
    description: "Build meaningful connections.",
    points: ["Coaches", "Clubs", "Teams", "Athletes", "Mentors"],
    icon: Users2,
  },
  {
    id: "opportunities",
    number: "05",
    title: "Opportunities",
    description: "Discover opportunities.",
    points: ["Trials", "Competitions", "Academies", "Sponsorship", "Events"],
    icon: Compass,
  },
  {
    id: "career",
    number: "06",
    title: "Career",
    description: "Build a long-term athletic career.",
    points: ["Career development", "Long-term tracking", "Milestones", "Growth plan"],
    icon: Trophy,
  },
];
