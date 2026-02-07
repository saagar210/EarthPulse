import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Volcano } from "../types/volcano";

interface VolcanoState {
  volcanoes: Volcano[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useVolcanoStore = create<VolcanoState>((set) => ({
  volcanoes: [],

  fetch: async () => {
    try {
      const volcanoes = await invoke<Volcano[]>("get_volcanoes");
      set({ volcanoes });
    } catch {
      // Volcano data not yet available
    }
  },

  startListening: async () => {
    const unlisten = await listen<Volcano[]>("volcanoes:update", (event) => {
      set({ volcanoes: event.payload });
    });
    return unlisten;
  },
}));
