"use client";

import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { motion } from "motion/react";
import { MousePointerClick, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/data/countries";
import { getSportConfig } from "@/data/sports";
import {
  GLOBAL_PARTICIPATION,
  MAX_PLAYERS,
  basisLabel,
  formatPlayers,
  type SportParticipation,
} from "@/data/global-participation";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { damp } from "@/scenes/earth/flat-earth";
import { getFlatFraming } from "@/scenes/earth/scene-framing";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { useJourney } from "@/stores/journeyStore";
import { trackEvent } from "@/lib/analytics";
import type { Sport } from "@/types/athlete";
import { cn } from "@/lib/utils";

/** Largest first, so the orbit and the mobile strip both read as a ranking. */
export const RANKED_SPORTS = [...GLOBAL_PARTICIPATION].sort((a, b) => b.players - a.players);

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

/** Below this width the planet sits under the copy and there is no room for a ring. */
const ORBIT_MIN_WIDTH = 860;

/** One revolution of the ring, in seconds. Slow enough to read a label in passing. */
const ORBIT_PERIOD = 140;

/** Tilt of the ring against the horizon, in degrees. */
const RING_TILT = -13;

/** Must match the globe's own parallax, so the ring stays on the planet. */
const PARALLAX_X = 22;
const PARALLAX_Y = 15;

const CARD_WIDTH = 300;

const DEG = Math.PI / 180;

/** Marks the chips and the card, so a click on either doesn't count as "outside". */
const ORBIT_UI_ATTR = "data-sport-orbit-ui";

/**
 * The point on the globe a set of places is best seen from.
 *
 * Longitudes are averaged as vectors rather than as numbers — the plain mean of
 * Japan (139°) and the UK (-0.1°) is the middle of Asia, which faces neither.
 */
function viewpointFor(places: { latitude: number; longitude: number }[]) {
  if (places.length === 0) return null;

  let x = 0;
  let y = 0;
  let latitude = 0;

  for (const place of places) {
    const weight = Math.cos(place.latitude * DEG);
    x += Math.cos(place.longitude * DEG) * weight;
    y += Math.sin(place.longitude * DEG) * weight;
    latitude += place.latitude;
  }

  if (x === 0 && y === 0) return null;
  return { latitude: latitude / places.length, longitude: Math.atan2(y, x) / DEG };
}

function strongholdsOf(entry: SportParticipation) {
  return entry.strongholds
    .map((code) => COUNTRY_BY_CODE.get(code))
    .filter((country) => country !== undefined);
}

function entryFor(sport: Sport | null) {
  return sport ? (RANKED_SPORTS.find((e) => e.sport === sport) ?? null) : null;
}

/**
 * Shows a sport on the planet while it is active: the network tinted in the
 * brand orange, the countries it runs deepest in lit, and the globe turned to
 * face them.
 *
 * `hoverSport` rather than `selectSport`: this is a preview, not a commitment,
 * so it never overwrites the filter set by answering the questions.
 */
export function useSportPreview(sport: Sport | null) {
  useEffect(() => {
    const entry = entryFor(sport);
    if (!entry) return;

    const { setSpotlight, hoverSport, focusOn } = useGlobalExperience.getState();
    const places = strongholdsOf(entry).map((c) => ({ latitude: c.latitude, longitude: c.longitude }));

    setSpotlight(places);
    hoverSport(entry.sport);
    const viewpoint = viewpointFor(places);
    if (viewpoint) focusOn(viewpoint.latitude, viewpoint.longitude);

    return () => {
      const state = useGlobalExperience.getState();
      state.setSpotlight([]);
      state.hoverSport(null);
    };
  }, [sport]);
}

/**
 * A sport and how many people play it, as a glass pill in the brand colours:
 * blue at rest, orange once it has the stage.
 * Shared by the orbit and the mobile strip.
 */
export function SportChip({
  entry,
  active = false,
  pressed,
  className,
  style,
  ref,
  decorative = false,
  onHover,
  onPress,
}: {
  entry: SportParticipation;
  active?: boolean;
  /** Set when the chip toggles a pinned selection; exposed as `aria-pressed`. */
  pressed?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLButtonElement>;
  /** A visual duplicate (the marquee's second copy): hidden from assistive tech. */
  decorative?: boolean;
  onHover?: (sport: Sport | null) => void;
  onPress?: (sport: Sport) => void;
}) {
  const config = getSportConfig(entry.sport);
  const Icon = config.icon;

  return (
    <button
      ref={ref}
      type="button"
      onPointerEnter={() => onHover?.(entry.sport)}
      onPointerLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(entry.sport)}
      onBlur={() => onHover?.(null)}
      onClick={() => onPress?.(entry.sport)}
      aria-label={`${config.label}: about ${formatPlayers(entry.players)} players worldwide`}
      aria-pressed={pressed}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      {...{ [ORBIT_UI_ATTR]: "" }}
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 whitespace-nowrap backdrop-blur-md",
        "transition-[border-color,background-color,box-shadow] duration-300",
        "hover:border-accent/60 hover:bg-[rgba(10,32,48,0.92)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active
          ? "border-orange/70 bg-[rgba(8,28,42,0.94)] shadow-[0_0_36px_-4px_rgb(240_107_40/0.55)]"
          : "border-white/[0.1] bg-[rgba(5,19,30,0.7)] shadow-[0_14px_40px_-18px_rgba(0,0,0,0.9)] data-[front=true]:border-white/[0.22]",
        className,
      )}
      style={style}
      data-globe-ignore
    >
      <span
        className={cn(
          "relative flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-300",
          active ? "bg-orange-soft text-orange-strong ring-orange-line" : "bg-accent-soft text-accent-strong ring-accent-line",
        )}
      >
        {/* A beacon on the chip passing the front of the planet: the one cue
            that these are things to press, not labels to read. */}
        <span
          aria-hidden
          className="absolute inset-0 hidden rounded-full ring-[1.5px] ring-accent group-data-[front=true]:block group-data-[front=true]:animate-pulse-ring"
        />
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="tabular font-display text-[0.95rem] font-semibold tracking-tight text-fg">
          {formatPlayers(entry.players)}
        </span>
        <span className="mt-1 font-display text-[0.55rem] font-semibold tracking-[0.18em] text-muted uppercase transition-colors group-hover:text-fg">
          {config.label}
        </span>
      </span>
    </button>
  );
}

