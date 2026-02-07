import { create } from "zustand";

interface LayerState {
  earthquakes: boolean;
  earthquakeHeatmap: boolean;
  iss: boolean;
  dayNight: boolean;
  aurora: boolean;
  volcanoes: boolean;
  hazards: boolean;
  satellites: boolean;
  toggleEarthquakes: () => void;
  toggleEarthquakeHeatmap: () => void;
  toggleIss: () => void;
  toggleDayNight: () => void;
  toggleAurora: () => void;
  toggleVolcanoes: () => void;
  toggleHazards: () => void;
  toggleSatellites: () => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  earthquakes: true,
  earthquakeHeatmap: false,
  iss: true,
  dayNight: true,
  aurora: true,
  volcanoes: true,
  hazards: true,
  satellites: true,
  toggleEarthquakes: () => set((s) => ({ earthquakes: !s.earthquakes })),
  toggleEarthquakeHeatmap: () => set((s) => ({ earthquakeHeatmap: !s.earthquakeHeatmap })),
  toggleIss: () => set((s) => ({ iss: !s.iss })),
  toggleDayNight: () => set((s) => ({ dayNight: !s.dayNight })),
  toggleAurora: () => set((s) => ({ aurora: !s.aurora })),
  toggleVolcanoes: () => set((s) => ({ volcanoes: !s.volcanoes })),
  toggleHazards: () => set((s) => ({ hazards: !s.hazards })),
  toggleSatellites: () => set((s) => ({ satellites: !s.satellites })),
}));

const layers = [
  { key: "earthquakes" as const, label: "Earthquakes", color: "accent-red-500" },
  { key: "earthquakeHeatmap" as const, label: "Quake Heatmap", color: "accent-red-500" },
  { key: "iss" as const, label: "ISS Tracker", color: "accent-blue-500" },
  { key: "satellites" as const, label: "Satellites", color: "accent-cyan-500" },
  { key: "dayNight" as const, label: "Day/Night", color: "accent-indigo-500" },
  { key: "aurora" as const, label: "Aurora", color: "accent-green-500" },
  { key: "volcanoes" as const, label: "Volcanoes", color: "accent-orange-500" },
  { key: "hazards" as const, label: "Hazard Alerts", color: "accent-yellow-500" },
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
    </div>
  );
}
