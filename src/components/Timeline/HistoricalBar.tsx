import { useHistoricalStore } from "../../stores/historicalStore";
import { useReplayStore } from "../../stores/replayStore";

export function HistoricalBar() {
  const {
    isExploring,
    startDate,
    endDate,
    minMagnitude,
    summary,
    loading,
    error,
    startExploring,
    stopExploring,
    setStartDate,
    setEndDate,
    setMinMagnitude,
    fetchHistorical,
  } = useHistoricalStore();
  const isReplaying = useReplayStore((s) => s.isReplaying);

  if (isReplaying) return null;

  if (!isExploring) {
    return (
      <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center px-4">
        <button
          onClick={startExploring}
          className="text-xs text-gray-400 hover:text-white transition-colors ml-3"
        >
          Historical Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-gray-400 flex items-center gap-1">
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700"
          />
        </label>
        <label className="text-xs text-gray-400 flex items-center gap-1">
          To
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700"
          />
        </label>
        <label className="text-xs text-gray-400 flex items-center gap-1">
          Min M
          <input
            type="range"
            min={2}
            max={8}
            step={0.5}
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(Number(e.target.value))}
            className="w-20 accent-amber-500 h-1"
          />
          <span className="text-gray-300 w-6">{minMagnitude}</span>
        </label>
        <button
          onClick={fetchHistorical}
          disabled={loading}
          className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Search"}
        </button>
        <button
          onClick={stopExploring}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
        >
          Exit
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400">{error}</div>
      )}

      {summary && (
        <div className="flex gap-4 text-xs text-gray-400">
          <span>
            <span className="text-gray-200 font-medium">{summary.total}</span> quakes
          </span>
          <span>
            Strongest: <span className="text-gray-200 font-medium">M{summary.strongest_mag.toFixed(1)}</span>{" "}
            {summary.strongest_place}
          </span>
          <span>
            Avg depth: <span className="text-gray-200 font-medium">{summary.avg_depth.toFixed(0)} km</span>
          </span>
          {summary.tsunami_count > 0 && (
            <span className="text-yellow-400">
              {summary.tsunami_count} tsunami warning{summary.tsunami_count > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
