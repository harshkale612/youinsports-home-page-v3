import type { Level } from "@/types/athlete";

export type LevelConfig = {
  id: Level;
  label: string;
  description: string;
  order: number;
};

export const LEVELS: LevelConfig[] = [
  { id: "local", label: "Local", description: "Playing in your city or community", order: 0 },
  { id: "district", label: "District", description: "Competing across your district", order: 1 },
  { id: "state", label: "State", description: "Representing your state", order: 2 },
  { id: "national", label: "National", description: "Competing at the national level", order: 3 },
  { id: "international", label: "International", description: "Competing on the global stage", order: 4 },
];

export function getLevelConfig(level: Level | null | undefined): LevelConfig {
  return LEVELS.find((l) => l.id === level) ?? LEVELS[0];
}

export function nextLevel(level: Level): LevelConfig | null {
  const current = getLevelConfig(level);
  return LEVELS.find((l) => l.order === current.order + 1) ?? null;
}
