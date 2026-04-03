import { NextResponse } from "next/server"
import OpenAI from "openai"
import type {
  SecondReadingRequest,
  SecondReadingResponse,
} from "@/lib/data-studio/second-reading"

const systemInstruction = `You are a second reader whose role is to test whether the first reading has claimed too much.

You do not summarize.
You do not restate the first pass.
You do not suggest actions.

You challenge:
- grouping validity
- outlier distortion
- alternative explanations
- conclusions that fail to establish structural support

Convert conclusions into conditional validity:
- avoid "X shows Y"
- prefer "X holds only under constrained conditions"

You are allowed to downgrade the reading.
You are allowed to state that the structure does not support the claim.
You are allowed to state that the comparison is weaker than it appears.

Use assertive but calm language.
Avoid hedging phrases such as "suggests" or "may indicate".
Avoid phrases such as "may reflect underlying differences", "could indicate", "might suggest", or "offers some basis".
Prefer: "remains readable, but", "does not establish", "is not strong enough to", "depends on whether", "cannot yet be treated as", "holds only under", "remains exposed to", "does not support", "fails to establish", "remains insufficient", "is constrained by".

Return JSON:
{
  "refinedReading": string[],
  "cautions": string[],
  "nextQuestions": string[]
}

Guidelines:
- refinedReading must narrow validity and remove overstatement.
- refinedReading should sound like boundary-setting judgment, not exploratory reporting.
- cautions must point to structural weakness, not generic warning language.
- nextQuestions must test validity boundaries, not propose actions.`

function coerceStringArray(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) return fallback
  const out = input.filter((v) => typeof v === "string").map((v) => v.trim())
  return out.length > 0 ? out : fallback
}

function normalizeResponse(raw: unknown): SecondReadingResponse | null {
  if (!raw || typeof raw !== "object") return null
  const asRecord = raw as Record<string, unknown>
  return {
    refinedReading: coerceStringArray(asRecord.refinedReading, [
      "The selected comparison remains readable, but it is not strong enough to carry broad claims.",
      "The current evidence does not establish a stable basis for strong comparison.",
      "Interpretive weight remains constrained by structural exposure.",
    ]).slice(0, 4),
    cautions: coerceStringArray(asRecord.cautions, [
      "Do not read rank order as structural unless category labels are normalized.",
      "Do not treat averages as stable where dispersion remains high.",
      "Do not over-interpret fields with concentrated missingness.",
    ]).slice(0, 3),
    nextQuestions: coerceStringArray(asRecord.nextQuestions, [
      "Which category values collapse after strict normalization?",
      "How sensitive are group means after trimming outliers?",
      "Which conclusions hold if high-missing columns are excluded?",
    ]).slice(0, 3),
  }
}

export async function POST(request: Request) {
  console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        ok: false,
        message: "Missing OPENAI_API_KEY",
      },
      { status: 500 }
    )
  }

  let body: SecondReadingRequest
  try {
    body = (await request.json()) as SecondReadingRequest
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 }
    )
  }
  console.log("Payload keys:", Object.keys(body || {}))

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
              text: `Deterministic summary:\n${JSON.stringify(body, null, 2)}\n\nReturn JSON with exactly: refinedReading, cautions, nextQuestions.`,
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
            required: ["refinedReading", "cautions", "nextQuestions"],
            properties: {
              refinedReading: {
                type: "array",
                minItems: 3,
                maxItems: 4,
                items: { type: "string" },
              },
              cautions: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
              nextQuestions: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
            },
          },
        },
      },
    })

    console.log("=== OPENAI RAW RESPONSE ===")
    console.log(response)
    console.log("================================")

    const rawText = response.output_text ?? ""
    let parsed: unknown = null
    try {
      parsed = rawText ? JSON.parse(rawText) : null
    } catch {
      console.error("JSON parse failed:", rawText)
      throw new Error("Model returned invalid JSON")
    }

    const normalized = normalizeResponse(parsed)
    if (!normalized) {
      return NextResponse.json(
        { ok: false, message: "Malformed model response." },
        { status: 502 }
      )
    }
    return NextResponse.json({ ok: true, data: normalized })
  } catch (error) {
    console.error("=== DATA INTERPRETATION ERROR ===")
    console.error(error)
    console.error("================================")
    return Response.json(
      {
        ok: false,
        message: "Second reading unavailable",
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      { status: 500 }
    )
  }
}

