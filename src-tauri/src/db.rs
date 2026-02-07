use crate::models::earthquake::Earthquake;
use crate::models::iss::IssPosition;
use rusqlite::Connection;
use std::sync::Mutex;

pub struct UserSettings {
    pub user_lat: Option<f64>,
    pub user_lon: Option<f64>,
    pub mag_threshold: Option<f64>,
    pub proximity_km: Option<f64>,
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
        let mut stmt = conn
            .prepare(
                "INSERT OR REPLACE INTO earthquakes (id, magnitude, latitude, longitude, depth, place, time, tsunami, title, fetched_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, strftime('%s', 'now'))",
            )
            .unwrap();

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
        let mut stmt = conn
            .prepare(
                "SELECT latitude, longitude, timestamp FROM iss_positions
                 WHERE fetched_at > strftime('%s', 'now') - 1800
                 ORDER BY id ASC",
            )
            .unwrap();

        stmt.query_map([], |row| {
            Ok(IssPosition {
                latitude: row.get(0)?,
                longitude: row.get(1)?,
                timestamp: row.get(2)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
    }

    // -- Replay methods --

    pub fn get_earthquakes_at(&self, timestamp_ms: i64) -> Vec<Earthquake> {
        let conn = self.conn.lock().unwrap();
        // Get earthquakes that were active at the given timestamp
        // (time <= timestamp AND time + 24h > timestamp)
        let mut stmt = conn
            .prepare(
                "SELECT id, magnitude, latitude, longitude, depth, place, time, tsunami, title
                 FROM earthquakes
                 WHERE time <= ?1 AND time > ?1 - 86400000
                 ORDER BY time DESC",
            )
            .unwrap();

        stmt.query_map(rusqlite::params![timestamp_ms], |row| {
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
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
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
        let get = |key: &str| -> Option<f64> {
            conn.query_row(
                "SELECT value FROM settings WHERE key = ?1",
                rusqlite::params![key],
                |row| row.get::<_, String>(0),
            )
            .ok()
            .and_then(|v| v.parse().ok())
        };
        UserSettings {
            user_lat: get("user_lat"),
            user_lon: get("user_lon"),
            mag_threshold: get("mag_threshold"),
            proximity_km: get("proximity_km"),
        }
    }

    pub fn save_settings(&self, lat: f64, lon: f64, mag_threshold: f64, proximity_km: f64) {
        let conn = self.conn.lock().unwrap();
        let pairs = [
            ("user_lat", lat.to_string()),
            ("user_lon", lon.to_string()),
            ("mag_threshold", mag_threshold.to_string()),
            ("proximity_km", proximity_km.to_string()),
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
    }
}
