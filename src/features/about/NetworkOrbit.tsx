"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  Binoculars,
  ClipboardList,
  Handshake,
  Shield,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type OrbitNode = { id: string; label: string; icon: LucideIcon };

const NODES: OrbitNode[] = [
  { id: "coaches", label: "Coaches", icon: ClipboardList },
  { id: "clubs", label: "Clubs", icon: Shield },
  { id: "scouts", label: "Scouts", icon: Binoculars },
  { id: "sponsors", label: "Sponsors", icon: Handshake },
  { id: "organisers", label: "Organisers", icon: Trophy },
  { id: "athletes", label: "Athletes", icon: Users },
];

const SIZE = 400;
const CENTRE = SIZE / 2;
const RADIUS = 148;
/** How long each connection holds the stage before the next one lights. */
const BEAT_MS = 2400;

// Rounded so the server and every browser print the same attribute values.
const round = (value: number) => Math.round(value * 100) / 100;

function onCircle(angle: number, radius: number) {
  return {
    x: round(CENTRE + Math.cos(angle) * radius),
    y: round(CENTRE + Math.sin(angle) * radius),
  };
}

// Start at the top and go clockwise, like `NetworkGraph`.
const POSITIONS = NODES.map((node, i) => ({
  ...node,
  ...onCircle((i / NODES.length) * Math.PI * 2 - Math.PI / 2, RADIUS),
}));

const SATELLITES = [
  { ...onCircle(0.35, 190), tone: "orange" },
  { ...onCircle(2.45, 190), tone: "blue" },
  { ...onCircle(4.4, 190), tone: "blue" },
] as const;

/**
 * The power of networking, drawn: the athlete at the centre of the people
 * around their sport.
 *
 * The ring turns slowly on its own; on top of that, one connection at a time
 * lights up and sends a signal in to the athlete, so the network reads as
 * something live rather than a static org chart. The beat only runs while the
 * diagram is on screen, and not at all for reduced motion.
 */
