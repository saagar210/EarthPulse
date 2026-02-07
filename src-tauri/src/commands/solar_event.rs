use crate::db::Database;
use crate::fetchers::solar_event::fetch_solar_activity;
use crate::models::solar_event::SolarActivity;
use tauri::State;

#[tauri::command]
pub async fn get_solar_activity(db: State<'_, Database>) -> Result<SolarActivity, String> {
    // Try cache first (3 hour window)
    if let Some(cached) = db.get_cached_response("nasa:donki", 10800) {
        if let Ok(activity) = serde_json::from_str::<SolarActivity>(&cached) {
            return Ok(activity);
        }
    }

    let activity = fetch_solar_activity().await?;
    if let Ok(json) = serde_json::to_string(&activity) {
        db.set_cached_response("nasa:donki", &json);
    }
    Ok(activity)
}
