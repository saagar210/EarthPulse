import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEonetStore } from "../../stores/eonetStore";

const categoryEmoji: Record<string, string> = {
  wildfires: "🔥",
  severeStorms: "🌪️",
  floods: "🌊",
  volcanoes: "🌋",
};

const iconCache: Record<string, L.DivIcon> = {};

function getEonetIcon(categoryId: string): L.DivIcon {
  if (iconCache[categoryId]) return iconCache[categoryId];
  const emoji = categoryEmoji[categoryId] || "⚠️";
  const icon = L.divIcon({
    className: "eonet-icon",
    html: `<div style="font-size: 16px; filter: drop-shadow(0 0 4px #f97316); text-align: center;">${emoji}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  iconCache[categoryId] = icon;
  return icon;
}

export function EonetLayer() {
  const events = useEonetStore((s) => s.events);

  return (
    <>
      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.latitude, e.longitude]}
          icon={getEonetIcon(e.category_id)}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[160px]">
              <div className="font-bold">{e.title}</div>
              <div className="text-gray-400">{e.category}</div>
              <div className="text-gray-500 text-xs">
                {new Date(e.date).toLocaleDateString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
