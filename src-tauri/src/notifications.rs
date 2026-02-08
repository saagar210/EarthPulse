use crate::db::Database;
use crate::models::asteroid::Asteroid;
use crate::models::earthquake::Earthquake;
use crate::models::satellite::PassPrediction;
use crate::models::solar_event::SolarActivity;
use std::collections::HashSet;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

pub struct NotificationTracker {
    notified_quake_ids: Mutex<HashSet<String>>,
    notified_asteroid_ids: Mutex<HashSet<String>>,
    notified_flare_ids: Mutex<HashSet<String>>,
    notified_cme_cycle: Mutex<bool>,
    last_kp_notified: Mutex<Option<f64>>,
    last_pass_notified: Mutex<Option<i64>>,
}

impl NotificationTracker {
    pub fn new() -> Self {
        Self {
            notified_quake_ids: Mutex::new(HashSet::new()),
            notified_asteroid_ids: Mutex::new(HashSet::new()),
            notified_flare_ids: Mutex::new(HashSet::new()),
            notified_cme_cycle: Mutex::new(false),
            last_kp_notified: Mutex::new(None),
            last_pass_notified: Mutex::new(None),
        }
    }
}

pub fn check_earthquake_notifications(
    app: &AppHandle,
    tracker: &NotificationTracker,
    quakes: &[Earthquake],
    min_magnitude: f64,
    user_lat: f64,
    user_lon: f64,
    proximity_km: f64,
) {
    let now = chrono::Utc::now().timestamp_millis();
    let mut notified = tracker.notified_quake_ids.lock().unwrap();

    // Prune old IDs (keep only IDs of quakes from the last hour)
    let one_hour_ago = now - 3600 * 1000;
    let current_quake_ids: HashSet<String> = quakes
        .iter()
        .filter(|q| q.time > one_hour_ago)
        .map(|q| q.id.clone())
        .collect();
    notified.retain(|id| current_quake_ids.contains(id));

    for quake in quakes {
        // Only notify for quakes in the last 5 minutes
        if now - quake.time > 5 * 60 * 1000 {
            continue;
        }

        // Skip if already notified
        if notified.contains(&quake.id) {
            continue;
        }

        let distance = haversine_km(user_lat, user_lon, quake.latitude, quake.longitude);

        let should_notify = quake.magnitude >= min_magnitude
            || (quake.magnitude >= 3.0 && distance <= proximity_km);

        if should_notify {
            let title = if distance <= proximity_km {
                format!("Nearby Earthquake M{:.1}", quake.magnitude)
            } else {
                format!("Earthquake M{:.1}", quake.magnitude)
            };

            app.notification()
                .builder()
                .title(&title)
                .body(&quake.place)
                .show()
                .ok();

            notified.insert(quake.id.clone());
        }
    }
}

pub fn check_kp_notification(app: &AppHandle, tracker: &NotificationTracker, kp: f64) {
    let mut last_kp = tracker.last_kp_notified.lock().unwrap();

    if kp >= 5.0 {
        // Only notify if this is a new storm or Kp increased by at least 1
        let should_notify = match *last_kp {
            Some(prev) => kp >= prev + 1.0,
            None => true,
        };

        if should_notify {
            app.notification()
                .builder()
                .title(&format!("Geomagnetic Storm - Kp {:.0}", kp))
                .body("Aurora may be visible at lower latitudes")
                .show()
                .ok();
            *last_kp = Some(kp);
        }
    } else {
        // Storm ended, reset tracker
        *last_kp = None;
    }
}

pub fn check_pass_notification(
    app: &AppHandle,
    tracker: &NotificationTracker,
    passes: &[PassPrediction],
) {
    let now = chrono::Utc::now().timestamp();
    let mut last_notified = tracker.last_pass_notified.lock().unwrap();

    // Find next visible pass within 15 minutes
    let upcoming = passes.iter().find(|p| {
        p.is_visible && p.start_time > now && p.start_time - now <= 900
    });

    if let Some(pass) = upcoming {
        // Don't re-notify for the same pass
        if *last_notified == Some(pass.start_time) {
            return;
        }

        let mins = (pass.start_time - now) / 60;
        let direction = azimuth_to_cardinal(pass.start_azimuth);

        app.notification()
            .builder()
            .title(&format!("{} Pass in {}min", pass.name, mins))
            .body(&format!(
                "Max elevation: {:.0}°, look {}",
                pass.max_elevation, direction
            ))
            .show()
            .ok();

        *last_notified = Some(pass.start_time);
    }
}

