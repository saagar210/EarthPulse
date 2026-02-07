use crate::db::Database;
use crate::models::iss::IssData;
use tauri::State;

#[tauri::command]
pub async fn get_iss_position(db: State<'_, Database>) -> Result<IssData, String> {
    let current = db.get_latest_iss_position().ok_or("No ISS data yet")?;
    let trail = db.get_iss_trail();
    Ok(IssData { current, trail })
}
