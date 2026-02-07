import { useEarthquakeStore } from "../../stores/earthquakeStore";
import { useIssStore } from "../../stores/issStore";
import { useSolarStore } from "../../stores/solarStore";
import { useVolcanoStore } from "../../stores/volcanoStore";
import { useGdacsStore } from "../../stores/gdacsStore";
import { useSatelliteStore } from "../../stores/satelliteStore";

export function StatsPanel() {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);
  const issPosition = useIssStore((s) => s.position);
  const kpIndex = useSolarStore((s) => s.kpIndex);
  const volcanoes = useVolcanoStore((s) => s.volcanoes);
  const gdacsAlerts = useGdacsStore((s) => s.alerts);
  const nextPass = useSatelliteStore((s) => s.nextPass);

  const strongest = earthquakes.reduce<{ mag: number; place: string } | null>(
    (best, eq) => {
      if (!best || eq.magnitude > best.mag) {
        return { mag: eq.magnitude, place: eq.place };
      }
      return best;
    },
    null,
  );

  const activeVolcanoes = volcanoes.filter(
    (v) => v.status === "warning" || v.status === "watch",
  ).length;

  const redAlerts = gdacsAlerts.filter((a) => a.severity === "Red").length;

  const nextPassLabel = nextPass
    ? (() => {
        const diff = nextPass.start_time * 1000 - Date.now();
        if (diff < 0) return "Now!";
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        if (hours > 0) return `${hours}h ${mins % 60}m`;
        return `${mins}m`;
      })()
    : null;

  const stats = [
    {
      label: "Earthquakes (24h)",
      value: earthquakes.length.toString(),
    },
    {
      label: "Strongest",
      value: strongest ? `M${strongest.mag.toFixed(1)}` : "--",
      sub: strongest?.place,
    },
    {
      label: "ISS Altitude",
      value: issPosition ? "~408 km" : "--",
    },
    {
      label: "Next ISS Pass",
      value: nextPassLabel ?? "--",
      sub: nextPass ? `${nextPass.max_elevation.toFixed(0)}° max el.` : undefined,
    },
    {
      label: "Kp Index",
      value: kpIndex !== null ? kpIndex.toFixed(1) : "--",
      sub: kpIndex !== null && kpIndex >= 5 ? "Storm!" : undefined,
    },
    {
      label: "Active Volcanoes",
      value: activeVolcanoes > 0 ? activeVolcanoes.toString() : "--",
    },
    {
      label: "Hazard Alerts",
      value: gdacsAlerts.length > 0 ? gdacsAlerts.length.toString() : "--",
      sub: redAlerts > 0 ? `${redAlerts} red` : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Live Stats
      </h3>
      {stats.map((stat) => (
        <div key={stat.label} className="flex justify-between items-start">
          <span className="text-xs text-gray-400">{stat.label}</span>
          <div className="text-right">
            <span className="text-sm font-medium">{stat.value}</span>
            {stat.sub && (
              <div className="text-xs text-gray-500 max-w-[120px] truncate">
                {stat.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
