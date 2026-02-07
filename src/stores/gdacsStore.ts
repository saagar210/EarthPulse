import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { GdacsAlert } from "../types/gdacs";

interface GdacsState {
  alerts: GdacsAlert[];
  loading: boolean;
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useGdacsStore = create<GdacsState>((set) => ({
  alerts: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const alerts = await invoke<GdacsAlert[]>("get_gdacs_alerts");
      set({ alerts, loading: false });
    } catch (e) {
      console.error("Failed to fetch GDACS alerts:", e);
      set({ loading: false });
    }
  },

  startListening: async () => {
    const unlisten = await listen<GdacsAlert[]>("gdacs:update", (event) => {
      set({ alerts: event.payload });
    });
    return unlisten;
  },
}));
