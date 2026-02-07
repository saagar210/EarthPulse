use crate::db::Database;
use crate::fetchers::eonet::fetch_eonet_events;
use crate::models::eonet::NaturalEvent;
use tauri::State;

#[tauri::command]
pub async fn get_eonet_events(db: State<'_, Database>) -> Result<Vec<NaturalEvent>, String> {
    // Try cache first (30 min window)
    if let Some(cached) = db.get_cached_response("eonet:events", 1800) {
        if let Ok(events) = serde_json::from_str::<Vec<NaturalEvent>>(&cached) {
            if !events.is_empty() {
                return Ok(events);
            }
        }
    }

    let events = fetch_eonet_events().await?;
    if let Ok(json) = serde_json::to_string(&events) {
        db.set_cached_response("eonet:events", &json);
    }
    Ok(events)
}
