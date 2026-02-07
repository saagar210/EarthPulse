import { useEffect, useRef } from "react";
import { useEarthquakeStore } from "../stores/earthquakeStore";
import { useEventStore } from "../stores/eventStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import type { EarthEvent } from "../types/event";

export function useEarthquakeEvents() {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);
  const addEvents = useEventStore((s) => s.addEvents);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const prevIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (earthquakes.length === 0 || isReplaying || isExploring) return;

    if (isFirstLoad.current) {
      // On first load, seed prevIds with all existing IDs without flooding the feed.
      // Only add the 5 most recent as initial events so the feed isn't empty.
      prevIds.current = new Set(earthquakes.map((eq) => eq.id));
      isFirstLoad.current = false;

      const recent = [...earthquakes]
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

      const events: EarthEvent[] = recent.map((eq) => ({
        id: `eq-${eq.id}`,
        type: "earthquake",
        title: eq.title,
        description: `M${eq.magnitude.toFixed(1)} - ${eq.place}`,
        latitude: eq.latitude,
        longitude: eq.longitude,
        time: eq.time,
        zoom: eq.magnitude >= 5 ? 6 : 8,
      }));

      if (events.length > 0) addEvents(events);
      return;
    }

    const newQuakes = earthquakes.filter((eq) => !prevIds.current.has(eq.id));
    if (newQuakes.length === 0) return;

    const events: EarthEvent[] = newQuakes.map((eq) => ({
      id: `eq-${eq.id}`,
      type: "earthquake",
      title: eq.title,
      description: `M${eq.magnitude.toFixed(1)} - ${eq.place}`,
      latitude: eq.latitude,
      longitude: eq.longitude,
      time: eq.time,
      zoom: eq.magnitude >= 5 ? 6 : 8,
    }));

    events.sort((a, b) => b.time - a.time);
    addEvents(events);

    prevIds.current = new Set(earthquakes.map((eq) => eq.id));
  }, [earthquakes, addEvents, isReplaying, isExploring]);
}
