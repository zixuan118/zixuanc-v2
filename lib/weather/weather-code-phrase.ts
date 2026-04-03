/**
 * WMO Weather interpretation codes (Open-Meteo).
 * Short, restrained phrases — not app copy.
 */
export function mapWeatherCodeToPhrase(code: number): string {
  const c = Math.round(code)

  if (c === 0) return "clear sky"
  if (c === 1) return "soft sun"
  if (c === 2) return "passing clouds"
  if (c === 3) return "overcast"
  if (c === 45 || c === 48) return "low mist"
  if (c === 51 || c === 53 || c === 55) return "fine drizzle"
  if (c === 56 || c === 57) return "freezing drizzle"
  if (c === 61 || c === 63 || c === 65) return "light rain"
  if (c === 66 || c === 67) return "cold rain"
  if (c === 71 || c === 73 || c === 75) return "snow"
  if (c === 77) return "snow grains"
  if (c === 80 || c === 81 || c === 82) return "passing showers"
  if (c === 85 || c === 86) return "snow showers"
  if (c === 95 || c === 96 || c === 99) return "storm nearby"

  return "passing clouds"
}
