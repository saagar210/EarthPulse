import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { SeaSurfaceTemp } from "../types/sst";

interface SSTState {
  sst: SeaSurfaceTemp | null;
  loading: boolean;
  error: string | null;
  fetchSST: (lat: number, lon: number) => Promise<void>;
}

export const useSSTStore = create<SSTState>((set) => ({
  sst: null,
  loading: false,
  error: null,

  fetchSST: async (lat: number, lon: number) => {
    set({ loading: true, error: null });
    try {
      const sst = await invoke<SeaSurfaceTemp>("get_sst", { lat, lon });
      set({ sst, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
