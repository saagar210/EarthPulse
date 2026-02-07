use super::http::HTTP_CLIENT;
use crate::models::air_quality::{AQResponse, AirQuality};

fn aqi_category(aqi: u32) -> (&'static str, &'static str) {
    match aqi {
        0..=50 => ("Good", "#22c55e"),
        51..=100 => ("Moderate", "#eab308"),
        101..=150 => ("Unhealthy for Sensitive Groups", "#f97316"),
        151..=200 => ("Unhealthy", "#ef4444"),
        201..=300 => ("Very Unhealthy", "#7c3aed"),
        _ => ("Hazardous", "#991b1b"),
    }
}

pub async fn fetch_air_quality(lat: f64, lon: f64) -> Result<AirQuality, String> {
    if !lat.is_finite() || !lon.is_finite() {
        return Err("Invalid coordinates".into());
    }

    let url = format!(
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude={}&longitude={}&current=european_aqi,us_aqi,pm2_5,pm10",
        lat, lon
    );

    let response = HTTP_CLIENT
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch air quality: {}", e))?;

    let data: AQResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse AQ data: {}", e))?;

    let aqi = data.current.us_aqi.unwrap_or(0.0) as u32;
    let (category, color) = aqi_category(aqi);

    Ok(AirQuality {
        latitude: data.latitude,
        longitude: data.longitude,
        us_aqi: aqi,
        category: category.to_string(),
        color: color.to_string(),
        pm2_5: data.current.pm2_5.unwrap_or(0.0),
        pm10: data.current.pm10.unwrap_or(0.0),
    })
}
