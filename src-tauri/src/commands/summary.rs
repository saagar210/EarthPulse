use crate::db::Database;
use crate::fetchers::http::HTTP_CLIENT;
use tauri::State;

#[derive(serde::Deserialize)]
struct OllamaResponse {
    response: String,
}

#[tauri::command]
pub async fn generate_summary(
    db: State<'_, Database>,
    model: String,
) -> Result<String, String> {
    // Compile stats
    let cached_quakes = db.get_cached_earthquakes();
    let quake_count = cached_quakes.as_ref().map(|q| q.len()).unwrap_or(0);
    let strongest = cached_quakes
        .as_ref()
        .and_then(|quakes| {
            quakes
                .iter()
                .max_by(|a, b| a.magnitude.partial_cmp(&b.magnitude).unwrap_or(std::cmp::Ordering::Equal))
        })
        .map(|q| format!("M{:.1} at {}", q.magnitude, q.place));

    let gdacs_count = db
        .get_cached_response("gdacs:rss", 86400)
        .and_then(|json| {
            serde_json::from_str::<Vec<serde_json::Value>>(&json)
                .ok()
                .map(|v| v.len())
        })
        .unwrap_or(0);

    let asteroid_count = db
        .get_cached_response("nasa:neo", 86400)
        .and_then(|json| {
            serde_json::from_str::<Vec<serde_json::Value>>(&json)
                .ok()
                .map(|v| v.len())
        })
        .unwrap_or(0);

    let prompt = format!(
        "You are EarthPulse, a real-time global activity monitor. Give a brief, engaging 2-3 paragraph daily summary based on this data:\n\
        - Earthquakes in last 24h: {}\n\
        - Strongest earthquake: {}\n\
        - GDACS hazard alerts: {}\n\
        - Near-Earth asteroid approaches this week: {}\n\
        \nBe concise and informative. Use a calm, scientific tone. Mention any notable events.",
        quake_count,
        strongest.unwrap_or_else(|| "None recorded".into()),
        gdacs_count,
        asteroid_count,
    );

    let body = serde_json::json!({
        "model": model,
        "prompt": prompt,
        "stream": false,
    });

    let response = HTTP_CLIENT
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            if e.is_connect() {
                "Ollama is not running. Start it with 'ollama serve' and ensure a model is installed (e.g., 'ollama pull llama3.2').".to_string()
            } else {
                format!("Ollama request failed: {}", e)
            }
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Ollama returned {}: {}", status, text));
    }

    let result: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    Ok(result.response)
}
