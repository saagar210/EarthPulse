import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import {
  useSourceHealthStore,
  type SourceHealthEvent,
} from "../stores/sourceHealthStore";

export function useSourceHealth() {
  const upsertEvent = useSourceHealthStore(function(s) { return s.upsertEvent });

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<SourceHealthEvent>("source:health", (event) => {
      upsertEvent(event.payload);
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((e) => {
        console.error("Failed to subscribe to source health events:", e);
      });

    return () => {
      unlisten?.();
    };
  }, [upsertEvent]);
}
