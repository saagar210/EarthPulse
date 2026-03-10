use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::iss::{IssApiResponse, IssPosition};

const ISS_URL: &str = "http://api.open-notify.org/iss-now.json";

pub async fn fetch_iss_position() -> Result<IssPosition, String> {
    let response =
        send_with_resilience("iss", SourceClass::Critical, "ISS position request", || {
            HTTP_CLIENT.get(ISS_URL)
        })
        .await?;

    let api: IssApiResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse ISS data".to_string())?;

    let lat: f64 = api
        .iss_position
        .latitude
        .parse()
        .map_err(|e| format!("Invalid latitude: {}", e))?;
    let lon: f64 = api
        .iss_position
        .longitude
        .parse()
        .map_err(|e| format!("Invalid longitude: {}", e))?;

    if !lat.is_finite() || !lon.is_finite() {
        return Err("ISS position contains non-finite coordinates".into());
    }

    Ok(IssPosition {
        latitude: lat,
        longitude: lon,
        timestamp: api.timestamp,
    })
}
