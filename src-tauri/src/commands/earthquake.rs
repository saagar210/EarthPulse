use crate::db::Database;
use crate::fetchers::earthquake::fetch_earthquakes;
use crate::models::earthquake::Earthquake;
use tauri::State;

#[tauri::command]
pub async fn get_earthquakes(db: State<'_, Database>) -> Result<Vec<Earthquake>, String> {
    // Try cache first
    if let Some(cached) = db.get_cached_earthquakes() {
        if !cached.is_empty() {
            return Ok(cached);
        }
    }

    // Fetch fresh
    let quakes = fetch_earthquakes().await?;
    db.store_earthquakes(&quakes);
    Ok(quakes)
}
