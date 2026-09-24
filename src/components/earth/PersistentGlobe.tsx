"use client";

import dynamic from "next/dynamic";
import { useGlobalExperience } from "@/stores/globalExperienceStore";

/**
 * A CSS stand-in for the planet, shown until the canvas has painted.
 *
 * The hero copy, navigation and background are all real HTML that render
 * immediately; this keeps the composition intact during those first frames
 * rather than leaving a hole where the globe will be.
 */
function GlobePlaceholder() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 aspect-square w-[min(120vh,120vw)] -translate-1/2 rounded-full opacity-70 transition-opacity duration-700 md:left-[68%]"
        style={{
          background:
            "radial-gradient(circle at 38% 34%, rgba(60,150,230,0.3), rgba(10,47,66,0.66) 46%, rgba(3,11,18,0) 68%)",
          filter: "blur(28px)",
        }}
      />
    </div>
  );
}

const FlatGlobe = dynamic(() => import("@/scenes/earth/FlatGlobe"), {
  // The globe rasterises a land bitmap from a canvas on mount, which has no
  // server equivalent. Deferring it also keeps it off the critical path — the
  // page is readable long before the planet paints.
  ssr: false,
  loading: () => <GlobePlaceholder />,
});

/**
 * The fixed layer the entire page is composed over.
 *
 * `pointer-events: none` is deliberate: interaction is resolved at the window
 * level by `useGlobeInteraction`, which lets the user drag the planet from any
 * empty area while every link, button and card above stays clickable.
 */
export function PersistentGlobe() {
  const isSceneReady = useGlobalExperience((s) => s.isSceneReady);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      data-globe-layer
    >
      {!isSceneReady && <GlobePlaceholder />}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: isSceneReady ? 1 : 0 }}
      >
        <FlatGlobe />
      </div>
    </div>
  );
}
