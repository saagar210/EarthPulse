use crate::calculations::terminator::calculate_terminator;

#[tauri::command]
pub fn get_terminator() -> Vec<[f64; 2]> {
    calculate_terminator()
}
