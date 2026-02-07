use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct OpenMeteoResponse {
    pub latitude: f64,
    pub longitude: f64,
    pub current: CurrentWeather,
}

#[derive(Debug, Deserialize)]
pub struct CurrentWeather {
    #[allow(dead_code)]
    pub time: String,
    pub temperature_2m: f64,
    pub weather_code: u32,
    pub wind_speed_10m: f64,
    pub wind_direction_10m: f64,
    pub relative_humidity_2m: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Weather {
    pub latitude: f64,
    pub longitude: f64,
    pub temperature_c: f64,
    pub weather_code: u32,
    pub weather_description: String,
    pub wind_speed_kmh: f64,
    pub wind_direction: f64,
    pub humidity_pct: f64,
}
