use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct AQResponse {
    pub latitude: f64,
    pub longitude: f64,
    pub current: CurrentAQ,
}

#[derive(Debug, Deserialize)]
pub struct CurrentAQ {
    #[allow(dead_code)]
    pub time: String,
    #[allow(dead_code)]
    pub european_aqi: Option<f64>,
    pub us_aqi: Option<f64>,
    pub pm2_5: Option<f64>,
    pub pm10: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AirQuality {
    pub latitude: f64,
    pub longitude: f64,
    pub us_aqi: u32,
    pub category: String,
    pub color: String,
    pub pm2_5: f64,
    pub pm10: f64,
}
