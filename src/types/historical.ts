import type { Earthquake } from "./earthquake";

export interface HistoricalSummary {
  total: number;
  strongest_mag: number;
  strongest_place: string;
  avg_depth: number;
  tsunami_count: number;
}

export interface HistoricalResult {
  earthquakes: Earthquake[];
  summary: HistoricalSummary;
}
