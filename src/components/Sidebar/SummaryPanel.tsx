import { useSummaryStore } from "../../stores/summaryStore";
import { useSettingsStore } from "../../stores/settingsStore";

export function SummaryPanel() {
  const summary = useSummaryStore((s) => s.summary);
  const loading = useSummaryStore((s) => s.loading);
  const error = useSummaryStore((s) => s.error);
  const generate = useSummaryStore((s) => s.generate);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
          AI Summary
        </h3>
        <button
          onClick={() => generate(ollamaModel)}
          disabled={loading}
          className="text-xs px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 rounded px-2 py-1.5">
          {error}
        </div>
      )}

      {summary && (
        <div className="text-xs text-gray-300 bg-gray-800/50 rounded px-3 py-2 leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      )}

      {!summary && !error && !loading && (
        <div className="text-xs text-gray-600">
          Requires local Ollama ({ollamaModel})
        </div>
      )}
    </div>
  );
}
