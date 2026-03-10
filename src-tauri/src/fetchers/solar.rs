use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::solar::SolarData;

const KP_URL: &str = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

pub async fn fetch_kp_index() -> Result<SolarData, String> {
    let response = send_with_resilience("solar", SourceClass::Standard, "Solar Kp request", || {
        HTTP_CLIENT.get(KP_URL)
    })
    .await?;

    let data: Vec<Vec<String>> = response
        .json()
        .await
        .map_err(|_| "Failed to parse Kp data".to_string())?;

    // Data format: first row is header, rest are [time_tag, Kp, a_running, station_count]
    // Need at least 2 rows (header + 1 data row)
    if data.len() < 2 {
        return Err("No Kp data available (only header row)".to_string());
    }
    let latest = data.last().ok_or("No Kp data available")?;
    if latest.len() < 2 {
        return Err("Invalid Kp data format".to_string());
    }

    let kp: f64 = latest[1]
        .parse()
        .map_err(|e| format!("Failed to parse Kp value: {}", e))?;

    if !kp.is_finite() {
        return Err("Kp value is non-finite".to_string());
    }

    Ok(SolarData {
        kp_index: kp,
        kp_timestamp: latest[0].clone(),
    })
}
