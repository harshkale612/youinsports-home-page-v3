import type { Environment } from "@/types/journey";
import {
  School,
  GraduationCap,
  Library,
  Users,
  Dumbbell,
  MapPin,
  Flag,
  Building2,
  User,
  type LucideIcon,
} from "lucide-react";

export type EnvironmentConfig = {
  id: Environment;
  label: string;
  /** Shown under the label on the choice card. */
  detail: string;
  icon: LucideIcon;
  /**
   * 0-1. How much structure this environment already gives an athlete —
   * coaching, fixtures, exposure. Feeds the illustrative network and
   * performance readings. Demo weighting, not a measurement.
   */
  structure: number;
};

export const ENVIRONMENTS: EnvironmentConfig[] = [
  { id: "school", label: "School", detail: "School team or inter-school sport", icon: School, structure: 0.25 },
  { id: "college", label: "College", detail: "College team and college circuit", icon: GraduationCap, structure: 0.4 },
  { id: "university", label: "University", detail: "University squad and inter-university sport", icon: Library, structure: 0.5 },
  { id: "club", label: "Club", detail: "A local club and its league", icon: Users, structure: 0.45 },
  { id: "academy", label: "Academy", detail: "A dedicated training academy", icon: Dumbbell, structure: 0.7 },
  { id: "district-team", label: "District team", detail: "Selected for your district", icon: MapPin, structure: 0.6 },
  { id: "state-team", label: "State team", detail: "Representing your state", icon: Flag, structure: 0.78 },
  { id: "professional-club", label: "Professional club", detail: "A professional or semi-pro setup", icon: Building2, structure: 0.9 },
  { id: "independent", label: "Independent", detail: "Training on your own terms", icon: User, structure: 0.15 },
];

const BY_ID = new Map(ENVIRONMENTS.map((e) => [e.id, e]));

export function getEnvironment(id: Environment | null | undefined): EnvironmentConfig {
  return (id && BY_ID.get(id)) || ENVIRONMENTS[0];
}
