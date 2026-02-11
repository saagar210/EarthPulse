use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Deserialize)]
pub struct SaveSettingsPayload {
    pub user_lat: f64,
    pub user_lon: f64,
    pub mag_threshold: f64,
    pub proximity_km: f64,
    pub notify_earthquakes: bool,
    pub notify_aurora: bool,
    pub notify_volcanoes: bool,
    pub sonification_enabled: bool,
    pub ollama_model: String,
}

#[derive(Serialize)]
pub struct SettingsResponse {
    pub user_lat: Option<f64>,
    pub user_lon: Option<f64>,
    pub mag_threshold: Option<f64>,
    pub proximity_km: Option<f64>,
    pub notify_earthquakes: Option<bool>,
    pub notify_aurora: Option<bool>,
    pub notify_volcanoes: Option<bool>,
    pub sonification_enabled: Option<bool>,
    pub ollama_model: Option<String>,
}

#[tauri::command]
pub fn get_settings(db: State<'_, Database>) -> Result<SettingsResponse, String> {
    let settings = db.get_settings();
    Ok(SettingsResponse {
        user_lat: settings.user_lat,
        user_lon: settings.user_lon,
        mag_threshold: settings.mag_threshold,
        proximity_km: settings.proximity_km,
        notify_earthquakes: settings.notify_earthquakes,
        notify_aurora: settings.notify_aurora,
        notify_volcanoes: settings.notify_volcanoes,
        sonification_enabled: settings.sonification_enabled,
        ollama_model: settings.ollama_model,
    })
}

#[tauri::command]
pub fn save_settings(settings: SaveSettingsPayload, db: State<'_, Database>) -> Result<(), String> {
    validate_settings(&settings)?;

    db.save_settings(
        settings.user_lat,
        settings.user_lon,
        settings.mag_threshold,
        settings.proximity_km,
        settings.notify_earthquakes,
        settings.notify_aurora,
        settings.notify_volcanoes,
        settings.sonification_enabled,
        settings.ollama_model.trim(),
    );
    Ok(())
}

fn validate_settings(settings: &SaveSettingsPayload) -> Result<(), String> {
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
    if settings.ollama_model.trim().is_empty() {
        return Err("Ollama model is required".to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{validate_settings, SaveSettingsPayload};

    fn valid_payload() -> SaveSettingsPayload {
        SaveSettingsPayload {
            user_lat: 37.3382,
            user_lon: -121.8863,
            mag_threshold: 5.0,
            proximity_km: 500.0,
            notify_earthquakes: true,
            notify_aurora: true,
            notify_volcanoes: true,
            sonification_enabled: false,
            ollama_model: "llama3.2".to_string(),
        }
    }

    #[test]
    fn validate_settings_accepts_valid_payload() {
        let payload = valid_payload();
        assert!(validate_settings(&payload).is_ok());
    }

    #[test]
    fn validate_settings_rejects_empty_model() {
        let mut payload = valid_payload();
        payload.ollama_model = "   ".to_string();
        assert!(validate_settings(&payload).is_err());
    }

    #[test]
    fn validate_settings_rejects_invalid_coordinates() {
        let mut payload = valid_payload();
        payload.user_lat = 120.0;
        assert!(validate_settings(&payload).is_err());

        payload.user_lat = 20.0;
        payload.user_lon = -220.0;
        assert!(validate_settings(&payload).is_err());
    }
}
