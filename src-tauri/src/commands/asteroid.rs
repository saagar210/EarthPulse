use crate::db::Database;
use crate::fetchers::asteroid::fetch_asteroids;
use crate::models::asteroid::Asteroid;
use tauri::State;

#[tauri::command]
pub async fn get_asteroids(db: State<'_, Database>) -> Result<Vec<Asteroid>, String> {
    // Try cache first (6 hour window)
    if let Some(cached) = db.get_cached_response("nasa:neo", 21600) {
        if let Ok(asteroids) = serde_json::from_str::<Vec<Asteroid>>(&cached) {
            if !asteroids.is_empty() {
                return Ok(asteroids);
            }
        }
    }

    let asteroids = fetch_asteroids().await?;
    if let Ok(json) = serde_json::to_string(&asteroids) {
        db.set_cached_response("nasa:neo", &json);
    }
    Ok(asteroids)
}
