use crate::fetchers::solar::fetch_kp_index;

#[tauri::command]
pub async fn get_solar_data() -> Result<crate::models::solar::SolarData, String> {
    fetch_kp_index().await
}
