import { useLayerStore } from "../../stores/layerStore";
import { MapStyleSelector } from "./MapStyleSelector";

const layers = [
  { key: "earthquakes" as const, label: "Earthquakes", color: "accent-red-500" },
  { key: "earthquakeHeatmap" as const, label: "Quake Heatmap", color: "accent-red-500" },
  { key: "iss" as const, label: "ISS Tracker", color: "accent-blue-500" },
  { key: "satellites" as const, label: "Satellites", color: "accent-cyan-500" },
  { key: "dayNight" as const, label: "Day/Night", color: "accent-indigo-500" },
  { key: "aurora" as const, label: "Aurora", color: "accent-green-500" },
  { key: "volcanoes" as const, label: "Volcanoes", color: "accent-orange-500" },
  { key: "hazards" as const, label: "Hazard Alerts", color: "accent-yellow-500" },
  { key: "wildfires" as const, label: "Wildfires", color: "accent-orange-500" },
  { key: "plates" as const, label: "Plate Boundaries", color: "accent-cyan-500" },
  { key: "meteors" as const, label: "Meteor Showers", color: "accent-purple-500" },
  { key: "watchlists" as const, label: "Watchlists", color: "accent-pink-500" },
] as const;

export function LayerPanel() {
  const store = useLayerStore();

  const togglers: Record<string, () => void> = {
    earthquakes: store.toggleEarthquakes,
    earthquakeHeatmap: store.toggleEarthquakeHeatmap,
    iss: store.toggleIss,
    dayNight: store.toggleDayNight,
    aurora: store.toggleAurora,
    volcanoes: store.toggleVolcanoes,
    hazards: store.toggleHazards,
    satellites: store.toggleSatellites,
    plates: store.togglePlates,
    wildfires: store.toggleWildfires,
    meteors: store.toggleMeteors,
    watchlists: store.toggleWatchlists,
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Layers
      </h3>
      {layers.map((layer) => (
        <label key={layer.key} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={store[layer.key]}
            onChange={togglers[layer.key]}
            className={layer.color}
          />
          <span className="text-sm">{layer.label}</span>
        </label>
      ))}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <MapStyleSelector />
      </div>
    </div>
  );
}
