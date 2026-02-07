import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SolarActivity } from "../types/solar_event";

interface SolarEventState {
  flares: SolarActivity["flares"];
  cmes: SolarActivity["cmes"];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useSolarEventStore = create<SolarEventState>((set) => ({
  flares: [],
  cmes: [],

  fetch: async () => {
    try {
      const data = await invoke<SolarActivity>("get_solar_activity");
      set({ flares: data.flares, cmes: data.cmes });
    } catch (e) {
      console.error("Failed to fetch solar activity:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<SolarActivity>(
      "solar_activity:update",
      (event) => {
        set({
          flares: event.payload.flares,
          cmes: event.payload.cmes,
        });
      },
    );
    return unlisten;
  },
}));
