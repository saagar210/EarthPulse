use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::earthquake::{Earthquake, UsgsResponse};

pub async fn fetch_historical_earthquakes(
    start: &str,
    end: &str,
    min_mag: f64,
) -> Result<Vec<Earthquake>, String> {
    let min_mag_s = min_mag.to_string();
    let response = send_with_resilience(
        "historical",
        SourceClass::OnDemand,
        "Historical earthquake request",
        || {
            HTTP_CLIENT
                .get("https://earthquake.usgs.gov/fdsnws/event/1/query")
                .query(&[
                    ("format", "geojson"),
                    ("starttime", start),
                    ("endtime", end),
                    ("minmagnitude", min_mag_s.as_str()),
                ])
        },
    )
    .await?;

    let usgs: UsgsResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse historical earthquake data".to_string())?;

    let earthquakes: Vec<Earthquake> = usgs
        .features
        .iter()
        .filter_map(Earthquake::from_feature)
        .collect();

    Ok(earthquakes)
}
