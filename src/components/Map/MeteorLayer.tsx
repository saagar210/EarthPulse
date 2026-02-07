import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useMeteorStore } from "../../stores/meteorStore";

const iconCache: Record<string, L.DivIcon> = {};

function getMeteorIcon(isPeak: boolean): L.DivIcon {
  const key = isPeak ? "peak" : "active";
  if (iconCache[key]) return iconCache[key];
  const size = isPeak ? 18 : 14;
  const glow = isPeak ? "drop-shadow(0 0 6px #a855f7)" : "drop-shadow(0 0 4px #8b5cf6)";
  const icon = L.divIcon({
    className: "meteor-icon",
    html: `<div style="font-size: ${size}px; filter: ${glow}; text-align: center;">⭐</div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
  iconCache[key] = icon;
  return icon;
}

export function MeteorLayer() {
  const showers = useMeteorStore((s) => s.showers);
  const active = showers.filter((s) => s.is_active);

  return (
    <>
      {active.map((shower) => (
        <Marker
          key={shower.name}
          position={[shower.latitude, shower.longitude]}
          icon={getMeteorIcon(shower.is_peak)}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            <div className="text-xs">
              <div className="font-bold">{shower.name}</div>
              <div>ZHR: {shower.zhr}</div>
              <div>Velocity: {shower.velocity_kps} km/s</div>
              <div>Parent: {shower.parent_body}</div>
              {shower.is_peak && (
                <div className="text-purple-400 font-semibold">Peak tonight!</div>
              )}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
