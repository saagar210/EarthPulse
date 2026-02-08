import { useEarthquakeStore } from "../stores/earthquakeStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import { saveScreenshot, copyScreenshot } from "../utils/export";
import { exportCSV, exportGeoJSON } from "../utils/dataExport";
import { useEffect, useState, useRef } from "react";

export function Header() {
  const lastUpdate = useEarthquakeStore((s) => s.lastUpdate);
  const loading = useEarthquakeStore((s) => s.loading);
  const toggleSettings = useSettingsStore((s) => s.toggle);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const replayTime = useReplayStore((s) => s.currentTime);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const [elapsed, setElapsed] = useState<string>("--");
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastUpdate) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
      if (seconds < 60) setElapsed(`${seconds}s ago`);
      else setElapsed(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showExport) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExport]);

  const replayLabel = isReplaying
    ? (() => {
        const diff = Date.now() - replayTime;
        const hours = Math.floor(diff / 3600000);
        if (hours > 0) return `Replaying: ${hours}h ago`;
        return `Replaying: ${Math.floor(diff / 60000)}m ago`;
      })()
    : null;

  const handleExportAction = async (action: "save" | "copy" | "csv" | "geojson") => {
    setShowExport(false);
    try {
      if (action === "save") {
        await saveScreenshot();
      } else if (action === "copy") {
        await copyScreenshot();
      } else {
        const quakes = useEarthquakeStore.getState().earthquakes;
        const timestamp = new Date().toISOString().slice(0, 10);
        if (action === "csv") {
          exportCSV(
            quakes.map((q) => ({
              id: q.id,
              magnitude: q.magnitude,
              latitude: q.latitude,
              longitude: q.longitude,
              depth: q.depth,
              place: q.place,
              time: q.time,
              tsunami: q.tsunami,
            })),
            `earthpulse-earthquakes-${timestamp}.csv`,
          );
        } else {
          exportGeoJSON(
            quakes as unknown as { latitude: number; longitude: number; [key: string]: unknown }[],
            `earthpulse-earthquakes-${timestamp}.geojson`,
          );
        }
      }
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <header className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
      <h1 className="text-sm font-bold tracking-wide text-white">
        EarthPulse
      </h1>

      {replayLabel && (
        <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">
          {replayLabel}
        </span>
      )}

      {isExploring && (
        <span className="text-xs bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded">
          Historical Mode
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto text-xs text-gray-400">
        {!isReplaying && !isExploring && (
          <>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                loading
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-green-400 animate-[pulse_2s_ease-in-out_infinite]"
              }`}
            />
            <span>{loading ? "Updating..." : "Live"}</span>
            <span className="text-gray-600">|</span>
            <span>Updated {elapsed}</span>
          </>
        )}

        {/* Screenshot button */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="ml-2 p-1 hover:bg-gray-800 rounded transition-colors"
            title="Screenshot"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {showExport && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 py-1 min-w-[140px]">
              <button
                onClick={() => handleExportAction("save")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors"
              >
                Save PNG
              </button>
              <button
                onClick={() => handleExportAction("copy")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => handleExportAction("csv")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportAction("geojson")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors"
              >
                Export GeoJSON
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleSettings}
          className="ml-2 p-1 hover:bg-gray-800 rounded transition-colors"
          title="Settings"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
