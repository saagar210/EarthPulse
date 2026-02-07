import { create } from "zustand";
import type { Map } from "leaflet";

interface MapState {
  map: Map | null;
  setMap: (map: Map | null) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  setMap: (map) => set({ map }),
  flyTo: (lat, lon, zoom = 6) => {
    const map = get().map;
    if (map) {
      map.flyTo([lat, lon], zoom, { duration: 1.5 });
    }
  },
}));
