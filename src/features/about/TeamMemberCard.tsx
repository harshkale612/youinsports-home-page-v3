"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { TeamMember } from "@/data/team";

const TILT = { stiffness: 220, damping: 22, mass: 0.6 };
/** Degrees the card leans toward the pointer at its edges. */
const MAX_TILT = 7;

/**
 * Where the stage light sits on each placeholder, so the roster reads as a
 * set rather than eight copies of one card.
 */
const GLOWS = [
  { orange: "18% 12%", blue: "92% 88%" },
  { orange: "85% 15%", blue: "10% 85%" },
  { orange: "50% 0%", blue: "50% 100%" },
  { orange: "8% 60%", blue: "95% 30%" },
];

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * One member of the team, as a player card.
 *
 * The card leans toward a mouse and catches the light where it points; touch
 * and reduced motion get a still card. Without a photo it shows a monogram on
 * faint pitch markings, which reads as deliberate rather than missing, and the
 * layout doesn't move when the photo arrives.
 *
 * On phones the role and name sit under a square portrait: at two cards a row
 * there is no room to lay a long designation over the portrait without it
 * running into the face. From `sm` the cards are wide enough to carry them
 * over the portrait.
 */
export function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const reducedMotion = usePrefersReducedMotion();

  // Pointer position across the card, 0–1 on each axis.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [MAX_TILT, -MAX_TILT]), TILT);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-MAX_TILT, MAX_TILT]), TILT);
  const glareX = useTransform(pointerX, (v) => `${v * 100}%`);
  const glareY = useTransform(pointerY, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(18rem circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.1), transparent 55%)`;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const glow = GLOWS[index % GLOWS.length];

  return (
    // Full height all the way down, so cards in a row match when one role wraps
    // further than its neighbour's.
    <div className="h-full perspective-[1100px]">
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX, rotateY }}
        className="group relative h-full rounded-[1.4rem] p-px"
      >
        {/* The border: a faint hairline at rest, the logo's orange-to-blue on hover. */}
        <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-white/[0.08]" />
        <span
          aria-hidden
          className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(150deg,rgb(240_107_40/0.9),rgb(150_200_240/0.1)_45%,rgb(150_200_240/0.1)_60%,rgb(44_143_227/0.9))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <article className="relative h-full overflow-hidden rounded-[calc(1.4rem-1px)] bg-bg shadow-[0_30px_70px_-40px_rgb(0_0_0/0.95)] transition-shadow duration-500 group-hover:shadow-[0_40px_90px_-40px_rgb(240_107_40/0.45)]">
          <div className="@container relative aspect-square overflow-hidden sm:aspect-4/5">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={`Portrait of ${member.name}`}
                fill
                sizes="(min-width: 1024px) 22rem, 50vw"
                className="object-cover object-[50%_25%] transition-[scale] duration-700 ease-out group-hover:scale-[1.06]"
              />
            ) : (
              <Monogram name={member.name} glow={glow} />
            )}

            {/* Fades the portrait into the card; from `sm`, where the name is
                laid over it, deep enough to keep the name legible on any photo. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg to-transparent sm:h-3/5 sm:via-bg/75"
            />

            <motion.div
              aria-hidden
              style={{ background: glare }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <span className="tabular absolute top-4 left-4 font-display text-[0.62rem] font-semibold tracking-[0.2em] text-muted/80">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative px-3.5 pt-3 pb-4 transition-[translate] duration-500 ease-out group-hover:-translate-y-1 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-5">
            <p className="font-display text-[0.55rem] leading-snug font-semibold tracking-[0.2em] text-orange-strong uppercase sm:text-[0.6rem]">
              {member.role}
            </p>
            <span
              aria-hidden
              className="mt-2.5 block h-px w-6 bg-gradient-to-r from-orange to-transparent transition-[width] duration-500 ease-out group-hover:w-12"
            />
            <h3 className="mt-2.5 font-display text-[1rem] leading-tight font-semibold tracking-tight text-balance text-fg sm:text-[1.2rem]">
              {member.name}
            </h3>
          </div>
        </article>
      </motion.div>
    </div>
  );
}

/** Initials on the centre spot of a pitch, lit from two corners. */
function Monogram({ name, glow }: { name: string; glow: (typeof GLOWS)[number] }) {
  return (
    // `--pitch-y` is where the centre spot sits: the middle of the square
    // portrait on phones; from `sm`, a little above the middle, clear of the
    // name laid over the portrait.
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(165deg,var(--color-surface),var(--color-bg)_55%,var(--color-void))] [--pitch-y:50%] sm:[--pitch-y:38.4%]"
    >
      <div
        className="absolute inset-0 opacity-80 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glow.orange}, rgb(240 107 40 / 0.34), transparent 55%), radial-gradient(circle at ${glow.blue}, rgb(44 143 227 / 0.32), transparent 55%)`,
        }}
      />

      {/* Pitch markings in CSS rather than a fixed drawing, so they fit both
          portrait shapes: the boxes at each end, the halfway line and the
          centre circle through the initials. */}
      <span className="absolute top-0 left-1/2 h-[13.6%] w-[48%] -translate-x-1/2 border-x border-b border-white/[0.07]" />
      <span className="absolute top-0 left-1/2 h-[4.8%] w-[22%] -translate-x-1/2 border-x border-b border-white/[0.07]" />
      <span className="absolute bottom-0 left-1/2 h-[13.6%] w-[48%] -translate-x-1/2 border-x border-t border-white/[0.07]" />
      <span className="absolute bottom-0 left-1/2 h-[4.8%] w-[22%] -translate-x-1/2 border-x border-t border-white/[0.07]" />
      <span className="absolute inset-x-0 top-[var(--pitch-y)] h-px bg-white/[0.07]" />
      <span className="absolute top-[var(--pitch-y)] left-1/2 size-[40cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

      <span className="absolute top-[var(--pitch-y)] left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[22cqw] leading-none font-semibold tracking-[-0.04em] text-white/90 [text-shadow:0_8px_40px_rgb(0_0_0/0.45)] transition-[scale] duration-700 ease-out group-hover:scale-110">
        {initials(name)}
      </span>
    </div>
  );
}
