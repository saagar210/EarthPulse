# EarthPulse Frontend-Backend Boundary

- Owner: Architecture Owner
- Last reviewed: 2026-03-13

## Purpose

This doc defines the contract between the React frontend and the Rust/Tauri backend so readiness work does not accidentally break cross-runtime behavior.

## Boundary Rules

1. Frontend code should call only documented Tauri commands.
2. Rust must register every public command in `tauri::generate_handler!`.
3. The command list in `contracts/tauri-commands.json` is the shared source of truth for contract tests.
4. Browser preview mocks must preserve the same command names and response shapes used by desktop mode.

## Current Command Surface

Current contract commands:

- `add_watchlist`
- `generate_summary`
- `get_air_quality`
- `get_asteroids`
- `get_eonet_events`
- `get_earthquakes`
- `get_gdacs_alerts`
- `get_historical_data`
- `get_historical_earthquakes`
- `get_iss_position`
- `get_meteors`
- `get_pass_predictions`
- `get_plates`
- `get_satellite_positions`
- `get_settings`
- `get_solar_activity`
- `get_solar_data`
- `get_sst`
- `get_terminator`
- `get_volcanoes`
- `get_watchlists`
- `get_weather`
- `remove_watchlist`
- `save_settings`

## Update Channels

Not all live data travels through direct `invoke(...)` calls. The backend also pushes events:

- `earthquakes:update`
- `iss:update`
- `terminator:update`
- `solar:update`
- `volcanoes:update`
- `gdacs:update`
- `satellites:update`
- `plates:update`
- `meteors:update`
- `eonet:update`
- `asteroids:update`
- `solar_activity:update`
- `source:health`

The frontend stores and hooks are responsible for subscribing to these events and translating them into UI state.

## Desktop-Only Responsibilities

These behaviors must be verified in Tauri desktop mode:

- SQLite-backed persistence
- system tray behavior
- native notifications
- file save and clipboard integrations
- live upstream polling and real source-health transitions

## Browser Preview Responsibilities

Browser preview exists for:

- quick UI smoke checks
- interaction tests
- fallback validation for dialogs and panels

Browser preview must not be treated as proof that native Tauri behavior works.

## Safe Change Workflow

When changing the boundary:

1. update frontend call sites
2. update Rust command registration and handlers
3. update `contracts/tauri-commands.json`
4. update browser preview mocks in `src/runtime/browserMocks.ts`
5. run `pnpm test:unit`
6. run `pnpm test:e2e`
7. run desktop validation with `pnpm tauri dev`

## How To Update This Doc

Update this doc any time a command is added, renamed, removed, or moved between event-driven and on-demand paths.
