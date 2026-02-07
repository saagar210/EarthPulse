import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Earthquake } from "../types/earthquake";
import type { HistoricalSummary, HistoricalResult } from "../types/historical";

interface HistoricalState {
  isExploring: boolean;
  earthquakes: Earthquake[];
  summary: HistoricalSummary | null;
  startDate: string;
  endDate: string;
  minMagnitude: number;
  loading: boolean;
  error: string | null;
  startExploring: () => void;
  stopExploring: () => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setMinMagnitude: (mag: number) => void;
  fetchHistorical: () => Promise<void>;
}

function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useHistoricalStore = create<HistoricalState>((set, get) => ({
  isExploring: false,
  earthquakes: [],
  summary: null,
  startDate: defaultStartDate(),
  endDate: defaultEndDate(),
  minMagnitude: 4.5,
  loading: false,
  error: null,

  startExploring: () => set({ isExploring: true }),
  stopExploring: () =>
    set({
      isExploring: false,
      earthquakes: [],
      summary: null,
      error: null,
    }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setMinMagnitude: (mag) => set({ minMagnitude: mag }),

  fetchHistorical: async () => {
    const { startDate, endDate, minMagnitude } = get();
    set({ loading: true, error: null });
    try {
      const result = await invoke<HistoricalResult>("get_historical_earthquakes", {
        startDate,
        endDate,
        minMagnitude,
      });
      set({
        earthquakes: result.earthquakes,
        summary: result.summary,
        loading: false,
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
