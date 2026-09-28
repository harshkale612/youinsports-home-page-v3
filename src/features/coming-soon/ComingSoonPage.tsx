"use client";

import { Fragment, useEffect, ViewTransition } from "react";
import { MotionConfig, motion, useMotionValue, useSpring, type Variants } from "motion/react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { Container } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ComingSoonHeadline } from "@/features/coming-soon/ComingSoonHeadline";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** Icons by name, so a Server Component page can pick one without passing a function. */
const ICONS = { arrow: ArrowRight, back: ArrowLeft, mail: Mail } as const;

export type ComingSoonAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  icon?: keyof typeof ICONS;
};

const DEFAULT_ACTIONS: ComingSoonAction[] = [
  { label: "Start your journey", href: "/", icon: "arrow" },
  { label: "About us", href: "/about", variant: "secondary" },
];

/** How far the stage leans towards the pointer, in degrees. */
const TILT = { x: 6, y: 9 };

/**
 * The page every unbuilt route shares while its real content is on the way.
 *
 * One composition, top to bottom: the page's own animated `visual` centred at
 * the top, then its name, "Coming soon.", a line on what's coming, and a way
 * back into the product — all over the site's stage light, with a dawn rising
 * on the horizon behind it.
 *
 * The visual lands first; the copy follows. A page whose visual has an
 * entrance of its own (the Chess ID board) holds `ready` false until that
 * entrance ends, and the copy plays the moment it flips.
 *
 * On client-side navigation the page also arrives through a view transition,
 * so moving between routes reads as one continuous move rather than a cut.
 */
export function ComingSoonPage({
  eyebrow,
  description,
  visual,
  visualClassName,
  ready = true,
  delay = 0.35,
  tilt = true,
  actions = DEFAULT_ACTIONS,
  note,
}: {
  /** The page's name, set small above the headline. */
  eyebrow: string;
  /** One or two sentences on what's coming. Plain text: it's revealed word by word. */
  description: string;
  /** The page's animated centrepiece. It fills the stage, which is square unless `visualClassName` says otherwise. */
  visual: React.ReactNode;
  visualClassName?: string;
  /** Holds the copy back until the visual's own entrance has finished. */
  ready?: boolean;
  /** Seconds between `ready` and the first line of copy. */
  delay?: number;
  /** Leans the stage towards the pointer. Off for visuals that do their own parallax. */
  tilt?: boolean;
  actions?: ComingSoonAction[];
  /** A small line under the actions, e.g. an address to write to in the meantime. */
  note?: React.ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 90, damping: 18, mass: 0.6 });
  const rotateY = useSpring(tiltY, { stiffness: 90, damping: 18, mass: 0.6 });

  useEffect(() => {
    trackEvent("coming_soon_viewed", { page: eyebrow });
  }, [eyebrow]);

  function handlePointerMove(event: React.PointerEvent) {
    // Reduced motion leaves the values at rest rather than unbinding them.
    if (!tilt || reducedMotion || event.pointerType !== "mouse") return;
    tiltY.set(((event.clientX / window.innerWidth) * 2 - 1) * TILT.y);
    tiltX.set(-((event.clientY / window.innerHeight) * 2 - 1) * TILT.x);
  }

  const words = description.split(" ");
  const line: Variants = {
    hidden: { opacity: 0, y: 16 },
    shown: (at: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease, delay: delay + at } }),
  };
  const word: Variants = {
    hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
    shown: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease, delay: delay + 0.75 + i * 0.028 },
    }),
  };
  const afterWords = 0.95 + words.length * 0.028;

  return (
    <MotionConfig reducedMotion="user">
      <SiteNav />

      <ViewTransition enter="page-in" exit="page-out" default="none">
        <main
          onPointerMove={handlePointerMove}
          className="relative isolate flex min-h-svh flex-col overflow-hidden"
        >
          <Backdrop />

          <Container className="relative flex flex-1 flex-col items-center justify-center pt-24 pb-28 text-center md:pt-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 28, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.3, ease }}
              style={{ rotateX, rotateY, transformPerspective: 1100 }}
              className={cn(
                "relative aspect-square w-[min(66vw,20rem,36svh)] md:w-[min(20rem,32svh)]",
                visualClassName,
              )}
            >
              {/* A pool of light the visual stands in. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-[22%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(240_107_40/0.16),rgb(44_143_227/0.08)_55%,transparent)]"
              />
              {visual}
            </motion.div>

            <motion.div initial="hidden" animate={ready ? "shown" : "hidden"} className="mt-8 flex flex-col items-center md:mt-9">
              <motion.p
                custom={0}
                variants={line}
                className="flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase"
              >
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange" aria-hidden />
                {eyebrow}
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange" aria-hidden />
              </motion.p>

              <ComingSoonHeadline play={ready} delay={delay + 0.1} className="mt-6" />

              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
                {words.map((text, i) => (
                  <Fragment key={i}>
                    <motion.span custom={i} variants={word} className="inline-block">
                      {text}
                    </motion.span>{" "}
                  </Fragment>
                ))}
              </p>

              <motion.div
                custom={afterWords}
                variants={line}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                {actions.map((action, i) => {
                  const Icon = action.icon ? ICONS[action.icon] : null;
                  const trailing = action.icon === "arrow";
                  return (
                    <ButtonLink
                      key={action.href}
                      href={action.href}
                      variant={action.variant ?? "primary"}
                      size="lg"
                      magnetic={i === 0}
                      onClick={() => trackEvent("coming_soon_cta_clicked", { page: eyebrow, target: action.label })}
                    >
                      {Icon && !trailing && <Icon className="size-3.5 shrink-0" aria-hidden />}
                      {action.label}
                      {Icon && trailing && (
                        <Icon
                          className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      )}
                    </ButtonLink>
                  );
                })}
              </motion.div>

              {note && (
                <motion.p custom={afterWords + 0.12} variants={line} className="mt-6 text-[0.88rem] text-faint">
                  {note}
                </motion.p>
              )}
            </motion.div>
          </Container>
        </main>
      </ViewTransition>
    </MotionConfig>
  );
}

/**
 * Stage light, a faint dotted field, and a dawn on the horizon: the rim of a
 * planet rising into frame, lit orange the way the homepage globe is — the
 * page's way of saying something is on its way.
 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(rgb(170_205_235/0.12)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_62%_55%_at_50%_38%,black,transparent_75%)]" />
      <div className="absolute top-[6%] -left-56 size-[44rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.12),transparent_62%)]" />
      <div className="absolute -top-56 -right-48 size-[48rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(44_143_227/0.13),transparent_62%)] [animation-delay:-9s]" />

      {/* Gradients, not a blurred box-shadow: a glow this large rasterises in
          tiles, and the tiles show. The planet covers the lower half of it. */}
      <motion.div
        initial={{ opacity: 0, y: 110 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.2, ease, delay: 0.25 }}
        className="absolute inset-x-0 bottom-0 h-[26rem]"
      >
        <div className="absolute top-[calc(100%-4rem)] left-1/2 h-[30rem] w-[max(170%,60rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(44_143_227/0.14),transparent)]" />
        <div className="absolute top-[calc(100%-4rem)] left-1/2 h-[16rem] w-[max(120%,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.36),rgb(240_107_40/0.08)_55%,transparent)]" />
        <div className="absolute top-[calc(100%-4rem)] left-1/2 aspect-square w-[max(160%,40rem)] -translate-x-1/2 rounded-full bg-void shadow-[inset_0_1px_0_rgb(255_138_76/0.7)]" />
      </motion.div>
    </div>
  );
}
