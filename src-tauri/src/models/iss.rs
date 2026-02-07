use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct IssApiResponse {
    pub iss_position: IssApiPosition,
    pub timestamp: i64,
}

#[derive(Debug, Deserialize)]
pub struct IssApiPosition {
    pub latitude: String,
    pub longitude: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssPosition {
    pub latitude: f64,
    pub longitude: f64,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssData {
    pub current: IssPosition,
    pub trail: Vec<IssPosition>,
}
