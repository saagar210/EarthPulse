import { useEffect, useRef } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useEarthquakeStore } from "../stores/earthquakeStore";
import { useSolarStore } from "../stores/solarStore";
import {
  playEarthquakeTone,
  updateKpDrone,
  stopDrone,
  cleanup,
} from "../audio/SonificationEngine";

export function useSonification(): void {
  const sonificationEnabled = useSettingsStore((s) => s.sonificationEnabled);
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);
  const kpIndex = useSolarStore((s) => s.kpIndex);
  const prevQuakeIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Track new earthquakes and play tones
  useEffect(() => {
    if (!sonificationEnabled || earthquakes.length === 0) return;

    if (isFirstLoad.current) {
      prevQuakeIds.current = new Set(earthquakes.map((eq) => eq.id));
      isFirstLoad.current = false;
      return;
    }

    const newQuakes = earthquakes.filter(
      (eq) => !prevQuakeIds.current.has(eq.id),
    );

    for (const eq of newQuakes) {
      playEarthquakeTone(eq.magnitude, eq.depth);
    }

    prevQuakeIds.current = new Set(earthquakes.map((eq) => eq.id));
  }, [earthquakes, sonificationEnabled]);

  // Update Kp drone
  useEffect(() => {
    if (!sonificationEnabled || kpIndex === null || !Number.isFinite(kpIndex)) {
      stopDrone();
      return;
    }
    updateKpDrone(kpIndex);
  }, [kpIndex, sonificationEnabled]);

  // Cleanup on disable or unmount
  useEffect(() => {
    if (!sonificationEnabled) {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [sonificationEnabled]);
}
