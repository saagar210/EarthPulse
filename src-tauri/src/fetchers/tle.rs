use super::http::HTTP_CLIENT;

pub struct TlePair {
    pub name: String,
    pub line1: String,
    pub line2: String,
}

pub async fn fetch_tle(url: &str) -> Result<Vec<TlePair>, String> {
    let response = HTTP_CLIENT
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch TLE: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read TLE response: {}", e))?;

    parse_tle_text(&text)
}

pub fn parse_tle_text(text: &str) -> Result<Vec<TlePair>, String> {
    let lines: Vec<&str> = text.lines().map(|l| l.trim()).filter(|l| !l.is_empty()).collect();
    let mut pairs = Vec::new();

    let mut i = 0;
    while i + 2 < lines.len() {
        let name_line = lines[i];
        let line1 = lines[i + 1];
        let line2 = lines[i + 2];

        // TLE line 1 starts with "1 " and line 2 with "2 "
        if line1.starts_with("1 ") && line2.starts_with("2 ") {
            pairs.push(TlePair {
                name: name_line.trim().to_string(),
                line1: line1.to_string(),
                line2: line2.to_string(),
            });
            i += 3;
        } else {
            i += 1;
        }
    }

    Ok(pairs)
}
