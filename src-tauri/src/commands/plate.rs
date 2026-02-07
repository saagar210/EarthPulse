use crate::fetchers::plate::get_plate_boundaries;
use crate::models::plate::PlateBoundary;

#[tauri::command]
pub fn get_plates() -> Vec<PlateBoundary> {
    get_plate_boundaries()
}
