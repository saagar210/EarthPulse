import { Circle } from "react-leaflet";
import { useSolarStore } from "../../stores/solarStore";

// Simplified aurora visualization based on Kp index
// Higher Kp = aurora visible at lower latitudes
function getAuroraLatitude(kp: number): number {
  // Kp 0 = ~67°, Kp 9 = ~45°
  return Math.max(45, 67 - kp * 2.5);
}

export function AuroraLayer() {
  const kpIndex = useSolarStore((s) => s.kpIndex);

  if (kpIndex === null || kpIndex < 1) return null;

  const lat = getAuroraLatitude(kpIndex);
  const opacity = Math.min(0.4, kpIndex * 0.05);
  const color = kpIndex >= 5 ? "#a855f7" : "#22c55e"; // purple for strong, green for moderate

  // Create aurora bands at both poles
  const bands: { lat: number; lon: number }[] = [];
  for (let lon = -180; lon <= 180; lon += 30) {
    bands.push({ lat, lon });
    bands.push({ lat: -lat, lon });
  }

  return (
    <>
      {bands.map((band, i) => (
        <Circle
          key={i}
          center={[band.lat, band.lon]}
          radius={500000}
          pathOptions={{
            color: "transparent",
            fillColor: color,
            fillOpacity: opacity,
          }}
        />
      ))}
    </>
  );
}
