import { create } from "zustand";

export interface SourceHealthEvent {
  source: string;
  ok: boolean;
  timestamp_ms: number;
  error?: string | null;
}

export interface SourceHealthState {
  source: string;
  ok: boolean;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  consecutiveFailures: number;
  lastError: string | null;
}

interface StoreState {
  bySource: Record<string, SourceHealthState>;
  upsertEvent: (event: SourceHealthEvent) => void;
}

export const useSourceHealthStore = create<StoreState>((set) => ({
  bySource: {},
  upsertEvent: (event) =>
    set((state) => {
      const prev = state.bySource[event.source];
      const next: SourceHealthState = {
        source: event.source,
        ok: event.ok,
        lastSuccessAt: (Boolean(event.ok)) ? event.timestamp_ms : prev?.lastSuccessAt ?? null,
        lastFailureAt: event.ok ? prev?.lastFailureAt ?? null : event.timestamp_ms,
        consecutiveFailures: event.ok ? 0 : (prev?.consecutiveFailures ?? 0) + 1,
        lastError: event.ok ? null : event.error ?? "Unknown error",
      };

      return {
        bySource: {
          ...state.bySource,
          [event.source]: next,
        },
      };
    }),
}));
