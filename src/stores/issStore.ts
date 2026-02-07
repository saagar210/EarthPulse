import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { IssData, IssPosition } from "../types/iss";

interface IssState {
  position: IssPosition | null;
  trail: IssPosition[];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useIssStore = create<IssState>((set) => ({
  position: null,
  trail: [],

  fetch: async () => {
    try {
      const data = await invoke<IssData>("get_iss_position");
      set({ position: data.current, trail: data.trail });
    } catch {
      // ISS data not yet available
    }
  },

  startListening: async () => {
    const unlisten = await listen<IssData>("iss:update", (event) => {
      set({ position: event.payload.current, trail: event.payload.trail });
    });
    return unlisten;
  },
}));
