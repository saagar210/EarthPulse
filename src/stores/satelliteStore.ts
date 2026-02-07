import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SatelliteData, SatellitePosition, OrbitTrack, PassPrediction } from "../types/satellite";

interface SatelliteState {
  positions: SatellitePosition[];
  orbits: OrbitTrack[];
  passes: PassPrediction[];
  nextPass: PassPrediction | null;
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useSatelliteStore = create<SatelliteState>((set) => ({
  positions: [],
  orbits: [],
  passes: [],
  nextPass: null,

  fetch: async () => {
    try {
      const [data, passes] = await Promise.all([
        invoke<SatelliteData>("get_satellite_positions"),
        invoke<PassPrediction[]>("get_pass_predictions"),
      ]);

      const now = Date.now() / 1000;
      const nextPass = passes.find((p) => p.start_time > now) ?? null;

      set({
        positions: data.positions,
        orbits: data.orbits,
        passes,
        nextPass,
      });
    } catch (e) {
      console.error("Failed to fetch satellite data:", e);
    }
  },

  startListening: async () => {
    const unsub1 = await listen<SatelliteData>("satellites:update", (event) => {
      set({
        positions: event.payload.positions,
        orbits: event.payload.orbits,
      });
    });

    const unsub2 = await listen<PassPrediction[]>("passes:update", (event) => {
      const now = Date.now() / 1000;
      const nextPass = event.payload.find((p) => p.start_time > now) ?? null;
      set({ passes: event.payload, nextPass });
    });

    return () => {
      unsub1();
      unsub2();
    };
  },
}));
