import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSourceHealth } from "./useSourceHealth";
import { useSourceHealthStore } from "../stores/sourceHealthStore";

const listenMock = vi.fn();

vi.mock("@tauri-apps/api/event", () => ({
  listen: (...args: unknown[]) => listenMock(...args),
}));

function Harness() {
  useSourceHealth();
  return null;
}

describe("useSourceHealth", () => {
  beforeEach(() => {
    listenMock.mockReset();
    useSourceHealthStore.setState({ bySource: {} });
  });

  it("subscribes to source:health and updates store", async () => {
    listenMock.mockImplementation(
      async (_eventName: string, handler: (payload: { payload: unknown }) => void) => {
        handler({
          payload: {
            source: "earthquakes",
            ok: true,
            timestamp_ms: 1234,
          },
        });
        return () => {};
      },
    );

    render(<Harness />);

    expect(listenMock).toHaveBeenCalledWith("source:health", expect.any(Function));
    const health = useSourceHealthStore.getState().bySource.earthquakes;
    expect(health.ok).toBe(true);
    expect(health.lastSuccessAt).toBe(1234);
  });
});