/**
 * Everything about one sport: the figure, what it counts, where the sport runs
 * deepest, and a way straight into the journey with it already chosen.
 */
export function SportDetailCard({
  entry,
  onClose,
  onStart,
  className,
  ref,
}: {
  entry: SportParticipation;
  onClose: () => void;
  onStart: () => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const config = getSportConfig(entry.sport);
  const Icon = config.icon;
  const setSport = useJourney((s) => s.setSport);
  const countries = strongholdsOf(entry);
  const shown = countries.slice(0, 6);

  return (
    <div
      ref={ref}
      {...{ [ORBIT_UI_ATTR]: "" }}
      className={cn(
        "rounded-2xl border border-orange/25 bg-[rgba(5,19,30,0.9)] p-5 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
        className,
      )}
      data-globe-ignore
      role="dialog"
      aria-label={`${config.label} worldwide`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-orange-soft text-orange-strong">
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-fg">{config.label}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-white/10 text-faint transition-colors hover:border-white/25 hover:text-fg"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>

      <p className="mt-4 flex items-baseline gap-2">
        <span className="tabular font-display text-4xl leading-none font-semibold tracking-tight text-fg">
          {formatPlayers(entry.players)}
        </span>
        <span className="text-xs text-muted">players worldwide</span>
      </p>
      <p className="mt-2 text-[0.72rem] leading-relaxed text-faint">
        {entry.counts} · {basisLabel(entry.basis)}
      </p>

      {shown.length > 0 && (
        <div className="mt-4 border-t border-white/[0.08] pt-3">
          <p className="font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase">
            Strongest in
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {shown.map((country) => (
              <li
                key={country.code}
                className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2 py-1 text-[0.68rem] text-muted"
              >
                <span aria-hidden>{country.flag}</span>
                {country.name}
              </li>
            ))}
            {countries.length > shown.length && (
              <li className="px-1 py-1 text-[0.68rem] text-faint">+{countries.length - shown.length}</li>
            )}
          </ul>
        </div>
      )}

      <Button
        size="sm"
        showArrow
        className="mt-5 w-full"
        onClick={() => {
          setSport(entry.sport);
          onStart();
        }}
      >
        Start with {config.label.toLowerCase()}
      </Button>
    </div>
  );
}

type Geometry = { cx: number; cy: number; rx: number; ry: number; radius: number; width: number; height: number };

function measure(): Geometry | null {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < ORBIT_MIN_WIDTH) return null;

  const { cx, cy, radius } = getFlatFraming("hero", width, height);
  // Wide enough to clear the disc, but never so wide the right-hand chips run
  // off the screen or the left-hand ones reach into the headline.
  const rx = Math.max(radius * 1.12, Math.min(radius * 1.36, width - cx - 78));
  return { cx, cy, rx, ry: radius * 0.52, radius, width, height };
}

/** An elliptical arc of the ring, from angle a to b (radians, screen-space). */
function arc(rx: number, ry: number, from: number, to: number) {
  const x0 = rx * Math.cos(from);
  const y0 = ry * Math.sin(from);
  const x1 = rx * Math.cos(to);
  const y1 = ry * Math.sin(to);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/**
 * Every sport, and how many people play it, orbiting the planet in the hero.
 *
 * A tilted ring around the globe carries one chip per sport. Chips on the near
 * side of the ring are bright and full size; on the far side they shrink and
 * dim so they read as passing behind the planet.
 *
 * Hovering a chip previews the sport on the globe; clicking pins it, stops the
 * orbit and opens a card beside the chip with the sport's detail and a way
 * straight into the journey. The chip crossing the front of the planet carries
 * a beacon, so the ring reads as something to press rather than decoration.
 *
 * Like the globe, positions are written straight to the DOM from an animation
 * frame rather than through React state.
 */
export function HeroSportsOrbit({ onStart }: { onStart: () => void }) {
  const earthScene = useGlobalExperience((s) => s.earthScene);
  const isSceneReady = useGlobalExperience((s) => s.isSceneReady);
  const reducedMotion = usePrefersReducedMotion();

  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [hoverTarget, setHovered] = useState<Sport | null>(null);
  const [pinTarget, setPinned] = useState<Sport | null>(null);

  const ringRef = useRef<SVGGElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoveredRef = useRef<Sport | null>(null);
  const pinnedRef = useRef<Sport | null>(null);
  const reducedMotionRef = useRef(reducedMotion);

  const visible = earthScene === "hero" && isSceneReady && geometry !== null;
  // Leaving the hero drops any hover or pin — the pointer may never get a leave
  // event from a chip that faded out from under it.
  const hovered = visible ? hoverTarget : null;
  const pinned = visible ? pinTarget : null;
  // The pinned sport stays on the globe; hovering another previews over it.
  const active = hovered ?? pinned;

  useSportPreview(active);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    hoveredRef.current = hovered;
    pinnedRef.current = pinned;
  }, [reducedMotion, hovered, pinned]);

  useEffect(() => {
    const update = () => setGeometry(measure());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // --- Dismissal: Escape, or a press anywhere outside the chips and card ------
  useEffect(() => {
    if (!pinned) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPinned(null);
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest(`[${ORBIT_UI_ATTR}]`)) return;
      setPinned(null);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pinned]);

  const togglePin = (sport: Sport) => {
    setPinned((current) => (current === sport ? null : sport));
    trackEvent("sport_explored");
  };

  // --- The orbit -----------------------------------------------------------
  useEffect(() => {
    if (!geometry) return;
    const { cx, cy, rx, ry, radius, width, height } = geometry;

    const tilt = RING_TILT * DEG;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const count = RANKED_SPORTS.length;

    let phase = 0;
    let speed = 1;
    let zoom = 1;
    let parallaxX = 0;
    let parallaxY = 0;
    let lastTime = 0;
    let frame = 0;
    let lastFront = -1;

    function render(time: number) {
      frame = requestAnimationFrame(render);
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.12) : 0;
      lastTime = time;

      const still = reducedMotionRef.current;
      const hoveredSport = hoveredRef.current;
      const pinnedSport = pinnedRef.current;
      const focused = hoveredSport ?? pinnedSport;

      speed = damp(speed, focused || still ? 0 : 1, 3.5, delta);
      phase += ((delta * Math.PI * 2) / ORBIT_PERIOD) * speed;

      // Clicking a marker draws the globe in; the ring follows it.
      const targetZoom = useGlobalExperience.getState().selectedAthleteId ? 1 / 0.84 : 1;
      zoom = damp(zoom, targetZoom, 2, delta);

      parallaxX = damp(parallaxX, still ? 0 : -earthMotion.pointerX * PARALLAX_X, 2.2, delta);
      parallaxY = damp(parallaxY, still ? 0 : -earthMotion.pointerY * PARALLAX_Y, 2.2, delta);

      const ox = cx + parallaxX;
      const oy = cy + parallaxY;

      ringRef.current?.setAttribute(
        "transform",
        `translate(${ox.toFixed(1)} ${oy.toFixed(1)}) rotate(${RING_TILT}) scale(${zoom.toFixed(4)})`,
      );

      if (readoutRef.current) {
        const y = Math.min(oy + radius * zoom + 30, height - 64);
        readoutRef.current.style.transform = `translate3d(${ox.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateX(-50%)`;
      }

      let front = -1;
      let frontDepth = -Infinity;

      for (let i = 0; i < count; i++) {
        const chip = chipRefs.current[i];
        if (!chip) continue;

        const angle = (i / count) * Math.PI * 2 + phase;
        const lx = rx * zoom * Math.cos(angle);
        const ly = ry * zoom * Math.sin(angle);
        const x = ox + lx * cosT - ly * sinT;
        const y = oy + lx * sinT + ly * cosT;

        // +1 on the near side of the ring (below the equator), -1 behind.
        const depth = Math.sin(angle);
        const near = (depth + 1) / 2;
        const entry = RANKED_SPORTS[i];
        const isFocused = entry.sport === hoveredSport || entry.sport === pinnedSport;

        if (depth > frontDepth) {
          frontDepth = depth;
          front = i;
        }

        // The biggest sports carry a slightly bigger chip — the ranking is in
        // the numbers, this only echoes it.
        const weight = 0.9 + 0.16 * Math.sqrt(entry.players / MAX_PLAYERS);
        const scale = weight * (0.72 + 0.28 * near) * (isFocused ? 1.1 : 1);
        const opacity = isFocused ? 1 : focused ? 0.3 + 0.25 * near : 0.42 + 0.58 * near * near;

        chip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        chip.style.opacity = opacity.toFixed(3);
        chip.style.zIndex = isFocused ? "40" : String(Math.round(near * 30));

        // The card hangs off the pinned chip: above it on the near side of the
        // ring, below it on the far side, flipped and clamped to stay on screen.
        const card = cardRef.current;
        if (card && entry.sport === pinnedSport) {
          const cardHeight = card.offsetHeight;
          const chipHalf = (chip.offsetHeight * scale) / 2;
          let top = depth > 0 ? y - chipHalf - 14 - cardHeight : y + chipHalf + 14;
          if (top < 84) top = y + chipHalf + 14;
          if (top + cardHeight > height - 16) top = y - chipHalf - 14 - cardHeight;
          top = Math.min(Math.max(top, 84), height - 16 - cardHeight);
          const left = Math.min(Math.max(x - CARD_WIDTH / 2, 16), width - 16 - CARD_WIDTH);
          card.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
        }
      }

      // Only one beacon at a time, and none while a sport has the stage.
      const beacon = focused ? -1 : front;
      if (beacon !== lastFront) {
        if (lastFront >= 0) chipRefs.current[lastFront]?.removeAttribute("data-front");
        if (beacon >= 0) chipRefs.current[beacon]?.setAttribute("data-front", "true");
        lastFront = beacon;
      }
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [geometry]);

  if (!geometry) return null;

  const { rx, ry } = geometry;
  const hoveredEntry = entryFor(hovered);
  const pinnedEntry = entryFor(pinned);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-20 transition-opacity ease-out",
        visible ? "opacity-100 delay-300 duration-1000" : "opacity-0 duration-300",
      )}
      aria-hidden={!visible}
    >
      <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="orbit-front" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
            <stop offset="0.5" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.55 }} />
            <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <g ref={ringRef}>
          {/* Far side: faint and dashed, so it reads as passing behind. */}
          <path
            d={arc(rx, ry, Math.PI, Math.PI * 2)}
            fill="none"
            stroke="rgba(244,247,252,0.13)"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
          {/* Near side: a lit arc with a soft glow under it. */}
          <path
            d={arc(rx, ry, 0, Math.PI)}
            fill="none"
            stroke="url(#orbit-front)"
            strokeWidth={6}
            opacity={0.25}
            style={{ filter: "blur(4px)" }}
          />
          <path d={arc(rx, ry, 0, Math.PI)} fill="none" stroke="url(#orbit-front)" strokeWidth={1.25} />
          {/* A second, wider ring for depth. */}
          <ellipse
            rx={rx * 1.14}
            ry={ry * 1.2}
            fill="none"
            stroke="rgba(244,247,252,0.05)"
            strokeWidth={1}
          />
        </g>
      </svg>

      {RANKED_SPORTS.map((entry, i) => (
        <SportChip
          key={entry.sport}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          entry={entry}
          active={entry.sport === active}
          pressed={entry.sport === pinned}
          onHover={setHovered}
          onPress={togglePin}
          className={cn(
            "absolute top-0 left-0 will-change-transform",
            visible ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{ opacity: 0 }}
        />
      ))}

      {pinnedEntry && (
          <div
            ref={cardRef}
            className="pointer-events-auto absolute top-0 left-0 z-50 will-change-transform"
            style={{ width: CARD_WIDTH }}
          >
            <motion.div
              key={pinnedEntry.sport}
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <SportDetailCard entry={pinnedEntry} onClose={() => setPinned(null)} onStart={onStart} />
            </motion.div>
          </div>
        )}

      {/* The call to interact, and the hover readout once someone does. What
          the number counts is always one gesture away — no global census of
          sport exists. Hidden while a card is open: the card says it all. */}
      <div
        ref={readoutRef}
        className={cn(
          "absolute top-0 left-0 w-max max-w-[24rem] text-center transition-opacity duration-300 will-change-transform",
          pinnedEntry ? "opacity-0" : "opacity-100",
        )}
      >
        {hoveredEntry ? (
          <>
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.24em] text-fg uppercase">
              {getSportConfig(hoveredEntry.sport).label} · {formatPlayers(hoveredEntry.players)} players
            </p>
            <p className="mt-1.5 text-[0.72rem] leading-relaxed text-faint">
              {hoveredEntry.counts} · {basisLabel(hoveredEntry.basis)} · Click for more
            </p>
          </>
        ) : (
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[rgba(5,19,30,0.6)] py-2 pr-4 pl-2.5 backdrop-blur-md">
            <span className="relative flex size-5 items-center justify-center rounded-full bg-accent-soft text-accent">
              <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full ring-1 ring-accent" />
              <MousePointerClick className="size-3" aria-hidden />
            </span>
            <span className="font-display text-[0.6rem] font-semibold tracking-[0.2em] text-muted uppercase">
              Click a sport to explore it
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
