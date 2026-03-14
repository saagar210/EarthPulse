# EarthPulse Dependencies And External Services

- Owner: Architecture Owner
- Last reviewed: 2026-03-13

## Purpose

This doc lists the important external dependencies behind EarthPulse, why they matter, and what failure looks like when one of them is unhealthy.

## Runtime And Build Dependencies

| Dependency     | Why it matters                                | Failure mode                                         |
| -------------- | --------------------------------------------- | ---------------------------------------------------- |
| Node.js 20+    | Frontend tooling and scripts                  | `pnpm` commands fail or mismatch verify expectations |
| pnpm 10+       | Package manager and lockfile contract         | install and script resolution problems               |
| Rust 1.88.0    | Tauri backend build and tests                 | `cargo` build or test failures                       |
| Git            | branch guard and release workflow assumptions | verify script and PR flow fail                       |
| GitHub Actions | CI, quality gates, release packaging          | no trusted release packaging path                    |

## External Data Services

| Service             | Used for                        | Auth             | Normal behavior                 | Known failure mode                          |
| ------------------- | ------------------------------- | ---------------- | ------------------------------- | ------------------------------------------- |
| USGS GeoJSON / FDSN | live and historical earthquakes | none             | frequent live quake updates     | stale or empty quake data                   |
| Open Notify         | ISS position                    | none             | fast ISS updates                | ISS panel stops refreshing                  |
| CelesTrak           | TLE data for satellites         | none             | orbital refresh every 5 minutes | satellite trails go stale                   |
| NOAA SWPC           | Kp and space weather support    | none             | aurora panel updates            | solar panel staleness                       |
| Smithsonian GVP     | volcano feed                    | none             | live volcano list               | degraded fallback to curated list           |
| GDACS RSS           | hazard alerts                   | none             | alert feed refresh              | missing alert entries                       |
| NASA EONET          | wildfire and storm events       | none             | event feed refresh              | event list gaps or rate limits              |
| NASA NEO API        | asteroid close approaches       | optional API key | stable with personal key        | DEMO_KEY rate limit or empty panel          |
| NASA DONKI          | flares and CMEs                 | optional API key | stable with personal key        | DEMO_KEY rate limit or sparse results       |
| Open-Meteo          | weather and air quality         | none             | on-demand card responses        | card-level error or timeout                 |
| NOAA SST inputs     | sea surface temperature         | none             | on-demand SST card response     | temporary service failure                   |
| Ollama              | local summary generation        | local service    | optional summary output         | summary command fails when Ollama is absent |

## Release And Distribution Dependencies

| Dependency                               | Used for        | Current posture                              |
| ---------------------------------------- | --------------- | -------------------------------------------- |
| `TAURI_SIGNING_PRIVATE_KEY` and password | updater signing | optional, not provisioned in repo by default |
| Apple certificate and password           | macOS signing   | optional, not provisioned in repo by default |
| Apple App Store Connect API credentials  | notarization    | optional, not provisioned in repo by default |

See `docs/release/RELEASE_SECRETS_SETUP.md` for the exact release credential contract.

## Ownership Notes

- Product/runtime ownership: EarthPulse maintainers
- Release credential ownership: credentialed release owner only
- NASA API key ownership: local developer or shared operations owner, depending on how the team wants to provision it

## Update Rules

Update this doc when:

- a new upstream feed is added
- a feed changes from anonymous to authenticated
- a release credential changes
- a service becomes optional or deprecated
