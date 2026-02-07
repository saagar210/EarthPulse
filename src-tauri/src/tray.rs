use std::sync::Mutex;
use tauri::{
    menu::{MenuBuilder, MenuItem, MenuItemBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};

pub struct TrayState {
    pub quake_item: MenuItem<tauri::Wry>,
    pub pass_item: MenuItem<tauri::Wry>,
    pub kp_item: MenuItem<tauri::Wry>,
}

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItemBuilder::with_id("show", "Show/Hide").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit EarthPulse").build(app)?;
    let quake_item = MenuItemBuilder::with_id("quake_info", "Recent Earthquake: --")
        .enabled(false)
        .build(app)?;
    let pass_item = MenuItemBuilder::with_id("pass_info", "Next ISS Pass: --")
        .enabled(false)
        .build(app)?;
    let kp_item = MenuItemBuilder::with_id("kp_info", "Kp Index: --")
        .enabled(false)
        .build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&show)
        .separator()
        .item(&quake_item)
        .item(&pass_item)
        .item(&kp_item)
        .separator()
        .item(&quit)
        .build()?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("EarthPulse")
        .icon(app.default_window_icon().unwrap().clone())
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        window.hide().ok();
                    } else {
                        window.show().ok();
                        window.set_focus().ok();
                    }
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    // Store menu item references for later updates
    app.manage(Mutex::new(TrayState {
        quake_item,
        pass_item,
        kp_item,
    }));

    Ok(())
}

pub fn update_tray_menu(app: &AppHandle, quake_text: &str, pass_text: &str, kp_text: &str) {
    if let Some(state) = app.try_state::<Mutex<TrayState>>() {
        if let Ok(tray) = state.lock() {
            if !quake_text.is_empty() {
                tray.quake_item.set_text(quake_text).ok();
            }
            if !pass_text.is_empty() {
                tray.pass_item.set_text(pass_text).ok();
            }
            if !kp_text.is_empty() {
                tray.kp_item.set_text(kp_text).ok();
            }
        }
    }
}
