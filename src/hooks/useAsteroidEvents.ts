import { useEffect, useRef } from "react";
import { useAsteroidStore } from "../stores/asteroidStore";
import { useEventStore } from "../stores/eventStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import type { EarthEvent } from "../types/event";

export function useAsteroidEvents() {
  const asteroids = useAsteroidStore((s) => s.asteroids);
  const addEvents = useEventStore((s) => s.addEvents);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const prevIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (asteroids.length === 0 || isReplaying || isExploring) return;

    if (isFirstLoad.current) {
      prevIds.current = new Set(asteroids.map((a) => a.id));
      isFirstLoad.current = false;

      // Show closest 3 approaches as initial events
      const closest = [...asteroids].slice(0, 3);
      const events: EarthEvent[] = closest.map((a) => ({
        id: `neo-${a.id}`,
        type: "asteroid",
        title: a.name,
        description: `${a.is_hazardous ? "⚠️ " : ""}${a.name.replace(/[()]/g, "")} — ${a.miss_distance_lunar.toFixed(1)} LD`,
        latitude: 0,
        longitude: 0,
        time: a.approach_time,
      }));

      if (events.length > 0) addEvents(events);
      return;
    }

    const newAsteroids = asteroids.filter((a) => !prevIds.current.has(a.id));
    if (newAsteroids.length === 0) return;

    const events: EarthEvent[] = newAsteroids.map((a) => ({
      id: `neo-${a.id}`,
      type: "asteroid",
      title: a.name,
      description: `${a.is_hazardous ? "⚠️ " : ""}${a.name.replace(/[()]/g, "")} — ${a.miss_distance_lunar.toFixed(1)} LD`,
      latitude: 0,
      longitude: 0,
      time: a.approach_time,
    }));

    addEvents(events);
    prevIds.current = new Set(asteroids.map((a) => a.id));
  }, [asteroids, addEvents, isReplaying, isExploring]);
}
