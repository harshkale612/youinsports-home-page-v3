/**
 * Per-frame globe state, held outside React on purpose.
 *
 * Scroll and drag both write here; the scene reads it inside `useFrame`. Going
 * through component state would re-render the tree on every scroll event and
 * every pointer move, which is exactly what makes scroll-driven WebGL janky.
 */
export type EarthMotion = {
  /** 0..1 across the whole scroll narrative. */
  scrollProgress: number;
  /** Additional Y rotation contributed by the user dragging, in radians. */
  dragRotationY: number;
  dragRotationX: number;
  /** Radians per second, decays after release to give the globe inertia. */
  dragVelocityY: number;
  dragVelocityX: number;
  isDragging: boolean;
  /**
   * Normalised pointer, -1..1. Steers the planet without a press, and drives
   * the camera and starfield parallax. Hover-capable pointers only.
   */
  pointerX: number;
  pointerY: number;
  /** Seconds since a user interaction — used to resume idle auto-rotation. */
  idleTime: number;
};

export const earthMotion: EarthMotion = {
  scrollProgress: 0,
  dragRotationY: 0,
  dragRotationX: 0,
  dragVelocityY: 0,
  dragVelocityX: 0,
  isDragging: false,
  pointerX: 0,
  pointerY: 0,
  idleTime: 0,
};

export function resetEarthMotion() {
  earthMotion.scrollProgress = 0;
  earthMotion.dragRotationY = 0;
  earthMotion.dragRotationX = 0;
  earthMotion.dragVelocityY = 0;
  earthMotion.dragVelocityX = 0;
  earthMotion.isDragging = false;
  earthMotion.idleTime = 0;
}
