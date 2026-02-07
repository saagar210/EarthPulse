export interface SatellitePosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  timestamp: number;
}

export interface OrbitTrack {
  satellite_id: string;
  points: [number, number][];
}

export interface SatelliteData {
  positions: SatellitePosition[];
  orbits: OrbitTrack[];
}

export interface PassPrediction {
  satellite_id: string;
  name: string;
  start_time: number;
  end_time: number;
  max_elevation: number;
  start_azimuth: number;
  is_visible: boolean;
}
