import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  suffix = "",
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <SurfaceCard className={cn("p-5", className)}>
      <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-semibold text-fg">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
    </SurfaceCard>
  );
}
