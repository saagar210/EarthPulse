use super::http::HTTP_CLIENT;
use crate::models::earthquake::{Earthquake, UsgsResponse};

pub async fn fetch_historical_earthquakes(
    start: &str,
    end: &str,
    min_mag: f64,
) -> Result<Vec<Earthquake>, String> {
    let url = format!(
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={}&endtime={}&minmagnitude={}",
        start, end, min_mag
    );

    let response = HTTP_CLIENT
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch historical earthquakes: {}", e))?;

    let usgs: UsgsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse historical data: {}", e))?;

    let earthquakes: Vec<Earthquake> = usgs
        .features
        .iter()
        .filter_map(Earthquake::from_feature)
        .collect();

    Ok(earthquakes)
}
