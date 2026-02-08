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
import { PlateLayer } from "./PlateLayer";
import { MeteorLayer } from "./MeteorLayer";
import { EonetLayer } from "./EonetLayer";
import { WatchlistLayer } from "./WatchlistLayer";
import { MapRef } from "./MapRef";
import { useLayerStore } from "../../stores/layerStore";
import { useMapStore } from "../../stores/mapStore";

export function EarthMap() {
  const earthquakes = useLayerStore((s) => s.earthquakes);
  const earthquakeHeatmap = useLayerStore((s) => s.earthquakeHeatmap);
  const iss = useLayerStore((s) => s.iss);
  const dayNight = useLayerStore((s) => s.dayNight);
  const aurora = useLayerStore((s) => s.aurora);
  const volcanoes = useLayerStore((s) => s.volcanoes);
  const hazards = useLayerStore((s) => s.hazards);
  const satellites = useLayerStore((s) => s.satellites);
  const plates = useLayerStore((s) => s.plates);
  const wildfires = useLayerStore((s) => s.wildfires);
  const meteors = useLayerStore((s) => s.meteors);
  const watchlists = useLayerStore((s) => s.watchlists);
  const tileUrl = useMapStore((s) => s.tileUrl);
  const tileSubdomains = useMapStore((s) => s.tileSubdomains);

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
        key={tileUrl}
        url={tileUrl}
        subdomains={tileSubdomains}
      />
      {dayNight && <DayNightLayer />}
      {aurora && <AuroraLayer />}
      {earthquakes && !earthquakeHeatmap && <EarthquakeLayer />}
      {earthquakes && earthquakeHeatmap && <EarthquakeHeatmapLayer />}
      {volcanoes && <VolcanoLayer />}
      {hazards && <GdacsLayer />}
      {wildfires && <EonetLayer />}
      {plates && <PlateLayer />}
      {meteors && <MeteorLayer />}
      {satellites && <SatelliteLayer />}
      {iss && <ISSLayer />}
      {watchlists && <WatchlistLayer />}
    </MapContainer>
  );
}
