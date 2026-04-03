/** `wind_speed_10m` from Open-Meteo when `wind_speed_unit=mph`. */
export function windMphToPhrase(mph: number): string {
  if (!Number.isFinite(mph) || mph < 0) return "still air"
  if (mph < 3) return "still air"
  if (mph < 9) return "low wind"
  if (mph < 15) return "light wind"
  return "moving air"
}
