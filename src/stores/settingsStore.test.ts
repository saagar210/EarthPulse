import { describe, expect, it } from "vitest";
import { useSettingsStore } from "./settingsStore";

describe("settingsStore", () => {
  it("hydrates persisted settings into runtime state", () => {
    useSettingsStore.setState({
      userLat: 0,
      userLon: 0,
      notifyEarthquakes: false,
      notifyAurora: false,
      notifyVolcanoes: false,
      earthquakeMagThreshold: 3,
      proximityRadius: 100,
      sonificationEnabled: false,
      ollamaModel: "baseline",
    });

    useSettingsStore.getState().hydrate({
      user_lat: 40.71,
      user_lon: -74.0,
      notify_earthquakes: true,
      notify_aurora: true,
      notify_volcanoes: true,
      mag_threshold: 5.5,
      proximity_km: 800,
      sonification_enabled: true,
      ollama_model: "llama3.3",
    });

    const state = useSettingsStore.getState();
    expect(state.userLat).toBe(40.71);
    expect(state.userLon).toBe(-74.0);
    expect(state.notifyEarthquakes).toBe(true);
    expect(state.notifyAurora).toBe(true);
    expect(state.notifyVolcanoes).toBe(true);
    expect(state.earthquakeMagThreshold).toBe(5.5);
    expect(state.proximityRadius).toBe(800);
    expect(state.sonificationEnabled).toBe(true);
    expect(state.ollamaModel).toBe("llama3.3");
  });
});
