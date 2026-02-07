use crate::fetchers::historical::fetch_historical_earthquakes;
use crate::models::earthquake::Earthquake;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct HistoricalSummary {
    pub total: usize,
    pub strongest_mag: f64,
    pub strongest_place: String,
    pub avg_depth: f64,
    pub tsunami_count: usize,
}

#[derive(Debug, Serialize)]
pub struct HistoricalResult {
    pub earthquakes: Vec<Earthquake>,
    pub summary: HistoricalSummary,
}

#[tauri::command]
pub async fn get_historical_earthquakes(
    start_date: String,
    end_date: String,
    min_magnitude: f64,
) -> Result<HistoricalResult, String> {
    if !min_magnitude.is_finite() || min_magnitude < 0.0 || min_magnitude > 10.0 {
        return Err("Magnitude must be between 0 and 10".to_string());
    }

    // Validate date range
    let start = chrono::NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
        .map_err(|_| "Invalid start date format (YYYY-MM-DD)".to_string())?;
    let end = chrono::NaiveDate::parse_from_str(&end_date, "%Y-%m-%d")
        .map_err(|_| "Invalid end date format (YYYY-MM-DD)".to_string())?;

    if end <= start {
        return Err("End date must be after start date".to_string());
    }

    let days = (end - start).num_days();

    // Enforce limits: max 1yr at M3+, 10yr at M5+
    if min_magnitude < 5.0 && days > 365 {
        return Err("Date range limited to 1 year for magnitude < 5.0".to_string());
    }
    if days > 3650 {
        return Err("Date range limited to 10 years".to_string());
    }

    let earthquakes = fetch_historical_earthquakes(&start_date, &end_date, min_magnitude).await?;

    let strongest = earthquakes
        .iter()
        .max_by(|a, b| a.magnitude.partial_cmp(&b.magnitude).unwrap_or(std::cmp::Ordering::Equal));

    let avg_depth = if earthquakes.is_empty() {
        0.0
    } else {
        earthquakes.iter().map(|e| e.depth).sum::<f64>() / earthquakes.len() as f64
    };

    let summary = HistoricalSummary {
        total: earthquakes.len(),
        strongest_mag: strongest.map(|e| e.magnitude).unwrap_or(0.0),
        strongest_place: strongest
            .map(|e| e.place.clone())
            .unwrap_or_else(|| "--".to_string()),
        avg_depth,
        tsunami_count: earthquakes.iter().filter(|e| e.tsunami).count(),
    };

    Ok(HistoricalResult {
        earthquakes,
        summary,
    })
}
