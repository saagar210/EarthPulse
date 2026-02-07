use crate::fetchers::sst::fetch_sst;
use crate::models::sst::SeaSurfaceTemp;

#[tauri::command]
pub async fn get_sst(lat: f64, lon: f64) -> Result<SeaSurfaceTemp, String> {
    if !lat.is_finite() || !lon.is_finite() {
        return Err("Invalid coordinates".into());
    }
    fetch_sst(lat, lon).await
}
