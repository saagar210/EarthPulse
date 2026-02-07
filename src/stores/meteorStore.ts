import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ActiveShower } from "../types/meteor";

interface MeteorState {
  showers: ActiveShower[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useMeteorStore = create<MeteorState>((set) => ({
  showers: [],

  fetch: async () => {
    try {
      const showers = await invoke<ActiveShower[]>("get_meteors");
      set({ showers });
    } catch (e) {
      console.error("Failed to fetch meteor showers:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<ActiveShower[]>("meteors:update", (event) => {
      set({ showers: event.payload });
    });
    return unlisten;
  },
}));
