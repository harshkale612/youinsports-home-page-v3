"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { MetricCard } from "@/components/ui/MetricCard";
import type { Athlete } from "@/types/athlete";

export function PerformanceChart({ athlete }: { athlete: Athlete }) {
  const data = [
    { metric: "Technique", value: athlete.performance.technique },
    { metric: "Fitness", value: athlete.performance.fitness },
    { metric: "Consistency", value: athlete.performance.consistency },
    { metric: "Match", value: athlete.performance.matchPerformance },
    { metric: "Overall", value: athlete.performance.overall },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <SurfaceCard className="p-6">
        <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          Performance index
        </p>
        <div className="mt-2 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="rgba(245,244,240,0.12)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#92929b", fontSize: 12 }}
              />
              <Radar
                dataKey="value"
                stroke="var(--color-accent)"
                fill="var(--color-accent)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Performance index" value={athlete.performance.overall} />
        <MetricCard label="Technique" value={athlete.performance.technique} />
        <MetricCard label="Fitness" value={athlete.performance.fitness} />
        <MetricCard label="Consistency" value={athlete.performance.consistency} />
      </div>
    </div>
  );
}
