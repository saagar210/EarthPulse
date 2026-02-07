import { useEarthquakeStore } from "../../stores/earthquakeStore";
import { useIssStore } from "../../stores/issStore";
import { useSolarStore } from "../../stores/solarStore";
import { useVolcanoStore } from "../../stores/volcanoStore";
import { useGdacsStore } from "../../stores/gdacsStore";
import { useSatelliteStore } from "../../stores/satelliteStore";
import { useMeteorStore } from "../../stores/meteorStore";
import { useAsteroidStore } from "../../stores/asteroidStore";
import { useSolarEventStore } from "../../stores/solarEventStore";

export function StatsPanel() {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);
  const issPosition = useIssStore((s) => s.position);
  const kpIndex = useSolarStore((s) => s.kpIndex);
  const volcanoes = useVolcanoStore((s) => s.volcanoes);
  const gdacsAlerts = useGdacsStore((s) => s.alerts);
  const nextPass = useSatelliteStore((s) => s.nextPass);
  const showers = useMeteorStore((s) => s.showers);
  const asteroids = useAsteroidStore((s) => s.asteroids);
  const flares = useSolarEventStore((s) => s.flares);
  const cmes = useSolarEventStore((s) => s.cmes);

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

  const nextShower = showers
    .filter((s) => s.days_until_peak >= 0)
    .sort((a, b) => a.days_until_peak - b.days_until_peak)[0];

  const hazardousCount = asteroids.filter((a) => a.is_hazardous).length;
  const significantFlare = flares.find((f) => f.class_type.startsWith("X") || f.class_type.startsWith("M"));
  const earthCmeCount = cmes.filter((c) => c.is_earth_directed).length;

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
    {
      label: "NEO Flybys (7d)",
      value: asteroids.length > 0 ? asteroids.length.toString() : "--",
      sub: hazardousCount > 0 ? `${hazardousCount} hazardous` : undefined,
    },
    {
      label: "Solar Flares (7d)",
      value: flares.length > 0 ? flares.length.toString() : "--",
      sub: significantFlare
        ? `Strongest: ${significantFlare.class_type}`
        : earthCmeCount > 0
          ? `${earthCmeCount} CME Earth-dir`
          : undefined,
    },
    {
      label: "Next Shower",
      value: nextShower ? nextShower.name : "--",
      sub: nextShower
        ? nextShower.days_until_peak === 0
          ? "Peak today!"
          : `in ${nextShower.days_until_peak}d`
        : undefined,
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
