/** Appendix copy for Data Interpretation Studio on /work only. */

export type DataStudioTechnicalNote = {
  label: string
  text: string
}

export const dataStudioTechnicalNotes: DataStudioTechnicalNote[] = [
  {
    label: "RUNTIME",
    text: "The demo runs entirely in the browser. CSV, TSV, TXT, and XLSX files are parsed locally. Nothing is uploaded to a server for cleaning, profiling, or chart selection. Optional second reading and relationship review call a small API route that receives structured summaries only, not raw rows.",
  },
  {
    label: "PIPELINE",
    text: "The flow is Upload → Clean → Audit → Plan → Visualize → Explain → Export. Cleaning is deterministic and receipted: duplicate removal, whitespace and sentinel normalization, category normalization on eligible fields, and invalid numeric values converted to missing. Audit profiles missingness, column types, drift, and outliers on cleaned data.",
  },
  {
    label: "COMPARISON LOGIC",
    text: "Before any chart is drawn, the tool scores grouping and metric pairings for semantic meaning and structure. Each candidate gets a readiness label: Stable, Usable with caution, Exploratory, or Not recommended. Outliers in the selected metric, small groups, and competing drivers can downgrade confidence. The UI separates algorithmic facts from the optional explanation layer.",
  },
  {
    label: "VISUAL BOARD",
    text: "Charts are chosen for structure, not completeness. Identifier-like fields are excluded. The board typically includes missingness, numeric summaries, a categorical breakdown, a distribution, the selected group comparison, a time trend when dates exist, and a local correlation matrix. Each block carries descriptive cautions where needed.",
  },
  {
    label: "SECOND READING",
    text: "The optional second reading explains computed cleaning, audit, plan, visuals, and relationship suggestions in plain language. It does not recalculate tables or claim causality. Relationship review ranks pre-computed candidates using field names and summaries; it does not prove cause and effect.",
  },
  {
    label: "EXPORT",
    text: "Users can download cleaned CSV or XLSX, a profile JSON, and a cleaning log JSON. The raw file remains unchanged; exports reflect the cleaned layer only.",
  },
]
