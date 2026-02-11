import { useEffect, useMemo, useState } from "react";
import { useSourceHealthStore } from "../../stores/sourceHealthStore";

const sourceCadenceMs: Record<string, number> = {
  earthquakes: 60_000,
  iss: 5_000,
  terminator: 60_000,
  solar: 900_000,
  gdacs: 900_000,
  satellites: 300_000,
  passes: 300_000,
  eonet: 1_800_000,
  asteroids: 21_600_000,
  solar_activity: 10800000,
  volcanoes: 86_400_000,
  meteors: 86_400_000,
  plates: 86_400_000,
};

function ageLabel(timestamp: number | null, nowMs: number): string {
  if (!timestamp) return "never";
  const diff = nowMs - timestamp;
  const secs = Math.max(0, Math.floor(diff / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function sourceStatus(
  source: string,
  lastSuccessAt: number | null,
  ok: boolean,
  nowMs: number,
): "ok" | "stale" | "error" {
  if (!ok) return "error";
  if (!lastSuccessAt) return "stale";
  const cadence = sourceCadenceMs[source] ?? 300_000;
  const staleThreshold = cadence * 2;
  return nowMs - lastSuccessAt > staleThreshold ? "stale" : "ok";
}

const dotClass: Record<"ok" | "stale" | "error", string> = {
  ok: "bg-emerald-500",
  stale: "bg-yellow-500",
  error: "bg-red-500",
};

export function SourceHealthPanel() {
  const bySource = useSourceHealthStore((s) => s.bySource);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(
    () =>
      Object.values(bySource)
        .sort((a, b) => a.source.localeCompare(b.source))
        .map((source) => ({
          ...source,
          status: sourceStatus(source.source, source.lastSuccessAt, source.ok, nowMs),
        })),
    [bySource, nowMs],
  );

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Data Health
      </h3>
      {rows.length === 0 && (
        <p className="text-xs text-gray-600">Collecting source telemetry...</p>
      )}

      {rows.map((row) => (
        <div key={row.source} className="bg-gray-800/50 rounded px-2 py-1.5 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full ${dotClass[row.status]}`} />
              <span className="text-xs text-gray-300 truncate">{row.source}</span>
            </div>
            <span className="text-[10px] text-gray-500">{ageLabel(row.lastSuccessAt, nowMs)}</span>
          </div>

          {row.status !== "ok" && (
            <div className="text-[10px] text-gray-500">
              {row.status === "stale"
                ? "No recent successful update"
                : row.lastError ?? "Source error"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
