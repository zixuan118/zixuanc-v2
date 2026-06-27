import { NextResponse } from "next/server"
import OpenAI from "openai"
import type {
  SecondReadingRequest,
  SecondReadingResponse,
  ConfidenceLanguage,
} from "@/lib/data-studio/second-reading"

const systemInstruction = `You explain already-computed analysis results in plain, practical language.

You receive cleaning summary, audit, analysis plan, comparison, visual summaries, and optional relationship suggestions.
You do NOT compute statistics or read raw rows.

Tone rules:
- Be direct and cautious. Avoid poetic or abstract phrasing.
- Do not claim causality. Say "shows", "visible in this sample", or "may reflect" instead of "because" or "due to".
- Use "signed rent" or "final signed rent". Never phrases like "rent residents actually sign for".
- Use "larger unit types" or "larger unit types show higher signed rents in this sample". Never "larger apartments".
- Prefer: "visible in the grouped means shown here" over "confirmed across all units studied".
- When interpreting patterns, add that the tool does not estimate causality when relevant.

Distinguish clearly in your output:
- whatTheTableShows: facts from computed metrics AFTER cleaning
- issues already resolved by cleaning (duplicate removal, category normalization, invalid numerics converted) should NOT be framed as ongoing aggregate inflation
- hypothesesOnly: interpretive ideas NOT established by the data
- notSafeToClaim: claims to withhold (causality, manager performance without controls, etc.)
- cautions should focus on what REMAINS after cleaning: outliers, small groups, unadjusted comparisons, high-cardinality identifiers excluded

Never sound more confident than the deterministic analysis readiness field.
If readiness is usable-with-caution or exploratory, your language must stay cautious.

Return JSON with refinedReading, keyFindings, cautions, nextQuestions, nonTechnicalSummary, confidenceLanguage.`

function coerceStringArray(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) return fallback
  const out = input.filter((v) => typeof v === "string").map((v) => v.trim())
  return out.length > 0 ? out : fallback
}

function coerceConfidence(input: unknown): ConfidenceLanguage {
  if (input === "low" || input === "medium" || input === "high") return input
  return "medium"
}

function normalizeResponse(raw: unknown): SecondReadingResponse | null {
  if (!raw || typeof raw !== "object") return null
  const asRecord = raw as Record<string, unknown>
  return {
    whatTheTableShows: coerceStringArray(asRecord.whatTheTableShows, [
      "The cleaned table profile reflects the computed row and column counts in the payload.",
    ]).slice(0, 4),
    hypothesesOnly: coerceStringArray(asRecord.hypothesesOnly, [
      "Any group rank order may shift if category mix or missingness changes.",
    ]).slice(0, 3),
    notSafeToClaim: coerceStringArray(asRecord.notSafeToClaim, [
      "Do not treat group comparisons as cause and effect.",
    ]).slice(0, 4),
    refinedReading: coerceStringArray(asRecord.refinedReading, [
      "The profile is readable, but interpretive weight stays limited by structure and cleaning flags.",
    ]).slice(0, 4),
    keyFindings: coerceStringArray(asRecord.keyFindings, [
      "Cleaning and missingness shape which comparisons are defensible.",
    ]).slice(0, 4),
    cautions: coerceStringArray(asRecord.cautions, [
      "Do not read rank order as stable unless categories are normalized.",
      "Do not treat averages as stable where dispersion remains high.",
      "Do not over-interpret fields with concentrated missingness.",
    ]).slice(0, 3),
    nextQuestions: coerceStringArray(asRecord.nextQuestions, [
      "Which conclusions hold if high-missing columns are excluded?",
      "How sensitive are group means after trimming outliers?",
      "Which category values collapse after strict normalization?",
    ]).slice(0, 3),
    nonTechnicalSummary:
      typeof asRecord.nonTechnicalSummary === "string" &&
      asRecord.nonTechnicalSummary.trim()
        ? asRecord.nonTechnicalSummary.trim()
        : "The table was cleaned and profiled locally. Any comparison shown passed basic checks, but confidence depends on data quality flags.",
    confidenceLanguage: coerceConfidence(asRecord.confidenceLanguage),
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { ok: false, message: "Missing OPENAI_API_KEY" },
      { status: 500 },
    )
  }

  let body: SecondReadingRequest
  try {
    body = (await request.json()) as SecondReadingRequest
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    )
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemInstruction }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Structured first-pass result (explain only):\n${JSON.stringify(body, null, 2)}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "second_reading",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "whatTheTableShows",
              "hypothesesOnly",
              "notSafeToClaim",
              "refinedReading",
              "keyFindings",
              "cautions",
              "nextQuestions",
              "nonTechnicalSummary",
              "confidenceLanguage",
            ],
            properties: {
              whatTheTableShows: {
                type: "array",
                items: { type: "string" },
              },
              hypothesesOnly: { type: "array", items: { type: "string" } },
              notSafeToClaim: { type: "array", items: { type: "string" } },
              refinedReading: { type: "array", items: { type: "string" } },
              keyFindings: { type: "array", items: { type: "string" } },
              cautions: { type: "array", items: { type: "string" } },
              nextQuestions: { type: "array", items: { type: "string" } },
              nonTechnicalSummary: { type: "string" },
              confidenceLanguage: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
            },
          },
        },
      },
    })

    const rawText = response.output_text ?? ""
    const parsed = rawText ? JSON.parse(rawText) : null
    const normalized = normalizeResponse(parsed)
    if (!normalized) {
      return NextResponse.json(
        { ok: false, message: "Malformed model response." },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, data: normalized })
  } catch (error) {
    console.error("Data interpretation second reading error:", error)
    return Response.json(
      { ok: false, message: "Second reading unavailable" },
      { status: 500 },
    )
  }
}
