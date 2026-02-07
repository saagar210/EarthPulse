import { useState } from "react";
import { MagnitudeChart } from "../Charts/MagnitudeChart";
import { FrequencyChart } from "../Charts/FrequencyChart";
import { KpChart } from "../Charts/KpChart";

export function StatsDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs uppercase tracking-wider text-gray-500 font-semibold hover:text-gray-300 transition-colors cursor-pointer"
      >
        <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
          ▶
        </span>
        Charts
      </button>
      {isOpen && (
        <div className="space-y-4">
          <MagnitudeChart />
          <FrequencyChart />
          <KpChart />
        </div>
      )}
    </div>
  );
}
