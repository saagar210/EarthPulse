import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeState {
  earthquakes: Earthquake[];
  lastUpdate: number | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useEarthquakeStore = create<EarthquakeState>((set) => ({
  earthquakes: [],
  lastUpdate: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const quakes = await invoke<Earthquake[]>("get_earthquakes");
      set({ earthquakes: quakes, lastUpdate: Date.now(), loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  startListening: async () => {
    const unlisten = await listen<Earthquake[]>(
      "earthquakes:update",
      (event) => {
        set({
          earthquakes: event.payload,
          lastUpdate: Date.now(),
        });
      },
    );
    return unlisten;
  },
}));
