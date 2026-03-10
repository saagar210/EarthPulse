import { describe, expect, it } from "vitest";
import { useSourceHealthStore } from "./sourceHealthStore";

describe("sourceHealthStore", () => {
  it("tracks degraded mode separately from hard failures", () => {
    useSourceHealthStore.setState({ bySource: {} });
    const upsert = useSourceHealthStore.getState().upsertEvent;

    upsert({
      source: "volcanoes",
      ok: true,
      degraded: true,
      timestamp_ms: 1000,
      error: "Live feed unavailable; using fallback",
    });

    let state = useSourceHealthStore.getState().bySource.volcanoes;
    expect(state.ok).toBe(true);
    expect(state.degraded).toBe(true);
    expect(state.degradedSince).toBe(1000);
    expect(state.lastError).toContain("fallback");

    upsert({
      source: "volcanoes",
      ok: false,
      timestamp_ms: 2000,
      error: "Request failed",
    });

    state = useSourceHealthStore.getState().bySource.volcanoes;
    expect(state.ok).toBe(false);
    expect(state.degraded).toBe(false);
    expect(state.degradedSince).toBeNull();
    expect(state.consecutiveFailures).toBe(1);
    expect(state.lastError).toContain("Request failed");
  });
});
