use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct EonetResponse {
    pub events: Vec<EonetEvent>,
}

#[derive(Debug, Deserialize)]
pub struct EonetEvent {
    pub id: String,
    pub title: String,
    #[allow(dead_code)]
    pub description: Option<String>,
    pub categories: Vec<EonetCategory>,
    pub geometry: Vec<EonetGeometry>,
}

#[derive(Debug, Deserialize)]
pub struct EonetCategory {
    pub id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct EonetGeometry {
    pub date: String,
    #[serde(rename = "type")]
    #[allow(dead_code)]
    pub geom_type: String,
    pub coordinates: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NaturalEvent {
    pub id: String,
    pub title: String,
    pub category: String,
    pub category_id: String,
    pub latitude: f64,
    pub longitude: f64,
    pub date: String,
}
