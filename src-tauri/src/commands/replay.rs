use crate::calculations::terminator::calculate_terminator_at;
use crate::db::Database;
use crate::models::earthquake::Earthquake;
use crate::models::iss::IssPosition;
use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct ReplayData {
    pub earthquakes: Vec<Earthquake>,
    pub iss_position: Option<IssPosition>,
    pub terminator: Vec<[f64; 2]>,
}

#[tauri::command]
pub async fn get_historical_data(
    timestamp: i64,
    db: State<'_, Database>,
) -> Result<ReplayData, String> {
    // timestamp arrives as milliseconds from the frontend
    let earthquakes = db.get_earthquakes_at(timestamp);
    let iss_position = db.get_iss_position_at(timestamp);
    // terminator calculation expects Unix seconds
    let terminator = calculate_terminator_at(timestamp / 1000);

    Ok(ReplayData {
        earthquakes,
        iss_position,
        terminator,
    })
}
