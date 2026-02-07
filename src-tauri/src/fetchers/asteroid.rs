use super::http::HTTP_CLIENT;
use crate::models::asteroid::{Asteroid, NeoResponse};
use chrono::Utc;

pub async fn fetch_asteroids() -> Result<Vec<Asteroid>, String> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let end = (Utc::now() + chrono::Duration::days(7))
        .format("%Y-%m-%d")
        .to_string();

    let url = format!(
        "https://api.nasa.gov/neo/rest/v1/feed?start_date={}&end_date={}&api_key=DEMO_KEY",
        today, end
    );

    let response = HTTP_CLIENT
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch asteroids: {}", e))?;

    let neo: NeoResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse asteroid data: {}", e))?;

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
