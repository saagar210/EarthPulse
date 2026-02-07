import type { Earthquake } from "./earthquake";
import type { IssPosition } from "./iss";

export interface ReplayData {
  earthquakes: Earthquake[];
  iss_position: IssPosition | null;
  terminator: [number, number][];
}
