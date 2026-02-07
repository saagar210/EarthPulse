use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct NeoResponse {
    pub near_earth_objects: HashMap<String, Vec<NeoObject>>,
}

#[derive(Debug, Deserialize)]
pub struct NeoObject {
    pub id: String,
    pub name: String,
    #[allow(dead_code)]
    pub absolute_magnitude_h: Option<f64>,
    pub estimated_diameter: DiameterEstimate,
    pub is_potentially_hazardous_asteroid: bool,
    pub close_approach_data: Vec<CloseApproach>,
}

#[derive(Debug, Deserialize)]
pub struct DiameterEstimate {
    pub kilometers: DiameterRange,
}

#[derive(Debug, Deserialize)]
pub struct DiameterRange {
    pub estimated_diameter_min: f64,
    pub estimated_diameter_max: f64,
}

#[derive(Debug, Deserialize)]
pub struct CloseApproach {
    pub close_approach_date: String,
    pub epoch_date_close_approach: i64,
    pub relative_velocity: Velocity,
    pub miss_distance: MissDistance,
}

#[derive(Debug, Deserialize)]
pub struct Velocity {
    pub kilometers_per_second: String,
}

#[derive(Debug, Deserialize)]
pub struct MissDistance {
    pub kilometers: String,
    pub lunar: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asteroid {
    pub id: String,
    pub name: String,
    pub diameter_km_min: f64,
    pub diameter_km_max: f64,
    pub is_hazardous: bool,
    pub approach_date: String,
    pub approach_time: i64,
    pub velocity_kps: f64,
    pub miss_distance_km: f64,
    pub miss_distance_lunar: f64,
}
