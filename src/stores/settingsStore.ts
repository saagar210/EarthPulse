import { create } from "zustand";

interface SettingsState {
  userLat: number;
  userLon: number;
  isOpen: boolean;
  notifyEarthquakes: boolean;
  notifyAurora: boolean;
  notifyVolcanoes: boolean;
  earthquakeMagThreshold: number;
  proximityRadius: number;
  sonificationEnabled: boolean;
  ollamaModel: string;
  setLocation: (lat: number, lon: number) => void;
  toggle: () => void;
  setNotifyEarthquakes: (v: boolean) => void;
  setNotifyAurora: (v: boolean) => void;
  setNotifyVolcanoes: (v: boolean) => void;
  setEarthquakeMagThreshold: (v: number) => void;
  setProximityRadius: (v: number) => void;
  toggleSonification: () => void;
  setOllamaModel: (v: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  userLat: 37.3382,
  userLon: -121.8863,
  isOpen: false,
  notifyEarthquakes: true,
  notifyAurora: true,
  notifyVolcanoes: true,
  earthquakeMagThreshold: 5.0,
  proximityRadius: 500,
  sonificationEnabled: false,
  ollamaModel: "llama3.2",
  setLocation: (lat, lon) => set({ userLat: lat, userLon: lon }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setNotifyEarthquakes: (v) => set({ notifyEarthquakes: v }),
  setNotifyAurora: (v) => set({ notifyAurora: v }),
  setNotifyVolcanoes: (v) => set({ notifyVolcanoes: v }),
  setEarthquakeMagThreshold: (v) => set({ earthquakeMagThreshold: v }),
  setProximityRadius: (v) => set({ proximityRadius: v }),
  toggleSonification: () => set((s) => ({ sonificationEnabled: !s.sonificationEnabled })),
  setOllamaModel: (v) => set({ ollamaModel: v }),
}));
