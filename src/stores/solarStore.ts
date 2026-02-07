import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SolarData } from "../types/solar";

interface SolarState {
  kpIndex: number | null;
  kpTimestamp: string | null;
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useSolarStore = create<SolarState>((set) => ({
  kpIndex: null,
  kpTimestamp: null,

  fetch: async () => {
    try {
      const data = await invoke<SolarData>("get_solar_data");
      set({ kpIndex: data.kp_index, kpTimestamp: data.kp_timestamp });
    } catch {
      // Solar data not yet available
    }
  },

  startListening: async () => {
    const unlisten = await listen<SolarData>("solar:update", (event) => {
      set({
        kpIndex: event.payload.kp_index,
        kpTimestamp: event.payload.kp_timestamp,
      });
    });
    return unlisten;
  },
}));
