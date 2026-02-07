import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { PlateBoundary } from "../types/plate";

interface PlateState {
  boundaries: PlateBoundary[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const usePlateStore = create<PlateState>((set) => ({
  boundaries: [],

  fetch: async () => {
    try {
      const boundaries = await invoke<PlateBoundary[]>("get_plates");
      set({ boundaries });
    } catch (e) {
      console.error("Failed to fetch plate boundaries:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<PlateBoundary[]>("plates:update", (event) => {
      set({ boundaries: event.payload });
    });
    return unlisten;
  },
}));
