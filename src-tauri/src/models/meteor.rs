use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveShower {
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub is_active: bool,
    pub is_peak: bool,
    pub peak_date: String,
    pub zhr: u32,
    pub velocity_kps: f64,
    pub parent_body: String,
    pub days_until_peak: i32,
}
