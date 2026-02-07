import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Weather } from "../types/weather";

interface WeatherState {
  weather: Weather | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (lat: number, lon: number) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  loading: false,
  error: null,

  fetchWeather: async (lat: number, lon: number) => {
    set({ loading: true, error: null });
    try {
      const weather = await invoke<Weather>("get_weather", { lat, lon });
      set({ weather, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
