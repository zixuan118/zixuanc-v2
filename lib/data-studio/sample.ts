/**
 * Built-in demo dataset: medium-complexity business analytics (not domain-specific).
 * ~60 rows, controlled messiness for cleaning/audit demos.
 */

const MONTHS = [
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
]

type Segment = "Enterprise" | "Mid-Market" | "SMB"

function segmentBase(segment: Segment, monthIdx: number): number {
  const growth = monthIdx * 1.04
  if (segment === "Enterprise") return Math.round(178000 + growth * 5200)
  if (segment === "Mid-Market") return Math.round(119000 + growth * 3100)
  return Math.round(83500 + growth * 1750)
}

function marginFor(
  revenue: number,
  segment: Segment,
  channelIdx: number,
  discount: number,
  salt: number,
): string {
  const base =
    segment === "Enterprise" ? 0.29 : segment === "Mid-Market" ? 0.24 : 0.2
  const channelEffect = [0.02, -0.015, -0.02, 0.01, -0.008][channelIdx] ?? 0
  const noise = ((salt * 17) % 29) * 0.0045 - 0.055
  const revDrag = -(revenue / 260000) * 0.06
  const discountDrag = -discount * 0.28
  const m = base + channelEffect + noise + revDrag + discountDrag
  return Math.max(0.14, Math.min(0.38, m)).toFixed(2)
}

function ordersFor(revenue: number, segment: Segment): number {
  const avg =
    segment === "Enterprise" ? 420 : segment === "Mid-Market" ? 310 : 520
  return Math.round(revenue / avg + (segment === "SMB" ? 40 : 0))
}

function conversionRate(segment: Segment, channelIdx: number): string {
  const base =
    segment === "Enterprise" ? 0.042 : segment === "Mid-Market" ? 0.035 : 0.028
  return (base + channelIdx * 0.004 - (segment === "SMB" ? 0.003 : 0)).toFixed(3)
}

function discountRate(segment: Segment, monthIdx: number): string {
  const base =
    segment === "Enterprise" ? 0.08 : segment === "Mid-Market" ? 0.13 : 0.19
  return (base + (monthIdx % 4) * 0.01).toFixed(2)
}

function buildSampleRows(): string[] {
  const regions = ["North", "South", "East", "West"] as const
  const channels = ["Direct", "Partner", "Paid Search", "Email", "Referral"] as const
  const segmentLabels: Array<{ canon: Segment; raw: string }> = [
    { canon: "Enterprise", raw: "Enterprise" },
    { canon: "Mid-Market", raw: "Mid-Market" },
    { canon: "SMB", raw: "SMB" },
  ]

  const rows: string[] = [
    "month,region,segment,channel,revenue,margin,orders,conversion_rate,discount_rate",
  ]

  for (let mi = 0; mi < MONTHS.length; mi++) {
    const month = MONTHS[mi]
    for (let si = 0; si < 3; si++) {
      const { canon, raw: defaultRaw } = segmentLabels[si]
      let segmentRaw = defaultRaw
      if (canon === "SMB" && mi === 1) segmentRaw = "smb"
      if (canon === "SMB" && mi === 4) segmentRaw = "Smb"
      if (canon === "Mid-Market" && mi === 2) segmentRaw = "Mid Market"
      if (canon === "Mid-Market" && mi === 5) segmentRaw = "mid-market"
      if (canon === "Mid-Market" && mi === 8) segmentRaw = "Mid-market"

      const region = regions[(mi + si) % regions.length]
      let regionRaw: string = region
      if (mi === 3 && si === 0) regionRaw = "north"
      if (mi === 6 && si === 1) regionRaw = "SOUTH"
      if (mi === 9 && si === 2) regionRaw = " west"

      const channelIdx = (mi + si) % channels.length
      let channelRaw: string = channels[channelIdx]
      if (mi === 2 && si === 1) channelRaw = "paid search"
      if (mi === 7 && si === 0) channelRaw = "Paid  Search"

      const revenue = segmentBase(canon, mi) + si * 2100 + (mi % 3) * 900
      const disc = discountRate(canon, mi)
      const margin = marginFor(revenue, canon, channelIdx, parseFloat(disc), mi * 10 + si)
      const orders = ordersFor(revenue, canon)
      const conv = conversionRate(canon, channelIdx)

      rows.push(
        `${month},${regionRaw},${segmentRaw},${channelRaw},${revenue},${margin},${orders},${conv},${disc}`,
      )
    }

    // Two extra rows per month for channel/region mix (keeps row count ~60+)
    const extraSegment: Segment = mi % 2 === 0 ? "Enterprise" : "Mid-Market"
    const extraRaw =
      extraSegment === "Mid-Market" && mi === 4 ? "Mid Market" : extraSegment
    const extraRegion = regions[(mi + 2) % regions.length]
    const extraChannel = channels[(mi + 1) % channels.length]
    const extraRev = segmentBase(extraSegment, mi) + 4800
    const extraDisc = discountRate(extraSegment, mi)
    rows.push(
      `${month},${extraRegion},${extraRaw},${extraChannel},${extraRev},${marginFor(extraRev, extraSegment, 2, parseFloat(extraDisc), mi * 10 + 4)},${ordersFor(extraRev, extraSegment)},${conversionRate(extraSegment, 2)},${extraDisc}`,
    )

    const smbChannel = channels[(mi + 3) % channels.length]
    const smbRev = segmentBase("SMB", mi) - 1200
    const smbDisc = discountRate("SMB", mi)
    rows.push(
      `${month},${regions[(mi + 1) % regions.length]},${mi === 10 ? "smb" : "SMB"},${smbChannel},${smbRev},${marginFor(smbRev, "SMB", 1, parseFloat(smbDisc), mi * 10 + 7)},${ordersFor(smbRev, "SMB")},${conversionRate("SMB", 1)},${smbDisc}`,
    )
  }

  // Controlled messiness
  const missingRevenueIdx = rows.length - 2
  const parts = rows[missingRevenueIdx].split(",")
  parts[4] = ""
  rows[missingRevenueIdx] = parts.join(",")

  const naMarginIdx = rows.length - 5
  const marginParts = rows[naMarginIdx].split(",")
  marginParts[5] = "n/a"
  rows[naMarginIdx] = marginParts.join(",")

  // One exact duplicate row
  rows.push(rows[rows.length - 8])

  return rows
}

export const sampleDatasetCsv = buildSampleRows().join("\n")
