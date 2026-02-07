use crate::models::meteor::ActiveShower;
use chrono::{Datelike, NaiveDate, Utc};

struct ShowerData {
    name: &'static str,
    peak_month: u32,
    peak_day: u32,
    active_start_month: u32,
    active_start_day: u32,
    active_end_month: u32,
    active_end_day: u32,
    #[allow(dead_code)]
    ra_hours: f64,
    dec_deg: f64,
    zhr: u32,
    velocity_kps: f64,
    parent_body: &'static str,
}

const SHOWERS: &[ShowerData] = &[
    ShowerData { name: "Quadrantids", peak_month: 1, peak_day: 4, active_start_month: 1, active_start_day: 1, active_end_month: 1, active_end_day: 10, ra_hours: 15.3, dec_deg: 49.0, zhr: 120, velocity_kps: 41.0, parent_body: "2003 EH1" },
    ShowerData { name: "Lyrids", peak_month: 4, peak_day: 22, active_start_month: 4, active_start_day: 16, active_end_month: 4, active_end_day: 25, ra_hours: 18.1, dec_deg: 34.0, zhr: 18, velocity_kps: 49.0, parent_body: "C/1861 G1 Thatcher" },
    ShowerData { name: "Eta Aquariids", peak_month: 5, peak_day: 6, active_start_month: 4, active_start_day: 19, active_end_month: 5, active_end_day: 28, ra_hours: 22.3, dec_deg: -1.0, zhr: 50, velocity_kps: 66.0, parent_body: "1P/Halley" },
    ShowerData { name: "Southern Delta Aquariids", peak_month: 7, peak_day: 30, active_start_month: 7, active_start_day: 12, active_end_month: 8, active_end_day: 23, ra_hours: 22.7, dec_deg: -16.0, zhr: 25, velocity_kps: 41.0, parent_body: "96P/Machholz" },
    ShowerData { name: "Alpha Capricornids", peak_month: 7, peak_day: 30, active_start_month: 7, active_start_day: 3, active_end_month: 8, active_end_day: 15, ra_hours: 20.5, dec_deg: -10.0, zhr: 5, velocity_kps: 23.0, parent_body: "169P/NEAT" },
    ShowerData { name: "Perseids", peak_month: 8, peak_day: 12, active_start_month: 7, active_start_day: 17, active_end_month: 8, active_end_day: 24, ra_hours: 3.1, dec_deg: 58.0, zhr: 100, velocity_kps: 59.0, parent_body: "109P/Swift-Tuttle" },
    ShowerData { name: "Draconids", peak_month: 10, peak_day: 8, active_start_month: 10, active_start_day: 6, active_end_month: 10, active_end_day: 10, ra_hours: 17.5, dec_deg: 54.0, zhr: 10, velocity_kps: 20.0, parent_body: "21P/Giacobini-Zinner" },
    ShowerData { name: "Orionids", peak_month: 10, peak_day: 21, active_start_month: 10, active_start_day: 2, active_end_month: 11, active_end_day: 7, ra_hours: 6.3, dec_deg: 16.0, zhr: 20, velocity_kps: 66.0, parent_body: "1P/Halley" },
    ShowerData { name: "Taurids (South)", peak_month: 11, peak_day: 5, active_start_month: 10, active_start_day: 1, active_end_month: 11, active_end_day: 25, ra_hours: 3.5, dec_deg: 14.0, zhr: 5, velocity_kps: 27.0, parent_body: "2P/Encke" },
    ShowerData { name: "Taurids (North)", peak_month: 11, peak_day: 12, active_start_month: 10, active_start_day: 1, active_end_month: 11, active_end_day: 25, ra_hours: 3.9, dec_deg: 22.0, zhr: 5, velocity_kps: 29.0, parent_body: "2P/Encke" },
    ShowerData { name: "Leonids", peak_month: 11, peak_day: 17, active_start_month: 11, active_start_day: 6, active_end_month: 11, active_end_day: 30, ra_hours: 10.1, dec_deg: 22.0, zhr: 15, velocity_kps: 71.0, parent_body: "55P/Tempel-Tuttle" },
    ShowerData { name: "Geminids", peak_month: 12, peak_day: 14, active_start_month: 12, active_start_day: 4, active_end_month: 12, active_end_day: 20, ra_hours: 7.5, dec_deg: 33.0, zhr: 150, velocity_kps: 35.0, parent_body: "3200 Phaethon" },
    ShowerData { name: "Ursids", peak_month: 12, peak_day: 22, active_start_month: 12, active_start_day: 17, active_end_month: 12, active_end_day: 26, ra_hours: 14.5, dec_deg: 76.0, zhr: 10, velocity_kps: 33.0, parent_body: "8P/Tuttle" },
    ShowerData { name: "Arietids", peak_month: 6, peak_day: 7, active_start_month: 5, active_start_day: 22, active_end_month: 7, active_end_day: 2, ra_hours: 2.8, dec_deg: 24.0, zhr: 30, velocity_kps: 39.0, parent_body: "1566 Icarus/96P" },
    ShowerData { name: "Puppid-Velids", peak_month: 12, peak_day: 7, active_start_month: 12, active_start_day: 1, active_end_month: 12, active_end_day: 15, ra_hours: 8.0, dec_deg: -45.0, zhr: 10, velocity_kps: 40.0, parent_body: "Unknown" },
    ShowerData { name: "Monocerotids", peak_month: 12, peak_day: 9, active_start_month: 11, active_start_day: 27, active_end_month: 12, active_end_day: 17, ra_hours: 6.6, dec_deg: 8.0, zhr: 3, velocity_kps: 42.0, parent_body: "C/1917 F1" },
    ShowerData { name: "Pi Puppids", peak_month: 4, peak_day: 24, active_start_month: 4, active_start_day: 15, active_end_month: 4, active_end_day: 28, ra_hours: 7.3, dec_deg: -45.0, zhr: 5, velocity_kps: 18.0, parent_body: "26P/Grigg-Skjellerup" },
    ShowerData { name: "Sigma Hydrids", peak_month: 12, peak_day: 6, active_start_month: 12, active_start_day: 3, active_end_month: 12, active_end_day: 15, ra_hours: 8.4, dec_deg: 2.0, zhr: 5, velocity_kps: 58.0, parent_body: "Unknown" },
    ShowerData { name: "Phoenicids", peak_month: 12, peak_day: 2, active_start_month: 11, active_start_day: 28, active_end_month: 12, active_end_day: 9, ra_hours: 1.1, dec_deg: -53.0, zhr: 5, velocity_kps: 18.0, parent_body: "289P/Blanpain" },
    ShowerData { name: "Comae Berenicids", peak_month: 12, peak_day: 20, active_start_month: 12, active_start_day: 12, active_end_month: 1, active_end_day: 2, ra_hours: 11.7, dec_deg: 25.0, zhr: 3, velocity_kps: 65.0, parent_body: "Unknown" },
];

