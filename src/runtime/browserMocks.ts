import { emit } from "@tauri-apps/api/event";
import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import type { PersistedSettings } from "../stores/settingsStore";
import type { AirQuality } from "../types/air_quality";
import type { Asteroid } from "../types/asteroid";
import type { Earthquake } from "../types/earthquake";
import type { NaturalEvent } from "../types/eonet";
import type { GdacsAlert } from "../types/gdacs";
import type { HistoricalResult } from "../types/historical";
import type { IssData, IssPosition } from "../types/iss";
import type { ActiveShower } from "../types/meteor";
import type { PlateBoundary } from "../types/plate";
import type { ReplayData } from "../types/replay";
import type {
  PassPrediction,
  SatelliteData,
  SatellitePosition,
} from "../types/satellite";
import type { SolarActivity } from "../types/solar_event";
import type { SolarData } from "../types/solar";
import type { SeaSurfaceTemp } from "../types/sst";
import type { Volcano } from "../types/volcano";
import type { Watchlist } from "../types/watchlist";
import type { Weather } from "../types/weather";
import { hasTauriInvoke } from "./tauri";

interface BrowserPreviewState {
  settings: PersistedSettings;
  watchlists: Watchlist[];
  nextWatchlistId: number;
}

const STORAGE_KEY = "earthpulse.browser-preview.state";

const defaultSettings: PersistedSettings = {
  user_lat: 37.3382,
  user_lon: -121.8863,
  mag_threshold: 5,
  proximity_km: 500,
  notify_earthquakes: true,
  notify_aurora: true,
  notify_volcanoes: true,
  sonification_enabled: false,
  ollama_model: "llama3.2",
};

function loadState(): BrowserPreviewState {
  if (typeof window === "undefined") {
    return {
      settings: defaultSettings,
      watchlists: [],
      nextWatchlistId: 1,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        settings: defaultSettings,
        watchlists: [],
        nextWatchlistId: 1,
      };
    }

    const parsed = JSON.parse(raw) as Partial<BrowserPreviewState>;
    return {
      settings: {
        ...defaultSettings,
        ...parsed.settings,
      },
      watchlists: parsed.watchlists ?? [],
      nextWatchlistId: parsed.nextWatchlistId ?? 1,
    };
  } catch {
    return {
      settings: defaultSettings,
      watchlists: [],
      nextWatchlistId: 1,
    };
  }
}

