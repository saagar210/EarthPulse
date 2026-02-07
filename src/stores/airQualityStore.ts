import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { AirQuality } from "../types/air_quality";

interface AirQualityState {
  airQuality: AirQuality | null;
  loading: boolean;
  error: string | null;
  fetchAirQuality: (lat: number, lon: number) => Promise<void>;
}

export const useAirQualityStore = create<AirQualityState>((set) => ({
  airQuality: null,
  loading: false,
  error: null,

  fetchAirQuality: async (lat: number, lon: number) => {
    set({ loading: true, error: null });
    try {
      const airQuality = await invoke<AirQuality>("get_air_quality", { lat, lon });
      set({ airQuality, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
