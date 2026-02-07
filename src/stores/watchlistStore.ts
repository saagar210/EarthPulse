import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Watchlist } from "../types/watchlist";

interface WatchlistState {
  watchlists: Watchlist[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (name: string, lat: number, lon: number, radiusKm: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  watchlists: [],
  loading: false,

  fetch: async () => {
    try {
      const data = await invoke<Watchlist[]>("get_watchlists");
      set({ watchlists: data });
    } catch (e) {
      console.error("Failed to fetch watchlists:", e);
    }
  },

  add: async (name, lat, lon, radiusKm) => {
    set({ loading: true });
    try {
      const watchlist = await invoke<Watchlist>("add_watchlist", {
        name,
        lat,
        lon,
        radiusKm,
      });
      set((s) => ({ watchlists: [...s.watchlists, watchlist], loading: false }));
    } catch (e) {
      console.error("Failed to add watchlist:", e);
      set({ loading: false });
      throw e;
    }
  },

  remove: async (id) => {
    try {
      await invoke("remove_watchlist", { id });
      set((s) => ({ watchlists: s.watchlists.filter((w) => w.id !== id) }));
    } catch (e) {
      console.error("Failed to remove watchlist:", e);
    }
  },
}));
