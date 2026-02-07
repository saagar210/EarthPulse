import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { useEarthquakeStore } from "../../stores/earthquakeStore";
import { useReplayStore } from "../../stores/replayStore";
import { useHistoricalStore } from "../../stores/historicalStore";

export function EarthquakeHeatmapLayer() {
  const map = useMap();
  const liveQuakes = useEarthquakeStore((s) => s.earthquakes);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const replayData = useReplayStore((s) => s.replayData);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const historicalQuakes = useHistoricalStore((s) => s.earthquakes);

  const earthquakes = isExploring
    ? historicalQuakes
    : isReplaying && replayData
      ? replayData.earthquakes
      : liveQuakes;

  useEffect(() => {
    const points: [number, number, number][] = earthquakes.map((eq) => [
      eq.latitude,
      eq.longitude,
      eq.magnitude / 10, // normalize intensity 0-1
    ]);

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.2: "#1e3a5f",
        0.4: "#ef4444",
        0.6: "#f97316",
        0.8: "#eab308",
        1.0: "#ffffff",
      },
    });

    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, earthquakes]);

  return null;
}
