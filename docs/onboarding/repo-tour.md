# EarthPulse Repo Tour

## Main entrypoints

- Frontend bootstrap: `src/main.tsx`
- App shell: `src/App.tsx`
- Desktop runtime: `src-tauri/src/lib.rs`

## Frontend shape

- `src/components/Map`: map layers and map wiring
- `src/components/Sidebar`: data panels, watchlists, source health, event feed
- `src/components/Timeline`: replay and historical controls
- `src/stores`: Zustand state per source or feature
- `src/hooks`: event feed creation, keyboard shortcuts, source health, sonification

## Backend shape

- `src-tauri/src/fetchers`: upstream API clients and feed parsing
- `src-tauri/src/commands`: Tauri invoke handlers
- `src-tauri/src/models`: shared backend data shapes
- `src-tauri/src/db.rs`: local persistence and cached responses
- `src-tauri/src/notifications.rs`: alert dedupe and notification logic

## Verification sources of truth

- Canonical verify commands: `.codex/verify.commands`
- Deterministic runner: `.codex/scripts/run_verify_commands.sh`
- Release flow: `docs/release/RELEASE_RUNBOOK.md`
