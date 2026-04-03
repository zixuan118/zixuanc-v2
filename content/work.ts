/**
 * Curated work — real projects only. No case-study subroutes until there is material to publish.
 */

export type WorkProject = {
  id: string
  title: string
  subtitle: string
  /** Editorial category (shown uppercase on Work; no status dating on this page) */
  kind: string
  /** Optional; omitted on Work when absent so the page does not read as a tracker */
  timeframe?: string
  /** One line for listings */
  lede: string
  /** Short line under title when featured (text-led layout) */
  caption?: string
  /** Featured block: opening paragraph */
  framing: string
  /** Featured block: supporting paragraphs */
  body: string[]
  /**
   * Optional long-form copy for the /work featured block only.
   * When set, `WorkFeatured` uses these instead of `framing` / `body`.
   * Use empty string to omit the opening framing paragraph on /work while keeping homepage `framing`.
   */
  detailFraming?: string
  detailBody?: string[]
}

export const featuredProjectId = "bos-roommate-matching"

export const workProjects: WorkProject[] = [
  {
    id: "bos-roommate-matching",
    title: "Roommate matching system for shared housing",
    subtitle:
      "Structured intake, staged matching, masked contact handling, and agent-side workflow support for student-focused shared housing.",
    kind: "Independent product",
    lede:
      "WeChat mini program for Boston roommate search: structured preferences, short onboarding, staged search, structured matching inputs, light analytics.",
    framing:
      "A WeChat mini program for roommate search in Boston. Preferences are structured early, onboarding stays short,\nand the search moves in stages so it does not collapse into endless chat.",
    body: [
      "The front end maps what people need from a lease and a roommate.\nThe back end keeps those inputs structured,\nso matching does not dissolve into noise.",
      "Light analytics sit underneath the flow:\nenough to see where people stall,\nnot enough to pretend the work is finished.",
    ],
    detailFraming: "",
    detailBody: [
      "The demand appeared repeatedly in Boston's student rental market, especially around shared housing and roommate search. People were not only looking for apartments. They were trying to align lifestyle, budget, move-in timing, and compatibility before even reaching the application stage.",
      "What existed in practice was noisy and unstable. Most roommate discovery happened through Xiaohongshu and similar social channels, where posts were easy to miss, difficult to compare, and quickly pulled into private chat before preferences could be organized. Discovery was only part of the problem. The larger issue was coordination.",
      "The product response was a WeChat mini program designed and built independently from definition through front-end implementation. Instead of leaving the process open-ended, the system turns roommate search into a structured intake and staged matching flow. User inputs are normalized into comparable fields, then surfaced through a simple compatibility layer so that people are not starting from scratch every time a new conversation begins.",
      "Matching is treated as a scored process rather than a binary outcome. Practical constraints and softer preferences are evaluated together, allowing coordination to happen before conversation becomes unstructured.",
      "Shared match views keep identifying details and direct contact information masked at the browsing stage. This allows users to explore compatibility without immediately bypassing the brokerage layer.",
      "The system was designed not only for user convenience, but for brokerage-adjacent use in a real rental workflow. User-facing discovery and office-facing handling remain separate, so coordination, follow-up, and application support can still be structured.",
      "A lightweight internal path is integrated into the same system. Agents can review submissions, inspect ownership-linked records, and move cases through defined states without direct backend access. The result is not a single matching feature, but a compact product system that holds intake, scoring, visibility control, and coordination together.",
    ],
  },
  {
    id: "personal-knowledge-site",
    title: "Personal knowledge system",
    subtitle:
      "A maintained index for work, notes, references, and selected images — built as a long-form personal system rather than a portfolio shell.",
    kind: "Personal system",
    lede:
      "This site is designed less as a showcase and more as a maintained personal system. Work, notes, archive material, and static identity pages sit inside separate sectional logics so different kinds of material can accumulate without flattening into the same presentation style.",
    framing:
      "This site is designed less as a showcase and more as a maintained personal system.",
    body: [
      "The structure favors continuity over novelty. New entries are meant to be filed, placed, and revisited rather than endlessly pushed downward in feed form. Typography, spacing, navigation, and page rhythm are tuned so the site can hold analytical writing, visual fragments, project descriptions, and slower personal material without collapsing into a single undifferentiated voice.",
      "The system is intentionally quiet. Instead of adding visible product behavior everywhere, small page-specific details are used to create recognition and continuity: restrained motion, margin objects, sectional pacing, and surfaces that feel editorial rather than app-like.",
      "In that sense, the site functions as both interface and index: a place to present selected work, but also a framework for storing, extending, and shaping an ongoing body of material over time.",
    ],
  },
  {
    id: "model-stress-eval",
    title: "Model stress-testing and evaluation design",
    subtitle:
      "STEM-grounded prompts, rubrics, and scoring structures built to make failure visible and comparable.",
    kind: "Evaluation work",
    lede:
      "Quantitative and STEM-grounded evaluation tasks written to expose where strong models still break under constraint: hallucination under pressure, brittle reasoning, weak instruction-following, and instability when answers had to remain verifiable rather than merely fluent.",
    framing:
      "Where AI touches analysis, the risk is sloppy questions and prettier wrong answers. The work focuses on how prompts are written, how outputs are judged, and how evaluation stays tied to the decision at hand.",
    body: [
      "The work is adversarial only in a disciplined sense. Difficulty is used to separate surface fluency from sustained correctness, with ambiguity controlled so failures remain diagnostic. Rubrics keep those failures comparable across runs and tied to reproducibility.",
    ],
  },
]

export function getFeaturedProject(): WorkProject {
  const found = workProjects.find((p) => p.id === featuredProjectId)
  return found ?? workProjects[0]
}

export function getOtherProjects(): WorkProject[] {
  return workProjects.filter((p) => p.id !== featuredProjectId)
}
