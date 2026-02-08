import { useEffect } from "react";
import { EarthMap } from "./components/Map/EarthMap";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SettingsPanel } from "./components/Settings/SettingsPanel";
import { ReplayBar } from "./components/Timeline/ReplayBar";
import { HistoricalBar } from "./components/Timeline/HistoricalBar";
import { useEarthquakeStore } from "./stores/earthquakeStore";
import { useIssStore } from "./stores/issStore";
import { useTerminatorStore } from "./stores/terminatorStore";
import { useSolarStore } from "./stores/solarStore";
import { useVolcanoStore } from "./stores/volcanoStore";
import { useGdacsStore } from "./stores/gdacsStore";
import { useSatelliteStore } from "./stores/satelliteStore";
import { usePlateStore } from "./stores/plateStore";
import { useMeteorStore } from "./stores/meteorStore";
import { useAsteroidStore } from "./stores/asteroidStore";
import { useEonetStore } from "./stores/eonetStore";
import { useSolarEventStore } from "./stores/solarEventStore";
import { useWatchlistStore } from "./stores/watchlistStore";
import { useEarthquakeEvents } from "./hooks/useEarthquakeEvents";
import { useGdacsEvents } from "./hooks/useGdacsEvents";
import { useAsteroidEvents } from "./hooks/useAsteroidEvents";
import { useEonetEvents } from "./hooks/useEonetEvents";
import { useSonification } from "./hooks/useSonification";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { ShortcutsHelp } from "./components/Sidebar/ShortcutsHelp";

export default function App() {
  const fetchQuakes = useEarthquakeStore((s) => s.fetch);
  const listenQuakes = useEarthquakeStore((s) => s.startListening);
  const fetchIss = useIssStore((s) => s.fetch);
  const listenIss = useIssStore((s) => s.startListening);
  const fetchTerminator = useTerminatorStore((s) => s.fetch);
  const listenTerminator = useTerminatorStore((s) => s.startListening);
  const fetchSolar = useSolarStore((s) => s.fetch);
  const listenSolar = useSolarStore((s) => s.startListening);
  const fetchVolcanoes = useVolcanoStore((s) => s.fetch);
  const listenVolcanoes = useVolcanoStore((s) => s.startListening);
  const fetchGdacs = useGdacsStore((s) => s.fetch);
  const listenGdacs = useGdacsStore((s) => s.startListening);
  const fetchSatellites = useSatelliteStore((s) => s.fetch);
  const listenSatellites = useSatelliteStore((s) => s.startListening);
  const fetchPlates = usePlateStore((s) => s.fetch);
  const listenPlates = usePlateStore((s) => s.startListening);
  const fetchMeteors = useMeteorStore((s) => s.fetch);
  const listenMeteors = useMeteorStore((s) => s.startListening);
  const fetchEonet = useEonetStore((s) => s.fetch);
  const listenEonet = useEonetStore((s) => s.startListening);
  const fetchAsteroids = useAsteroidStore((s) => s.fetch);
  const listenAsteroids = useAsteroidStore((s) => s.startListening);
  const fetchSolarActivity = useSolarEventStore((s) => s.fetch);
  const listenSolarActivity = useSolarEventStore((s) => s.startListening);
  const fetchWatchlists = useWatchlistStore((s) => s.fetch);

  useEarthquakeEvents();
  useGdacsEvents();
  useAsteroidEvents();
  useEonetEvents();
  useSonification();
  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  useEffect(() => {
    fetchQuakes();
    fetchIss();
    fetchTerminator();
    fetchSolar();
    fetchVolcanoes();
    fetchGdacs();
    fetchSatellites();
    fetchPlates();
    fetchMeteors();
    fetchEonet();
    fetchAsteroids();
    fetchSolarActivity();
    fetchWatchlists();

    const listeners = Promise.all([
      listenQuakes(),
      listenIss(),
      listenTerminator(),
      listenSolar(),
      listenVolcanoes(),
      listenGdacs(),
      listenSatellites(),
      listenPlates(),
      listenMeteors(),
      listenEonet(),
      listenAsteroids(),
      listenSolarActivity(),
    ]);

    return () => {
      listeners
        .then((fns) => fns.forEach((fn) => fn()))
        .catch((e) => console.error("Failed to clean up listeners:", e));
    };
  }, [
    fetchQuakes, listenQuakes,
    fetchIss, listenIss,
    fetchTerminator, listenTerminator,
    fetchSolar, listenSolar,
    fetchVolcanoes, listenVolcanoes,
    fetchGdacs, listenGdacs,
    fetchSatellites, listenSatellites,
    fetchPlates, listenPlates,
    fetchMeteors, listenMeteors,
    fetchEonet, listenEonet,
    fetchAsteroids, listenAsteroids,
    fetchSolarActivity, listenSolarActivity,
    fetchWatchlists,
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-200 overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 relative">
          <EarthMap />
        </main>
        <Sidebar />
      </div>
      <ReplayBar />
      <HistoricalBar />
      <SettingsPanel />
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
