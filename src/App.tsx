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
import { useEarthquakeEvents } from "./hooks/useEarthquakeEvents";
import { useGdacsEvents } from "./hooks/useGdacsEvents";

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

  useEarthquakeEvents();
  useGdacsEvents();

  useEffect(() => {
    fetchQuakes();
    fetchIss();
    fetchTerminator();
    fetchSolar();
    fetchVolcanoes();
    fetchGdacs();
    fetchSatellites();

    const listeners = Promise.all([
      listenQuakes(),
      listenIss(),
      listenTerminator(),
      listenSolar(),
      listenVolcanoes(),
      listenGdacs(),
      listenSatellites(),
    ]);

    return () => {
      listeners.then((fns) => fns.forEach((fn) => fn()));
    };
  }, [
    fetchQuakes, listenQuakes,
    fetchIss, listenIss,
    fetchTerminator, listenTerminator,
    fetchSolar, listenSolar,
    fetchVolcanoes, listenVolcanoes,
    fetchGdacs, listenGdacs,
    fetchSatellites, listenSatellites,
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
    </div>
  );
}
