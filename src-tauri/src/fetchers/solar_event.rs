use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use super::nasa;
use crate::models::solar_event::*;
use chrono::Utc;
use serde::de::DeserializeOwned;

async fn fetch_donki<T: DeserializeOwned>(
    endpoint: &str,
    start: &str,
    end: &str,
) -> Result<T, String> {
    let response = send_with_resilience(
        "solar_activity",
        SourceClass::Bulk,
        "Solar activity request",
        || {
            HTTP_CLIENT
                .get(format!("https://api.nasa.gov/DONKI/{endpoint}"))
                .query(&[
                    ("startDate", start),
                    ("endDate", end),
                    ("api_key", nasa::api_key()),
                ])
        },
    )
    .await
    .map_err(|_| format!("Failed to fetch NASA DONKI {endpoint} data"))?;

    response
        .json()
        .await
        .map_err(|_| format!("Failed to parse NASA DONKI {endpoint} payload"))
}

pub async fn fetch_solar_activity() -> Result<SolarActivity, String> {
    let end = Utc::now().format("%Y-%m-%d").to_string();
    let start = (Utc::now() - chrono::Duration::days(7))
        .format("%Y-%m-%d")
        .to_string();

    // Fetch both in parallel
    let (flare_res, cme_res) = tokio::join!(
        fetch_donki::<Vec<DonkiFlare>>("FLR", &start, &end),
        fetch_donki::<Vec<DonkiCME>>("CME", &start, &end)
    );

    let flares = match flare_res {
        Ok(donki_flares) => donki_flares
            .into_iter()
            .map(|f| SolarFlare {
                id: f.flr_id,
                class_type: f.class_type.unwrap_or_else(|| "Unknown".into()),
                peak_time: f
                    .peak_time
                    .unwrap_or_else(|| f.begin_time.unwrap_or_default()),
                source_location: f.source_location,
            })
            .collect(),
        Err(e) => {
            log::warn!("{e}");
            vec![]
        }
    };

    let cmes = match cme_res {
        Ok(donki_cmes) => donki_cmes
            .into_iter()
            .map(|c| {
                let best_analysis = c.cme_analyses.as_ref().and_then(|analyses| {
                    analyses
                        .iter()
                        .find(|a| a.is_most_accurate == Some(true))
                        .or(analyses.first())
                });

                let speed = best_analysis.and_then(|a| a.speed);
                let half_angle = best_analysis.and_then(|a| a.half_angle).unwrap_or(0.0);
                // Rough heuristic: earth-directed if half-angle is wide (>45°)
                // and the note mentions "Earth" or analysis latitude is near 0
                let note_mentions_earth = c
                    .note
                    .as_ref()
                    .map(|n| n.to_lowercase().contains("earth"))
                    .unwrap_or(false);
                let is_earth_directed = note_mentions_earth || half_angle > 45.0;

                CoronalMassEjection {
                    id: c.activity_id,
                    start_time: c.start_time.unwrap_or_default(),
                    speed_kps: speed,
                    is_earth_directed,
                    note: c.note,
                }
            })
            .collect(),
        Err(e) => {
            log::warn!("{e}");
            vec![]
        }
    };

    Ok(SolarActivity { flares, cmes })
}
