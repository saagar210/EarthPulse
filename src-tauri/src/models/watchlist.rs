use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Watchlist {
    pub id: i64,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub radius_km: f64,
    pub created_at: i64,
}
