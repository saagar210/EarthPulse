use crate::models::plate::{PlateBoundary, PlateGeoJson};

const PLATES_JSON: &str = include_str!("../../plates.geojson");

fn classify_boundary(name: &str) -> &'static str {
    let lower = name.to_lowercase();
    // Subduction zones and collision boundaries
    if lower.contains("trench") || lower.contains("thrust") || lower.contains("subduc") {
        return "convergent";
    }
    // Spreading ridges
    if lower.contains("ridge") || lower.contains("rise") || lower.contains("rift") {
        return "divergent";
    }
    // Named transforms / strike-slip
    if lower.contains("transform") || lower.contains("fault") || lower.contains("fracture") {
        return "transform";
    }
    // Default to transform for unnamed
    "transform"
}

fn parse_line_coords(coords: &serde_json::Value) -> Vec<[f64; 2]> {
    coords
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|pt| {
                    let pair = pt.as_array()?;
                    let lon = pair.first()?.as_f64()?;
                    let lat = pair.get(1)?.as_f64()?;
                    Some([lat, lon])
                })
                .collect()
        })
        .unwrap_or_default()
}

pub fn get_plate_boundaries() -> Vec<PlateBoundary> {
    let geojson: PlateGeoJson = match serde_json::from_str(PLATES_JSON) {
        Ok(g) => g,
        Err(e) => {
            log::error!("Failed to parse plates GeoJSON: {}", e);
            return vec![];
        }
    };

    let mut boundaries = Vec::new();

    for feature in &geojson.features {
        let name = feature
            .properties
            .name
            .clone()
            .unwrap_or_else(|| "Unknown".into());
        let boundary_type = classify_boundary(&name).to_string();

        match feature.geometry.geom_type.as_str() {
            "LineString" => {
                let coords = parse_line_coords(&feature.geometry.coordinates);
                if !coords.is_empty() {
                    boundaries.push(PlateBoundary {
                        name: name.clone(),
                        boundary_type: boundary_type.clone(),
                        coordinates: coords,
                    });
                }
            }
            "MultiLineString" => {
                if let Some(lines) = feature.geometry.coordinates.as_array() {
                    for line in lines {
                        let coords = parse_line_coords(line);
                        if !coords.is_empty() {
                            boundaries.push(PlateBoundary {
                                name: name.clone(),
                                boundary_type: boundary_type.clone(),
                                coordinates: coords,
                            });
                        }
                    }
                }
            }
            _ => {}
        }
    }

    boundaries
}
