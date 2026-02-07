use super::http::HTTP_CLIENT;
use crate::models::earthquake::{Earthquake, UsgsResponse};

const USGS_URL: &str =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

pub async fn fetch_earthquakes() -> Result<Vec<Earthquake>, String> {
    let response = HTTP_CLIENT
        .get(USGS_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch earthquakes: {}", e))?;

    let usgs: UsgsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse earthquake data: {}", e))?;

    let earthquakes: Vec<Earthquake> = usgs
        .features
        .iter()
        .filter_map(Earthquake::from_feature)
        .collect();

    Ok(earthquakes)
}