/// Approximate conversion from RA/Dec to a ground lat/lon for the radiant.
/// The radiant is fixed in equatorial coordinates, so longitude depends on time of day.
/// We use a simplified approach: lat ≈ dec, lon ≈ 0 (placeholder, since radiant moves with Earth's rotation).
fn radiant_to_latlon(dec_deg: f64) -> (f64, f64) {
    // Latitude approximation from declination
    let lat = dec_deg;
    // Longitude: approximate from RA at midnight. This gives a static map marker.
    // Not astronomically precise, but useful for visualization.
    let lon = 0.0; // Radiant markers are mainly for display
    (lat, lon)
}

fn day_of_year(month: u32, day: u32, year: i32) -> i32 {
    NaiveDate::from_ymd_opt(year, month, day)
        .map(|d| d.ordinal() as i32)
        .unwrap_or(0)
}

pub fn get_meteor_showers() -> Vec<ActiveShower> {
    let now = Utc::now().date_naive();
    let year = now.year();
    let today_doy = now.ordinal() as i32;
    let days_in_year = if NaiveDate::from_ymd_opt(year, 12, 31).map(|d| d.ordinal()).unwrap_or(365) == 366 { 366 } else { 365 };

    SHOWERS
        .iter()
        .map(|s| {
            let peak_doy = day_of_year(s.peak_month, s.peak_day, year);
            let start_doy = day_of_year(s.active_start_month, s.active_start_day, year);
            let end_doy = day_of_year(s.active_end_month, s.active_end_day, year);

            // Handle year-wrapping showers (e.g., active Dec-Jan)
            let is_active = if start_doy <= end_doy {
                today_doy >= start_doy && today_doy <= end_doy
            } else {
                today_doy >= start_doy || today_doy <= end_doy
            };

            let is_peak = (today_doy - peak_doy).abs() <= 1
                || (today_doy - peak_doy + days_in_year).abs() <= 1
                || (today_doy - peak_doy - days_in_year).abs() <= 1;

            // Days until peak (can be negative for past peaks)
            let mut days_until = peak_doy - today_doy;
            if days_until < -days_in_year / 2 {
                days_until += days_in_year;
            } else if days_until > days_in_year / 2 {
                days_until -= days_in_year;
            }

            let (lat, lon) = radiant_to_latlon(s.dec_deg);
            let peak_date = NaiveDate::from_ymd_opt(year, s.peak_month, s.peak_day)
                .map(|d| d.format("%b %d").to_string())
                .unwrap_or_default();

            ActiveShower {
                name: s.name.to_string(),
                latitude: lat,
                longitude: lon,
                is_active,
                is_peak,
                peak_date,
                zhr: s.zhr,
                velocity_kps: s.velocity_kps,
                parent_body: s.parent_body.to_string(),
                days_until_peak: days_until,
            }
        })
        .collect()
}
