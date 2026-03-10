use super::http::{send_with_resilience, SourceClass, HTTP_CLIENT};

pub struct TlePair {
    pub name: String,
    pub line1: String,
    pub line2: String,
}

pub async fn fetch_tle(url: &str) -> Result<Vec<TlePair>, String> {
    let response = send_with_resilience("tle", SourceClass::Standard, "TLE request", || {
        HTTP_CLIENT.get(url)
    })
    .await?;

    let text = response
        .text()
        .await
        .map_err(|_| "Failed to read TLE response".to_string())?;

    parse_tle_text(&text)
}

pub fn parse_tle_text(text: &str) -> Result<Vec<TlePair>, String> {
    let lines: Vec<&str> = text
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect();
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

#[cfg(test)]
mod tests {
    use super::parse_tle_text;

    #[test]
    fn parses_tle_triplets() {
        let text = r#"
ISS (ZARYA)
1 25544U 98067A   26061.51001736  .00018403  00000+0  33241-3 0  9990
2 25544  51.6439 227.6748 0005064  91.0128 314.1376 15.50312296501688
HUBBLE SPACE TELESCOPE
1 20580U 90037B   26061.21875000  .00000643  00000+0  30218-4 0  9990
2 20580  28.4693 236.6442 0002792 165.7664 194.3413 15.09210294432100
        "#;

        let parsed = parse_tle_text(text).expect("text should parse");
        assert_eq!(parsed.len(), 2);
        assert_eq!(parsed[0].name, "ISS (ZARYA)");
        assert!(parsed[1].line2.starts_with("2 20580"));
    }
}
