import { useEffect, useRef } from "react";
import { useGdacsStore } from "../stores/gdacsStore";
import { useEventStore } from "../stores/eventStore";
import { useReplayStore } from "../stores/replayStore";
import { useHistoricalStore } from "../stores/historicalStore";
import type { EarthEvent } from "../types/event";

export function useGdacsEvents() {
  const alerts = useGdacsStore((s) => s.alerts);
  const addEvents = useEventStore((s) => s.addEvents);
  const isReplaying = useReplayStore((s) => s.isReplaying);
  const isExploring = useHistoricalStore((s) => s.isExploring);
  const prevIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (alerts.length === 0 || isReplaying || isExploring) return;

    if (isFirstLoad.current) {
      prevIds.current = new Set(alerts.map((a) => a.id));
      isFirstLoad.current = false;

      const recent = alerts.slice(0, 3);
      const events: EarthEvent[] = recent.map((a) => ({
        id: `gdacs-${a.id}`,
        type: "hazard",
        title: a.title,
        description: `${a.severity} ${a.alert_type} - ${a.country || "Global"}`,
        latitude: a.latitude,
        longitude: a.longitude,
        time: a.pub_date ? new Date(a.pub_date).getTime() || Date.now() : Date.now(),
        zoom: 5,
      }));

      if (events.length > 0) addEvents(events);
      return;
    }

    const newAlerts = alerts.filter((a) => !prevIds.current.has(a.id));
    if (newAlerts.length === 0) return;

    const events: EarthEvent[] = newAlerts.map((a) => ({
      id: `gdacs-${a.id}`,
      type: "hazard",
      title: a.title,
      description: `${a.severity} ${a.alert_type} - ${a.country || "Global"}`,
      latitude: a.latitude,
      longitude: a.longitude,
      time: a.pub_date ? new Date(a.pub_date).getTime() || Date.now() : Date.now(),
      zoom: 5,
    }));

    addEvents(events);
    prevIds.current = new Set(alerts.map((a) => a.id));
  }, [alerts, addEvents, isReplaying, isExploring]);
}
