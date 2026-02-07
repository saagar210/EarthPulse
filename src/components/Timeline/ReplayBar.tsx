import { useEffect, useRef } from "react";
import { useReplayStore } from "../../stores/replayStore";
import { useHistoricalStore } from "../../stores/historicalStore";

function formatTimeLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m ago`;
  return `${minutes}m ago`;
}

export function ReplayBar() {
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const currentTime = useReplayStore((s) => s.currentTime);
  const speed = useReplayStore((s) => s.speed);
  const startReplay = useReplayStore((s) => s.startReplay);
  const stopReplay = useReplayStore((s) => s.stopReplay);
  const setPlaying = useReplayStore((s) => s.setPlaying);
  const setTime = useReplayStore((s) => s.setTime);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const fetchReplayData = useReplayStore((s) => s.fetchReplayData);

  const intervalRef = useRef<number | null>(null);
  const now = Date.now();
  const min = now - 24 * 60 * 60 * 1000;

  // Playback loop
  useEffect(() => {
    if (!isReplaying || !isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      useReplayStore.setState((state) => {
        const newTime = state.currentTime + speed * 1000;
        if (newTime >= Date.now()) {
          return { isPlaying: false, currentTime: Date.now() };
        }
        return { currentTime: newTime };
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReplaying, isPlaying, speed]);

  // Fetch data when time changes (debounced)
  useEffect(() => {
    if (!isReplaying) return;
    const timer = setTimeout(() => {
      fetchReplayData(currentTime);
    }, 200);
    return () => clearTimeout(timer);
  }, [currentTime, isReplaying, fetchReplayData]);

  const isExploring = useHistoricalStore((s) => s.isExploring);

  if (isExploring) return null;

  if (!isReplaying) {
    return (
      <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center px-4">
        <button
          onClick={startReplay}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          24h Replay
        </button>
      </div>
    );
  }

  const speeds = [1, 10, 60];

  return (
    <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-3">
      <button
        onClick={() => setPlaying(!isPlaying)}
        className="text-sm w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <div className="flex gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`text-xs px-1.5 py-0.5 rounded ${
              speed === s
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <input
        type="range"
        min={min}
        max={now}
        value={currentTime}
        onChange={(e) => setTime(Number(e.target.value))}
        className="flex-1 accent-blue-500 h-1"
      />

      <span className="text-xs text-gray-400 w-24 text-right">
        {formatTimeLabel(currentTime)}
      </span>
      <span className="text-xs text-gray-500 w-16">
        {formatRelative(currentTime)}
      </span>

      <button
        onClick={stopReplay}
        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
      >
        Exit
      </button>
    </div>
  );
}
