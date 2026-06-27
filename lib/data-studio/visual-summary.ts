import type { VisualBlock } from "@/lib/data-studio/types"

function kindLabel(kind: VisualBlock["kind"]): string {
  switch (kind) {
    case "missingness-bars":
      return "missingness"
    case "numeric-table":
      return "numeric summary"
    case "categorical-table":
      return "categorical breakdown"
    case "histogram":
      return "distribution"
    case "grouped-bars":
      return "group comparison"
    case "scatter":
      return "relationship view"
    case "trend":
      return "trend"
    case "correlation-matrix":
      return "correlation matrix"
    default:
      return "view"
  }
}

function formatList(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

export function buildVisualBoardSummary(blocks: VisualBlock[]): string {
  if (blocks.length === 0) {
    return "No charts were selected for this table."
  }
  const orderedLabels = blocks.map((b) => kindLabel(b.kind))
  const uniqueInOrder = [...new Set(orderedLabels)]
  const count = blocks.length
  return `The system selected ${count} visual${count === 1 ? "" : "s"}: ${formatList(uniqueInOrder)}. Identifier-like fields were excluded.`
}
