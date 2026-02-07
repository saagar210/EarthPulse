use crate::fetchers::volcano::get_active_volcanoes;

#[tauri::command]
pub fn get_volcanoes() -> Vec<crate::models::volcano::Volcano> {
    get_active_volcanoes()
}
