import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SolarData } from "../types/solar";

const MAX_KP_HISTORY = 48;

interface SolarState {
  kpIndex: number | null;
  kpTimestamp: string | null;
  kpHistory: { time: number; value: number }[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useSolarStore = create<SolarState>((set) => ({
  kpIndex: null,
  kpTimestamp: null,
  kpHistory: [],

  fetch: async () => {
    try {
      const data = await invoke<SolarData>("get_solar_data");
      set((state) => {
        const entry = { time: Date.now(), value: data.kp_index };
        const history = [...state.kpHistory, entry].slice(-MAX_KP_HISTORY);
        return {
          kpIndex: data.kp_index,
          kpTimestamp: data.kp_timestamp,
          kpHistory: history,
        };
      });
    } catch (e) {
      console.error("Failed to fetch solar data:", e);
    }
  },

  startListening: async () => {
    const unlisten = await listen<SolarData>("solar:update", (event) => {
      set((state) => {
        const entry = { time: Date.now(), value: event.payload.kp_index };
        const history = [...state.kpHistory, entry].slice(-MAX_KP_HISTORY);
        return {
          kpIndex: event.payload.kp_index,
          kpTimestamp: event.payload.kp_timestamp,
          kpHistory: history,
        };
      });
    });
    return unlisten;
  },
}));
