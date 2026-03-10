use crate::fetchers::volcano::{fallback_volcanoes, get_active_volcanoes};

#[tauri::command]
pub async fn get_volcanoes() -> Vec<crate::models::volcano::Volcano> {
    match get_active_volcanoes().await {
        Ok(volcanoes) if !volcanoes.is_empty() => volcanoes,
        Ok(_) => fallback_volcanoes(),
        Err(e) => {
            log::warn!("Volcano feed unavailable, using fallback list: {e}");
            fallback_volcanoes()
        }
    }
}