export function NetworkOrbit({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const beating = inView && !reducedMotion;

  useEffect(() => {
    if (!beating) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % NODES.length), BEAT_MS);
    return () => window.clearInterval(id);
  }, [beating]);

  const source = POSITIONS[active];

  return (
    <div
      ref={ref}
      role="img"
      aria-label="An athlete at the centre, connected to coaches, clubs, scouts, sponsors, organisers and other athletes"
      className={cn("@container relative aspect-square w-full", className)}
    >
      {/* Light behind the network: blue at the heart, the orange sunrise below. */}
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.2),transparent_66%)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-[18%] bottom-[4%] h-[40%] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(240_107_40/0.22),transparent)] blur-2xl"
      />

      {/* Outer ring and its satellites, drifting the other way. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease, delay: 0.2 }}
        className="absolute inset-0"
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 size-full animate-orbit [animation-direction:reverse] [animation-duration:160s]"
        >
          <circle cx={CENTRE} cy={CENTRE} r={190} fill="none" stroke="rgb(170 205 235 / 0.07)" />
          <circle cx={CENTRE} cy={CENTRE} r={88} fill="none" stroke="rgb(170 205 235 / 0.07)" />
          {SATELLITES.map((dot) => (
            <circle
              key={`${dot.x}-${dot.y}`}
              cx={dot.x}
              cy={dot.y}
              r={2.6}
              fill={dot.tone === "orange" ? "var(--brand-orange)" : "var(--brand-blue)"}
              opacity={0.85}
            />
          ))}
        </svg>
      </motion.div>

      {/* The network itself. Everything in here turns together; each chip
          turns back the same amount so its label stays upright. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease, delay: 0.3 }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 animate-orbit">
          <svg
            aria-hidden
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="absolute inset-0 size-full overflow-visible"
          >
            <defs>
              {POSITIONS.map((node) => (
                <linearGradient
                  key={node.id}
                  id={`orbit-link-${node.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={node.x}
                  y1={node.y}
                  x2={CENTRE}
                  y2={CENTRE}
                >
                  <stop offset="0%" style={{ stopColor: "var(--brand-orange)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--brand-blue)" }} />
                </linearGradient>
              ))}
              <radialGradient id="orbit-pulse-glow">
                <stop offset="0%" stopColor="#ffb07a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#f06b28" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={RADIUS}
              fill="none"
              stroke="rgb(170 205 235 / 0.16)"
              strokeDasharray="1.5 7"
              strokeLinecap="round"
            />

            {POSITIONS.map((node, i) => (
              <g key={node.id}>
                <motion.line
                  x1={CENTRE}
                  y1={CENTRE}
                  x2={node.x}
                  y2={node.y}
                  stroke="rgb(170 205 235 / 0.16)"
                  strokeWidth={1}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease, delay: 0.6 + i * 0.08 }}
                />
                <line
                  x1={CENTRE}
                  y1={CENTRE}
                  x2={node.x}
                  y2={node.y}
                  stroke={`url(#orbit-link-${node.id})`}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  className={cn(
                    "transition-opacity duration-700",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                />
              </g>
            ))}

            {/* The signal, travelling in from whoever is lit. Keyed on the
                beat so each one starts from its own node. */}
            {beating && (
              <g key={active}>
                {[
                  { r: 10, fill: "url(#orbit-pulse-glow)" },
                  { r: 2.4, fill: "#fff4ec" },
                ].map((dot) => (
                  <motion.circle
                    key={dot.r}
                    r={dot.r}
                    fill={dot.fill}
                    initial={{ cx: source.x, cy: source.y, opacity: 0 }}
                    animate={{ cx: CENTRE, cy: CENTRE, opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.3,
                      delay: 0.25,
                      ease: [0.55, 0, 0.25, 1],
                      opacity: { duration: 1.3, delay: 0.25, times: [0, 0.18, 0.82, 1] },
                    }}
                  />
                ))}
              </g>
            )}
          </svg>

          {POSITIONS.map((node, i) => (
            <div
              key={node.id}
              className="absolute"
              style={{ left: `${(node.x / SIZE) * 100}%`, top: `${(node.y / SIZE) * 100}%` }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <div className="animate-orbit [animation-direction:reverse]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease, delay: 0.85 + i * 0.08 }}
                  >
                    <OrbitChip node={node} active={i === active} />
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* The athlete. */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[27%] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.45 }}
          className="absolute inset-0"
        >
          {/* The logo's orange and blue, chasing each other round the rim. */}
          <div className="absolute -inset-px animate-orbit rounded-full bg-[conic-gradient(from_0deg,var(--brand-orange),transparent_28%,var(--brand-blue)_52%,transparent_78%,var(--brand-orange))] [animation-duration:9s]" />
          <div className="absolute inset-px rounded-full bg-[radial-gradient(circle_at_35%_28%,#15374f,#061621_70%)] shadow-[0_0_70px_-12px_rgb(240_107_40/0.5)]" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full ring-1 ring-orange/40" />

          <div className="relative flex size-full flex-col items-center justify-center">
            <span className="text-brand font-display text-[6.4cqw] leading-none font-semibold tracking-tight">
              You
            </span>
            <span className="mt-[1.2cqw] font-display text-[length:max(0.5rem,1.7cqw)] font-semibold tracking-[0.26em] text-muted uppercase">
              Athlete
            </span>
          </div>
        </motion.div>

        {/* Each signal lands with a ripple. */}
        {beating && (
          <motion.span
            key={active}
            className="absolute inset-0 rounded-full border border-orange/60"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.9, 0], scale: [1, 1.35, 1.7] }}
            transition={{ duration: 1.1, delay: 1.35, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );
}

/** A glass pill in the brand colours: blue at rest, orange while it's connecting. */
function OrbitChip({ node, active }: { node: OrbitNode; active: boolean }) {
  const Icon = node.icon;

  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 whitespace-nowrap backdrop-blur-md sm:gap-2.5 sm:py-1.5 sm:pr-4 sm:pl-1.5",
        "transition-[border-color,background-color,box-shadow] duration-500",
        active
          ? "border-orange/70 bg-[rgba(8,28,42,0.94)] shadow-[0_0_36px_-4px_rgb(240_107_40/0.55)]"
          : "border-white/[0.1] bg-[rgba(5,19,30,0.72)] shadow-[0_14px_40px_-18px_rgba(0,0,0,0.9)]",
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-500 sm:size-7",
          active
            ? "bg-orange-soft text-orange-strong ring-orange-line"
            : "bg-accent-soft text-accent-strong ring-accent-line",
        )}
      >
        <Icon className="size-3 sm:size-3.5" aria-hidden />
      </span>
      <span
        className={cn(
          "font-display text-[0.56rem] font-semibold tracking-[0.18em] uppercase transition-colors duration-500 sm:text-[0.62rem]",
          active ? "text-fg" : "text-muted",
        )}
      >
        {node.label}
      </span>
    </span>
  );
}
