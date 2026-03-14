# EarthPulse

**Desktop mission control for a very active planet.**

EarthPulse turns your desktop into a living globe of earthquakes, satellites, volcanoes, space weather, storm systems, wildfire activity, and other signals that normally stay scattered across half a dozen dashboards. Open it, and the world starts moving.

Built with **Tauri 2 + React 19 + Rust**, EarthPulse is designed to feel like a fast, information-dense companion screen: something you can leave open, glance at, and immediately understand what Earth and near-Earth space are doing right now.

## Why It Is Fun To Use

EarthPulse is not just a list of feeds. It is a live, layered, explorable view of the planet.

- Watch earthquakes pulse across the globe in real time.
- Follow the ISS and satellite tracks as they sweep across the map.
- See aurora conditions, solar flares, CMEs, and asteroid close approaches alongside Earth events.
- Jump into **24h Replay** to scrub through recent seismic activity.
- Open **Historical Explorer** to query older quake windows and compare patterns across time.
- Keep custom watchlists for places you care about and get proximity-based alerts.
- Export CSV, GeoJSON, and screenshots when you want to save or share what you are seeing.

The goal is simple: make global activity feel immediate, readable, and a little thrilling.

## What You Can Watch

| Layer                                    | Source                                | Refresh |
| ---------------------------------------- | ------------------------------------- | ------- |
| Earthquakes (circles + heatmap)          | USGS GeoJSON                          | 60s     |
| ISS tracker + orbit trail                | Open Notify                           | 5s      |
| Satellite tracks (ISS, Hubble, Tiangong) | CelesTrak TLE + SGP4                  | 5min    |
| Day / night terminator                   | Solar calculation                     | 60s     |
| Aurora / Kp index                        | NOAA SWPC                             | 15min   |
| Volcanoes                                | Smithsonian GVP with curated fallback | 6h      |
| GDACS hazard alerts                      | GDACS RSS                             | 15min   |
| Wildfires and storms                     | NASA EONET v3                         | 30min   |
| Asteroid close approaches                | NASA NEO API                          | 6h      |
| Solar flares and CMEs                    | NASA DONKI                            | 3h      |
| Tectonic plate boundaries                | Static GeoJSON                        | Startup |
| Meteor shower calendar                   | Curated catalog                       | Startup |

## Standout Features

- **24h Replay**: Scrub through the last day of quake activity and watch the map come alive.

- **Historical Explorer**: Query USGS historical windows to compare earlier activity against the present.

- **Stats Dashboard**: See magnitude distributions, frequency trends, and Kp history in compact charts.

- **Local Conditions**: Pull weather, air quality, and sea-surface temperature for your configured location.

- **Sonification**: Turn parts of the live data into sound so the app can be monitored with your ears too.

- **Ollama Summary**: Generate a local LLM summary of current conditions when you want a quick narrative read.

- **Custom Watchlists**: Save geographic points of interest and get proximity-aware event notifications.

- **Desktop-Native Behavior**: Use screenshots, clipboard copy, system tray behavior, and native notifications.

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)

Important local setup notes:

- Your local workspace path must **not** contain `:`.
- Run `pnpm preflight` after install so the repo can validate your environment.

Optional but recommended:

- Set `EARTHPULSE_NASA_API_KEY` or `NASA_API_KEY` to avoid `DEMO_KEY` limits for NASA NEO and DONKI feeds.

### Run The Real Desktop App

```bash
pnpm install
pnpm preflight
pnpm tauri dev
```

### Run The Browser Preview

```bash
pnpm dev
```

Browser preview is great for quick UI checks and smoke tests. It uses mocked desktop data, so use `pnpm tauri dev` for real desktop validation.

### Build

```bash
pnpm preflight
pnpm tauri build
```

## Core Commands

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm test:rust
bash .codex/scripts/run_verify_commands.sh
```

## Development Modes

### Standard desktop development

```bash
pnpm tauri dev
```

### Lean dev mode

```bash
pnpm dev:lean
```

Lean mode keeps heavy build output in temporary directories and cleans them up when the process exits. It is useful when disk pressure matters more than restart speed.

## Release And Project Docs

- [Release Runbook](docs/release/RELEASE_RUNBOOK.md)
- [Release Secrets Setup](docs/release/RELEASE_SECRETS_SETUP.md)
- [Release Notes](docs/releases/release-notes-v0.1.0.md)
- [Environment Setup](docs/onboarding/environment-setup.md)
- [Repo Tour](docs/onboarding/repo-tour.md)
- [Common Tasks](docs/onboarding/common-tasks.md)
- [System Overview](docs/architecture/system-overview.md)
- [Final Closeout Report](docs/comms/closeout/final-closeout-report.md)

## Project Structure

```text
src/
  components/   React UI: map, sidebar, timeline, dialogs
  stores/       Zustand state per data source
  hooks/        Keyboard shortcuts, listeners, and app behaviors
  runtime/      Real Tauri bridge or browser preview mocks
  utils/        Export, notifications, sonification helpers

src-tauri/src/
  commands/     Tauri IPC handlers
  fetchers/     External data clients
  calculations/ Terminator and orbital calculations
  models/       Shared backend data types
  db.rs         SQLite cache and settings
  notifications.rs
  tray.rs
  lib.rs        App setup and background polling loops
```

## Tech Stack

| Area          | Stack                                    |
| ------------- | ---------------------------------------- |
| Desktop shell | Tauri 2                                  |
| Frontend      | React 19, TypeScript, Tailwind CSS 4     |
| State         | Zustand 5                                |
| Mapping       | Leaflet + react-leaflet 5                |
| Backend       | Rust, reqwest, rusqlite, sgp4, quick-xml |
| Charts        | uPlot                                    |
| Audio         | Web Audio API                            |

## Current Release Posture

EarthPulse is currently documented and stabilized as an **internal unsigned beta**. The app is launchable and the verification path is in place, but signed public desktop distribution still depends on provisioning the real release credentials described in [docs/release/RELEASE_SECRETS_SETUP.md](docs/release/RELEASE_SECRETS_SETUP.md).

## License

MIT
