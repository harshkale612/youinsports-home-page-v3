"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const NODES = [
  { id: "coach", label: "Coach" },
  { id: "athlete", label: "Athletes" },
  { id: "club", label: "Clubs" },
  { id: "organizer", label: "Organisers" },
  { id: "sponsor", label: "Sponsors" },
];

const SIZE = 260;
const CENTRE = SIZE / 2;
const ORBIT = 92;

/**
 * The athlete at the centre of the people around them.
 *
 * Structural, not quantitative — nothing here encodes a value, so nothing is
 * scaled. Every node is labelled in the SVG and repeated in the list below it,
 * so the diagram is never the only way to get the information.
 */
export function NetworkGraph({ className }: { className?: string }) {
  const positions = NODES.map((node, i) => {
    // Start at the top and go clockwise.
    const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: CENTRE + Math.cos(angle) * ORBIT,
      y: CENTRE + Math.sin(angle) * ORBIT,
    };
  });

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[17rem]"
        role="img"
        aria-label="You at the centre, connected to coaches, athletes, clubs, organisers and sponsors"
      >
        {positions.map((node, i) => (
          <motion.line
            key={`line-${node.id}`}
            x1={CENTRE}
            y1={CENTRE}
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            strokeWidth={1}
            className="text-accent/35"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.09 }}
          />
        ))}

        {positions.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.45, ease, delay: 0.35 + i * 0.09 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            <circle cx={node.x} cy={node.y} r={4} className="fill-accent" />
            <text
              x={node.x}
              y={node.y - 11}
              textAnchor="middle"
              className="fill-current font-display text-[8px] tracking-[0.12em] text-muted uppercase"
            >
              {node.label}
            </text>
          </motion.g>
        ))}

        <circle cx={CENTRE} cy={CENTRE} r={16} className="fill-accent/15 stroke-accent" strokeWidth={1} />
        <text
          x={CENTRE}
          y={CENTRE + 3}
          textAnchor="middle"
          className="fill-current font-display text-[8px] font-semibold tracking-[0.12em] text-fg uppercase"
        >
          You
        </text>
      </svg>
    </div>
  );
}
