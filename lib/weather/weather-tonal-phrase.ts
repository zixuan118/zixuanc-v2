/**
 * Quiet time-of-day wording for the hero weather second line only.
 * Boston civil time (America/New_York); deterministic, no randomness.
 */

export type BostonDaySegment =
  | "early" // 5–9
  | "mid" // 9–14
  | "afternoon" // 14–18
  | "evening" // 18–22
  | "night" // 22–5

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getBostonHour(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date)
  const raw = parts.find((p) => p.type === "hour")?.value ?? "0"
  let h = parseInt(raw, 10)
  if (raw === "24") h = 0
  return Number.isFinite(h) ? h : 0
}

export function bostonSegmentFromHour(hour: number): BostonDaySegment {
  if (hour >= 5 && hour < 9) return "early"
  if (hour >= 9 && hour < 14) return "mid"
  if (hour >= 14 && hour < 18) return "afternoon"
  if (hour >= 18 && hour < 22) return "evening"
  return "night"
}

function combine(a: string, b: string): string {
  const x = a.trim()
  const y = b.trim()
  if (!x) return y
  if (!y) return x
  return `${x}, ${y}`
}

/** Full-line alternates for common sky + wind pairs (two options per segment). */
const PAIRED: Partial<
  Record<
    string,
    Partial<Record<BostonDaySegment, readonly [string, string]>>
  >
> = {
  "overcast|||low wind": {
    early: ["overcast, still air", "pale sky, low wind"],
    mid: ["overcast, light air", "flat sky, low wind"],
    afternoon: ["overcast, steady air", "muted sky, low wind"],
    evening: ["dim sky, low wind", "overcast, settling air"],
    night: ["quiet sky, still air", "dark sky, low wind"],
  },
  "passing clouds|||low wind": {
    early: ["passing clouds, still air", "thin cloud, low wind"],
    mid: ["passing clouds, light air", "broken cloud, low wind"],
    afternoon: ["passing clouds, steady air", "layered cloud, low wind"],
    evening: ["low cloud, low wind", "passing clouds, settling air"],
    night: ["quiet cloud, still air", "passing clouds, low wind"],
  },
  "clear sky|||still air": {
    early: ["clear sky, still air", "open sky, still air"],
    mid: ["clear sky, light air", "clear sky, low wind"],
    afternoon: ["clear sky, steady air", "high sky, still air"],
    evening: ["clear sky, settling air", "clear sky, low wind"],
    night: ["clear sky, still air", "open sky, low wind"],
  },
  "soft sun|||low wind": {
    early: ["soft sun, still air", "thin haze, low wind"],
    mid: ["soft sun, light air", "light haze, low wind"],
    afternoon: ["soft sun, steady air", "hazy sun, low wind"],
    evening: ["soft sun, settling air", "low sun, low wind"],
    night: ["soft sun, still air", "soft sun, low wind"],
  },
  "low mist|||still air": {
    early: ["low mist, still air", "ground mist, still air"],
    mid: ["low mist, light air", "thin mist, low wind"],
    afternoon: ["low mist, steady air", "low mist, low wind"],
    evening: ["low mist, settling air", "low mist, low wind"],
    night: ["low mist, still air", "low mist, low wind"],
  },
}

const WIND_LOW: Record<BostonDaySegment, readonly [string, string]> = {
  early: ["low wind", "still air"],
  mid: ["low wind", "light air"],
  afternoon: ["low wind", "steady air"],
  evening: ["low wind", "settling air"],
  night: ["low wind", "still air"],
}

const WIND_STILL: Record<BostonDaySegment, readonly [string, string]> = {
  early: ["still air", "still air"],
  mid: ["still air", "light air"],
  afternoon: ["still air", "steady air"],
  evening: ["still air", "settling air"],
  night: ["still air", "still air"],
}

/**
 * Second line only: same facts as base sky + wind, wording nudged by Boston time of day.
 */
export function tonalWeatherSecondLine(
  skyPhrase: string,
  windPhrase: string,
  date: Date = new Date(),
): string {
  const sky = skyPhrase.trim()
  const wind = windPhrase.trim()
  const seg = bostonSegmentFromHour(getBostonHour(date))
  const key = `${sky}|||${wind}`
  const pair = PAIRED[key]?.[seg]
  const v = simpleHash(`${key}|${seg}`) % 2
  if (pair) return pair[v] ?? pair[0]

  if (wind === "low wind") {
    return combine(sky, WIND_LOW[seg][v])
  }
  if (wind === "still air") {
    const w = WIND_STILL[seg][v]
    return combine(sky, w)
  }

  return combine(sky, wind)
}
