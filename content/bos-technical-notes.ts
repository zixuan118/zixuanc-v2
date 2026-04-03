/** Appendix copy for the BOS project on /work only. */

export type BosTechnicalNote = {
  label: string
  text: string
}

export const bosTechnicalNotes: BosTechnicalNote[] = [
  {
    label: "INTAKE MODEL",
    text: "The first problem was not matching but comparability. Roommate search arrives as loose preference language, so the intake had to turn move-in timing, budget, geography, room type, roommate preference, lease length, pet tolerance, and optional compatibility signals into normalized fields without making the flow collapse under its own formality.",
  },
  {
    label: "MATCHING LOGIC",
    text: "The scoring model separates exclusion from ranking. Non-viable pairs drop out first. Softer preferences are weighted only inside the surviving pool. That avoids false precision while still producing a readable order of fit.",
  },
  {
    label: "PRIVACY ROUTING",
    text: "Each submission is assigned an internal identifier. Shared match views do not expose full identifying or contact detail. User-facing matching and office-facing handling remain intentionally separate, so the interface stays useful without becoming a direct bypass around the brokerage layer.",
  },
  {
    label: "AGENT WORKFLOW",
    text: "A lightweight front-end CRM path lets agents log in, review recent submissions, inspect ownership-linked records, and move cases through defined states without touching raw database access or backend tooling.",
  },
  {
    label: "SYSTEM SHAPE",
    text: "The build was end to end: product definition, interface design, matching logic, privacy handling, and workflow support. The deeper task was to make a fragmented, socially noisy housing search process legible enough to operate.",
  },
]
