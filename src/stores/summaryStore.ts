import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface SummaryState {
  summary: string | null;
  loading: boolean;
  error: string | null;
  generate: (model: string) => Promise<void>;
}

export const useSummaryStore = create<SummaryState>((set) => ({
  summary: null,
  loading: false,
  error: null,

  generate: async (model: string) => {
    set({ loading: true, error: null });
    try {
      const summary = await invoke<string>("generate_summary", { model });
      set({ summary, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
