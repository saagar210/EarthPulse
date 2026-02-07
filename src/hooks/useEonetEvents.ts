import { useEffect, useRef } from "react";
import { useEonetStore } from "../stores/eonetStore";
import { useEventStore } from "../stores/eventStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import type { EarthEvent } from "../types/event";

export function useEonetEvents() {
  const eonetEvents = useEonetStore((s) => s.events);
  const addEvents = useEventStore((s) => s.addEvents);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const prevIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (eonetEvents.length === 0 || isReplaying || isExploring) return;

    if (isFirstLoad.current) {
      prevIds.current = new Set(eonetEvents.map((e) => e.id));
      isFirstLoad.current = false;

      const recent = eonetEvents.slice(0, 3);
      const events: EarthEvent[] = recent.map((e) => ({
        id: `eonet-${e.id}`,
        type: "wildfire",
        title: e.title,
        description: `${e.category} - ${e.title}`,
        latitude: e.latitude,
        longitude: e.longitude,
        time: new Date(e.date).getTime() || Date.now(),
        zoom: 6,
      }));

      if (events.length > 0) addEvents(events);
      return;
    }

    const newEvents = eonetEvents.filter((e) => !prevIds.current.has(e.id));
    if (newEvents.length === 0) return;

    const events: EarthEvent[] = newEvents.map((e) => ({
      id: `eonet-${e.id}`,
      type: "wildfire",
      title: e.title,
      description: `${e.category} - ${e.title}`,
      latitude: e.latitude,
      longitude: e.longitude,
      time: new Date(e.date).getTime() || Date.now(),
      zoom: 6,
    }));

    addEvents(events);
    prevIds.current = new Set(eonetEvents.map((e) => e.id));
  }, [eonetEvents, addEvents, isReplaying, isExploring]);
}
