use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct PlateGeoJson {
    pub features: Vec<PlateFeature>,
}

#[derive(Debug, Deserialize)]
pub struct PlateFeature {
    pub properties: PlateProperties,
    pub geometry: PlateGeometry,
}

#[derive(Debug, Deserialize)]
pub struct PlateProperties {
    #[serde(alias = "Name")]
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PlateGeometry {
    #[serde(rename = "type")]
    pub geom_type: String,
    pub coordinates: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlateBoundary {
    pub name: String,
    pub boundary_type: String,
    pub coordinates: Vec<[f64; 2]>,
}
