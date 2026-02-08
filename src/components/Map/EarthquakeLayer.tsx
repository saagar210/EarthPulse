import { useState, useEffect } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { useEarthquakeStore } from "../../stores/earthquakeStore";
import { useReplayStore } from "../../stores/replayStore";
import { useHistoricalStore } from "../../stores/historicalStore";

function getColor(depth: number): string {
  if (depth < 70) return "#ef4444"; // shallow - red
  if (depth < 300) return "#eab308"; // intermediate - yellow
  return "#8b5cf6"; // deep - purple
}

function getRadius(magnitude: number): number {
  return Math.min(40, Math.max(3, Math.pow(2, magnitude) * 1.5));
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function EarthquakeLayer() {
  const liveQuakes = useEarthquakeStore((s) => s.earthquakes);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const replayData = useReplayStore((s) => s.replayData);
  const replayTime = useReplayStore((s) => s.currentTime);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const historicalQuakes = useHistoricalStore((s) => s.earthquakes);

  const [liveNow, setLiveNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const earthquakes = isExploring
    ? historicalQuakes
    : isReplaying && replayData
      ? replayData.earthquakes
      : liveQuakes;
  const now = isReplaying ? replayTime : liveNow;

  return (
    <>
      {earthquakes.map((eq) => {
        const isRecent = now - eq.time < 30 * 60 * 1000;
        const color = getColor(eq.depth);

        return (
          <CircleMarker
            key={eq.id}
            center={[eq.latitude, eq.longitude]}
            radius={getRadius(eq.magnitude)}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1,
              opacity: 0.9,
            }}
            className={isRecent ? "earthquake-pulse" : ""}
          >
            <Popup>
              <div className="text-sm space-y-1 min-w-[180px]">
                <div className="font-bold text-base">M{eq.magnitude.toFixed(1)}</div>
                <div>{eq.place}</div>
                <div className="text-gray-400">Depth: {eq.depth.toFixed(1)} km</div>
                <div className="text-gray-400">{formatTime(eq.time)}</div>
                {eq.tsunami && (
                  <div className="text-yellow-400 font-semibold">Tsunami Warning</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
