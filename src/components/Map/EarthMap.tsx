import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EarthquakeLayer } from "./EarthquakeLayer";
import { EarthquakeHeatmapLayer } from "./EarthquakeHeatmapLayer";
import { ISSLayer } from "./ISSLayer";
import { DayNightLayer } from "./DayNightLayer";
import { AuroraLayer } from "./AuroraLayer";
import { VolcanoLayer } from "./VolcanoLayer";
import { GdacsLayer } from "./GdacsLayer";
import { SatelliteLayer } from "./SatelliteLayer";
import { MapRef } from "./MapRef";
import { useLayerStore } from "../Sidebar/LayerPanel";

export function EarthMap() {
  const layers = useLayerStore();

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={18}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <MapRef />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {layers.dayNight && <DayNightLayer />}
      {layers.aurora && <AuroraLayer />}
      {layers.earthquakes && !layers.earthquakeHeatmap && <EarthquakeLayer />}
      {layers.earthquakes && layers.earthquakeHeatmap && <EarthquakeHeatmapLayer />}
      {layers.volcanoes && <VolcanoLayer />}
      {layers.hazards && <GdacsLayer />}
      {layers.satellites && <SatelliteLayer />}
      {layers.iss && <ISSLayer />}
    </MapContainer>
  );
}
