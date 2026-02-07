use crate::models::satellite::{OrbitTrack, PassPrediction, SatellitePosition};
use chrono::{Datelike, Timelike};
use sgp4::{Constants, Elements, MinutesSinceEpoch};
use std::f64::consts::PI;

const EARTH_RADIUS_KM: f64 = 6371.0;
const DEG: f64 = 180.0 / PI;

pub fn propagate_position(
    id: &str,
    name: &str,
    line1: &str,
    line2: &str,
    timestamp_unix: i64,
) -> Option<SatellitePosition> {
    let elements = Elements::from_tle(
        Some(name.to_string()),
        line1.as_bytes(),
        line2.as_bytes(),
    ).ok()?;

    let constants = Constants::from_elements(&elements).ok()?;

    let epoch_unix = tle_epoch_to_unix(&elements);
    let minutes_since = (timestamp_unix as f64 - epoch_unix) / 60.0;

    let prediction = constants.propagate(MinutesSinceEpoch(minutes_since)).ok()?;
    let pos = prediction.position;
    let vel = prediction.velocity;

    let gmst = gmst_from_unix(timestamp_unix);
    let (lat, lon, alt) = eci_to_geodetic(pos[0], pos[1], pos[2], gmst);

    let vel_kmh = (vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]).sqrt() * 3600.0;

    Some(SatellitePosition {
        id: id.to_string(),
        name: name.to_string(),
        latitude: lat,
        longitude: lon,
        altitude_km: alt,
        velocity_kmh: vel_kmh,
        timestamp: timestamp_unix,
    })
}

pub fn predict_orbit_track(
    id: &str,
    line1: &str,
    line2: &str,
    name: &str,
    start_unix: i64,
    duration_mins: i64,
) -> Option<OrbitTrack> {
    let elements = Elements::from_tle(
        Some(name.to_string()),
        line1.as_bytes(),
        line2.as_bytes(),
    ).ok()?;

    let constants = Constants::from_elements(&elements).ok()?;
    let epoch_unix = tle_epoch_to_unix(&elements);

    let mut points = Vec::new();
    let step_secs = 30_i64;
    let steps = (duration_mins * 60) / step_secs;

    for i in 0..=steps {
        let t = start_unix + i * step_secs;
        let minutes_since = (t as f64 - epoch_unix) / 60.0;

        if let Ok(prediction) = constants.propagate(MinutesSinceEpoch(minutes_since)) {
            let gmst = gmst_from_unix(t);
            let (lat, lon, _) = eci_to_geodetic(
                prediction.position[0],
                prediction.position[1],
                prediction.position[2],
                gmst,
            );
            points.push([lat, lon]);
        }
    }

    Some(OrbitTrack {
        satellite_id: id.to_string(),
        points,
    })
}

pub fn predict_passes(
    id: &str,
    name: &str,
    line1: &str,
    line2: &str,
    observer_lat: f64,
    observer_lon: f64,
    hours_ahead: i64,
) -> Vec<PassPrediction> {
    let elements = match Elements::from_tle(
        Some(name.to_string()),
        line1.as_bytes(),
        line2.as_bytes(),
    ) {
        Ok(e) => e,
        Err(_) => return Vec::new(),
    };

    let constants = match Constants::from_elements(&elements) {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };

    let epoch_unix = tle_epoch_to_unix(&elements);
    let now = chrono::Utc::now().timestamp();
    let end_time = now + hours_ahead * 3600;

    let step = 30_i64;
    let obs_lat_rad = observer_lat / DEG;
    let obs_lon_rad = observer_lon / DEG;

    let mut passes = Vec::new();
    let mut in_pass = false;
    let mut pass_start = 0_i64;
    let mut max_el = 0.0_f64;
    let mut start_az = 0.0_f64;

    let mut t = now;
    while t < end_time {
        let minutes_since = (t as f64 - epoch_unix) / 60.0;

        if let Ok(prediction) = constants.propagate(MinutesSinceEpoch(minutes_since)) {
            let gmst = gmst_from_unix(t);
            let (sat_lat, sat_lon, sat_alt) = eci_to_geodetic(
                prediction.position[0],
                prediction.position[1],
                prediction.position[2],
                gmst,
            );

            let el = elevation_angle(
                obs_lat_rad,
                obs_lon_rad,
                sat_lat / DEG,
                sat_lon / DEG,
                sat_alt,
            );

            if el > 5.0 {
                if !in_pass {
                    in_pass = true;
                    pass_start = t;
                    max_el = el;
                    start_az = azimuth(obs_lat_rad, obs_lon_rad, sat_lat / DEG, sat_lon / DEG);
                }
                if el > max_el {
                    max_el = el;
                }
            } else if in_pass {
                in_pass = false;
                passes.push(PassPrediction {
                    satellite_id: id.to_string(),
                    name: name.to_string(),
                    start_time: pass_start,
                    end_time: t,
                    max_elevation: max_el,
                    start_azimuth: start_az * DEG,
                    is_visible: max_el > 10.0,
                });
                if passes.len() >= 10 {
                    break;
                }
            }
        }

        t += step;
    }

    passes
}

fn tle_epoch_to_unix(elements: &Elements) -> f64 {
    let dt = elements.datetime;
    let naive = chrono::NaiveDate::from_ymd_opt(
        dt.year() as i32,
        dt.month() as u32,
        dt.day() as u32,
    )
    .unwrap()
    .and_hms_nano_opt(
        dt.hour() as u32,
        dt.minute() as u32,
        dt.second() as u32,
        dt.nanosecond(),
    )
    .unwrap();

    naive.and_utc().timestamp() as f64
}

fn gmst_from_unix(timestamp: i64) -> f64 {
    let jd = timestamp as f64 / 86400.0 + 2440587.5;
    let t = (jd - 2451545.0) / 36525.0;

    let gmst = 280.46061837
        + 360.98564736629 * (jd - 2451545.0)
        + 0.000387933 * t * t
        - t * t * t / 38710000.0;

    (gmst % 360.0) / DEG
}

fn eci_to_geodetic(x: f64, y: f64, z: f64, gmst: f64) -> (f64, f64, f64) {
    let r = (x * x + y * y).sqrt();
    let lon = (y.atan2(x) - gmst) * DEG;
    let lat = z.atan2(r) * DEG;
    let alt = (x * x + y * y + z * z).sqrt() - EARTH_RADIUS_KM;

    let lon = ((lon + 180.0) % 360.0 + 360.0) % 360.0 - 180.0;

    (lat, lon, alt)
}

fn elevation_angle(
    obs_lat: f64,
    obs_lon: f64,
    sat_lat: f64,
    sat_lon: f64,
    sat_alt: f64,
) -> f64 {
    let dlat = sat_lat - obs_lat;
    let dlon = sat_lon - obs_lon;

    let a = (dlat / 2.0).sin().powi(2)
        + obs_lat.cos() * sat_lat.cos() * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();
    let ground_dist = EARTH_RADIUS_KM * c;

    if ground_dist < 1.0 {
        return 90.0;
    }

    (sat_alt / ground_dist).atan() * DEG
}

fn azimuth(obs_lat: f64, obs_lon: f64, sat_lat: f64, sat_lon: f64) -> f64 {
    let dlon = sat_lon - obs_lon;
    let y = dlon.sin() * sat_lat.cos();
    let x = obs_lat.cos() * sat_lat.sin() - obs_lat.sin() * sat_lat.cos() * dlon.cos();
    y.atan2(x)
}
