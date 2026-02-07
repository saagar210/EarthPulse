use crate::db::Database;
use serde::Deserialize;
use tauri::State;

#[derive(Deserialize)]
pub struct SaveSettingsPayload {
    pub user_lat: f64,
    pub user_lon: f64,
    pub mag_threshold: f64,
    pub proximity_km: f64,
}

#[tauri::command]
pub fn save_settings(
    settings: SaveSettingsPayload,
    db: State<'_, Database>,
) -> Result<(), String> {
    db.save_settings(
        settings.user_lat,
        settings.user_lon,
        settings.mag_threshold,
        settings.proximity_km,
    );
    Ok(())
}
