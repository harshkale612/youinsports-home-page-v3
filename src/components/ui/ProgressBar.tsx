"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function ProgressBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          {label}
        </span>
        <span className="font-display text-sm font-semibold text-fg">
          <AnimatedCounter value={value} />
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="bg-brand-reading h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: isInView ? `${value}%` : "0%" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}
