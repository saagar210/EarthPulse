import { Marker, Popup } from "react-leaflet";
import { useVolcanoStore } from "../../stores/volcanoStore";
import L from "leaflet";

const statusColors: Record<string, string> = {
  normal: "#22c55e",
  advisory: "#eab308",
  watch: "#f97316",
  warning: "#ef4444",
};

// Cache icons by status to avoid creating new L.divIcon instances on every render
const iconCache: Record<string, L.DivIcon> = {};

function getVolcanoIcon(status: string): L.DivIcon {
  if (iconCache[status]) return iconCache[status];
  const color = statusColors[status] || "#888";
  const icon = L.divIcon({
    className: "volcano-icon",
    html: `<div style="
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 14px solid ${color};
      filter: drop-shadow(0 0 4px ${color});
    "></div>`,
    iconSize: [16, 14],
    iconAnchor: [8, 14],
  });
  iconCache[status] = icon;
  return icon;
}

export function VolcanoLayer() {
  const volcanoes = useVolcanoStore((s) => s.volcanoes);

  return (
    <>
      {volcanoes.map((v) => (
        <Marker
          key={v.id}
          position={[v.latitude, v.longitude]}
          icon={getVolcanoIcon(v.status)}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[160px]">
              <div className="font-bold">{v.name}</div>
              <div className="text-gray-400">{v.description}</div>
              <div>
                Status:{" "}
                <span
                  style={{ color: statusColors[v.status] || "#888" }}
                  className="font-semibold capitalize"
                >
                  {v.status}
                </span>
              </div>
              <div className="text-gray-400">
                Last eruption: {v.last_eruption}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
