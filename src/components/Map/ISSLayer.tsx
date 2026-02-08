import { Marker, Polyline, Tooltip } from "react-leaflet";
import { useIssStore } from "../../stores/issStore";
import { useReplayStore } from "../../stores/replayStore";
import { splitAtAntimeridian } from "../../utils/geo";
import L from "leaflet";

const issIcon = L.divIcon({
  className: "iss-icon",
  html: `<div style="font-size: 24px; filter: drop-shadow(0 0 6px #3b82f6);">🛰️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function ISSLayer() {
  const livePosition = useIssStore((s) => s.position);
  const liveTrail = useIssStore((s) => s.trail);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const replayData = useReplayStore((s) => s.replayData);

  const position = isReplaying && replayData?.iss_position
    ? replayData.iss_position
    : livePosition;
  // During replay we don't have trail data, so show empty trail
  const trail = isReplaying ? [] : liveTrail;

  if (!position) return null;

  const trailCoords = trail.map(
    (p) => [p.latitude, p.longitude] as [number, number],
  );

  const segments = splitAtAntimeridian(trailCoords);

  return (
    <>
      {segments.map((seg, i) => (
        <Polyline
          key={i}
          positions={seg}
          pathOptions={{
            color: "#3b82f6",
            weight: 2,
            opacity: 0.5,
            dashArray: "4 6",
          }}
        />
      ))}
      <Marker position={[position.latitude, position.longitude]} icon={issIcon}>
        <Tooltip direction="top" offset={[0, -16]} permanent={false}>
          <div className="text-xs">
            <div className="font-bold">ISS</div>
            <div>
              {position.latitude.toFixed(2)}, {position.longitude.toFixed(2)}
            </div>
            <div>~408 km altitude</div>
            <div>~28,000 km/h</div>
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}
