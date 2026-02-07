import { create } from "zustand";
import type { EarthEvent } from "../types/event";

const MAX_EVENTS = 100;

interface EventState {
  events: EarthEvent[];
  addEvent: (event: EarthEvent) => void;
  addEvents: (events: EarthEvent[]) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],

  addEvent: (event) =>
    set((state) => {
      if (state.events.some((e) => e.id === event.id)) return state;
      const events = [event, ...state.events].slice(0, MAX_EVENTS);
      return { events };
    }),

  addEvents: (newEvents) =>
    set((state) => {
      const existing = new Set(state.events.map((e) => e.id));
      const fresh = newEvents.filter((e) => !existing.has(e.id));
      if (fresh.length === 0) return state;
      const events = [...fresh, ...state.events].slice(0, MAX_EVENTS);
      return { events };
    }),
}));
