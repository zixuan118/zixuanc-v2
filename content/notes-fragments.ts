export type NotesImageEmphasis = "quiet" | "present"

/** Visual hierarchy: whisper (light), standard (most), anchor (Nov 6 2021 + Mar 13 2026 only). */
export type NotesWeight = "whisper" | "standard" | "anchor"

export type NotesFragmentImage = {
  alt: string
  emphasis: NotesImageEmphasis
  /** If true, image shows only after expanded content */
  afterExpand?: boolean
  /** Primary display path (JPEG/PNG); use with optional HEIC in picture */
  src: string
  /** Optional HEIC for Safari; browsers fall back to `src` */
  heicSrc?: string
  /** Optional second image below the first (same note). */
  secondary?: {
    alt: string
    src: string
    heicSrc?: string
  }
}

export type NotesFragment = {
  id: string
  weight: NotesWeight
  /** Display like "Mar 13, 2026" */
  dateLabel: string
  enLines: string[]
  cn: string
  expandable?: {
    enLines: string[]
    cn: string
  }
  image?: NotesFragmentImage
}

/**
 * Curated notes in fixed order (12 total).
 * Images are memory fragments—never full-bleed, never “article” illustrations.
 */
export const NOTES_FRAGMENTS: NotesFragment[] = [
  {
    id: "2017-10-18",
    weight: "whisper",
    dateLabel: "Oct 18, 2017",
    enLines: [
      "We need other people.",
      "We also need a place they cannot reach.",
    ],
    cn: "人需要人群，\n也需要一处不被人群抵达的地方。",
  },
  {
    id: "2019-01-28",
    weight: "whisper",
    dateLabel: "Jan 28, 2019",
    enLines: ["You see a cage.", "I see the sea."],
    cn: "你看到牢笼，\n我看到海。",
  },
  {
    id: "2019-08-23",
    weight: "whisper",
    dateLabel: "Aug 23, 2019",
    enLines: ["My heart does not always move with the weather."],
    cn: "心情并不是总和天气相匹配。",
    image: {
      src: "/images/IMG_2123.jpeg",
      alt: "",
      emphasis: "quiet",
    },
  },
  {
    id: "2021-06-23",
    weight: "standard",
    dateLabel: "Jun 23, 2021",
    enLines: [
      "Adults notice the fruit.",
      "Children still notice which leaf is more beautiful.",
    ],
    cn: "成年人只会注意到果实，\n小孩才能看到哪片树叶更美。",
    image: {
      src: "/images/IMG_1242.jpg",
      heicSrc: "/images/IMG_1242.heic",
      alt: "",
      emphasis: "present",
    },
  },
  {
    id: "2021-11-06",
    weight: "anchor",
    dateLabel: "Nov 6, 2021",
    enLines: [
      "For the little house by the tracks,",
      "the 2:30 train",
      "was the first thing each day worth waiting for.",
    ],
    cn: "对铁轨旁的木屋来说，\n每天下午 2:30 的火车，\n是它每天最值得期待的第一件事。",
    expandable: {
      enLines: ["And the last thing it held onto before sleep."],
      cn: "也是睡前回忆的最后一件事。",
    },
    image: {
      src: "/images/ORG_DSC00226.JPG",
      alt: "",
      emphasis: "quiet",
      afterExpand: true,
      secondary: {
        src: "/images/IMG_2750.jpeg",
        alt: "",
      },
    },
  },
  {
    id: "2021-12-14",
    weight: "standard",
    dateLabel: "Dec 14, 2021",
    enLines: [
      "I don’t know whether I am a romantic person.",
      "Most of the time,",
      "those moments are mine alone,",
      "and they move no one but me.",
    ],
    cn: "我不知道自己是不是一个浪漫的人。\n很多时候那些浪漫只有我知道，\n也只能感动我自己。",
  },
  {
    id: "2022-01-10",
    weight: "standard",
    dateLabel: "Jan 10, 2022",
    enLines: [
      "Maybe fireworks exist",
      "to help us overcome",
      "our fear of darkness and loneliness.",
    ],
    cn: "烟花的存在是为了克服人们对黑暗和孤独的恐惧。",
  },
  {
    id: "2022-12-26",
    weight: "standard",
    dateLabel: "Dec 26, 2022",
    enLines: [
      "A ritual is not escape.",
      "It is a way of checking",
      "what still holds the center.",
    ],
    cn: "仪式不是逃离，\n是确认什么\n仍然占据中心。",
  },
  {
    id: "2023-03-08",
    weight: "whisper",
    dateLabel: "Mar 8, 2023",
    enLines: [
      "Feeling arrives first.",
      "Thinking begins",
      "when we refuse to stop there.",
    ],
    cn: "情绪总是先到。\n而思考开始于，\n我们不愿停在那里。",
  },
  {
    id: "2023-06-13",
    weight: "whisper",
    dateLabel: "Jun 13, 2023",
    enLines: ["Once a rope has snapped,", "every knot remembers it."],
    cn: "断过的绳，\n怎么系都有结。",
  },
  {
    id: "2023-12-25",
    weight: "standard",
    dateLabel: "Dec 25, 2023",
    enLines: [
      "In that tiny world,",
      "once the noise had fallen away,",
      "our presence became the only thing that felt real.",
    ],
    cn: "在停止吵闹的小小世界里，\n彼此的存在成为了唯一的真实。",
  },
  {
    id: "2026-03-13",
    weight: "anchor",
    dateLabel: "Mar 13, 2026",
    enLines: [
      "I am not asking for much.",
      "Only mornings I wake to with anticipation,",
      "and nights I can lie down in with peace.",
    ],
    cn: "我并不贪婪。\n我只想要被期待叫醒的清晨，\n和安心躺下的夜晚。",
    expandable: {
      enLines: [
        "There are nights in this city",
        "when everything feels far away,",
        "and somehow clearer because of it.",
      ],
      cn: "在这座城市的某些夜晚，\n一切都很遥远，\n却也因此变得更清晰。",
    },
  },
]
