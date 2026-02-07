import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useMapStore } from "../../stores/mapStore";

export function MapRef() {
  const map = useMap();
  const setMap = useMapStore((s) => s.setMap);

  useEffect(() => {
    setMap(map);
    return () => setMap(null);
  }, [map, setMap]);

  return null;
}
