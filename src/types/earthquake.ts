export interface Earthquake {
  id: string;
  magnitude: number;
  latitude: number;
  longitude: number;
  depth: number;
  place: string;
  time: number;
  tsunami: boolean;
  title: string;
}
