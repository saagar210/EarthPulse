import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSourceHealthStore } from "../../stores/sourceHealthStore";
import { SourceHealthPanel } from "./SourceHealthPanel";

describe("SourceHealthPanel", () => {
  it("renders degraded stale messaging with elapsed time", () => {
    useSourceHealthStore.setState({
      bySource: {
        volcanoes: {
          source: "volcanoes",
          ok: true,
          degraded: true,
          degradedSince: Date.now() - 90_000,
          lastSuccessAt: Date.now() - 90_000,
          lastFailureAt: null,
          consecutiveFailures: 0,
          lastError: "Live feed unavailable; using curated fallback data",
        },
      },
    });

    render(<SourceHealthPanel />);

    expect(screen.getByText("Data Health")).toBeInTheDocument();
    expect(screen.getByText("volcanoes")).toBeInTheDocument();
    expect(screen.getByText(/fallback data/i)).toBeInTheDocument();
  });
});
