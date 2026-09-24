"use client";

import { create } from "zustand";
import type { EarthSceneState, Sport } from "@/types/network";

/**
 * Discrete experience state only.
 *
 * Anything that changes every frame — scroll progress, drag velocity, the live
 * rotation — deliberately lives in `earthMotion` instead, outside React, so the
 * globe can animate at 60fps without re-rendering a single component. The same
 * goes for `spotlight`: a section sets it once, not per frame.
 */
export type GlobalExperienceState = {
  selectedAthleteId: string | null;
  hoveredAthleteId: string | null;
  selectedSport: Sport | null;
  /** Transient preview while a sport pill is hovered; overrides the selection. */
  hoveredSport: Sport | null;
  selectedCountry: string | null;

  /**
   * Places a section wants lit on the globe, over and above the athlete
   * network — the countries where a sport is most played, say. Emphasised
   * rather than merged into the network, because they are a different claim:
   * a place the sport runs deep, not an athlete the platform holds.
   */
  spotlight: { latitude: number; longitude: number }[];

  earthScene: EarthSceneState;

  isSearchOpen: boolean;
  /** Set once the globe has actually painted, so the UI can reveal itself. */
  isSceneReady: boolean;

  /**
   * A request for the camera to fly to a point. `token` increments on every
   * request so repeating the same coordinates still re-triggers the flight.
   */
  focus: { latitude: number; longitude: number; token: number } | null;

  selectAthlete: (id: string | null) => void;
  hoverAthlete: (id: string | null) => void;
  selectSport: (sport: Sport | null) => void;
  hoverSport: (sport: Sport | null) => void;
  selectCountry: (code: string | null) => void;
  setSpotlight: (places: { latitude: number; longitude: number }[]) => void;
  setEarthScene: (scene: EarthSceneState) => void;
  setSearchOpen: (open: boolean) => void;
  setSceneReady: (ready: boolean) => void;
  focusOn: (latitude: number, longitude: number) => void;
};

export const useGlobalExperience = create<GlobalExperienceState>((set) => ({
  selectedAthleteId: null,
  hoveredAthleteId: null,
  selectedSport: null,
  hoveredSport: null,
  selectedCountry: null,
  spotlight: [],

  earthScene: "hero",

  isSearchOpen: false,
  isSceneReady: false,
  focus: null,

  selectAthlete: (id) => set({ selectedAthleteId: id }),
  hoverAthlete: (id) => set({ hoveredAthleteId: id }),
  selectSport: (sport) =>
    // Re-clicking the active sport clears the filter rather than doing nothing.
    set((s) => ({ selectedSport: s.selectedSport === sport ? null : sport })),
  hoverSport: (sport) => set({ hoveredSport: sport }),
  selectCountry: (code) => set({ selectedCountry: code }),
  setSpotlight: (places) => set({ spotlight: places }),
  setEarthScene: (scene) =>
    set((s) =>
      s.earthScene === scene
        ? s
        : // Crossing into a new act releases any pinned athlete, so the card
          // never lingers over a section it isn't about.
          { earthScene: scene, selectedAthleteId: null, hoveredAthleteId: null },
    ),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSceneReady: (ready) => set({ isSceneReady: ready }),
  focusOn: (latitude, longitude) =>
    set((s) => ({
      focus: { latitude, longitude, token: (s.focus?.token ?? 0) + 1 },
    })),
}));
