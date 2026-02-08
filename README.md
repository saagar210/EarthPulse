# EarthPulse

**A real-time global activity dashboard for your desktop.** Track earthquakes, satellites, space weather, volcanoes, wildfires, and more — all on a live dark-themed map.

Built with **Tauri 2 + React 19 + Rust** for native performance and tiny bundle size.

---

## What It Does

| Layer | Source | Refresh |
|-------|--------|---------|
| Earthquakes (circle + heatmap) | USGS GeoJSON | 60s |
| ISS Tracker + orbit trail | Open Notify | 5s |
| Satellite Tracks (ISS, Hubble, Tiangong) | CelesTrak TLE + SGP4 | 5min |
| Day/Night Terminator | Solar calculation | 60s |
| Aurora / Kp Index | NOAA SWPC | 15min |
| Volcanoes | Smithsonian GVP | startup |
| GDACS Hazard Alerts | GDACS RSS | 15min |
| EONET Wildfires & Storms | NASA EONET v3 | 30min |
| Asteroid Close Approaches | NASA NEO API | 6h |
| Solar Flares & CMEs | NASA DONKI | 3h |
| Tectonic Plate Boundaries | Static GeoJSON | startup |
| Meteor Shower Calendar | Hardcoded catalog | startup |

### Extra Features

- **24h Replay** — scrub through the last day of seismic activity
- **Historical Explorer** — query USGS FDSNWS for any date range
- **ISS Pass Predictions** — SGP4 propagation with elevation alerts
- **Statistics Dashboard** — magnitude histogram, frequency timeline, Kp trend (uPlot)
- **Sonification** — earthquakes mapped to audio tones, Kp to a drone
- **Weather / Air Quality / SST** — on-demand cards via Open-Meteo & NOAA
- **Data Export** — CSV and GeoJSON download
- **Ollama Summary** — local LLM narration of current conditions
- **Screenshot Export** — PNG with UTC watermark, save or copy to clipboard
- **Custom Watchlists** — geographic alerts with proximity notifications
- **System Tray** — live data in menu, hide-to-tray on close
- **Keyboard Shortcuts** — `1-9` toggle layers, `Space` play/pause, `R` replay, `S` screenshot, `?` help
- **Map Styles** — Dark Matter, Satellite, Topo, Light

---

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)

### Run

```bash
pnpm install
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

---

## Tech Stack

| | |
|---|---|
| **Desktop** | Tauri 2 |
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 |
| **State** | Zustand 5 |
| **Map** | Leaflet + react-leaflet 5 |
| **Backend** | Rust, reqwest, rusqlite, sgp4, quick-xml |
| **Charts** | uPlot |
| **Audio** | Web Audio API |

---

## Project Structure

```
src/                  # React frontend
  components/         # Map layers, sidebar panels, timeline
  stores/             # Zustand stores (one per data source)
  hooks/              # Keyboard shortcuts, event listeners
  utils/              # Export, notifications, sonification

src-tauri/src/        # Rust backend
  fetchers/           # API clients (USGS, NASA, NOAA, etc.)
  commands/           # Tauri IPC command handlers
  models/             # Data types
  calculations/       # Terminator, SGP4 propagation
  db.rs               # SQLite cache + settings
  notifications.rs    # Dedup + alert logic
  tray.rs             # System tray setup
  lib.rs              # App setup + background tasks
```

---

## License

MIT
