use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SatellitePosition {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub altitude_km: f64,
    pub velocity_kmh: f64,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrbitTrack {
    pub satellite_id: String,
    pub points: Vec<[f64; 2]>, // [lat, lon]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SatelliteData {
    pub positions: Vec<SatellitePosition>,
    pub orbits: Vec<OrbitTrack>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PassPrediction {
    pub satellite_id: String,
    pub name: String,
    pub start_time: i64,   // unix seconds
    pub end_time: i64,
    pub max_elevation: f64, // degrees
    pub start_azimuth: f64, // degrees
    pub is_visible: bool,
}
