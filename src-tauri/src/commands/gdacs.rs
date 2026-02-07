use crate::db::Database;
use crate::fetchers::gdacs::fetch_gdacs_alerts;
use crate::models::gdacs::GdacsAlert;
use tauri::State;

#[tauri::command]
pub async fn get_gdacs_alerts(db: State<'_, Database>) -> Result<Vec<GdacsAlert>, String> {
    // Try cache first (15 min window)
    if let Some(cached) = db.get_cached_response("gdacs:rss", 900) {
        if let Ok(alerts) = serde_json::from_str::<Vec<GdacsAlert>>(&cached) {
            if !alerts.is_empty() {
                return Ok(alerts);
            }
        }
    }

    let alerts = fetch_gdacs_alerts().await?;
    if let Ok(json) = serde_json::to_string(&alerts) {
        db.set_cached_response("gdacs:rss", &json);
    }
    Ok(alerts)
}
