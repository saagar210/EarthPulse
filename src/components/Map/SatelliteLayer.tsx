import { Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useSatelliteStore } from "../../stores/satelliteStore";
import { splitAtAntimeridian } from "../../utils/geo";

const satIcons: Record<string, L.DivIcon> = {};

function getSatIcon(name: string): L.DivIcon {
  if (satIcons[name]) return satIcons[name];

  let emoji = "🛰️";
  const lower = name.toLowerCase();
  if (lower.includes("iss") || lower.includes("zarya")) emoji = "🚀";
  else if (lower.includes("hubble") || lower.includes("hst")) emoji = "🔭";
  else if (lower.includes("tiangong")) emoji = "🏠";

  const icon = L.divIcon({
    className: "sat-icon",
    html: `<div style="font-size: 16px; filter: drop-shadow(0 0 4px #06b6d4); text-align: center;">${emoji}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  satIcons[name] = icon;
  return icon;
}

const orbitColors = ["#06b6d4", "#8b5cf6", "#f97316", "#22c55e"];

export function SatelliteLayer() {
  const positions = useSatelliteStore((s) => s.positions);
  const orbits = useSatelliteStore((s) => s.orbits);

  return (
    <>
      {orbits.map((orbit, idx) => {
        const segments = splitAtAntimeridian(orbit.points);
        const color = orbitColors[idx % orbitColors.length];

        return segments.map((seg, si) => (
          <Polyline
            key={`${orbit.satellite_id}-${si}`}
            positions={seg}
            pathOptions={{
              color,
              weight: 1.5,
              opacity: 0.4,
              dashArray: "4 6",
            }}
          />
        ));
      })}

      {positions.map((sat) => (
        <Marker
          key={sat.id}
          position={[sat.latitude, sat.longitude]}
          icon={getSatIcon(sat.name)}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            <div className="text-xs">
              <div className="font-bold">{sat.name}</div>
              <div>
                {sat.latitude.toFixed(2)}, {sat.longitude.toFixed(2)}
              </div>
              <div>Alt: {sat.altitude_km.toFixed(0)} km</div>
              <div>Vel: {sat.velocity_kmh.toFixed(0)} km/h</div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
