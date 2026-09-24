"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const PULL_STRENGTH = 0.25;
const MAX_OFFSET = 10;

export function MagneticWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * PULL_STRENGTH;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * PULL_STRENGTH;
    x.set(Math.max(Math.min(offsetX, MAX_OFFSET), -MAX_OFFSET));
    y.set(Math.max(Math.min(offsetY, MAX_OFFSET), -MAX_OFFSET));
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
