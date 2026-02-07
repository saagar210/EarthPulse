use crate::db::Database;
use crate::models::watchlist::Watchlist;
use tauri::State;

#[tauri::command]
pub fn get_watchlists(db: State<'_, Database>) -> Vec<Watchlist> {
    db.get_watchlists()
}

#[tauri::command]
pub fn add_watchlist(
    db: State<'_, Database>,
    name: String,
    lat: f64,
    lon: f64,
    radius_km: f64,
) -> Result<Watchlist, String> {
    if !lat.is_finite() || !lon.is_finite() || !radius_km.is_finite() {
        return Err("Invalid coordinates or radius".to_string());
    }
    if lat < -90.0 || lat > 90.0 || lon < -180.0 || lon > 180.0 {
        return Err("Coordinates out of range".to_string());
    }
    if radius_km <= 0.0 || radius_km > 20000.0 {
        return Err("Radius must be between 0 and 20000 km".to_string());
    }
    if name.trim().is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    db.add_watchlist(&name, lat, lon, radius_km)
        .map_err(|e| format!("Failed to add watchlist: {}", e))
}

#[tauri::command]
pub fn remove_watchlist(db: State<'_, Database>, id: i64) -> Result<(), String> {
    db.remove_watchlist(id)
        .map_err(|e| format!("Failed to remove watchlist: {}", e))
}
