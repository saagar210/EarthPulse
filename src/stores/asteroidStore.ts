import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Asteroid } from "../types/asteroid";

interface AsteroidState {
  asteroids: Asteroid[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useAsteroidStore = create<AsteroidState>((set) => ({
  asteroids: [],

  fetch: async () => {
    try {
      const asteroids = await invoke<Asteroid[]>("get_asteroids");
      set({ asteroids });
    } catch (e) {
      console.error("Failed to fetch asteroids:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<Asteroid[]>("asteroids:update", (event) => {
      set({ asteroids: event.payload });
    });
    return unlisten;
  },
}));
