use crate::models::earthquake::Earthquake;
use crate::models::iss::IssPosition;
use crate::models::watchlist::Watchlist;
use rusqlite::Connection;
use std::sync::Mutex;

pub struct UserSettings {
    pub user_lat: Option<f64>,
    pub user_lon: Option<f64>,
    pub mag_threshold: Option<f64>,
    pub proximity_km: Option<f64>,
    pub notify_earthquakes: Option<bool>,
    pub notify_aurora: Option<bool>,
    pub notify_volcanoes: Option<bool>,
    pub sonification_enabled: Option<bool>,
    pub ollama_model: Option<String>,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_dir: &std::path::Path) -> Self {
        std::fs::create_dir_all(app_dir).ok();
        let db_path = app_dir.join("earthpulse.db");
        let conn = Connection::open(db_path).expect("Failed to open database");

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS earthquakes (
                id TEXT PRIMARY KEY,
                magnitude REAL NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                depth REAL NOT NULL,
                place TEXT NOT NULL,
                time INTEGER NOT NULL,
                tsunami INTEGER NOT NULL DEFAULT 0,
                title TEXT NOT NULL,
                fetched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS iss_positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                timestamp INTEGER NOT NULL,
                fetched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS api_cache (
                endpoint TEXT PRIMARY KEY,
                response TEXT NOT NULL,
                fetched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS watchlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                radius_km REAL NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            );
            ",
        )
        .expect("Failed to create tables");

        Database {
            conn: Mutex::new(conn),
        }
    }

    // -- Earthquake methods --

    pub fn store_earthquakes(&self, quakes: &[Earthquake]) {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare(
            "INSERT OR REPLACE INTO earthquakes (id, magnitude, latitude, longitude, depth, place, time, tsunami, title, fetched_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, strftime('%s', 'now'))",
        ) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to prepare earthquake insert: {}", e);
                return;
            }
        };

        for q in quakes {
            stmt.execute(rusqlite::params![
                q.id,
                q.magnitude,
                q.latitude,
                q.longitude,
                q.depth,
                q.place,
                q.time,
                q.tsunami as i32,
                q.title,
            ])
            .ok();
        }
    }

    pub fn get_cached_earthquakes(&self) -> Option<Vec<Earthquake>> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn
            .prepare(
                "SELECT id, magnitude, latitude, longitude, depth, place, time, tsunami, title
                 FROM earthquakes
                 WHERE fetched_at > strftime('%s', 'now') - 600
                 ORDER BY time DESC",
            )
            .ok()?;

        let quakes = stmt
            .query_map([], |row| {
                Ok(Earthquake {
                    id: row.get(0)?,
                    magnitude: row.get(1)?,
                    latitude: row.get(2)?,
                    longitude: row.get(3)?,
                    depth: row.get(4)?,
                    place: row.get(5)?,
                    time: row.get(6)?,
                    tsunami: row.get::<_, i32>(7)? == 1,
                    title: row.get(8)?,
                })
            })
            .ok()?
            .filter_map(|r| r.ok())
            .collect::<Vec<_>>();

        if quakes.is_empty() {
            None
        } else {
            Some(quakes)
        }
    }

    // -- ISS methods --

    pub fn store_iss_position(&self, pos: &IssPosition) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO iss_positions (latitude, longitude, timestamp) VALUES (?1, ?2, ?3)",
            rusqlite::params![pos.latitude, pos.longitude, pos.timestamp],
        )
        .ok();
    }

    pub fn get_latest_iss_position(&self) -> Option<IssPosition> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT latitude, longitude, timestamp FROM iss_positions ORDER BY id DESC LIMIT 1",
            [],
            |row| {
                Ok(IssPosition {
                    latitude: row.get(0)?,
                    longitude: row.get(1)?,
                    timestamp: row.get(2)?,
                })
            },
        )
        .ok()
    }

    pub fn get_iss_trail(&self) -> Vec<IssPosition> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare(
            "SELECT latitude, longitude, timestamp FROM iss_positions
             WHERE fetched_at > strftime('%s', 'now') - 1800
             ORDER BY id ASC",
        ) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to prepare ISS trail query: {}", e);
                return Vec::new();
            }
        };

        let result = match stmt.query_map([], |row| {
            Ok(IssPosition {
                latitude: row.get(0)?,
                longitude: row.get(1)?,
                timestamp: row.get(2)?,
            })
        }) {
            Ok(rows) => rows.filter_map(|r| r.ok()).collect(),
            Err(e) => {
                log::error!("Failed to query ISS trail: {}", e);
                Vec::new()
            }
        };
        result
    }

    // -- Replay methods --

    pub fn get_earthquakes_at(&self, timestamp_ms: i64) -> Vec<Earthquake> {
        let conn = self.conn.lock().unwrap();
        // Get earthquakes that were active at the given timestamp
        // (time <= timestamp AND time + 24h > timestamp)
        let mut stmt = match conn.prepare(
            "SELECT id, magnitude, latitude, longitude, depth, place, time, tsunami, title
             FROM earthquakes
             WHERE time <= ?1 AND time > ?1 - 86400000
             ORDER BY time DESC",
        ) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to prepare replay query: {}", e);
                return Vec::new();
            }
        };

        let result = match stmt.query_map(rusqlite::params![timestamp_ms], |row| {
            Ok(Earthquake {
                id: row.get(0)?,
                magnitude: row.get(1)?,
                latitude: row.get(2)?,
                longitude: row.get(3)?,
                depth: row.get(4)?,
                place: row.get(5)?,
                time: row.get(6)?,
                tsunami: row.get::<_, i32>(7)? == 1,
                title: row.get(8)?,
            })
        }) {
            Ok(rows) => rows.filter_map(|r| r.ok()).collect(),
            Err(e) => {
                log::error!("Failed to query replay data: {}", e);
                Vec::new()
            }
        };
        result
    }

    pub fn get_iss_position_at(&self, timestamp_ms: i64) -> Option<IssPosition> {
        let conn = self.conn.lock().unwrap();
        let timestamp_s = timestamp_ms / 1000;
        conn.query_row(
            "SELECT latitude, longitude, timestamp FROM iss_positions
             WHERE timestamp <= ?1
             ORDER BY timestamp DESC LIMIT 1",
            rusqlite::params![timestamp_s],
            |row| {
                Ok(IssPosition {
                    latitude: row.get(0)?,
                    longitude: row.get(1)?,
                    timestamp: row.get(2)?,
                })
            },
        )
        .ok()
    }

    // -- Settings methods --

    pub fn get_settings(&self) -> UserSettings {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare(
            "SELECT key, value FROM settings WHERE key IN (
                'user_lat',
                'user_lon',
                'mag_threshold',
                'proximity_km',
                'notify_earthquakes',
                'notify_aurora',
                'notify_volcanoes',
                'sonification_enabled',
                'ollama_model'
            )",
        ) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to prepare settings query: {}", e);
                return UserSettings {
                    user_lat: None,
                    user_lon: None,
                    mag_threshold: None,
                    proximity_km: None,
                    notify_earthquakes: None,
                    notify_aurora: None,
                    notify_volcanoes: None,
                    sonification_enabled: None,
                    ollama_model: None,
                };
            }
        };

        let mut settings = UserSettings {
            user_lat: None,
            user_lon: None,
            mag_threshold: None,
            proximity_km: None,
            notify_earthquakes: None,
            notify_aurora: None,
            notify_volcanoes: None,
            sonification_enabled: None,
            ollama_model: None,
        };

        let rows = match stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        }) {
            Ok(r) => r,
            Err(e) => {
                log::error!("Failed to query settings: {}", e);
                return settings;
            }
        };

        for row in rows.flatten() {
            let val: Option<f64> = row.1.parse().ok();
            match row.0.as_str() {
                "user_lat" => settings.user_lat = val,
                "user_lon" => settings.user_lon = val,
                "mag_threshold" => settings.mag_threshold = val,
                "proximity_km" => settings.proximity_km = val,
                "notify_earthquakes" => settings.notify_earthquakes = parse_bool_setting(&row.1),
                "notify_aurora" => settings.notify_aurora = parse_bool_setting(&row.1),
                "notify_volcanoes" => settings.notify_volcanoes = parse_bool_setting(&row.1),
                "sonification_enabled" => {
                    settings.sonification_enabled = parse_bool_setting(&row.1)
                }
                "ollama_model" => settings.ollama_model = Some(row.1),
                _ => {}
            }
        }

        settings
    }

    #[allow(clippy::too_many_arguments)]
    pub fn save_settings(
        &self,
        lat: f64,
        lon: f64,
        mag_threshold: f64,
        proximity_km: f64,
        notify_earthquakes: bool,
        notify_aurora: bool,
        notify_volcanoes: bool,
        sonification_enabled: bool,
        ollama_model: &str,
    ) {
        let conn = self.conn.lock().unwrap();
        let pairs = [
            ("user_lat", lat.to_string()),
            ("user_lon", lon.to_string()),
            ("mag_threshold", mag_threshold.to_string()),
            ("proximity_km", proximity_km.to_string()),
            (
                "notify_earthquakes",
                if notify_earthquakes { "true" } else { "false" }.to_string(),
            ),
            (
                "notify_aurora",
                if notify_aurora { "true" } else { "false" }.to_string(),
            ),
            (
                "notify_volcanoes",
                if notify_volcanoes { "true" } else { "false" }.to_string(),
            ),
            (
                "sonification_enabled",
                if sonification_enabled {
                    "true"
                } else {
                    "false"
                }
                .to_string(),
            ),
            ("ollama_model", ollama_model.to_string()),
        ];
        for (key, value) in &pairs {
            conn.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                rusqlite::params![key, value],
            )
            .ok();
        }
    }

    // -- API cache methods --

    pub fn get_cached_response(&self, endpoint: &str, max_age_secs: i64) -> Option<String> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT response FROM api_cache WHERE endpoint = ?1 AND fetched_at > strftime('%s', 'now') - ?2",
            rusqlite::params![endpoint, max_age_secs],
            |row| row.get::<_, String>(0),
        )
        .ok()
    }

    pub fn set_cached_response(&self, endpoint: &str, response: &str) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO api_cache (endpoint, response, fetched_at) VALUES (?1, ?2, strftime('%s', 'now'))",
            rusqlite::params![endpoint, response],
        )
        .ok();
    }

    // -- Watchlist methods --

    pub fn get_watchlists(&self) -> Vec<Watchlist> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare(
            "SELECT id, name, latitude, longitude, radius_km, created_at FROM watchlists ORDER BY created_at DESC",
        ) {
            Ok(s) => s,
            Err(e) => {
                log::error!("Failed to prepare watchlists query: {}", e);
                return Vec::new();
            }
        };

        let result = match stmt.query_map([], |row| {
            Ok(Watchlist {
                id: row.get(0)?,
                name: row.get(1)?,
                latitude: row.get(2)?,
                longitude: row.get(3)?,
                radius_km: row.get(4)?,
                created_at: row.get(5)?,
            })
        }) {
            Ok(rows) => rows.filter_map(|r| r.ok()).collect(),
            Err(e) => {
                log::error!("Failed to query watchlists: {}", e);
                Vec::new()
            }
        };
        result
    }

    pub fn add_watchlist(
        &self,
        name: &str,
        latitude: f64,
        longitude: f64,
        radius_km: f64,
    ) -> Result<Watchlist, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO watchlists (name, latitude, longitude, radius_km) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![name, latitude, longitude, radius_km],
        )?;
        let id = conn.last_insert_rowid();
        let created_at: i64 = conn.query_row(
            "SELECT created_at FROM watchlists WHERE id = ?1",
            rusqlite::params![id],
            |row| row.get(0),
        )?;
        Ok(Watchlist {
            id,
            name: name.to_string(),
            latitude,
            longitude,
            radius_km,
            created_at,
        })
    }

    pub fn remove_watchlist(&self, id: i64) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM watchlists WHERE id = ?1",
            rusqlite::params![id],
        )?;
        Ok(())
    }

    // -- Cleanup --

    pub fn cleanup_old_data(&self) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM earthquakes WHERE fetched_at < strftime('%s', 'now') - 604800",
            [],
        )
        .ok();
        conn.execute(
            "DELETE FROM iss_positions WHERE fetched_at < strftime('%s', 'now') - 604800",
            [],
        )
        .ok();
        conn.execute(
            "DELETE FROM api_cache WHERE fetched_at < strftime('%s', 'now') - 86400",
            [],
        )
        .ok();
    }
}

fn parse_bool_setting(value: &str) -> Option<bool> {
    match value.to_ascii_lowercase().as_str() {
        "true" | "1" | "yes" | "on" => Some(true),
        "false" | "0" | "no" | "off" => Some(false),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::parse_bool_setting;

    #[test]
    fn parse_bool_setting_variants() {
        assert_eq!(parse_bool_setting("true"), Some(true));
        assert_eq!(parse_bool_setting("1"), Some(true));
        assert_eq!(parse_bool_setting("FALSE"), Some(false));
        assert_eq!(parse_bool_setting("off"), Some(false));
        assert_eq!(parse_bool_setting("maybe"), None);
    }
}
