import { LayerPanel } from "./LayerPanel";
import { StatsPanel } from "./StatsPanel";
import { EventFeed } from "./EventFeed";
import { MeteorPanel } from "./MeteorPanel";
import { AsteroidPanel } from "./AsteroidPanel";
import { SolarActivityPanel } from "./SolarActivityPanel";
import { WeatherCard } from "./WeatherCard";
import { StatsDashboard } from "./StatsDashboard";
import { SummaryPanel } from "./SummaryPanel";
import { WatchlistPanel } from "./WatchlistPanel";
import { SourceHealthPanel } from "./SourceHealthPanel";
import { isBrowserPreviewMode } from "../../runtime/tauri";

export function Sidebar() {
  const isPreviewMode = isBrowserPreviewMode();

  return (
    <aside className="w-72 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto flex flex-col gap-6">
      {isPreviewMode && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Browser preview uses mocked desktop data so we can smoke-test UI flows
          without the Tauri bridge.
        </div>
      )}
      <LayerPanel />
      <div className="border-t border-gray-800" />
      <StatsPanel />
      <div className="border-t border-gray-800" />
      <MeteorPanel />
      <div className="border-t border-gray-800" />
      <AsteroidPanel />
      <div className="border-t border-gray-800" />
      <SolarActivityPanel />
      <div className="border-t border-gray-800" />
      <WeatherCard />
      <div className="border-t border-gray-800" />
      <StatsDashboard />
      <div className="border-t border-gray-800" />
      <SummaryPanel />
      <div className="border-t border-gray-800" />
      <WatchlistPanel />
      <div className="border-t border-gray-800" />
      <SourceHealthPanel />
      <div className="border-t border-gray-800" />
      <EventFeed />
    </aside>
  );
}
