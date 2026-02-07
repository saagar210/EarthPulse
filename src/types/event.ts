export type EventType = "earthquake" | "iss" | "volcano" | "aurora" | "hazard";

export interface EarthEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  time: number;
  zoom?: number;
}
