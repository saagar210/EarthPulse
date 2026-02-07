import { Circle, Tooltip } from "react-leaflet";
import { useWatchlistStore } from "../../stores/watchlistStore";

export function WatchlistLayer() {
  const watchlists = useWatchlistStore((s) => s.watchlists);

  return (
    <>
      {watchlists.map((w) => (
        <Circle
          key={w.id}
          center={[w.latitude, w.longitude]}
          radius={w.radius_km * 1000}
          pathOptions={{
            color: "#ec4899",
            fillColor: "#ec4899",
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: "6 4",
          }}
        >
          <Tooltip direction="top" permanent className="watchlist-label">
            {w.name}
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}
