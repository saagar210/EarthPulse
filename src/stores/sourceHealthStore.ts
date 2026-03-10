import { create } from "zustand";

export interface SourceHealthEvent {
  source: string;
  ok: boolean;
  degraded?: boolean;
  timestamp_ms: number;
  error?: string | null;
}

interface SourceHealthState {
  source: string;
  ok: boolean;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  consecutiveFailures: number;
  degraded: boolean;
  degradedSince: number | null;
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
      const isDegraded = event.ok && (event.degraded ?? false);
      const next: SourceHealthState = {
        source: event.source,
        ok: event.ok,
        lastSuccessAt: event.ok ? event.timestamp_ms : prev?.lastSuccessAt ?? null,
        lastFailureAt: event.ok ? prev?.lastFailureAt ?? null : event.timestamp_ms,
        consecutiveFailures: event.ok ? 0 : (prev?.consecutiveFailures ?? 0) + 1,
        degraded: isDegraded,
        degradedSince: isDegraded
          ? prev?.degraded
            ? prev.degradedSince ?? event.timestamp_ms
            : event.timestamp_ms
          : null,
        lastError: event.ok
          ? isDegraded
            ? event.error ?? prev?.lastError ?? null
            : null
          : event.error ?? "Unknown error",
      };

      return {
        bySource: {
          ...state.bySource,
          [event.source]: next,
        },
      };
    }),
}));
