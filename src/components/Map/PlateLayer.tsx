import { Polyline, Tooltip } from "react-leaflet";
import { usePlateStore } from "../../stores/plateStore";

const typeColors: Record<string, string> = {
  convergent: "#ef4444",
  divergent: "#06b6d4",
  transform: "#eab308",
};

export function PlateLayer() {
  const boundaries = usePlateStore((s) => s.boundaries);

  return (
    <>
      {boundaries.map((b, idx) => (
        <Polyline
          key={`${b.name}-${idx}`}
          positions={b.coordinates}
          pathOptions={{
            color: typeColors[b.boundary_type] || "#888",
            weight: 1.5,
            opacity: 0.5,
          }}
        >
          <Tooltip sticky>
            <span className="text-xs">{b.name}</span>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
