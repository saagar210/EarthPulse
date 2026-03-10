use std::sync::LazyLock;

static NASA_API_KEY: LazyLock<String> = LazyLock::new(|| {
    let key = std::env::var("EARTHPULSE_NASA_API_KEY")
        .ok()
        .or_else(|| std::env::var("NASA_API_KEY").ok())
        .map(|raw| raw.trim().to_string())
        .filter(|k| !k.is_empty());

    match key {
        Some(value) => value,
        None => {
            log::warn!(
                "NASA API key not configured; using DEMO_KEY (rate-limited). Set EARTHPULSE_NASA_API_KEY or NASA_API_KEY."
            );
            "DEMO_KEY".to_string()
        }
    }
});

pub fn api_key() -> &'static str {
    NASA_API_KEY.as_str()
}
