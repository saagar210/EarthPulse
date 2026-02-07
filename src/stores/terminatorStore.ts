import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface TerminatorState {
  points: [number, number][];
  fetch: () => Promise<void>;
  startListening: () => Promise<() => void>;
}

export const useTerminatorStore = create<TerminatorState>((set) => ({
  points: [],

  fetch: async () => {
    try {
      const pts = await invoke<[number, number][]>("get_terminator");
      set({ points: pts });
    } catch {
      // Terminator data not yet available
    }
  },

  startListening: async () => {
    const unlisten = await listen<[number, number][]>(
      "terminator:update",
      (event) => {
        set({ points: event.payload });
      },
    );
    return unlisten;
  },
}));
