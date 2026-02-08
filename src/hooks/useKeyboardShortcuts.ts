import { useEffect, useState } from "react";
import { useLayerStore } from "../stores/layerStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import { useSettingsStore } from "../stores/settingsStore";
import { saveScreenshot } from "../utils/export";

export function useKeyboardShortcuts(): {
  showHelp: boolean;
  setShowHelp: (v: boolean) => void;
} {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch (e.key) {
        case "1":
          useLayerStore.getState().toggleEarthquakes();
          break;
        case "2":
          useLayerStore.getState().toggleIss();
          break;
        case "3":
          useLayerStore.getState().toggleSatellites();
          break;
        case "4":
          useLayerStore.getState().toggleDayNight();
          break;
        case "5":
          useLayerStore.getState().toggleAurora();
          break;
        case "6":
          useLayerStore.getState().toggleVolcanoes();
          break;
        case "7":
          useLayerStore.getState().toggleHazards();
          break;
        case "8":
          useLayerStore.getState().toggleWildfires();
          break;
        case "9":
          useLayerStore.getState().togglePlates();
          break;
        case " ":
          e.preventDefault();
          // Toggle replay play/pause
          {
            const replay = useReplayStore.getState();
            if (replay.isReplaying) {
              replay.setPlaying(!replay.isPlaying);
            }
          }
          break;
        case "r":
          {
            const replay = useReplayStore.getState();
            if (replay.isReplaying) {
              replay.stopReplay();
            } else {
              replay.startReplay();
            }
          }
          break;
        case "h":
          {
            const hist = useHistoricalStore.getState();
            if (hist.isExploring) {
              hist.stopExploring();
            } else {
              hist.startExploring();
            }
          }
          break;
        case "s":
          saveScreenshot().catch((err) =>
            console.error("Screenshot failed:", err),
          );
          break;
        case "Escape":
          if (useSettingsStore.getState().isOpen) {
            useSettingsStore.getState().toggle();
          }
          setShowHelp(false);
          break;
        case "?":
          setShowHelp((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { showHelp, setShowHelp };
}
