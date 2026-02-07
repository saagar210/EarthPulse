import { useSolarEventStore } from "../../stores/solarEventStore";

function flareColor(classType: string): string {
  if (classType.startsWith("X")) return "text-red-400";
  if (classType.startsWith("M")) return "text-orange-400";
  if (classType.startsWith("C")) return "text-yellow-400";
  return "text-gray-400";
}

function formatTime(isoStr: string): string {
  if (!isoStr) return "--";
  try {
    const d = new Date(isoStr.replace("Z", "+00:00"));
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr.slice(0, 16);
  }
}

export function SolarActivityPanel() {
  const flares = useSolarEventStore((s) => s.flares);
  const cmes = useSolarEventStore((s) => s.cmes);

  if (flares.length === 0 && cmes.length === 0) return null;

  const earthDirected = cmes.filter((c) => c.is_earth_directed);

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Solar Activity (7d)
      </h3>

      {flares.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-gray-500 uppercase">Flares</div>
          {flares.slice(0, 5).map((f) => (
            <div
              key={f.id}
              className="px-2 py-1 rounded bg-gray-800/50 text-xs flex justify-between"
            >
              <span className={`font-bold ${flareColor(f.class_type)}`}>
                {f.class_type}
              </span>
              <span className="text-gray-500">{formatTime(f.peak_time)}</span>
            </div>
          ))}
          {flares.length > 5 && (
            <div className="text-[10px] text-gray-600 px-2">
              +{flares.length - 5} more
            </div>
          )}
        </div>
      )}

      {cmes.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-gray-500 uppercase">
            CMEs {earthDirected.length > 0 && (
              <span className="text-red-400">
                ({earthDirected.length} Earth-directed)
              </span>
            )}
          </div>
          {cmes.slice(0, 5).map((c) => (
            <div
              key={c.id}
              className={`px-2 py-1 rounded text-xs ${
                c.is_earth_directed
                  ? "bg-red-900/30 border border-red-800/50"
                  : "bg-gray-800/50"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {c.is_earth_directed && "🌍 "}
                  {c.speed_kps ? `${c.speed_kps.toFixed(0)} km/s` : "Speed N/A"}
                </span>
                <span className="text-gray-500">
                  {formatTime(c.start_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
