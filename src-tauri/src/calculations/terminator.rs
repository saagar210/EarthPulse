use chrono::Utc;

/// Calculate the solar terminator polygon for the current time.
/// Returns a vec of [lat, lon] points tracing the terminator line,
/// plus points to close the polygon covering the night side.
pub fn calculate_terminator() -> Vec<[f64; 2]> {
    calculate_terminator_at(Utc::now().timestamp())
}

pub fn calculate_terminator_at(unix_timestamp: i64) -> Vec<[f64; 2]> {
    let days_since_j2000 = (unix_timestamp as f64 - 946684800.0) / 86400.0;

    // Solar declination (simplified)
    let mean_longitude = (280.460 + 0.9856474 * days_since_j2000) % 360.0;
    let mean_anomaly = ((357.528 + 0.9856003 * days_since_j2000) % 360.0).to_radians();
    let ecliptic_longitude =
        (mean_longitude + 1.915 * mean_anomaly.sin() + 0.020 * (2.0 * mean_anomaly).sin())
            .to_radians();
    let obliquity = (23.439 - 0.0000004 * days_since_j2000).to_radians();
    let declination = (obliquity.sin() * ecliptic_longitude.sin()).asin();

    // Greenwich Mean Sidereal Time (degrees)
    let gmst = (280.46061837 + 360.98564736629 * days_since_j2000) % 360.0;
    // Sub-solar longitude
    let subsolar_lon = -(gmst
        - (ecliptic_longitude.sin() * obliquity.cos()).atan2(ecliptic_longitude.cos()).to_degrees());

    let mut points: Vec<[f64; 2]> = Vec::with_capacity(363);

    // Generate terminator line points
    for i in 0..=360 {
        let lon = -180.0 + i as f64;
        let hour_angle = (lon - subsolar_lon).to_radians();
        let lat = (-hour_angle.cos() * declination.tan())
            .atan()
            .to_degrees();
        points.push([lat, lon]);
    }

    // Close the polygon on the night side
    // Determine which pole is in darkness
    if declination >= 0.0 {
        // Northern hemisphere summer: south pole is dark
        points.push([-90.0, 180.0]);
        points.push([-90.0, -180.0]);
    } else {
        // Southern hemisphere summer: north pole is dark
        points.push([90.0, 180.0]);
        points.push([90.0, -180.0]);
    }

    points
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_terminator_returns_points() {
        let points = calculate_terminator();
        assert!(points.len() > 360);
        for p in &points {
            assert!(p[0] >= -90.0 && p[0] <= 90.0, "lat out of range: {}", p[0]);
            assert!(
                p[1] >= -180.0 && p[1] <= 180.0,
                "lon out of range: {}",
                p[1]
            );
        }
    }
}