pub fn check_asteroid_notification(
    app: &AppHandle,
    tracker: &NotificationTracker,
    asteroids: &[Asteroid],
) {
    let mut notified = tracker.notified_asteroid_ids.lock().unwrap();
    let now_ms = chrono::Utc::now().timestamp_millis();

    // Prune IDs for asteroids no longer in the dataset
    let current_ids: HashSet<String> = asteroids.iter().map(|a| a.id.clone()).collect();
    notified.retain(|id| current_ids.contains(id));

    for asteroid in asteroids {
        if asteroid.is_hazardous && asteroid.miss_distance_lunar < 20.0 {
            // Only notify for approaches within next 48 hours
            if asteroid.approach_time > now_ms
                && asteroid.approach_time - now_ms < 172_800_000
                && !notified.contains(&asteroid.id)
            {
                app.notification()
                    .builder()
                    .title(&format!(
                        "Hazardous Asteroid: {}",
                        asteroid.name.replace(['(', ')'], "")
                    ))
                    .body(&format!(
                        "Close approach at {:.1} lunar distances ({:.0} km)",
                        asteroid.miss_distance_lunar, asteroid.miss_distance_km
                    ))
                    .show()
                    .ok();

                notified.insert(asteroid.id.clone());
            }
        }
    }
}

pub fn check_solar_flare_notification(
    app: &AppHandle,
    tracker: &NotificationTracker,
    activity: &SolarActivity,
) {
    let mut notified_flares = tracker.notified_flare_ids.lock().unwrap();

    // Prune IDs for flares no longer in the dataset
    let current_flare_ids: HashSet<String> = activity.flares.iter().map(|f| f.id.clone()).collect();
    notified_flares.retain(|id| current_flare_ids.contains(id));

    // Notify on M-class or X-class flares
    for flare in &activity.flares {
        if (flare.class_type.starts_with('X') || flare.class_type.starts_with('M'))
            && !notified_flares.contains(&flare.id)
        {
            let peak_display = &flare.peak_time[..16.min(flare.peak_time.len())];
            app.notification()
                .builder()
                .title(&format!("Solar Flare: {}", flare.class_type))
                .body(&format!(
                    "Peak time: {}{}",
                    peak_display,
                    flare
                        .source_location
                        .as_ref()
                        .map(|s| format!(" at {}", s))
                        .unwrap_or_default()
                ))
                .show()
                .ok();

            notified_flares.insert(flare.id.clone());
            break; // Only one notification per update cycle
        }
    }
    drop(notified_flares);

    // Notify on earth-directed CMEs (once per batch)
    let earth_cmes: Vec<_> = activity.cmes.iter().filter(|c| c.is_earth_directed).collect();
    let mut cme_notified = tracker.notified_cme_cycle.lock().unwrap();
    if !earth_cmes.is_empty() && !*cme_notified {
        let speed_text = earth_cmes
            .first()
            .and_then(|c| c.speed_kps)
            .map(|s| format!(" at {:.0} km/s", s))
            .unwrap_or_default();
        app.notification()
            .builder()
            .title("Earth-Directed CME Detected")
            .body(&format!(
                "{} CME(s) headed toward Earth{}",
                earth_cmes.len(),
                speed_text
            ))
            .show()
            .ok();
        *cme_notified = true;
    } else if earth_cmes.is_empty() {
        *cme_notified = false;
    }
}

pub fn check_watchlist_notifications(
    app: &AppHandle,
    tracker: &NotificationTracker,
    quakes: &[Earthquake],
    db: &Database,
) {
    let now = chrono::Utc::now().timestamp_millis();
    let mut notified = tracker.notified_quake_ids.lock().unwrap();
    let watchlists = db.get_watchlists();

    if watchlists.is_empty() {
        return;
    }

    for quake in quakes {
        // Only check quakes from the last 5 minutes
        if now - quake.time > 5 * 60 * 1000 {
            continue;
        }

        let watchlist_key = format!("wl:{}", quake.id);
        if notified.contains(&watchlist_key) {
            continue;
        }

        for wl in &watchlists {
            let distance = haversine_km(wl.latitude, wl.longitude, quake.latitude, quake.longitude);
            if distance <= wl.radius_km {
                app.notification()
                    .builder()
                    .title(&format!(
                        "M{:.1} in watchlist \"{}\"",
                        quake.magnitude, wl.name
                    ))
                    .body(&format!(
                        "{} ({:.0}km from center)",
                        quake.place, distance
                    ))
                    .show()
                    .ok();

                notified.insert(watchlist_key.clone());
                break; // One notification per quake
            }
        }
    }
}

fn azimuth_to_cardinal(az: f64) -> &'static str {
    let az = ((az % 360.0) + 360.0) % 360.0;
    match az as u32 {
        0..=22 | 338..=360 => "N",
        23..=67 => "NE",
        68..=112 => "E",
        113..=157 => "SE",
        158..=202 => "S",
        203..=247 => "SW",
        248..=292 => "W",
        293..=337 => "NW",
        _ => "N",
    }
}

fn haversine_km(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0;
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat / 2.0).sin().powi(2)
        + lat1.to_radians().cos() * lat2.to_radians().cos() * (dlon / 2.0).sin().powi(2);
    let a = a.clamp(0.0, 1.0); // Guard against floating-point drift past [0,1]
    let c = 2.0 * a.sqrt().asin();
    r * c
}
