import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { NaturalEvent } from "../types/eonet";

interface EonetState {
  events: NaturalEvent[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useEonetStore = create<EonetState>((set) => ({
  events: [],

  fetch: async () => {
    try {
      const events = await invoke<NaturalEvent[]>("get_eonet_events");
      set({ events });
    } catch (e) {
      console.error("Failed to fetch EONET events:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<NaturalEvent[]>(
      "eonet:update",
      (event) => {
        set({ events: event.payload });
      },
    );
    return unlisten;
  },
}));
