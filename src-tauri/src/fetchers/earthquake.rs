use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::earthquake::{Earthquake, UsgsResponse};

const USGS_URL: &str = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

pub async fn fetch_earthquakes() -> Result<Vec<Earthquake>, String> {
    let response = send_with_resilience(
        "earthquakes",
        SourceClass::Critical,
        "Earthquake feed request",
        || HTTP_CLIENT.get(USGS_URL),
    )
    .await?;

    let usgs: UsgsResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse earthquake data".to_string())?;

    let earthquakes: Vec<Earthquake> = usgs
        .features
        .iter()
        .filter_map(Earthquake::from_feature)
        .collect();

    Ok(earthquakes)
}
