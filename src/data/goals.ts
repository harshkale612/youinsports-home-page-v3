import type { Goal } from "@/types/athlete";
import { Rocket, Flag, Eye, TrendingUp, Users, Calendar, IdCard, Handshake, Infinity as InfinityIcon, type LucideIcon } from "lucide-react";

export type GoalConfig = {
  id: Goal;
  label: string;
  icon: LucideIcon;
};

export const GOALS: GoalConfig[] = [
  { id: "turn-professional", label: "Become a professional", icon: Rocket },
  { id: "reach-national", label: "Reach the national level", icon: Flag },
  { id: "get-discovered", label: "Get discovered", icon: Eye },
  { id: "improve-performance", label: "Improve my performance", icon: TrendingUp },
  { id: "find-coaches", label: "Find coaches", icon: Users },
  { id: "find-competitions", label: "Find competitions", icon: Calendar },
  { id: "build-profile", label: "Build my sports profile", icon: IdCard },
  { id: "find-sponsorship", label: "Find sponsorship", icon: Handshake },
  { id: "long-term-career", label: "Build a long-term sports career", icon: InfinityIcon },
];

export function getGoalConfig(goal: Goal | null | undefined): GoalConfig {
  return GOALS.find((g) => g.id === goal) ?? GOALS[0];
}
