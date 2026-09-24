"use client";

import { useEffect, useRef } from "react";
import { earthMotion } from "@/scenes/earth/earth-motion";
import { findMarkerNear } from "@/scenes/earth/marker-registry";

/** Anything matching this owns its own pointer behaviour and must not drag the globe. */
const UI_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [role="link"], [data-globe-ignore]';

const DRAG_SENSITIVITY = 0.0042;
const TAP_THRESHOLD_PX = 6;

export type GlobePointer = { x: number; y: number; active: boolean };

/**
 * Pointer handling for the globe, bound to the window rather than the canvas.
 *
 * The canvas sits behind the whole page with `pointer-events: none` so the
 * content above it stays fully interactive. Listening at the window and ignoring
 * anything that starts on a UI element means the user can drag the planet from
 * any empty part of the page, which is far better than confining it to a box.
 */
export function useGlobeInteraction({
  enabled,
  onSelectAthlete,
}: {
  enabled: boolean;
  onSelectAthlete: (id: string) => void;
}) {
  const pointer = useRef<GlobePointer>({ x: 0, y: 0, active: false });
  const dragState = useRef({
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    lastTime: 0,
    moved: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    function isOverUi(target: EventTarget | null) {
      return target instanceof Element && target.closest(UI_SELECTOR) !== null;
    }

    function handlePointerMove(event: PointerEvent) {
      // Only hover-capable pointers steer the globe and drive marker hover;
      // touch selects on tap. A finger would otherwise leave the planet leaning
      // toward wherever it last lifted off.
      if (event.pointerType !== "touch") {
        earthMotion.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        earthMotion.pointerY = (event.clientY / window.innerHeight) * 2 - 1;

        pointer.current.x = event.clientX;
        pointer.current.y = event.clientY;
        pointer.current.active = !isOverUi(event.target);
      }

      const drag = dragState.current;
      if (drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      const now = performance.now();
      const dt = Math.max((now - drag.lastTime) / 1000, 1 / 240);

      earthMotion.dragRotationY += dx * DRAG_SENSITIVITY;
      earthMotion.dragRotationX += dy * DRAG_SENSITIVITY * 0.55;
      // Velocity is sampled from the last frame of movement, which is what the
      // inertia on release is integrated from.
      earthMotion.dragVelocityY = (dx * DRAG_SENSITIVITY) / dt;
      earthMotion.dragVelocityX = (dy * DRAG_SENSITIVITY * 0.55) / dt;
      earthMotion.idleTime = 0;

      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTime = now;
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (isOverUi(event.target)) return;

      dragState.current = {
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        lastTime: performance.now(),
        moved: 0,
      };
      earthMotion.isDragging = true;
      earthMotion.dragVelocityY = 0;
      earthMotion.dragVelocityX = 0;
      earthMotion.idleTime = 0;
      document.body.dataset.globeDragging = "true";
    }

    function handlePointerUp(event: PointerEvent) {
      const drag = dragState.current;
      if (drag.pointerId !== event.pointerId) return;

      earthMotion.isDragging = false;
      drag.pointerId = -1;
      delete document.body.dataset.globeDragging;

      // A press that barely moved is a tap, not a drag — resolve it against the
      // markers. This is what makes marker selection work identically on touch.
      const travel =
        Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY);
      if (travel <= TAP_THRESHOLD_PX && !isOverUi(event.target)) {
        const hit = findMarkerNear(event.clientX, event.clientY, 30);
        if (hit) onSelectAthlete(hit);
      }
    }

    function handlePointerLeave() {
      pointer.current.active = false;
      // Settle back to neutral rather than holding the lean the cursor had when
      // it left the window.
      earthMotion.pointerX = 0;
      earthMotion.pointerY = 0;
    }

    document.body.dataset.globeInteractive = "true";

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("pointerleave", handlePointerLeave);
      earthMotion.isDragging = false;
      delete document.body.dataset.globeInteractive;
      delete document.body.dataset.globeDragging;
    };
  }, [enabled, onSelectAthlete]);

  return pointer;
}
