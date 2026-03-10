use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use super::nasa;
use crate::models::asteroid::{Asteroid, NeoResponse};
use chrono::Utc;

pub async fn fetch_asteroids() -> Result<Vec<Asteroid>, String> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let end = (Utc::now() + chrono::Duration::days(7))
        .format("%Y-%m-%d")
        .to_string();

    let response = send_with_resilience(
        "asteroids",
        SourceClass::Bulk,
        "Asteroid feed request",
        || {
            HTTP_CLIENT
                .get("https://api.nasa.gov/neo/rest/v1/feed")
                .query(&[
                    ("start_date", today.as_str()),
                    ("end_date", end.as_str()),
                    ("api_key", nasa::api_key()),
                ])
        },
    )
    .await?;

    let neo: NeoResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse asteroid data from NASA NEO API".to_string())?;

    let mut asteroids: Vec<Asteroid> = neo
        .near_earth_objects
        .values()
        .flat_map(|objects| {
            objects.iter().filter_map(|obj| {
                let approach = obj.close_approach_data.first()?;
                let velocity: f64 = approach
                    .relative_velocity
                    .kilometers_per_second
                    .parse()
                    .ok()?;
                let miss_km: f64 = approach.miss_distance.kilometers.parse().ok()?;
                let miss_lunar: f64 = approach.miss_distance.lunar.parse().ok()?;

                if !velocity.is_finite() || !miss_km.is_finite() || !miss_lunar.is_finite() {
                    return None;
                }

                Some(Asteroid {
                    id: obj.id.clone(),
                    name: obj.name.clone(),
                    diameter_km_min: obj.estimated_diameter.kilometers.estimated_diameter_min,
                    diameter_km_max: obj.estimated_diameter.kilometers.estimated_diameter_max,
                    is_hazardous: obj.is_potentially_hazardous_asteroid,
                    approach_date: approach.close_approach_date.clone(),
                    approach_time: approach.epoch_date_close_approach,
                    velocity_kps: velocity,
                    miss_distance_km: miss_km,
                    miss_distance_lunar: miss_lunar,
                })
            })
        })
        .collect();

    asteroids.sort_by_key(|a| a.approach_time);
    Ok(asteroids)
}
