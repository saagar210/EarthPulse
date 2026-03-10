use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::sst::{ErddapResponse, SeaSurfaceTemp};

pub async fn fetch_sst(lat: f64, lon: f64) -> Result<SeaSurfaceTemp, String> {
    if !lat.is_finite() || !lon.is_finite() {
        return Err("Invalid coordinates".into());
    }

    // ERDDAP uses (last) for the most recent time slice
    let url = format!(
        "https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?sst[(last)][({lat}):1:({lat})][({lon}):1:({lon})]",
        lat = lat,
        lon = lon,
    );

    let response = send_with_resilience("sst", SourceClass::OnDemand, "SST request", || {
        HTTP_CLIENT.get(&url)
    })
    .await?;

    let data: ErddapResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse SST data".to_string())?;

    // Data rows start at index 1 (index 0 might be the only data row after the header is parsed)
    let row = data.table.rows.last().ok_or("No SST data rows")?;

    // Find column indices — fail explicitly if columns are missing
    let time_idx = data
        .table
        .column_names
        .iter()
        .position(|n| n == "time")
        .ok_or("ERDDAP response missing 'time' column")?;
    let sst_idx = data
        .table
        .column_names
        .iter()
        .position(|n| n == "sst")
        .ok_or("ERDDAP response missing 'sst' column")?;

    let time = row
        .get(time_idx)
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let temp = row
        .get(sst_idx)
        .and_then(|v| v.as_f64())
        .ok_or("Missing SST value (likely a land point)")?;

    if !temp.is_finite() {
        return Err("SST value is NaN (likely a land point)".into());
    }

    Ok(SeaSurfaceTemp {
        latitude: lat,
        longitude: lon,
        temperature_c: temp,
        time,
    })
}
