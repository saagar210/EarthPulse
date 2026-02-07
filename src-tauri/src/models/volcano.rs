use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Volcano {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub status: String,
    pub last_eruption: String,
    pub description: String,
}
