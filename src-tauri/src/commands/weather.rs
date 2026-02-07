use crate::fetchers::weather::fetch_weather;
use crate::models::weather::Weather;

#[tauri::command]
pub async fn get_weather(lat: f64, lon: f64) -> Result<Weather, String> {
    if !lat.is_finite() || !lon.is_finite() {
        return Err("Invalid coordinates".into());
    }
    fetch_weather(lat, lon).await
}
