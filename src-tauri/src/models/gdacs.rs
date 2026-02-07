use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GdacsAlert {
    pub id: String,
    pub title: String,
    pub description: String,
    pub alert_type: String,
    pub severity: String,
    pub latitude: f64,
    pub longitude: f64,
    pub pub_date: String,
    pub link: String,
    pub country: String,
}
