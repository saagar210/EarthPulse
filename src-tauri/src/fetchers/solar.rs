use super::http::HTTP_CLIENT;
use crate::models::solar::SolarData;

const KP_URL: &str = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

pub async fn fetch_kp_index() -> Result<SolarData, String> {
    let response = HTTP_CLIENT
        .get(KP_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch Kp index: {}", e))?;

    let data: Vec<Vec<String>> = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Kp data: {}", e))?;

    // Data format: first row is header, rest are [time_tag, Kp, a_running, station_count]
    // Get the most recent entry (last row)
    let latest = data.last().ok_or("No Kp data available")?;
    if latest.len() < 2 {
        return Err("Invalid Kp data format".to_string());
    }

    let kp: f64 = latest[1]
        .parse()
        .map_err(|e| format!("Failed to parse Kp value: {}", e))?;

    Ok(SolarData {
        kp_index: kp,
        kp_timestamp: latest[0].clone(),
    })
}
