import type { CachedWeatherEnvelope, HeroWeatherSnapshot } from "@/lib/weather/types"
import { mapWeatherCodeToPhrase } from "@/lib/weather/weather-code-phrase"
import { windMphToPhrase } from "@/lib/weather/wind-phrase"

const CACHE_KEY = "zxc-hero-weather-v2"
/** 25 minutes */
const CACHE_TTL_MS = 25 * 60 * 1000

/**
 * Same Boston coordinates as the brief; `current` adds apparent temp + F + mph in one call.
 * Open-Meteo: no key, no registration.
 */
const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=42.3601&longitude=-71.0589&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph"

type OpenMeteoCurrent = {
  temperature_2m?: number
  apparent_temperature?: number
  weather_code?: number
  wind_speed_10m?: number
}

type OpenMeteoResponse = {
  current?: OpenMeteoCurrent
  current_weather?: {
    temperature?: number
    windspeed?: number
    weathercode?: number
  }
}

function readCache(): CachedWeatherEnvelope | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedWeatherEnvelope
    if (
      typeof parsed?.savedAt !== "number" ||
      !parsed?.snapshot ||
      typeof parsed.snapshot !== "object"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCache(snapshot: HeroWeatherSnapshot): void {
  if (typeof window === "undefined") return
  try {
    const env: CachedWeatherEnvelope = {
      savedAt: Date.now(),
      snapshot,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(env))
  } catch {
    /* quota / private mode */
  }
}

function parseResponse(json: OpenMeteoResponse): HeroWeatherSnapshot | null {
  const cur = json.current
  if (
    cur &&
    typeof cur.temperature_2m === "number" &&
    typeof cur.weather_code === "number"
  ) {
    const tempF = Math.round(cur.temperature_2m)
    const apparent =
      typeof cur.apparent_temperature === "number"
        ? Math.round(cur.apparent_temperature)
        : null
    const wind =
      typeof cur.wind_speed_10m === "number" ? cur.wind_speed_10m : 0
    return {
      ok: true,
      tempF,
      apparentF: apparent,
      skyPhrase: mapWeatherCodeToPhrase(cur.weather_code),
      windPhrase: windMphToPhrase(wind),
    }
  }

  const legacy = json.current_weather
  if (
    legacy &&
    typeof legacy.temperature === "number" &&
    typeof legacy.weathercode === "number"
  ) {
    const tempF = Math.round((legacy.temperature * 9) / 5 + 32)
    const windKmh = typeof legacy.windspeed === "number" ? legacy.windspeed : 0
    const mph = windKmh * 0.621371
    return {
      ok: true,
      tempF,
      apparentF: null,
      skyPhrase: mapWeatherCodeToPhrase(legacy.weathercode),
      windPhrase: windMphToPhrase(mph),
    }
  }

  return null
}

/**
 * Returns cached snapshot if fresh; otherwise fetches once, caches, and returns.
 * Call only from client (e.g. useEffect).
 */
export async function loadBostonHeroWeather(): Promise<HeroWeatherSnapshot> {
  const cached = readCache()
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return cached.snapshot
  }

  try {
    const res = await fetch(OPEN_METEO_URL, { cache: "no-store" })
    if (!res.ok) {
      return { ok: false }
    }
    const json = (await res.json()) as OpenMeteoResponse
    const snapshot = parseResponse(json)
    if (!snapshot) {
      return { ok: false }
    }
    writeCache(snapshot)
    return snapshot
  } catch {
    return { ok: false }
  }
}
