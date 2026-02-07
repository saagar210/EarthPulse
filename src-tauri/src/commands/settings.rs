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
    if !settings.user_lat.is_finite() || settings.user_lat < -90.0 || settings.user_lat > 90.0 {
        return Err("Latitude must be between -90 and 90".to_string());
    }
    if !settings.user_lon.is_finite() || settings.user_lon < -180.0 || settings.user_lon > 180.0 {
        return Err("Longitude must be between -180 and 180".to_string());
    }
    if !settings.mag_threshold.is_finite() || settings.mag_threshold < 0.0 {
        return Err("Magnitude threshold must be non-negative".to_string());
    }
    if !settings.proximity_km.is_finite() || settings.proximity_km < 0.0 {
        return Err("Proximity radius must be non-negative".to_string());
    }

    db.save_settings(
        settings.user_lat,
        settings.user_lon,
        settings.mag_threshold,
        settings.proximity_km,
    );
    Ok(())
}
