use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolarData {
    pub kp_index: f64,
    pub kp_timestamp: String,
}
