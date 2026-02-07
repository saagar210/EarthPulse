import { useEventStore } from "../../stores/eventStore";
import { useMapStore } from "../../stores/mapStore";
import type { EventType } from "../../types/event";

const dotColors: Record<EventType, string> = {
  earthquake: "bg-red-500",
  iss: "bg-blue-500",
  volcano: "bg-orange-500",
  aurora: "bg-green-500",
  hazard: "bg-yellow-500",
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function EventFeed() {
  const events = useEventStore((s) => s.events);
  const flyTo = useMapStore((s) => s.flyTo);

  return (
    <div className="space-y-1">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
        Event Feed
      </h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {events.length === 0 && (
          <p className="text-xs text-gray-600">Waiting for events...</p>
        )}
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => flyTo(event.latitude, event.longitude, event.zoom)}
            className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColors[event.type]}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-300 truncate">
                {event.description}
              </div>
              <div className="text-xs text-gray-600">
                {formatRelativeTime(event.time)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
