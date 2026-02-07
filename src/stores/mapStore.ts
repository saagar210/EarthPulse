import { create } from "zustand";
import type { Map } from "leaflet";

interface MapState {
  map: Map | null;
  tileUrl: string;
  tileSubdomains: string;
  setMap: (map: Map | null) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  setMapStyle: (url: string, subdomains: string) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  tileSubdomains: "abcd",
  setMap: (map) => set({ map }),
  flyTo: (lat, lon, zoom = 6) => {
    const map = get().map;
    if (map) {
      map.flyTo([lat, lon], zoom, { duration: 1.5 });
    }
  },
  setMapStyle: (url, subdomains) => set({ tileUrl: url, tileSubdomains: subdomains }),
}));
