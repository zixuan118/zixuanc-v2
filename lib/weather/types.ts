/** Normalized snapshot for UI (Fahrenheit, short phrases). */
export type HeroWeatherSnapshot =
  | {
      ok: true
      tempF: number
      apparentF: number | null
      skyPhrase: string
      windPhrase: string
    }
  | { ok: false }

export type CachedWeatherEnvelope = {
  savedAt: number
  snapshot: HeroWeatherSnapshot
}
