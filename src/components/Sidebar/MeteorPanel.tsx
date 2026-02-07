import { useMeteorStore } from "../../stores/meteorStore";

export function MeteorPanel() {
  const showers = useMeteorStore((s) => s.showers);
  const sorted = [...showers].sort((a, b) => {
    // Active showers first, then by days until peak
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;
    return a.days_until_peak - b.days_until_peak;
  });

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Meteor Showers
      </h3>
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
        {sorted.slice(0, 10).map((shower) => (
          <div
            key={shower.name}
            className={`px-2 py-1.5 rounded text-xs ${
              shower.is_active
                ? "bg-purple-900/30 border border-purple-800/50"
                : "bg-gray-800/50"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-200">
                {shower.is_peak && "⭐ "}
                {shower.name}
              </span>
              <span className="text-gray-500 text-[10px]">
                ZHR {shower.zhr}
              </span>
            </div>
            <div className="text-gray-400 mt-0.5">
              Peak: {shower.peak_date}
              {shower.is_active ? (
                <span className="text-purple-400 ml-2">Active now</span>
              ) : shower.days_until_peak > 0 ? (
                <span className="ml-2">in {shower.days_until_peak}d</span>
              ) : (
                <span className="ml-2">{Math.abs(shower.days_until_peak)}d ago</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
