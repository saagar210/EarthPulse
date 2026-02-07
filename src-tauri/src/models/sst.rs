use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ErddapResponse {
    pub table: ErddapTable,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ErddapTable {
    pub column_names: Vec<String>,
    pub rows: Vec<Vec<serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeaSurfaceTemp {
    pub latitude: f64,
    pub longitude: f64,
    pub temperature_c: f64,
    pub time: String,
}
