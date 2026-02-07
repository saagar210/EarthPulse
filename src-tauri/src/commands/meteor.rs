use crate::fetchers::meteor::get_meteor_showers;
use crate::models::meteor::ActiveShower;

#[tauri::command]
pub fn get_meteors() -> Vec<ActiveShower> {
    get_meteor_showers()
}
