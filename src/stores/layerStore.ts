import { create } from "zustand";

interface LayerState {
  earthquakes: boolean;
  earthquakeHeatmap: boolean;
  iss: boolean;
  dayNight: boolean;
  aurora: boolean;
  volcanoes: boolean;
  hazards: boolean;
  satellites: boolean;
  plates: boolean;
  wildfires: boolean;
  meteors: boolean;
  watchlists: boolean;
  toggleEarthquakes: () => void;
  toggleEarthquakeHeatmap: () => void;
  toggleIss: () => void;
  toggleDayNight: () => void;
  toggleAurora: () => void;
  toggleVolcanoes: () => void;
  toggleHazards: () => void;
  toggleSatellites: () => void;
  togglePlates: () => void;
  toggleWildfires: () => void;
  toggleMeteors: () => void;
  toggleWatchlists: () => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  earthquakes: true,
  earthquakeHeatmap: false,
  iss: true,
  dayNight: true,
  aurora: true,
  volcanoes: true,
  hazards: true,
  satellites: true,
  plates: false,
  wildfires: true,
  meteors: true,
  watchlists: true,
  toggleEarthquakes: () => set((s) => ({ earthquakes: !s.earthquakes })),
  toggleEarthquakeHeatmap: () => set((s) => ({ earthquakeHeatmap: !s.earthquakeHeatmap })),
  toggleIss: () => set((s) => ({ iss: !s.iss })),
  toggleDayNight: () => set((s) => ({ dayNight: !s.dayNight })),
  toggleAurora: () => set((s) => ({ aurora: !s.aurora })),
  toggleVolcanoes: () => set((s) => ({ volcanoes: !s.volcanoes })),
  toggleHazards: () => set((s) => ({ hazards: !s.hazards })),
  toggleSatellites: () => set((s) => ({ satellites: !s.satellites })),
  togglePlates: () => set((s) => ({ plates: !s.plates })),
  toggleWildfires: () => set((s) => ({ wildfires: !s.wildfires })),
  toggleMeteors: () => set((s) => ({ meteors: !s.meteors })),
  toggleWatchlists: () => set((s) => ({ watchlists: !s.watchlists })),
}));
