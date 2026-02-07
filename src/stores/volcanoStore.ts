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
    } catch (e) {
      console.error("Failed to fetch volcano data:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<Volcano[]>("volcanoes:update", (event) => {
      set({ volcanoes: event.payload });
    });
    return unlisten;
  },
}));
