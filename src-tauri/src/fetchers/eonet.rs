use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};
use crate::models::eonet::{EonetResponse, NaturalEvent};

const EONET_URL: &str = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50";

pub async fn fetch_eonet_events() -> Result<Vec<NaturalEvent>, String> {
    let response = send_with_resilience("eonet", SourceClass::Bulk, "EONET events request", || {
        HTTP_CLIENT.get(EONET_URL)
    })
    .await?;

    let eonet: EonetResponse = response
        .json()
        .await
        .map_err(|_| "Failed to parse EONET data".to_string())?;

    let events: Vec<NaturalEvent> = eonet
        .events
        .into_iter()
        .filter_map(|event| {
            let category = event.categories.first()?;
            // Filter to wildfires, severe storms, volcanoes, floods
            let dominated = matches!(
                category.id.as_str(),
                "wildfires" | "severeStorms" | "floods" | "volcanoes"
            );
            if !dominated {
                return None;
            }

            let geom = event.geometry.last()?;
            if geom.coordinates.len() < 2 {
                return None;
            }

            let lon = geom.coordinates[0];
            let lat = geom.coordinates[1];
            if !lon.is_finite() || !lat.is_finite() {
                return None;
            }

            Some(NaturalEvent {
                id: event.id,
                title: event.title,
                category: category.title.clone(),
                category_id: category.id.clone(),
                longitude: lon,
                latitude: lat,
                date: geom.date.clone(),
            })
        })
        .collect();

    Ok(events)
}
