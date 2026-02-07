use super::http::HTTP_CLIENT;
use crate::models::iss::{IssApiResponse, IssPosition};

const ISS_URL: &str = "http://api.open-notify.org/iss-now.json";

pub async fn fetch_iss_position() -> Result<IssPosition, String> {
    let response = HTTP_CLIENT
        .get(ISS_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch ISS position: {}", e))?;

    let api: IssApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse ISS data: {}", e))?;

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

    Ok(IssPosition {
        latitude: lat,
        longitude: lon,
        timestamp: api.timestamp,
    })
}
