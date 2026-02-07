import { useAsteroidStore } from "../../stores/asteroidStore";

function formatDistance(km: number): string {
  if (km >= 1e6) return `${(km / 1e6).toFixed(1)}M km`;
  if (km >= 1e3) return `${(km / 1e3).toFixed(0)}K km`;
  return `${km.toFixed(0)} km`;
}

export function AsteroidPanel() {
  const asteroids = useAsteroidStore((s) => s.asteroids);

  if (asteroids.length === 0) return null;

  const upcoming = asteroids.slice(0, 8);

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Near-Earth Objects (7d)
      </h3>
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
        {upcoming.map((a) => (
          <div
            key={a.id}
            className={`px-2 py-1.5 rounded text-xs ${
              a.is_hazardous
                ? "bg-red-900/30 border border-red-800/50"
                : "bg-gray-800/50"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-200 truncate max-w-[140px]">
                {a.is_hazardous && "⚠️ "}
                {a.name.replace(/[()]/g, "")}
              </span>
              <span className="text-gray-500 text-[10px] shrink-0">
                {a.approach_date}
              </span>
            </div>
            <div className="text-gray-400 mt-0.5 flex gap-3">
              <span>{formatDistance(a.miss_distance_km)}</span>
              <span>{a.miss_distance_lunar.toFixed(1)} LD</span>
              <span>{a.velocity_kps.toFixed(1)} km/s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
