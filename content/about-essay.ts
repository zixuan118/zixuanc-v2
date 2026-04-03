/**
 * About page — flowing groups separated by “---” in the manuscript.
 * `gapAfter` = breathing after the group; `innerSpacing` = rhythm inside the group.
 */
export type AboutEssayGroup = {
  paragraphs: string[]
  gapAfter: string | null
  innerSpacing: string
}

export const ABOUT_ESSAY_GROUPS: AboutEssayGroup[] = [
  {
    paragraphs: [
      "I do not think a person can be reduced to a clean introduction.",
      "Most lives only make sense in hindsight.\nEven then, not fully.",
    ],
    gapAfter: "mb-9 md:mb-11",
    innerSpacing: "space-y-4 md:space-y-[1.05rem]",
  },
  {
    paragraphs: [
      "I learned to think through economics, systems, and behavior.",
      "Later, I found myself drawn just as much to interfaces, language, and the small emotional details people leave behind.",
    ],
    gapAfter: "mb-4 md:mb-5",
    innerSpacing: "space-y-3 md:space-y-3.5",
  },
  {
    paragraphs: [
      "Somewhere in between, I became someone who likes building things.",
      "Not only functional things.",
      "Not only beautiful things.",
      "Something a little quieter than that.",
    ],
    gapAfter: "mb-5 md:mb-6",
    innerSpacing: "space-y-2.5 md:space-y-3",
  },
  {
    paragraphs: [
      "I care about structure.",
      "I care about whether something works.",
      "But I also care about tone, pacing, and the feeling a thing leaves behind after it is gone.",
    ],
    gapAfter: "mb-4 md:mb-[1.125rem]",
    innerSpacing: "space-y-2.5 md:space-y-3",
  },
  {
    paragraphs: [
      "I have spent years moving between analysis and expression,\nbetween what can be measured and what can only be noticed.",
    ],
    gapAfter: "mb-5 md:mb-6",
    innerSpacing: "space-y-3 md:space-y-3.5",
  },
  {
    paragraphs: [
      "Some of that happened in classrooms.",
      "Some of it happened through work.",
      "Some of it happened alone, late at night, making and remaking things until they felt honest.",
    ],
    gapAfter: "mb-4 md:mb-5",
    innerSpacing: "space-y-2.5 md:space-y-3",
  },
  {
    paragraphs: [
      "I live in Boston now,\nin a life shaped by research, code, housing, language, and memory,\nand by a constant attempt to let usefulness and sensitivity coexist.",
    ],
    gapAfter: "mb-8 md:mb-10",
    innerSpacing: "space-y-3 md:space-y-3.5",
  },
  {
    paragraphs: [
      "I do not always trust people who know exactly how to describe themselves.",
    ],
    gapAfter: "mb-8 md:mb-11 lg:mb-12",
    innerSpacing: "space-y-0",
  },
  {
    paragraphs: ["What feels more true to me is this:"],
    gapAfter: "mb-14 md:mb-20 lg:mb-24",
    innerSpacing: "space-y-0",
  },
  {
    paragraphs: ["I pay attention."],
    gapAfter: "mb-7 md:mb-8",
    innerSpacing: "space-y-0",
  },
  {
    paragraphs: ["I stay with things longer than I need to."],
    gapAfter: "mb-4 md:mb-5",
    innerSpacing: "space-y-0",
  },
  {
    paragraphs: [
      "I care about precision, but never only precision.",
      "I am drawn to work that feels thoughtful, useful, and quietly human.",
    ],
    gapAfter: "mb-12 md:mb-16 lg:mb-18",
    innerSpacing: "space-y-2 md:space-y-2.5",
  },
  {
    paragraphs: [
      "This site is not meant to explain everything.",
      "It is only a record of what I kept coming back to.",
    ],
    gapAfter: "mb-20 md:mb-24 lg:mb-32",
    innerSpacing: "space-y-4 md:space-y-5",
  },
]
