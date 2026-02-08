use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct UsgsResponse {
    pub features: Vec<UsgsFeature>,
}

#[derive(Debug, Deserialize)]
pub struct UsgsFeature {
    pub properties: UsgsProperties,
    pub geometry: UsgsGeometry,
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct UsgsProperties {
    pub mag: Option<f64>,
    pub place: Option<String>,
    pub time: Option<i64>,
    #[allow(dead_code)]
    pub updated: Option<i64>,
    pub tsunami: Option<i32>,
    pub title: Option<String>,
    #[allow(dead_code)]
    pub alert: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UsgsGeometry {
    pub coordinates: Vec<f64>, // [lon, lat, depth]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Earthquake {
    pub id: String,
    pub magnitude: f64,
    pub latitude: f64,
    pub longitude: f64,
    pub depth: f64,
    pub place: String,
    pub time: i64,
    pub tsunami: bool,
    pub title: String,
}

impl Earthquake {
    pub fn from_feature(feature: &UsgsFeature) -> Option<Self> {
        let coords = &feature.geometry.coordinates;
        if coords.len() < 3 {
            return None;
        }

        let mag = feature.properties.mag.unwrap_or(0.0);
        let lon = coords[0];
        let lat = coords[1];
        let depth = coords[2];

        if !mag.is_finite() || !lon.is_finite() || !lat.is_finite() || !depth.is_finite() {
            return None;
        }

        Some(Earthquake {
            id: feature.id.clone(),
            magnitude: mag,
            longitude: lon,
            latitude: lat,
            depth,
            place: feature
                .properties
                .place
                .clone()
                .unwrap_or_else(|| "Unknown".to_string()),
            time: feature.properties.time.unwrap_or(0),
            tsunami: feature.properties.tsunami.unwrap_or(0) == 1,
            title: feature
                .properties
                .title
                .clone()
                .unwrap_or_else(|| "Unknown earthquake".to_string()),
        })
    }
}
