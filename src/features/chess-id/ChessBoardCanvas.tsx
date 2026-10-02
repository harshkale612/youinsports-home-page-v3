"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import type { ChessBoardScene } from "@/scenes/chess/ChessBoardScene";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * The 3D board, driven by the story's scroll progress.
 *
 * three.js is loaded with the scene rather than with the page, so the copy
 * paints first and the board fades in behind it once its first frame is ready.
 * The canvas is created per mount, not rendered by React, so a remount always
 * gets a fresh WebGL context instead of reusing a disposed one.
 *
 * `headroom` is the height of the stage's title, in pixels; the opening shot
 * frames the board below it.
 */
export function ChessBoardCanvas({
  progress,
  headroom = 0,
  className,
}: {
  progress: MotionValue<number>;
  headroom?: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ChessBoardScene | null>(null);
  // Read when the scene is created, so a change of title size never rebuilds it.
  const headroomRef = useRef(headroom);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    headroomRef.current = headroom;
    sceneRef.current?.setHeadroom(headroom);
  }, [headroom]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let teardown = () => {};

    import("@/scenes/chess/ChessBoardScene")
      .then(({ ChessBoardScene }) => {
        if (cancelled) return;

        const canvas = document.createElement("canvas");
        canvas.className = "block size-full";
        host.appendChild(canvas);

        let scene: ChessBoardScene;
        try {
          scene = new ChessBoardScene(canvas, {
            reducedMotion,
            onReady: () => setStatus("ready"),
          });
        } catch {
          canvas.remove();
          setStatus("failed");
          return;
        }
        sceneRef.current = scene;
        scene.setHeadroom(headroomRef.current);
        scene.resize(host.clientWidth, host.clientHeight);
        scene.setProgress(progress.get(), true);

        const resizer = new ResizeObserver(([entry]) => {
          scene.resize(entry.contentRect.width, entry.contentRect.height);
        });
        resizer.observe(host);

        // Only spend frames while the board is actually on screen.
        let onScreen = false;
        const sync = () => scene.setRunning(onScreen && document.visibilityState === "visible");
        const observer = new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        });
        observer.observe(host);
        document.addEventListener("visibilitychange", sync);

        const onPointer = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          scene.setPointer(
            (event.clientX / window.innerWidth) * 2 - 1,
            (event.clientY / window.innerHeight) * 2 - 1,
          );
        };
        window.addEventListener("pointermove", onPointer, { passive: true });

        teardown = () => {
          observer.disconnect();
          resizer.disconnect();
          document.removeEventListener("visibilitychange", sync);
          window.removeEventListener("pointermove", onPointer);
          scene.dispose();
          canvas.remove();
          sceneRef.current = null;
        };
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [progress, reducedMotion]);

  useMotionValueEvent(progress, "change", (value) => sceneRef.current?.setProgress(value));

  return (
    <div className={cn("relative", className)} aria-hidden>
      <div
        ref={hostRef}
        className={cn(
          "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
          status === "ready" ? "opacity-100" : "opacity-0",
        )}
      />
      {status === "failed" && <FlatBoard />}
    </div>
  );
}

/** Without WebGL: the same board, flat, tilted with CSS. */
function FlatBoard() {
  return (
    <div className="absolute inset-x-0 bottom-[8%] flex justify-center perspective-[1200px]">
      <div className="grid w-[min(70vw,34rem)] rotate-x-[58deg] grid-cols-8 overflow-hidden rounded-xl border-[10px] border-[#0a1822] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square",
              (Math.floor(i / 8) + i) % 2 === 0 ? "bg-[#94a2af]" : "bg-[#14314a]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
