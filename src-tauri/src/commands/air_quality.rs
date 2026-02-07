use crate::fetchers::air_quality::fetch_air_quality;
use crate::models::air_quality::AirQuality;

#[tauri::command]
pub async fn get_air_quality(lat: f64, lon: f64) -> Result<AirQuality, String> {
    if !lat.is_finite() || !lon.is_finite() {
        return Err("Invalid coordinates".into());
    }
    fetch_air_quality(lat, lon).await
}
