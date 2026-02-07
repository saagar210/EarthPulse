import { Polygon } from "react-leaflet";
import { useTerminatorStore } from "../../stores/terminatorStore";
import { useReplayStore } from "../../stores/replayStore";

export function DayNightLayer() {
  const livePoints = useTerminatorStore((s) => s.points);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const replayData = useReplayStore((s) => s.replayData);

  const points = isReplaying && replayData ? replayData.terminator : livePoints;

  if (points.length === 0) return null;

  return (
    <Polygon
      positions={points as [number, number][]}
      pathOptions={{
        color: "transparent",
        fillColor: "#000014",
        fillOpacity: 0.4,
        stroke: true,
        weight: 1,
        opacity: 0.3,
        dashArray: undefined,
      }}
    />
  );
}
