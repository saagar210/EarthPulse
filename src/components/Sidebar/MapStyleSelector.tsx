import { useMapStore } from "../../stores/mapStore";

const styles = [
  {
    name: "Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
  },
  {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
  },
  {
    name: "Topographic",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
  },
  {
    name: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
  },
];

export function MapStyleSelector() {
  const tileUrl = useMapStore((s) => s.tileUrl);
  const setMapStyle = useMapStore((s) => s.setMapStyle);

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Map Style
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {styles.map((style) => (
          <button
            key={style.name}
            onClick={() => setMapStyle(style.url, style.subdomains)}
            className={`text-xs px-2 py-1.5 rounded transition-colors ${
              tileUrl === style.url
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}
