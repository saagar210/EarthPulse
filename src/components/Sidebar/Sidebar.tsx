import { LayerPanel } from "./LayerPanel";
import { StatsPanel } from "./StatsPanel";
import { EventFeed } from "./EventFeed";

export function Sidebar() {
  return (
    <aside className="w-72 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto flex flex-col gap-6">
      <LayerPanel />
      <div className="border-t border-gray-800" />
      <StatsPanel />
      <div className="border-t border-gray-800" />
      <EventFeed />
    </aside>
  );
}
