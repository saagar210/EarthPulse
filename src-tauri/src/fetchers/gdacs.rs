use super::http::HTTP_CLIENT;
use crate::models::gdacs::GdacsAlert;
use quick_xml::events::Event;
use quick_xml::Reader;

const GDACS_RSS_URL: &str = "https://www.gdacs.org/xml/rss.xml";

pub async fn fetch_gdacs_alerts() -> Result<Vec<GdacsAlert>, String> {
    let response = HTTP_CLIENT
        .get(GDACS_RSS_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch GDACS: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read GDACS response: {}", e))?;

    parse_gdacs_rss(&text)
}

fn parse_gdacs_rss(xml: &str) -> Result<Vec<GdacsAlert>, String> {
    let mut reader = Reader::from_str(xml);
    let mut alerts = Vec::new();
    let mut buf = Vec::new();

    let mut in_item = false;
    let mut current_tag = String::new();

    // Item fields
    let mut title = String::new();
    let mut description = String::new();
    let mut link = String::new();
    let mut pub_date = String::new();
    let mut alert_level = String::new();
    let mut event_type = String::new();
    let mut country = String::new();
    let mut lat: Option<f64> = None;
    let mut lon: Option<f64> = None;
    let mut event_id = String::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                let name = String::from_utf8_lossy(e.name().as_ref()).to_string();
                current_tag = name.clone();

                if name == "item" {
                    in_item = true;
                    title.clear();
                    description.clear();
                    link.clear();
                    pub_date.clear();
                    alert_level.clear();
                    event_type.clear();
                    country.clear();
                    lat = None;
                    lon = None;
                    event_id.clear();
                }
            }
            Ok(Event::Empty(_)) => {}
            Ok(Event::Text(ref e)) => {
                if !in_item {
                    buf.clear();
                    continue;
                }

                let text = e.unescape().unwrap_or_default().to_string();
                let text = text.trim().to_string();
                if text.is_empty() {
                    buf.clear();
                    continue;
                }

                match current_tag.as_str() {
                    "title" => title = text,
                    "description" => description = text,
                    "link" => link = text,
                    "pubDate" => pub_date = text,
                    "gdacs:alertlevel" => alert_level = text,
                    "gdacs:eventtype" => event_type = text,
                    "gdacs:country" => country = text,
                    "gdacs:eventid" => event_id = text,
                    "geo:lat" => lat = text.parse().ok(),
                    "geo:long" => lon = text.parse().ok(),
                    "georss:point" => {
                        // Format: "lat lon"
                        let parts: Vec<&str> = text.split_whitespace().collect();
                        if parts.len() == 2 {
                            lat = parts[0].parse().ok();
                            lon = parts[1].parse().ok();
                        }
                    }
                    _ => {}
                }
            }
            Ok(Event::End(ref e)) => {
                let name = String::from_utf8_lossy(e.name().as_ref()).to_string();
                if name == "item" && in_item {
                    in_item = false;

                    if let (Some(latitude), Some(longitude)) = (lat, lon) {
                        let id = if event_id.is_empty() {
                            format!("gdacs-{}-{:.4}-{:.4}", event_type, latitude, longitude)
                        } else {
                            format!("gdacs-{}-{}", event_type, event_id)
                        };

                        alerts.push(GdacsAlert {
                            id,
                            title: title.clone(),
                            description: strip_html(&description),
                            alert_type: event_type.clone(),
                            severity: alert_level.clone(),
                            latitude,
                            longitude,
                            pub_date: pub_date.clone(),
                            link: link.clone(),
                            country: country.clone(),
                        });
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(format!("XML parse error: {}", e)),
            _ => {}
        }
        buf.clear();
    }

    Ok(alerts)
}

fn strip_html(s: &str) -> String {
    let mut result = String::new();
    let mut in_tag = false;
    for c in s.chars() {
        if c == '<' {
            in_tag = true;
        } else if c == '>' {
            in_tag = false;
        } else if !in_tag {
            result.push(c);
        }
    }
    // Collapse whitespace
    result.split_whitespace().collect::<Vec<_>>().join(" ")
}
