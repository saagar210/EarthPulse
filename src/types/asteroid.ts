export interface Asteroid {
  id: string;
  name: string;
  diameter_km_min: number;
  diameter_km_max: number;
  is_hazardous: boolean;
  approach_date: string;
  approach_time: number;
  velocity_kps: number;
  miss_distance_km: number;
  miss_distance_lunar: number;
}
