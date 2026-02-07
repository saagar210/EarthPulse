import { useState } from "react";
import { useWatchlistStore } from "../../stores/watchlistStore";

export function WatchlistPanel() {
  const watchlists = useWatchlistStore((s) => s.watchlists);
  const loading = useWatchlistStore((s) => s.loading);
  const addWatchlist = useWatchlistStore((s) => s.add);
  const removeWatchlist = useWatchlistStore((s) => s.remove);

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [radius, setRadius] = useState("500");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = parseFloat(radius);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum) || !Number.isFinite(radiusNum)) {
      setError("Invalid number");
      return;
    }
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      setError("Coordinates out of range");
      return;
    }
    if (radiusNum <= 0 || radiusNum > 20000) {
      setError("Radius must be 1-20000 km");
      return;
    }

    try {
      await addWatchlist(name.trim(), latNum, lonNum, radiusNum);
      setName("");
      setLat("");
      setLon("");
      setRadius("500");
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Watchlists
      </h3>

      {watchlists.length === 0 && (
        <p className="text-xs text-gray-600">No watchlists yet</p>
      )}

      {watchlists.map((w) => (
        <div
          key={w.id}
          className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1"
        >
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{w.name}</div>
            <div className="text-[10px] text-gray-500">
              {w.latitude.toFixed(2)}, {w.longitude.toFixed(2)} &middot;{" "}
              {w.radius_km}km
            </div>
          </div>
          <button
            onClick={() => removeWatchlist(w.id)}
            className="text-gray-500 hover:text-red-400 text-xs ml-2 shrink-0"
            title="Remove"
          >
            x
          </button>
        </div>
      ))}

      <div className="space-y-1 pt-1">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
        />
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            placeholder="Lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
          />
          <input
            type="number"
            placeholder="Lon"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
          />
        </div>
        <input
          type="number"
          placeholder="Radius (km)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
        />
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full text-xs px-2 py-1 rounded bg-pink-600 hover:bg-pink-500 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Watchlist"}
        </button>
      </div>
    </div>
  );
}
