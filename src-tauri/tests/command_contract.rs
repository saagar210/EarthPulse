use serde::Deserialize;
use std::collections::BTreeSet;

#[derive(Deserialize)]
struct CommandContract {
    commands: Vec<String>,
}

fn rust_registered_commands() -> BTreeSet<String> {
    let source = include_str!("../src/lib.rs");
    let mut in_handler = false;
    let mut commands = BTreeSet::new();

    for line in source.lines() {
        if line.contains("tauri::generate_handler![") {
            in_handler = true;
            continue;
        }
        if in_handler && line.contains("])") {
            break;
        }
        if !in_handler {
            continue;
        }

        let trimmed = line.trim().trim_end_matches(',');
        if !trimmed.starts_with("commands::") {
            continue;
        }
        let parts: Vec<&str> = trimmed.split("::").collect();
        if let Some(name) = parts.last() {
            commands.insert((*name).to_string());
        }
    }

    commands
}

#[test]
fn tauri_command_contract_matches_invoke_handler() {
    let contract_path = format!(
        "{}/../contracts/tauri-commands.json",
        env!("CARGO_MANIFEST_DIR")
    );
    let raw = std::fs::read_to_string(contract_path).expect("contract json should be readable");
    let contract: CommandContract =
        serde_json::from_str(&raw).expect("contract json should be parseable");

    let expected: BTreeSet<String> = contract.commands.into_iter().collect();
    let actual = rust_registered_commands();

    assert_eq!(
        expected, actual,
        "Rust invoke handler and contract file are out of sync"
    );
}
