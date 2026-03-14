# EarthPulse Data Flow

- Owner: Architecture Owner
- Last reviewed: 2026-03-13

## Purpose

This doc explains how data moves from external feeds into the desktop UI, how the app handles degraded sources, and where persistence happens.

## Data Flow Patterns

EarthPulse uses three patterns:

1. Background polling plus event push
2. On-demand command fetch
3. Local persistence and rehydration

## Background Polling Plus Event Push

Most live sources are polled by Rust loops in `src-tauri/src/lib.rs`. The backend then emits update events that stores listen for.

| Source           | Backend path               | Refresh cadence | Frontend consumer                        |
| ---------------- | -------------------------- | --------------- | ---------------------------------------- |
| Earthquakes      | `fetchers::earthquake`     | 60s             | `useEarthquakeStore`, map layers, replay |
| ISS              | `fetchers::iss`            | 5s              | `useIssStore`, ISS layer                 |
| Terminator       | `calculations::terminator` | 60s             | `useTerminatorStore`, map overlay        |
| Solar Kp         | `fetchers::solar`          | 15m             | `useSolarStore`, aurora panel and chart  |
| Volcanoes        | `fetchers::volcano`        | 6h              | `useVolcanoStore`, volcano panel and map |
| GDACS alerts     | `fetchers::gdacs`          | 15m             | `useGdacsStore`                          |
| Satellite tracks | `fetchers::satellite`      | 5m              | `useSatelliteStore`                      |
| EONET            | `fetchers::eonet`          | 30m             | `useEonetStore`                          |
| Asteroids        | `fetchers::asteroid`       | 6h              | `useAsteroidStore`                       |
| Solar activity   | `fetchers::solar_event`    | 3h              | `useSolarEventStore`                     |

Every background loop also emits `source:health` so the UI can show `ok`, degraded, or failed states.

## On-Demand Command Fetch

Some features fetch only when needed through `invoke(...)` commands:

- settings load and save
- weather card
- air quality card
- sea surface temperature card
- historical explorer
- watchlist CRUD
- summary generation
- data export inputs

These calls cross the command contract in `contracts/tauri-commands.json`.

## Local Persistence And Rehydration

Rust uses SQLite through `src-tauri/src/db.rs` for:

- cached live data
- persisted settings
- watchlists
- historical earthquake snapshots used by replay and lookup paths

On startup, the frontend requests settings and watchlists, then subscribes to live update events.

## Degraded Data Handling

EarthPulse is designed to stay usable even when some sources fail.

- Volcanoes can fall back to curated data when the live source is empty or unavailable.
- Browser preview mode always uses mock data and should not be used to diagnose upstream incidents.
- Panels should show loading, empty, degraded, or error states instead of disappearing.

## User-Visible Flow

1. A source fetch succeeds or fails in Rust.
2. Rust stores or transforms the result if needed.
3. Rust emits data updates and source-health events.
4. Stores update local state.
5. Components re-render map overlays, panels, and alerts.

## Failure Signals

Use these signals together during triage:

- source-health panel in the app
- `pnpm tauri dev` terminal logs
- failing store state in the UI
- deterministic verify results for build and test integrity

## How To Update This Doc

Update this doc when a new source is added, a refresh cadence changes, the persistence model changes, or a new degraded-data policy is introduced.
