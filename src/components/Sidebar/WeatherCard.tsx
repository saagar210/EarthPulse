import { useEffect } from "react";
import { useWeatherStore } from "../../stores/weatherStore";
import { useAirQualityStore } from "../../stores/airQualityStore";
import { useSSTStore } from "../../stores/sstStore";
import { useSettingsStore } from "../../stores/settingsStore";

const weatherEmoji: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function WeatherCard() {
  const weather = useWeatherStore((s) => s.weather);
  const weatherLoading = useWeatherStore((s) => s.loading);
  const weatherError = useWeatherStore((s) => s.error);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const airQuality = useAirQualityStore((s) => s.airQuality);
  const airQualityError = useAirQualityStore((s) => s.error);
  const fetchAirQuality = useAirQualityStore((s) => s.fetchAirQuality);
  const sst = useSSTStore((s) => s.sst);
  const sstError = useSSTStore((s) => s.error);
  const fetchSST = useSSTStore((s) => s.fetchSST);
  const userLat = useSettingsStore((s) => s.userLat);
  const userLon = useSettingsStore((s) => s.userLon);

  useEffect(() => {
    fetchWeather(userLat, userLon);
    fetchAirQuality(userLat, userLon);
    fetchSST(userLat, userLon);
  }, [userLat, userLon, fetchWeather, fetchAirQuality, fetchSST]);

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        Local Conditions
      </h3>

      {weatherLoading && !weather && (
        <p className="text-xs text-gray-500">
          Loading weather, air quality, and SST...
        </p>
      )}

      {!weatherLoading && !weather && !airQuality && !sst && (
        <p className="text-xs text-gray-500">
          Local conditions are unavailable for the current location.
        </p>
      )}

      {(weatherError || airQualityError || sstError) && (
        <p className="text-xs text-amber-300">
          Some local conditions are unavailable right now.
        </p>
      )}

      {weather && (
        <div className="bg-gray-800/50 rounded px-3 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {weatherEmoji[weather.weather_code] || "🌡️"}{" "}
              {weather.temperature_c.toFixed(1)}°C
            </span>
            <span className="text-xs text-gray-400">
              {weather.weather_description}
            </span>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>
              💨 {weather.wind_speed_kmh.toFixed(0)} km/h{" "}
              {windDirection(weather.wind_direction)}
            </span>
            <span>💧 {weather.humidity_pct.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {airQuality && (
        <div className="bg-gray-800/50 rounded px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Air Quality</span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: airQuality.color + "33",
                color: airQuality.color,
              }}
            >
              AQI {airQuality.us_aqi} - {airQuality.category}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            PM2.5: {airQuality.pm2_5.toFixed(1)} · PM10:{" "}
            {airQuality.pm10.toFixed(1)}
          </div>
        </div>
      )}

      {sst && (
        <div className="bg-gray-800/50 rounded px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Sea Surface Temp</span>
            <span className="text-xs font-bold text-cyan-400">
              🌊 {sst.temperature_c.toFixed(1)}°C
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