function saveState(state: BrowserPreviewState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sampleEarthquakes(now = Date.now()): Earthquake[] {
  return [
    {
      id: "eq-preview-1",
      magnitude: 6.2,
      latitude: 38.322,
      longitude: 142.369,
      depth: 24,
      place: "Offshore Honshu, Japan",
      time: now - 12 * 60 * 1000,
      tsunami: false,
      title: "M 6.2 - Offshore Honshu, Japan",
    },
    {
      id: "eq-preview-2",
      magnitude: 5.4,
      latitude: 18.457,
      longitude: -72.533,
      depth: 11,
      place: "Southern Haiti",
      time: now - 48 * 60 * 1000,
      tsunami: false,
      title: "M 5.4 - Southern Haiti",
    },
    {
      id: "eq-preview-3",
      magnitude: 4.9,
      latitude: 61.212,
      longitude: -149.9,
      depth: 34,
      place: "Anchorage, Alaska region",
      time: now - 95 * 60 * 1000,
      tsunami: false,
      title: "M 4.9 - Anchorage, Alaska region",
    },
  ];
}

function sampleIss(now = Date.now()): IssData {
  const current: IssPosition = {
    latitude: 12.4,
    longitude: -24.8,
    timestamp: now,
  };

  return {
    current,
    trail: [
      { latitude: 6.2, longitude: -44.8, timestamp: now - 10 * 60 * 1000 },
      { latitude: 9.1, longitude: -34.9, timestamp: now - 5 * 60 * 1000 },
      current,
    ],
  };
}

function sampleTerminator(): [number, number][] {
  return Array.from({ length: 13 }, (_, index) => {
    const longitude = -180 + index * 30;
    const latitude = Math.sin((index / 12) * Math.PI * 2) * 40;
    return [latitude, longitude];
  });
}

function sampleSolar(): SolarData {
  return {
    kp_index: 4.7,
    kp_timestamp: new Date().toISOString(),
  };
}

function sampleVolcanoes(): Volcano[] {
  return [
    {
      id: "volc-preview-1",
      name: "Etna",
      latitude: 37.75,
      longitude: 14.99,
      status: "warning",
      last_eruption: "2026-03-11T08:15:00Z",
      description: "Persistent strombolian activity observed.",
    },
    {
      id: "volc-preview-2",
      name: "Fuego",
      latitude: 14.473,
      longitude: -90.88,
      status: "watch",
      last_eruption: "2026-03-12T18:40:00Z",
      description: "Ash emissions continue from the summit crater.",
    },
  ];
}

function sampleGdacs(): GdacsAlert[] {
  return [
    {
      id: "gdacs-preview-1",
      title: "Flood - Peru",
      description: "Preview flood alert for smoke testing.",
      alert_type: "Flood",
      severity: "Orange",
      latitude: -12.0464,
      longitude: -77.0428,
      pub_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      link: "https://www.gdacs.org/",
      country: "Peru",
    },
    {
      id: "gdacs-preview-2",
      title: "Tropical Storm - Madagascar",
      description: "Preview storm alert for smoke testing.",
      alert_type: "Storm",
      severity: "Red",
      latitude: -18.8792,
      longitude: 47.5079,
      pub_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      link: "https://www.gdacs.org/",
      country: "Madagascar",
    },
  ];
}

function sampleSatellites(now = Date.now()): SatelliteData {
  const positions: SatellitePosition[] = [
    {
      id: "iss",
      name: "ISS",
      latitude: 12.4,
      longitude: -24.8,
      altitude_km: 408,
      velocity_kmh: 27600,
      timestamp: now,
    },
    {
      id: "hubble",
      name: "Hubble",
      latitude: 28.1,
      longitude: -61.2,
      altitude_km: 538,
      velocity_kmh: 27400,
      timestamp: now,
    },
  ];

  return {
    positions,
    orbits: [
      {
        satellite_id: "iss",
        points: [
          [5, -80],
          [12, -24.8],
          [18, 30],
        ],
      },
      {
        satellite_id: "hubble",
        points: [
          [18, -100],
          [28.1, -61.2],
          [37, -10],
        ],
      },
    ],
  };
}

function samplePassPredictions(now = Date.now()): PassPrediction[] {
  const start = Math.floor((now + 18 * 60 * 1000) / 1000);
  return [
    {
      satellite_id: "iss",
      name: "ISS",
      start_time: start,
      end_time: start + 7 * 60,
      max_elevation: 62,
      start_azimuth: 124,
      is_visible: true,
    },
  ];
}

function samplePlates(): PlateBoundary[] {
  return [
    {
      name: "Pacific Ring",
      boundary_type: "convergent",
      coordinates: [
        [34.0, 140.0],
        [40.0, 150.0],
        [45.0, 160.0],
      ],
    },
  ];
}

function sampleMeteors(): ActiveShower[] {
  return [
    {
      name: "Lyrids",
      latitude: 35,
      longitude: -105,
      is_active: true,
      is_peak: false,
      peak_date: "2026-04-22",
      zhr: 18,
      velocity_kps: 49,
      parent_body: "C/1861 G1 Thatcher",
      days_until_peak: 39,
    },
  ];
}

function sampleEonet(): NaturalEvent[] {
  return [
    {
      id: "eonet-preview-1",
      title: "Western Canada Wildfires",
      category: "Wildfires",
      category_id: "wildfires",
      latitude: 53.7267,
      longitude: -127.6476,
      date: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
  ];
}

function sampleAsteroids(now = Date.now()): Asteroid[] {
  return [
    {
      id: "neo-preview-1",
      name: "(2026 AB)",
      diameter_km_min: 0.12,
      diameter_km_max: 0.27,
      is_hazardous: true,
      approach_date: "2026-03-15",
      approach_time: now + 22 * 60 * 60 * 1000,
      velocity_kps: 14.5,
      miss_distance_km: 615000,
      miss_distance_lunar: 1.6,
    },
    {
      id: "neo-preview-2",
      name: "(2026 CD3)",
      diameter_km_min: 0.03,
      diameter_km_max: 0.08,
      is_hazardous: false,
      approach_date: "2026-03-17",
      approach_time: now + 3 * 24 * 60 * 60 * 1000,
      velocity_kps: 8.1,
      miss_distance_km: 1250000,
      miss_distance_lunar: 3.2,
    },
  ];
}

function sampleSolarActivity(): SolarActivity {
  return {
    flares: [
      {
        id: "flare-preview-1",
        class_type: "M3.1",
        peak_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source_location: "N15W32",
      },
    ],
    cmes: [
      {
        id: "cme-preview-1",
        start_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        speed_kps: 920,
        is_earth_directed: true,
        note: "Preview event",
      },
    ],
  };
}

function sampleWeather(lat: number, lon: number): Weather {
  return {
    latitude: lat,
    longitude: lon,
    temperature_c: 17.8,
    weather_code: 2,
    weather_description: "Partly cloudy",
    wind_speed_kmh: 11,
    wind_direction: 240,
    humidity_pct: 63,
  };
}

function sampleAirQuality(lat: number, lon: number): AirQuality {
  return {
    latitude: lat,
    longitude: lon,
    us_aqi: 42,
    category: "Good",
    color: "#34d399",
    pm2_5: 6.1,
    pm10: 12.4,
  };
}

function sampleSst(lat: number, lon: number): SeaSurfaceTemp {
  return {
    latitude: lat,
    longitude: lon,
    temperature_c: 14.4,
    time: new Date().toISOString(),
  };
}

function sampleHistorical(): HistoricalResult {
  const earthquakes = sampleEarthquakes(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).map((quake, index) => ({
    ...quake,
    id: `historic-${quake.id}`,
    time: Date.now() - (index + 3) * 24 * 60 * 60 * 1000,
  }));

  return {
    earthquakes,
    summary: {
      total: earthquakes.length,
      strongest_mag: Math.max(...earthquakes.map((quake) => quake.magnitude)),
      strongest_place: earthquakes[0]?.place ?? "Unknown",
      avg_depth:
        earthquakes.reduce((sum, quake) => sum + quake.depth, 0) /
        earthquakes.length,
      tsunami_count: earthquakes.filter((quake) => quake.tsunami).length,
    },
  };
}

function sampleReplayData(timestamp: number): ReplayData {
  const earthquakes = sampleEarthquakes(timestamp).map((quake, index) => ({
    ...quake,
    id: `replay-${quake.id}`,
    time: timestamp - index * 20 * 60 * 1000,
  }));

  return {
    earthquakes,
    iss_position: {
      latitude: 4.2,
      longitude: 18.1,
      timestamp,
    },
    terminator: sampleTerminator(),
  };
}

function previewSummary(model: string): string {
  return [
    `Preview summary from ${model}:`,
    "- Seismic activity is elevated in the western Pacific.",
    "- One Earth-directed CME is present in the last 24 hours.",
    "- Hazard alerts remain active across flood and storm regions.",
  ].join("\n");
}

function previewHealthEvents() {
  const now = Date.now();
  return [
    { source: "earthquakes", ok: true, timestamp_ms: now },
    { source: "solar", ok: true, timestamp_ms: now - 45_000 },
    {
      source: "volcanoes",
      ok: true,
      degraded: true,
      timestamp_ms: now - 5 * 60_000,
      error: "Preview fallback data in browser mode",
    },
  ];
}

export function installBrowserTauriMocks(): void {
  if (typeof window === "undefined" || hasTauriInvoke()) {
    return;
  }

  if (window.__EARTHPULSE_BROWSER_MOCKS__) {
    return;
  }

  window.__EARTHPULSE_BROWSER_MOCKS__ = true;
  mockWindows("main");

  let state = loadState();

  mockIPC(
    async (cmd, payload) => {
      const args =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : {};

      switch (cmd) {
        case "get_settings":
          return state.settings;
        case "save_settings":
          state = {
            ...state,
            settings: {
              ...state.settings,
              ...(args.settings as PersistedSettings),
            },
          };
          saveState(state);
          return null;
        case "get_earthquakes":
          return sampleEarthquakes();
        case "get_iss_position":
          return sampleIss();
        case "get_terminator":
          return sampleTerminator();
        case "get_solar_data":
          return sampleSolar();
        case "get_volcanoes":
          return sampleVolcanoes();
        case "get_gdacs_alerts":
          return sampleGdacs();
        case "get_satellite_positions":
          return sampleSatellites();
        case "get_pass_predictions":
          return samplePassPredictions();
        case "get_plates":
          return samplePlates();
        case "get_meteors":
          return sampleMeteors();
        case "get_eonet_events":
          return sampleEonet();
        case "get_asteroids":
          return sampleAsteroids();
        case "get_solar_activity":
          return sampleSolarActivity();
        case "get_watchlists":
          return state.watchlists;
        case "add_watchlist": {
          const watchlist: Watchlist = {
            id: state.nextWatchlistId,
            name: String(args.name ?? "Preview Watchlist"),
            latitude: Number(args.lat ?? state.settings.user_lat ?? 0),
            longitude: Number(args.lon ?? state.settings.user_lon ?? 0),
            radius_km: Number(args.radiusKm ?? 500),
            created_at: Date.now(),
          };
          state = {
            ...state,
            watchlists: [...state.watchlists, watchlist],
            nextWatchlistId: state.nextWatchlistId + 1,
          };
          saveState(state);
          return watchlist;
        }
        case "remove_watchlist":
          state = {
            ...state,
            watchlists: state.watchlists.filter(
              (watchlist) => watchlist.id !== Number(args.id),
            ),
          };
          saveState(state);
          return null;
        case "get_historical_earthquakes":
          return sampleHistorical();
        case "get_historical_data":
          return sampleReplayData(Number(args.timestamp ?? Date.now()));
        case "get_weather":
          return sampleWeather(
            Number(args.lat ?? state.settings.user_lat ?? 0),
            Number(args.lon ?? state.settings.user_lon ?? 0),
          );
        case "get_air_quality":
          return sampleAirQuality(
            Number(args.lat ?? state.settings.user_lat ?? 0),
            Number(args.lon ?? state.settings.user_lon ?? 0),
          );
        case "get_sst":
          return sampleSst(
            Number(args.lat ?? state.settings.user_lat ?? 0),
            Number(args.lon ?? state.settings.user_lon ?? 0),
          );
        case "generate_summary":
          return previewSummary(
            String(args.model ?? defaultSettings.ollama_model),
          );
        default:
          return null;
      }
    },
    { shouldMockEvents: true },
  );

  const dispatchHealthPreview = () => {
    for (const event of previewHealthEvents()) {
      void emit("source:health", event);
    }
  };

  window.setTimeout(dispatchHealthPreview, 400);
  window.setTimeout(dispatchHealthPreview, 1500);
}
