mod calculations;
mod commands;
mod db;
mod fetchers;
mod models;
mod notifications;
mod tray;

use db::Database;
use models::iss::IssData;
use notifications::NotificationTracker;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize database
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            let database = Database::new(&app_dir);
            database.cleanup_old_data();
            app.manage(database);

            // Shared notification tracker (prevents duplicate notifications)
            let tracker = Arc::new(NotificationTracker::new());

            // Setup system tray
            tray::setup_tray(app.handle()).ok();

            // Background: earthquake polling (every 60s)
            let handle = app.handle().clone();
            let eq_tracker = Arc::clone(&tracker);
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::earthquake::fetch_earthquakes().await {
                        Ok(quakes) => {
                            let db = handle.state::<Database>();
                            db.store_earthquakes(&quakes);
                            handle.emit("earthquakes:update", &quakes).ok();

                            // Read user settings from DB, falling back to defaults
                            let settings = db.get_settings();
                            let user_lat = settings.user_lat.unwrap_or(37.3382);
                            let user_lon = settings.user_lon.unwrap_or(-121.8863);
                            let mag_threshold = settings.mag_threshold.unwrap_or(5.0);
                            let proximity_km = settings.proximity_km.unwrap_or(500.0);

                            notifications::check_earthquake_notifications(
                                &handle,
                                &eq_tracker,
                                &quakes,
                                mag_threshold,
                                user_lat,
                                user_lon,
                                proximity_km,
                            );

                            // Check watchlists
                            notifications::check_watchlist_notifications(
                                &handle,
                                &eq_tracker,
                                &quakes,
                                &db,
                            );

                            // Update tray with strongest quake
                            let strongest = quakes
                                .iter()
                                .max_by(|a, b| a.magnitude.partial_cmp(&b.magnitude).unwrap_or(std::cmp::Ordering::Equal));
                            if let Some(eq) = strongest {
                                let text = format!("Recent Earthquake: M{:.1} {}", eq.magnitude, eq.place);
                                tray::update_tray_menu(&handle, &text, "", "");
                            }

                            log::info!("Fetched {} earthquakes", quakes.len());
                        }
                        Err(e) => log::error!("Earthquake fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(60)).await;
                }
            });

            // Background: ISS position polling (every 5s)
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::iss::fetch_iss_position().await {
                        Ok(pos) => {
                            let db = handle.state::<Database>();
                            db.store_iss_position(&pos);
                            let trail = db.get_iss_trail();
                            let data = IssData {
                                current: pos,
                                trail,
                            };
                            handle.emit("iss:update", &data).ok();
                        }
                        Err(e) => log::error!("ISS fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            });

            // Background: terminator update (every 60s)
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    let points = calculations::terminator::calculate_terminator();
                    handle.emit("terminator:update", &points).ok();
                    tokio::time::sleep(Duration::from_secs(60)).await;
                }
            });

            // Background: solar data polling (every 15min)
            let handle = app.handle().clone();
            let kp_tracker = Arc::clone(&tracker);
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::solar::fetch_kp_index().await {
                        Ok(data) => {
                            notifications::check_kp_notification(
                                &handle,
                                &kp_tracker,
                                data.kp_index,
                            );
                            tray::update_tray_menu(
                                &handle,
                                "",
                                "",
                                &format!("Kp Index: {:.1}", data.kp_index),
                            );
                            handle.emit("solar:update", &data).ok();
                            log::info!("Fetched Kp index: {}", data.kp_index);
                        }
                        Err(e) => log::error!("Solar fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(900)).await;
                }
            });

            // Emit volcano data once at startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let volcanoes = fetchers::volcano::get_active_volcanoes();
                handle.emit("volcanoes:update", &volcanoes).ok();
            });

            // Emit meteor shower data once at startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let showers = fetchers::meteor::get_meteor_showers();
                handle.emit("meteors:update", &showers).ok();
            });

            // Emit tectonic plate boundaries once at startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let plates = fetchers::plate::get_plate_boundaries();
                handle.emit("plates:update", &plates).ok();
                log::info!("Loaded {} plate boundary segments", plates.len());
            });

            // Background: GDACS hazard alerts (every 15min)
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::gdacs::fetch_gdacs_alerts().await {
                        Ok(alerts) => {
                            let db = handle.state::<Database>();
                            if let Ok(json) = serde_json::to_string(&alerts) {
                                db.set_cached_response("gdacs:rss", &json);
                            }
                            handle.emit("gdacs:update", &alerts).ok();
                            log::info!("Fetched {} GDACS alerts", alerts.len());
                        }
                        Err(e) => log::error!("GDACS fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(900)).await;
                }
            });

            // Background: satellite positions + pass predictions (every 5min)
            let handle = app.handle().clone();
            let sat_tracker = Arc::clone(&tracker);
            tauri::async_runtime::spawn(async move {
                loop {
                    let db = handle.state::<Database>();

                    // Fetch and propagate satellite positions
                    match commands::satellite::get_satellite_positions_inner(&db).await {
                        Ok(data) => {
                            handle.emit("satellites:update", &data).ok();
                        }
                        Err(e) => log::error!("Satellite fetch error: {}", e),
                    }

                    // Calculate pass predictions
                    match commands::satellite::get_pass_predictions_inner(&db).await {
                        Ok(passes) => {
                            notifications::check_pass_notification(
                                &handle,
                                &sat_tracker,
                                &passes,
                            );

                            // Update tray with next ISS pass only
                            let now = chrono::Utc::now().timestamp();
                            if let Some(next) = passes.iter().find(|p| p.satellite_id == "sat-25544" && p.start_time > now) {
                                let mins = (next.start_time - now) / 60;
                                let text = format!("Next ISS Pass: {}min", mins);
                                tray::update_tray_menu(&handle, "", &text, "");
                            }

                            handle.emit("passes:update", &passes).ok();
                        }
                        Err(e) => log::error!("Pass prediction error: {}", e),
                    }

                    tokio::time::sleep(Duration::from_secs(300)).await;
                }
            });

            // Background: EONET natural events (every 30 min)
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::eonet::fetch_eonet_events().await {
                        Ok(events) => {
                            let db = handle.state::<Database>();
                            if let Ok(json) = serde_json::to_string(&events) {
                                db.set_cached_response("eonet:events", &json);
                            }
                            handle.emit("eonet:update", &events).ok();
                            log::info!("Fetched {} EONET events", events.len());
                        }
                        Err(e) => log::error!("EONET fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(1800)).await;
                }
            });

            // Background: asteroid close approaches (every 6 hours)
            let handle = app.handle().clone();
            let ast_tracker = Arc::clone(&tracker);
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::asteroid::fetch_asteroids().await {
                        Ok(asteroids) => {
                            let db = handle.state::<Database>();
                            if let Ok(json) = serde_json::to_string(&asteroids) {
                                db.set_cached_response("nasa:neo", &json);
                            }

                            // Check for hazardous close approaches
                            notifications::check_asteroid_notification(&handle, &ast_tracker, &asteroids);

                            handle.emit("asteroids:update", &asteroids).ok();
                            log::info!("Fetched {} asteroids", asteroids.len());
                        }
                        Err(e) => log::error!("Asteroid fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(21600)).await;
                }
            });

            // Background: solar flares & CMEs (every 3 hours)
            let handle = app.handle().clone();
            let flare_tracker = Arc::clone(&tracker);
            tauri::async_runtime::spawn(async move {
                loop {
                    match fetchers::solar_event::fetch_solar_activity().await {
                        Ok(activity) => {
                            let db = handle.state::<Database>();
                            if let Ok(json) = serde_json::to_string(&activity) {
                                db.set_cached_response("nasa:donki", &json);
                            }

                            notifications::check_solar_flare_notification(&handle, &flare_tracker, &activity);

                            handle.emit("solar_activity:update", &activity).ok();
                            log::info!(
                                "Fetched {} flares, {} CMEs",
                                activity.flares.len(),
                                activity.cmes.len()
                            );
                        }
                        Err(e) => log::error!("Solar activity fetch error: {}", e),
                    }
                    tokio::time::sleep(Duration::from_secs(10800)).await;
                }
            });

            // Handle window close → hide to tray
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        window_clone.hide().ok();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::earthquake::get_earthquakes,
            commands::iss::get_iss_position,
            commands::terminator::get_terminator,
            commands::solar::get_solar_data,
            commands::volcano::get_volcanoes,
            commands::replay::get_historical_data,
            commands::settings::save_settings,
            commands::gdacs::get_gdacs_alerts,
            commands::historical::get_historical_earthquakes,
            commands::satellite::get_satellite_positions,
            commands::satellite::get_pass_predictions,
            commands::plate::get_plates,
            commands::meteor::get_meteors,
            commands::asteroid::get_asteroids,
            commands::solar_event::get_solar_activity,
            commands::eonet::get_eonet_events,
            commands::weather::get_weather,
            commands::air_quality::get_air_quality,
            commands::sst::get_sst,
            commands::summary::generate_summary,
            commands::watchlist::get_watchlists,
            commands::watchlist::add_watchlist,
            commands::watchlist::remove_watchlist,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
