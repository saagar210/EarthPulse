export interface SolarFlare {
  id: string;
  class_type: string;
  peak_time: string;
  source_location: string | null;
}

export interface CoronalMassEjection {
  id: string;
  start_time: string;
  speed_kps: number | null;
  is_earth_directed: boolean;
  note: string | null;
}

export interface SolarActivity {
  flares: SolarFlare[];
  cmes: CoronalMassEjection[];
}
