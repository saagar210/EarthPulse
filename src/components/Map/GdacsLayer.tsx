import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useGdacsStore } from "../../stores/gdacsStore";

const severityColors: Record<string, string> = {
  Red: "#ef4444",
  Orange: "#f97316",
  Green: "#22c55e",
};

const typeEmojis: Record<string, string> = {
  EQ: "🌍",
  TC: "🌀",
  FL: "🌊",
  VO: "🌋",
  DR: "☀️",
  WF: "🔥",
};

const iconCache: Record<string, L.DivIcon> = {};

function makeIcon(alertType: string, severity: string) {
  const key = `${alertType}-${severity}`;
  if (iconCache[key]) return iconCache[key];

  const emoji = typeEmojis[alertType] || "⚠️";
  const color = severityColors[severity] || "#eab308";

  const icon = L.divIcon({
    className: "gdacs-icon",
    html: `<div style="font-size: 18px; filter: drop-shadow(0 0 4px ${color}); text-align: center;">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  iconCache[key] = icon;
  return icon;
}

export function GdacsLayer() {
  const alerts = useGdacsStore((s) => s.alerts);

  return (
    <>
      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={makeIcon(alert.alert_type, alert.severity)}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[200px]">
              <div className="font-bold">{alert.title}</div>
              <div
                className="text-xs px-1.5 py-0.5 rounded inline-block"
                style={{
                  backgroundColor: severityColors[alert.severity] || "#eab308",
                  color: "white",
                }}
              >
                {alert.severity} Alert
              </div>
              <div className="text-gray-400 text-xs">{alert.description.slice(0, 200)}</div>
              {alert.country && (
                <div className="text-xs text-gray-500">{alert.country}</div>
              )}
              <div className="text-xs text-gray-500">{alert.pub_date}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
