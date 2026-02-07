use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DonkiFlare {
    #[serde(rename = "flrID")]
    pub flr_id: String,
    pub class_type: Option<String>,
    pub begin_time: Option<String>,
    pub peak_time: Option<String>,
    #[allow(dead_code)]
    pub end_time: Option<String>,
    pub source_location: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DonkiCME {
    #[serde(rename = "activityID")]
    pub activity_id: String,
    pub start_time: Option<String>,
    pub note: Option<String>,
    pub cme_analyses: Option<Vec<CMEAnalysis>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CMEAnalysis {
    pub speed: Option<f64>,
    #[allow(dead_code)]
    pub latitude: Option<f64>,
    #[allow(dead_code)]
    pub longitude: Option<f64>,
    pub half_angle: Option<f64>,
    pub is_most_accurate: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolarFlare {
    pub id: String,
    pub class_type: String,
    pub peak_time: String,
    pub source_location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoronalMassEjection {
    pub id: String,
    pub start_time: String,
    pub speed_kps: Option<f64>,
    pub is_earth_directed: bool,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolarActivity {
    pub flares: Vec<SolarFlare>,
    pub cmes: Vec<CoronalMassEjection>,
}
