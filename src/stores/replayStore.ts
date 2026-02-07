import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ReplayData } from "../types/replay";

interface ReplayState {
  isReplaying: boolean;
  isPlaying: boolean;
  currentTime: number;
  speed: number;
  replayData: ReplayData | null;
  startReplay: () => void;
  stopReplay: () => void;
  setPlaying: (playing: boolean) => void;
  setTime: (time: number) => void;
  setSpeed: (speed: number) => void;
  fetchReplayData: (timestamp: number) => Promise<void>;
}

export const useReplayStore = create<ReplayState>((set) => ({
  isReplaying: false,
  isPlaying: false,
  currentTime: Date.now() - 12 * 60 * 60 * 1000, // default 12h ago
  speed: 10,
  replayData: null,

  startReplay: () =>
    set({
      isReplaying: true,
      isPlaying: false,
      currentTime: Date.now() - 12 * 60 * 60 * 1000,
    }),

  stopReplay: () =>
    set({ isReplaying: false, isPlaying: false, replayData: null }),

  setPlaying: (playing) => set({ isPlaying: playing }),
  setTime: (time) => set({ currentTime: time }),
  setSpeed: (speed) => set({ speed }),

  fetchReplayData: async (timestamp) => {
    try {
      const data = await invoke<ReplayData>("get_historical_data", {
        timestamp,
      });
      set({ replayData: data });
    } catch {
      // Replay data not available
    }
  },
}));
