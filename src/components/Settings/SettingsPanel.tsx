import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../../stores/settingsStore";

export function SettingsPanel() {
  const store = useSettingsStore();

  // Local state for all editable fields — snapshot store values when panel opens
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [magThreshold, setMagThreshold] = useState(5.0);
  const [proximityRadius, setProximityRadius] = useState(500);
  const [notifyEq, setNotifyEq] = useState(true);
  const [notifyAurora, setNotifyAurora] = useState(true);
  const [notifyVolc, setNotifyVolc] = useState(true);

  // Sync local state from store whenever the panel opens
  useEffect(() => {
    if (store.isOpen) {
      setLat(store.userLat.toString());
      setLon(store.userLon.toString());
      setMagThreshold(store.earthquakeMagThreshold);
      setProximityRadius(store.proximityRadius);
      setNotifyEq(store.notifyEarthquakes);
      setNotifyAurora(store.notifyAurora);
      setNotifyVolc(store.notifyVolcanoes);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isOpen]);

  if (!store.isOpen) return null;

  const handleSave = () => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const validCoords = !isNaN(parsedLat) && !isNaN(parsedLon)
      && parsedLat >= -90 && parsedLat <= 90
      && parsedLon >= -180 && parsedLon <= 180;

    if (validCoords) {
      store.setLocation(parsedLat, parsedLon);
    }
    store.setEarthquakeMagThreshold(magThreshold);
    store.setProximityRadius(proximityRadius);
    store.setNotifyEarthquakes(notifyEq);
    store.setNotifyAurora(notifyAurora);
    store.setNotifyVolcanoes(notifyVolc);

    // Persist to Rust backend only with valid coordinates
    if (validCoords) {
      invoke("save_settings", {
        settings: {
          user_lat: parsedLat,
          user_lon: parsedLon,
          mag_threshold: magThreshold,
          proximity_km: proximityRadius,
        },
      }).catch((e) => console.error("Failed to save settings:", e));
    }

    store.toggle();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96 space-y-5 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold">Settings</h2>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Location</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Latitude</label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="0.0001"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Longitude</label>
              <input
                type="number"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                step="0.0001"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800" />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Notifications</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEq}
              onChange={(e) => setNotifyEq(e.target.checked)}
              className="accent-red-500"
            />
            <span className="text-sm">Earthquake alerts</span>
          </label>

          <div className="ml-6 space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Global threshold: M{magThreshold.toFixed(1)}+
              </label>
              <input
                type="range"
                min={3}
                max={8}
                step={0.5}
                value={magThreshold}
                onChange={(e) => setMagThreshold(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Proximity: {proximityRadius} km
              </label>
              <input
                type="range"
                min={100}
                max={2000}
                step={100}
                value={proximityRadius}
                onChange={(e) => setProximityRadius(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyAurora}
              onChange={(e) => setNotifyAurora(e.target.checked)}
              className="accent-green-500"
            />
            <span className="text-sm">Aurora / Kp alerts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyVolc}
              onChange={(e) => setNotifyVolc(e.target.checked)}
              className="accent-orange-500"
            />
            <span className="text-sm">Volcano alerts</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={store.toggle}
            className="px-3 py-1.5 text-sm rounded bg-gray-800 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
